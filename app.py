import csv
import io
from flask import Flask, Response, render_template, request, redirect, url_for, session, abort
from flask_pymongo import PyMongo
from flask_login import (
    LoginManager, UserMixin,
    login_user, login_required,
    logout_user, current_user
)
from werkzeug.security import generate_password_hash, check_password_hash
from bson.objectid import ObjectId
from datetime import datetime

from io import BytesIO
from flask import send_file
from xhtml2pdf import pisa

app = Flask(__name__)
app.secret_key = "123"

app.config["MONGO_URI"] = "mongodb://localhost:27017/review_app"
mongo = PyMongo(app)


# —— Flask-Login Setup ——
login_manager = LoginManager(app)
login_manager.login_view = "login"

def seed_demo_templates():
    demo = [
    {
        "category": "Fire Safety",
        "name": "消防安全巡检（日常）",
        "items": [
        { "key": "exit_signs_visible",      "label": "疏散指示标志清晰可见",          "type": "boolean" },
        { "key": "exit_lighting_ok",        "label": "疏散照明正常",                  "type": "boolean" },
        { "key": "fire_door_closed",        "label": "防火门完好并保持关闭",          "type": "boolean" },
        { "key": "corridor_unblocked",      "label": "疏散通道/安全出口畅通无阻",      "type": "boolean" },
        { "key": "extinguishers_present",   "label": "灭火器配备齐全在有效期内",      "type": "boolean" },
        { "key": "alarm_panel_normal",      "label": "火灾报警控制器无故障显示",      "type": "boolean" },
        { "key": "sprinkler_valves_open",   "label": "喷淋阀门开启且铅封完好",        "type": "boolean" },
        { "key": "pump_room_access",        "label": "消防水泵房可进入且整洁",        "type": "boolean" },
        { "key": "special_risks_notes",     "label": "特殊风险点/临时动火说明",       "type": "text"    },
        { "key": "last_drill_date",         "label": "最近一次消防演练日期",          "type": "date"    },
        { "key": "overall_notes",           "label": "其他备注",                      "type": "text"    }
        ]
    },
    {
        "category": "Structural",
        "name": "结构安全快检",
        "items": [
        { "key": "visible_cracks",          "label": "主要承重构件是否存在明显裂缝",  "type": "boolean" },
        { "key": "crack_notes",             "label": "裂缝位置/长度/宽度记录",        "type": "text"    },
        { "key": "deflection_observed",     "label": "楼板/梁是否有明显挠度变形",      "type": "boolean" },
        { "key": "member_damage",           "label": "混凝土/钢构件破损锈蚀剥落",      "type": "boolean" },
        { "key": "support_alteration",      "label": "是否存在私改拆改承重构件",        "type": "boolean" },
        { "key": "water_leakage",           "label": "渗水/漏水（顶板/墙/节点）",       "type": "boolean" },
        { "key": "foundation_settlement",   "label": "是否疑似不均匀沉降迹象",         "type": "boolean" },
        { "key": "infill_damage",           "label": "填充墙/围护墙开裂脱落",           "type": "boolean" },
        { "key": "inspection_date",         "label": "本次检查日期",                  "type": "date"    },
        { "key": "struct_summary",          "label": "结论与建议（是否需复检/加固）",   "type": "text"    }
        ]
    }
    ]
    for t in demo:
        exists = mongo.db.templates.find_one({"name": t["name"], "category": t["category"]})
        if not exists:
            mongo.db.templates.insert_one(t)
seed_demo_templates()
class User(UserMixin):
    def __init__(self, user_doc):
        self.id = str(user_doc["_id"])
        self.username = user_doc["username"]
    @staticmethod
    def get(user_id):
        doc = mongo.db.users.find_one({"_id": ObjectId(user_id)})
        return User(doc) if doc else None

@login_manager.user_loader
def load_user(user_id):
    return User.get(user_id)

tool_data = {
    "Planning Permission": [
        "Land Use Policy Lookup",
        "Building Density Calculator",
        "Site Survey Tool"
    ],
    "Fire Safety Review": [
        "Escape Route Compliance Checker",
        "Fire Protection System Designer",
        "Fire Spread Simulation Tool"
    ],
    "Structural Review": [
        "Structural Analysis Software",
        "Foundation Construction Guidelines",
        "Structural Reliability Assessment"
    ],
}

# —— Registration Route ——
@app.route("/register", methods=["GET", "POST"])
def register():
    if request.method == "POST":
        username = request.form["username"].strip()
        pwd = request.form["password"]
        if mongo.db.users.find_one({"username": username}):
            return "Username exists", 400
        mongo.db.users.insert_one({
            "username": username,
            "password": generate_password_hash(pwd),
            "checklist": []
        })
        return redirect(url_for("login"))
    return render_template("register.html")

# —— Login Route ——
@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        username = request.form["username"].strip()
        pwd = request.form["password"]
        user_doc = mongo.db.users.find_one({"username": username})
        if not user_doc or not check_password_hash(user_doc["password"], pwd):
            return "Invalid creds", 401
        user = User(user_doc)
        login_user(user)
        return redirect(url_for("index"))
    return render_template("login.html")

# —— Logout ——
@app.route("/logout")
@login_required
def logout():
    logout_user()
    return redirect(url_for("login"))



@app.route("/")
@login_required
def index():
    cats = mongo.db.templates.distinct("category")
    return render_template("index.html", categories=cats)

@app.route("/categories")
@login_required
def categories():
    cats = mongo.db.templates.distinct("category")
    return render_template("categories.html", categories=cats)

@app.route("/categories/<category>/templates")
@login_required
def templates_by_category(category):
    templates = list(mongo.db.templates.find({"category": category}))
    return render_template("templates_by_category.html",
                           category=category,
                           templates=templates)

@app.route("/template/<template_id>/items")
@login_required
def template_items(template_id):
    tpl = mongo.db.templates.find_one({"_id": ObjectId(template_id)})
    if not tpl:
        abort(404)
    return render_template("template_items.html", tpl=tpl)

@app.route("/add_to_checklist", methods=["POST"])
@login_required
def add_to_checklist():
    tool = request.form.get("tool")
    if "checklist" not in session:
        session["checklist"] = []
    if tool and tool not in session["checklist"]:
        session["checklist"].append(tool)
        session.modified = True
    return redirect(request.referrer or url_for("index"))

@app.route("/checklist")
@login_required
def checklist():
    checklist = session.get("checklist", [])
    return render_template("checklist.html", checklist=checklist)

# need a way to remove it from the user selected list
@app.route("/remove_from_checklist", methods=["POST"])
@login_required
def remove_from_checklist():
    checklist = session.get("checklist", [])

    entry_id = request.form.get("entry_id")
    legacy_key = request.form.get("tool_details")

    if entry_id:
        checklist = [it for it in checklist if it.get("added_at") != entry_id]

    elif legacy_key:
        try:
            tool, added_at = legacy_key.split("|||", 1)
        except ValueError:
            tool, added_at = legacy_key, None

        def _is_same(it):
            match_name = (it.get("tool") == tool) or (it.get("template_name") == tool)
            match_time = (it.get("added_at") == added_at) if added_at else False
            return match_name and match_time

        checklist = [it for it in checklist if not _is_same(it)]
    session["checklist"] = checklist
    session.modified = True

    return redirect(request.referrer or url_for("checklist"))

@app.route("/add_comment", methods=["POST"])
@login_required
def add_comment():
    tool = request.form["tool"]
    text = request.form["comment_text"].strip()
    if text:
        cid = ObjectId()
        mongo.db.tools.update_one(
            {"tool_name": tool},
            {"$push": {
                "comments": {
                    "comment_id": cid,
                    "text": text,
                    "created_at": datetime.utcnow().isoformat(),
                    "user_id": ObjectId(current_user.id)
                }
            }}
        )
    return redirect(request.referrer or url_for("category_page",
                                               category=request.form["category"]))

@app.route("/delete_comment", methods=["POST"])
@login_required
def delete_comment():
    tool = request.form["tool"]
    cid = request.form["comment_id"]
    mongo.db.tools.update_one(
        {"tool_name": tool},
        {"$pull": {"comments": {"comment_id": ObjectId(cid)}}}
    )
    return redirect(request.referrer or url_for("category_page",
                                               category=request.form["category"]))

@app.route("/comment/<tool>", methods=["GET", "POST"])
@login_required
def comment_page(tool):
    # On POST, save the detailed comment and redirect back
    if request.method == "POST":
        text = request.form.get("comment_text", "").strip()
        if text:
            cid = ObjectId()
            mongo.db.tools.update_one(
                {"tool_name": tool},
                {"$push": {
                    "comments": {
                        "comment_id": cid,
                        "text": text,
                        "created_at": datetime.utcnow().isoformat(),
                        "user_id": ObjectId(current_user.id)
                    }
                }}
            )
        # Redirect back to category page
        next_cat = request.form.get("category")
        return redirect(url_for("templates_by_category", category=next_cat))


    # On GET, render the dedicated comment form
    category = request.args.get("category", "")
    return render_template("comment_form.html", tool=tool, category=category)

@app.route("/item/<tool>/details", methods=["GET", "POST"])
@login_required
def item_details(tool):
    # validate tool exists in your data
    # (URL-decoded automatically by Flask)
    found = False
    for cat_tools in tool_data.values():
        if tool in cat_tools:
            found = True
            break
    if not found:
        return abort(404)

    if request.method == "POST":
        details = request.form.get("details", "").strip()
        # Initialize session checklist as list of dicts
        checklist = session.setdefault("checklist", [])
        # Add the item with details
        checklist.append({
            "tool": tool,
            "details": details,
            "added_at": datetime.utcnow().isoformat()
        })
        session.modified = True
        # Redirect back to category or wherever you like
        category = request.form.get("category", "")
        if category:
            return redirect(url_for("category_page", category=category))
        return redirect(url_for("checklist"))

    # GET → render the form
    category = request.args.get("category", "")
    return render_template(
        "detail_form.html",
        tool=tool,
        category=category
    )

@app.route("/submit_checklist", methods=["POST"])
@login_required
def submit_checklist():
    items = session.get("checklist", [])
    if not items:
        return redirect(url_for("checklist"))

    # Build the submission document
    submission = {
        "user_id": ObjectId(current_user.id),
        "submitted_at": datetime.utcnow(),
        "items": [
            {
                "tool": it["tool"],
                "details": it["details"],
                "added_at": datetime.fromisoformat(it["added_at"])
            }
            for it in items
        ]
    }
    # Insert into MongoDB
    mongo.db.submissions.insert_one(submission)

    # Clear the user’s cart
    session["checklist"] = []
    session.modified = True

    # Render a simple success page
    return render_template("submit_success.html")

@app.route("/stats/popular-tools")
@login_required
def popular_tools():
    pipeline = [
      {"$unwind": "$items"},
      {"$group": {"_id": "$items.tool", "count": {"$sum": 1}}},
      {"$sort": {"count": -1}}
    ]
    stats = list(mongo.db.submissions.aggregate(pipeline))
    return render_template("stats.html", stats=stats)

@app.route("/export_submissions.csv")
@login_required  # you can add an “admin-only” check here
def export_submissions():
    # Query all submissions
    cursor = mongo.db.submissions.find()
    # Prepare CSV in memory
    buffer = io.StringIO()
    writer = csv.writer(buffer)
    # Header row
    writer.writerow(["submission_id","user_id","submitted_at","tool","details","added_at"])
    # Flatten each item
    for sub in cursor:
        sid = str(sub["_id"])
        uid = str(sub["user_id"])
        ts = sub["submitted_at"].isoformat()
        for it in sub["items"]:
            writer.writerow([
                sid,
                uid,
                ts,
                it["tool"],
                it["details"],
                it["added_at"].isoformat()
            ])
    # Send as download
    return Response(
        buffer.getvalue(),
        mimetype="text/csv",
        headers={"Content-Disposition":"attachment; filename=submissions.csv"}
    )
    
# templates
@app.route("/templates")
@login_required
def list_templates():
    templates = list(mongo.db.templates.find())
    return render_template("list_templates.html", templates=templates)


@app.route("/inspect/<template_id>", methods=["GET", "POST"])
@login_required
def inspect(template_id):
    tpl = mongo.db.templates.find_one({"_id": ObjectId(template_id)})
    if not tpl:
        abort(404)

    if request.method == "POST":
        responses = {}
        for it in tpl["items"]:
            key = it["key"]
            if it["type"] == "boolean":
                responses[key] = bool(request.form.get(key))
            else:
                responses[key] = request.form.get(key)

        mongo.db.inspections.insert_one({
            "template_id": ObjectId(template_id),
            "user_id": ObjectId(current_user.id),
            "started_at": datetime.utcnow(),
            "completed_at": datetime.utcnow(),
            "responses": responses
        })
        return render_template("inspection_success.html", tpl=tpl)

    return render_template("inspect.html", tpl=tpl)

# ─── Admin

@app.route("/admin/templates")
@login_required
def admin_list_templates():
    templates = list(mongo.db.templates.find())
    return render_template("admin_list_templates.html", templates=templates)

@app.route("/admin/template/new", methods=["GET","POST"])
@login_required
def new_template():
    if request.method == "POST":
        category = request.form["category"].strip()
        name     = request.form["name"].strip()
        keys     = request.form.getlist("item_key")
        labels   = request.form.getlist("item_label")
        types    = request.form.getlist("item_type")
        items = [
            {"key": k, "label": l, "type": t}
            for k,l,t in zip(keys, labels, types)
            if k and l and t
        ]
        mongo.db.templates.insert_one({
            "category": category,
            "name":     name,
            "items":    items
        })
        return redirect(url_for("admin_list_templates"))

    return render_template("edit_template.html", template=None)

@app.route("/admin/template/<template_id>/edit", methods=["GET","POST"])
@login_required
def edit_template(template_id):
    tpl = mongo.db.templates.find_one({"_id": ObjectId(template_id)})
    if not tpl:
        abort(404)

    if request.method == "POST":
        category = request.form["category"].strip()
        name     = request.form["name"].strip()
        keys     = request.form.getlist("item_key")
        labels   = request.form.getlist("item_label")
        types    = request.form.getlist("item_type")
        items = [
            {"key": k, "label": l, "type": t}
            for k,l,t in zip(keys, labels, types)
            if k and l and t
        ]
        mongo.db.templates.update_one(
            {"_id": ObjectId(template_id)},
            {"$set": {
               "category": category,
               "name":     name,
               "items":    items
            }}
        )
        return redirect(url_for("admin_list_templates"))

    return render_template("edit_template.html", template=tpl)

@app.route("/template/<template_id>/add_to_cart", methods=["POST"])
@login_required
def add_template_to_cart(template_id):
    tpl = mongo.db.templates.find_one({"_id": ObjectId(template_id)})
    if not tpl:
        abort(404)

    details, labels = {}, {}
    for it in tpl['items']:
        key = it['key']
        labels[key] = it['label']
        form_name = f"field__{key}"
        val = request.form.get(form_name)
        if it['type'] == 'boolean':
            details[key] = val if val in ("Pass", "Not Pass") else "Not Pass"
        else:
            details[key] = (val or "").strip()

    entry = {
        "template_id": str(tpl["_id"]),
        "template_name": tpl["name"],
        "category": tpl.get("category", ""),
        "details": details,
        "labels": labels,
        "added_at": datetime.utcnow().isoformat()
    }
    checklist = session.setdefault("checklist", [])
    checklist.append(entry)
    session.modified = True
    return redirect(url_for("review"))

@app.route("/review")
@login_required
def review():
    entries = session.get("checklist", [])

    grouped = {}
    for e in entries:
        cat = e.get("category", "Uncategorized")
        name = e.get("template_name") or e.get("tool", "Untitled")
        grouped.setdefault((cat, name), []).append(e)

    return render_template("review.html", grouped=grouped, total=len(entries))

@app.route("/export_pdf")
@login_required
def export_pdf():
    entries = session.get("checklist", [])
    grouped = {}
    for e in entries:
        cat = e.get("category", "Uncategorized")
        name = e.get("template_name") or e.get("tool", "Untitled")
        grouped.setdefault((cat, name), []).append(e)

    html = render_template("review_pdf.html", grouped=grouped, generated_at=datetime.utcnow())
    pdf_io = BytesIO()
    pisa.CreatePDF(src=html, dest=pdf_io)
    pdf_io.seek(0)
    return send_file(
        pdf_io,
        as_attachment=True,
        download_name="inspection_summary.pdf",
        mimetype="application/pdf"
    )


import csv
@app.route("/export_csv")
@login_required
def export_csv():
    from io import StringIO
    sio = StringIO()
    writer = csv.writer(sio)
    writer.writerow(["Category","Template","Field Key","Field Value","Added At"])

    entries = session.get("checklist", [])
    for e in entries:
        cat = e.get("category", "Uncategorized")
        name = e.get("template_name") or e.get("tool", "Untitled")
        for k, v in (e.get("details") or {}).items():
            writer.writerow([cat, name, k, v, e.get("added_at","")])

    return send_file(
        BytesIO(sio.getvalue().encode("utf-8")),
        as_attachment=True,
        download_name="inspection_summary.csv",
        mimetype="text/csv"
    )

if __name__ == '__main__':
    app.run(debug=True)
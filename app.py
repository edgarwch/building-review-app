import csv
import io
from flask import Flask, Response, render_template, request, redirect, url_for, session
from flask_pymongo import PyMongo
from flask_login import (
    LoginManager, UserMixin,
    login_user, login_required,
    logout_user, current_user
)
from werkzeug.security import generate_password_hash, check_password_hash
from bson.objectid import ObjectId
from datetime import datetime
from bson.objectid import ObjectId

app = Flask(__name__)
app.secret_key = "123"

app.config["MONGO_URI"] = "mongodb://localhost:27017/review_app"
mongo = PyMongo(app)


# —— Flask-Login Setup ——
login_manager = LoginManager(app)
login_manager.login_view = "login"

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
    tool = request.form.get("tool")
    checklist = session.get("checklist", [])
    if tool in checklist:
        checklist.remove(tool)
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

    details = {}
    for it in tpl['items']:
        key = it['key']
        form_name = f"field__{key}"
        if it['type'] == 'boolean':
            details[key] = bool(request.form.get(form_name))
        else:
            details[key] = request.form.get(form_name, "").strip()

    # Add one entry to the session checklist
    session.setdefault("checklist", []).append({
        "template_id": template_id,
        "template_name": tpl['name'],
        "details": details,
        "added_at": datetime.utcnow().isoformat()
    })
    session.modified = True

    return redirect(url_for('template_items', template_id=template_id))

if __name__ == '__main__':
    app.run(debug=True)
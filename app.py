from flask import Flask, render_template, request, redirect, url_for, session

app = Flask(__name__)
app.secret_key = "123"

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

@app.route("/")
def index():
    categories = list(tool_data.keys())
    return render_template("index.html", categories=categories)

@app.route("/category/<category>")
def category_page(category):
    tools = tool_data.get(category, [])
    return render_template("category.html", category=category, tools=tools)

@app.route("/add_to_checklist", methods=["POST"])
def add_to_checklist():
    tool = request.form.get("tool")
    if "checklist" not in session:
        session["checklist"] = []
    if tool and tool not in session["checklist"]:
        session["checklist"].append(tool)
        session.modified = True
    return redirect(request.referrer or url_for("index"))

@app.route("/checklist")
def checklist():
    checklist = session.get("checklist", [])
    return render_template("checklist.html", checklist=checklist)

# need a way to remove it from the user selected list
@app.route("/remove_from_checklist", methods=["POST"])
def remove_from_checklist():
    tool = request.form.get("tool")
    checklist = session.get("checklist", [])
    if tool in checklist:
        checklist.remove(tool)
        session["checklist"] = checklist
        session.modified = True
    return redirect(request.referrer or url_for("checklist"))

if __name__ == '__main__':
    app.run(debug=True)
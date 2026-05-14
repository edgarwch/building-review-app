from functools import wraps

from flask import abort
from flask_login import UserMixin, current_user, login_required
from bson.objectid import ObjectId


class User(UserMixin):
    def __init__(self, user_doc):
        self.id = str(user_doc["_id"])
        self.username = user_doc["username"]
        self._role = user_doc.get("role", "inspector")

    @property
    def role(self):
        return self._role or "inspector"

    @property
    def is_manager(self):
        return self.role == "manager"

    @staticmethod
    def get(user_id, mongo):
        doc = mongo.db.users.find_one({"_id": ObjectId(user_id)})
        return User(doc) if doc else None


def role_required(*roles):
    def decorator(f):
        @wraps(f)
        @login_required
        def wrapped(*args, **kwargs):
            if current_user.role not in roles:
                abort(403)
            return f(*args, **kwargs)

        return wrapped

    return decorator

from flask import Flask
from flask_pymongo import PyMongo
from flask_login import LoginManager
from app.config import Config
from app.models import User

mongo = PyMongo()
login_manager = LoginManager()


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    mongo.init_app(app)
    login_manager.init_app(app)
    login_manager.login_view = "auth.login"

    @login_manager.user_loader
    def load_user(user_id):
        return User.get(user_id, mongo)

    from app.routes_auth import auth_bp
    from app.routes_main import main_bp
    from app.routes_admin import admin_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(main_bp)
    app.register_blueprint(admin_bp, url_prefix="/admin")

    return app

import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "dev-key-change-me")
    MONGO_URI = os.environ.get("MONGO_URI", "mongodb://localhost:27017/review_app")
    UPLOAD_FOLDER = os.environ.get(
        "UPLOAD_FOLDER",
        os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads"),
    )
    MAX_CONTENT_LENGTH = 50 * 1024 * 1024  # 50MB
    OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY", "")

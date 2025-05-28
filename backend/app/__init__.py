import os
from flask import Flask
from app.database import db
from flask_cors import CORS
from config import DevelopmentConfig, ProductionConfig

def create_app():
    app = Flask(__name__)
    env = os.getenv("FLASK_ENV", "development")
    cfg = ProductionConfig if env=="production" else DevelopmentConfig
    app.config.from_object(cfg)

    db.init_app(app)
    with app.app_context():
        db.create_all()

    CORS(app, resources={r"/*": {"origins": "*"}})

    from app.routes import api
    app.register_blueprint(api, url_prefix="/")
    return app

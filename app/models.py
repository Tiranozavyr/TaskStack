from app.database import db
from typing import Any

class Task(db.Model):
    id: int = db.Column(db.Integer, primary_key=True)
    title: str = db.Column(db.String, nullable=False)
    description: str = db.Column(db.String, nullable=True)
    is_done: bool = db.Column(db.Boolean, default=False)

    def __init__(self, title: str, description: str = "", is_done: bool = False):
        self.title = title
        self.description = description
        self.is_done = is_done

    def to_dict(self) -> dict[str, Any]:
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "is_done": self.is_done
        }
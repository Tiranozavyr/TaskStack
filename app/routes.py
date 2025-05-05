from flask import Blueprint, request, jsonify
from app.database import db
from app.models import Task
from typing import List, cast

api = Blueprint('api', __name__)

@api.route("/", methods=["GET"])
def home():
    return {"message": "Welcome to TaskStack API!"}

@api.route("/tasks", methods=["GET"])
def get_tasks():
    tasks = cast(List[Task], Task.query.all())
    return jsonify([task.to_dict() for task in tasks])

@api.route("/tasks", methods=["POST"])
def create_task():
    data = request.get_json()
    new_task = Task(
        title=data.get("title"),
        description=data.get("description", ""),
        is_done=data.get("is_done", False)
    )
    db.session.add(new_task)
    db.session.commit()
    return jsonify(new_task.to_dict()), 201

@api.route("/tasks/<int:task_id>", methods=["PUT"])
def update_task(task_id: int):
    task = Task.query.get(task_id)
    if not task:
        return jsonify({"error": "Task not found"}), 404

    data = request.get_json()
    task.title = data.get("title")
    task.description = data.get("description", "")
    task.is_done = data.get("is_done", False)

    db.session.commit()
    return jsonify(task.to_dict())

@api.route("/tasks/<int:task_id>", methods=["PATCH"])
def partial_update_task(task_id: int):
    task = Task.query.get(task_id)
    if not task:
        return jsonify({"error": "Task not found"}), 404

    data = request.get_json()
    if "title" in data:
        task.title = data["title"]
    if "description" in data:
        task.description = data["description"]
    if "is_done" in data:
        task.is_done = data["is_done"]

    db.session.commit()
    return jsonify(task.to_dict())
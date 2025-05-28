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

@api.route("/tasks/<int:task_id>", methods=["GET"])
def get_task(task_id: int):
    task = Task.query.get(task_id)
    if not task:
        return jsonify({"error": "Task not found"}), 404
    return jsonify(task.to_dict())

@api.route("/tasks", methods=["POST"])
def create_task():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid input"}), 400
    
    title = data.get("title")
    if not title or not isinstance(title, str):
        return jsonify({"error": "Invalid or missing 'title'. Must be a non-empty string."}), 400

    description = data.get("description", "")
    if not isinstance(description, str):
        return jsonify({"error": "Invalid 'description'. Must be a string."}), 400

    is_done = data.get("is_done", False)
    if not isinstance(is_done, bool):
        return jsonify({"error": "Invalid 'is_done'. Must be a boolean."}), 400
    
    new_task = Task(
        title=title,
        description=description,
        is_done=is_done
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
    if not data:
        return jsonify({"error": "Invalid input"}), 400

    title = data.get("title")
    if not title or not isinstance(title, str):
        return jsonify({"error": "Invalid or missing 'title'. Must be a non-empty string."}), 400

    description = data.get("description", "")
    if not isinstance(description, str):
        return jsonify({"error": "Invalid 'description'. Must be a string."}), 400

    is_done = data.get("is_done", False)
    if not isinstance(is_done, bool):
        return jsonify({"error": "Invalid 'is_done'. Must be a boolean."}), 400

    task.title = title
    task.description = description
    task.is_done = is_done

    db.session.commit()
    return jsonify(task.to_dict())

@api.route("/tasks/<int:task_id>", methods=["PATCH"])
def partial_update_task(task_id: int):
    task = Task.query.get(task_id)
    if not task:
        return jsonify({"error": "Task not found"}), 404

    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid input"}), 400

    if "title" in data:
        title = data["title"]
        if not title or not isinstance(title, str):
            return jsonify({"error": "Invalid 'title'. Must be a non-empty string."}), 400
        task.title = title
    if "description" in data:
        description = data["description"]
        if not isinstance(description, str):
            return jsonify({"error": "Invalid 'description'. Must be a string."}), 400
        task.description = description
    if "is_done" in data:
        is_done = data["is_done"]
        if not isinstance(is_done, bool):
            return jsonify({"error": "Invalid 'is_done'. Must be a boolean."}), 400
        task.is_done = is_done

    db.session.commit()
    return jsonify(task.to_dict())

@api.route("/tasks/<int:task_id>", methods=["DELETE"])
def delete_task(task_id: int):
    task = Task.query.get(task_id)
    if not task:
        return jsonify({"error": "Task not found"}), 404

    db.session.delete(task)
    db.session.commit()

    return jsonify({"message": "Task deleted successfully"}), 200

@api.errorhandler(404)
def not_found(e: Exception):
    return jsonify({"error":"Not found"}), 404

@api.route("/health", methods=["GET"])
def health():
    return jsonify({"status":"ok"}), 200

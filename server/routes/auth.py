from flask import Blueprint, jsonify, request, session

from extensions import db
from models import User


auth_bp = Blueprint("auth", __name__, url_prefix="/api")


@auth_bp.route("/signup", methods=["POST"])
def signup():
    data = request.get_json() or {}

    username = data.get("username", "").strip()
    password = data.get("password", "")

    if not username or not password:
        return jsonify({"error": "Username and password are required"}), 400

    if len(password) < 8:
        return jsonify(
            {"error": "Password must be at least 8 characters long"}
        ), 400

    existing_user = User.query.filter_by(username=username).first()

    if existing_user:
        return jsonify({"error": "Username is already taken"}), 409

    user = User(username=username)
    user.set_password(password)

    db.session.add(user)
    db.session.commit()

    session["user_id"] = user.id

    return jsonify({"user": user.to_dict()}), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}

    username = data.get("username", "").strip()
    password = data.get("password", "")

    if not username or not password:
        return jsonify({"error": "Username and password are required"}), 400

    user = User.query.filter_by(username=username).first()

    if not user or not user.check_password(password):
        return jsonify({"error": "Invalid username or password"}), 401

    session["user_id"] = user.id

    return jsonify({"user": user.to_dict()}), 200


@auth_bp.route("/logout", methods=["POST"])
def logout():
    session.pop("user_id", None)

    return jsonify({"message": "Logged out successfully"}), 200


@auth_bp.route("/me", methods=["GET"])
def current_user():
    user_id = session.get("user_id")

    if not user_id:
        return jsonify({"user": None}), 200

    user = db.session.get(User, user_id)

    if not user:
        session.pop("user_id", None)
        return jsonify({"user": None}), 200

    return jsonify({"user": user.to_dict()}), 200
from functools import wraps

from flask import jsonify, session


def login_required(route_function):
    @wraps(route_function)
    def protected_route(*args, **kwargs):
        if not session.get("user_id"):
            return jsonify({"error": "Authentication required"}), 401

        return route_function(*args, **kwargs)

    return protected_route
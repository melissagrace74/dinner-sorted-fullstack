from flask import Blueprint, jsonify, request, session

from extensions import db
from models import MealPlan
from routes.auth_helpers import login_required


meal_plans_bp = Blueprint(
    "meal_plans",
    __name__,
    url_prefix="/api/meal-plans",
)


def get_owned_meal_plan(meal_plan_id):
    return MealPlan.query.filter_by(
        id=meal_plan_id,
        user_id=session["user_id"],
    ).first()


@meal_plans_bp.route("", methods=["GET"])
@login_required
def get_meal_plans():
    page = request.args.get("page", 1, type=int)
    per_page = request.args.get("per_page", 10, type=int)

    page = max(page, 1)
    per_page = min(max(per_page, 1), 50)

    pagination = (
        MealPlan.query
        .filter_by(user_id=session["user_id"])
        .order_by(MealPlan.created_at.desc())
        .paginate(
            page=page,
            per_page=per_page,
            error_out=False,
        )
    )

    return jsonify(
        {
            "meal_plans": [
                meal_plan.to_dict()
                for meal_plan in pagination.items
            ],
            "pagination": {
                "page": pagination.page,
                "per_page": pagination.per_page,
                "total": pagination.total,
                "pages": pagination.pages,
            },
        }
    ), 200


@meal_plans_bp.route("", methods=["POST"])
@login_required
def create_meal_plan():
    data = request.get_json() or {}
    name = data.get("name", "").strip()

    if not name:
        return jsonify({"error": "Meal plan name is required"}), 400

    meal_plan = MealPlan(
        name=name,
        user_id=session["user_id"],
    )

    db.session.add(meal_plan)
    db.session.commit()

    return jsonify({"meal_plan": meal_plan.to_dict()}), 201


@meal_plans_bp.route("/<int:meal_plan_id>", methods=["GET"])
@login_required
def get_meal_plan(meal_plan_id):
    meal_plan = get_owned_meal_plan(meal_plan_id)

    if not meal_plan:
        return jsonify({"error": "Meal plan not found"}), 404

    return jsonify({"meal_plan": meal_plan.to_dict()}), 200


@meal_plans_bp.route("/<int:meal_plan_id>", methods=["PATCH"])
@login_required
def update_meal_plan(meal_plan_id):
    meal_plan = get_owned_meal_plan(meal_plan_id)

    if not meal_plan:
        return jsonify({"error": "Meal plan not found"}), 404

    data = request.get_json() or {}
    name = data.get("name", "").strip()

    if not name:
        return jsonify({"error": "Meal plan name is required"}), 400

    meal_plan.name = name
    db.session.commit()

    return jsonify({"meal_plan": meal_plan.to_dict()}), 200


@meal_plans_bp.route("/<int:meal_plan_id>", methods=["DELETE"])
@login_required
def delete_meal_plan(meal_plan_id):
    meal_plan = get_owned_meal_plan(meal_plan_id)

    if not meal_plan:
        return jsonify({"error": "Meal plan not found"}), 404

    db.session.delete(meal_plan)
    db.session.commit()

    return jsonify({"message": "Meal plan deleted successfully"}), 200
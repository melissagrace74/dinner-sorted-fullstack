from flask import Blueprint, jsonify, request, session

from extensions import db
from models import MealPlan, PlannedMeal
from routes.auth_helpers import login_required


planned_meals_bp = Blueprint(
    "planned_meals",
    __name__,
    url_prefix="/api",
)

VALID_DAYS = {
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
}


def get_owned_meal_plan(meal_plan_id):
    return MealPlan.query.filter_by(
        id=meal_plan_id,
        user_id=session["user_id"],
    ).first()


def get_owned_planned_meal(planned_meal_id):
    return (
        PlannedMeal.query
        .join(MealPlan)
        .filter(
            PlannedMeal.id == planned_meal_id,
            MealPlan.user_id == session["user_id"],
        )
        .first()
    )


@planned_meals_bp.route(
    "/meal-plans/<int:meal_plan_id>/meals",
    methods=["GET"],
)
@login_required
def get_planned_meals(meal_plan_id):
    meal_plan = get_owned_meal_plan(meal_plan_id)

    if not meal_plan:
        return jsonify({"error": "Meal plan not found"}), 404

    planned_meals = (
        PlannedMeal.query
        .filter_by(meal_plan_id=meal_plan.id)
        .order_by(PlannedMeal.id)
        .all()
    )

    return jsonify(
        {
            "planned_meals": [
                planned_meal.to_dict()
                for planned_meal in planned_meals
            ]
        }
    ), 200


@planned_meals_bp.route(
    "/meal-plans/<int:meal_plan_id>/meals",
    methods=["POST"],
)
@login_required
def create_planned_meal(meal_plan_id):
    meal_plan = get_owned_meal_plan(meal_plan_id)

    if not meal_plan:
        return jsonify({"error": "Meal plan not found"}), 404

    data = request.get_json() or {}

    day = data.get("day", "").strip()
    mealdb_id = str(data.get("mealdb_id", "")).strip()
    meal_name = data.get("meal_name", "").strip()
    thumbnail = data.get("thumbnail")

    if day not in VALID_DAYS:
        return jsonify({"error": "A valid day is required"}), 400

    if not mealdb_id or not meal_name:
        return jsonify(
            {"error": "Meal ID and meal name are required"}
        ), 400

    existing_meal = PlannedMeal.query.filter_by(
        meal_plan_id=meal_plan.id,
        day=day,
    ).first()

    if existing_meal:
        return jsonify(
            {"error": f"{day} already has a planned meal"}
        ), 409

    planned_meal = PlannedMeal(
        day=day,
        mealdb_id=mealdb_id,
        meal_name=meal_name,
        thumbnail=thumbnail,
        meal_plan_id=meal_plan.id,
    )

    db.session.add(planned_meal)
    db.session.commit()

    return jsonify(
        {"planned_meal": planned_meal.to_dict()}
    ), 201


@planned_meals_bp.route(
    "/planned-meals/<int:planned_meal_id>",
    methods=["GET"],
)
@login_required
def get_planned_meal(planned_meal_id):
    planned_meal = get_owned_planned_meal(planned_meal_id)

    if not planned_meal:
        return jsonify({"error": "Planned meal not found"}), 404

    return jsonify(
        {"planned_meal": planned_meal.to_dict()}
    ), 200


@planned_meals_bp.route(
    "/planned-meals/<int:planned_meal_id>",
    methods=["PATCH"],
)
@login_required
def update_planned_meal(planned_meal_id):
    planned_meal = get_owned_planned_meal(planned_meal_id)

    if not planned_meal:
        return jsonify({"error": "Planned meal not found"}), 404

    data = request.get_json() or {}

    if "day" in data:
        day = str(data["day"]).strip()

        if day not in VALID_DAYS:
            return jsonify({"error": "A valid day is required"}), 400

        existing_meal = PlannedMeal.query.filter(
            PlannedMeal.meal_plan_id == planned_meal.meal_plan_id,
            PlannedMeal.day == day,
            PlannedMeal.id != planned_meal.id,
        ).first()

        if existing_meal:
            return jsonify(
                {"error": f"{day} already has a planned meal"}
            ), 409

        planned_meal.day = day

    if "mealdb_id" in data:
        mealdb_id = str(data["mealdb_id"]).strip()

        if not mealdb_id:
            return jsonify({"error": "Meal ID cannot be empty"}), 400

        planned_meal.mealdb_id = mealdb_id

    if "meal_name" in data:
        meal_name = str(data["meal_name"]).strip()

        if not meal_name:
            return jsonify({"error": "Meal name cannot be empty"}), 400

        planned_meal.meal_name = meal_name

    if "thumbnail" in data:
        planned_meal.thumbnail = data["thumbnail"]

    db.session.commit()

    return jsonify(
        {"planned_meal": planned_meal.to_dict()}
    ), 200


@planned_meals_bp.route(
    "/planned-meals/<int:planned_meal_id>",
    methods=["DELETE"],
)
@login_required
def delete_planned_meal(planned_meal_id):
    planned_meal = get_owned_planned_meal(planned_meal_id)

    if not planned_meal:
        return jsonify({"error": "Planned meal not found"}), 404

    db.session.delete(planned_meal)
    db.session.commit()

    return jsonify(
        {"message": "Planned meal deleted successfully"}
    ), 200
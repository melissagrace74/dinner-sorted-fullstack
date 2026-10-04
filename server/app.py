import os

from dotenv import load_dotenv
from flask import Flask, jsonify
from flask_cors import CORS

from extensions import db, migrate
from models import MealPlan, PlannedMeal, User
from routes.auth import auth_bp
from routes.meal_plans import meal_plans_bp
from routes.planned_meals import planned_meals_bp


load_dotenv()

app = Flask(__name__)

app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URL")
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["SECRET_KEY"] = os.environ.get("SECRET_KEY")

CORS(
    app,
    origins=["http://localhost:5173"],
    supports_credentials=True,
)

db.init_app(app)
migrate.init_app(app, db)

app.register_blueprint(auth_bp)
app.register_blueprint(meal_plans_bp)
app.register_blueprint(planned_meals_bp)


@app.route("/api/health")
def health_check():
    return jsonify({"message": "Dinner, Sorted API is running"}), 200


if __name__ == "__main__":
    app.run(port=5555, debug=True)
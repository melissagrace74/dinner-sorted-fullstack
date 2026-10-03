import os

from dotenv import load_dotenv
from flask import Flask, jsonify
from flask_cors import CORS

from extensions import db, migrate
from models import User


load_dotenv()

app = Flask(__name__)

app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URL")
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

CORS(app)

db.init_app(app)
migrate.init_app(app, db)


@app.route("/api/health")
def health_check():
    return jsonify({"message": "Dinner, Sorted API is running"}), 200


if __name__ == "__main__":
    app.run(port=5555, debug=True)
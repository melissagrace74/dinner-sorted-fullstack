from datetime import datetime, timezone

from extensions import db


class MealPlan(db.Model):
    __tablename__ = "meal_plans"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    created_at = db.Column(
        db.DateTime,
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False,
    )

    user = db.relationship(
        "User",
        back_populates="meal_plans",
    )

    planned_meals = db.relationship(
        "PlannedMeal",
        back_populates="meal_plan",
        cascade="all, delete-orphan",
    )

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "created_at": self.created_at.isoformat(),
            "user_id": self.user_id,
        }

    def __repr__(self):
        return f"<MealPlan {self.name}>"
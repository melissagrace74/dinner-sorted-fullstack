from extensions import db


class PlannedMeal(db.Model):
    __tablename__ = "planned_meals"

    id = db.Column(db.Integer, primary_key=True)
    day = db.Column(db.String(20), nullable=False)
    mealdb_id = db.Column(db.String(20), nullable=False)
    meal_name = db.Column(db.String(200), nullable=False)
    thumbnail = db.Column(db.String(500))

    meal_plan_id = db.Column(
        db.Integer,
        db.ForeignKey("meal_plans.id"),
        nullable=False,
    )

    meal_plan = db.relationship(
        "MealPlan",
        back_populates="planned_meals",
    )

    __table_args__ = (
        db.UniqueConstraint(
            "meal_plan_id",
            "day",
            name="unique_meal_plan_day",
        ),
    )

    def to_dict(self):
        return {
            "id": self.id,
            "day": self.day,
            "mealdb_id": self.mealdb_id,
            "meal_name": self.meal_name,
            "thumbnail": self.thumbnail,
            "meal_plan_id": self.meal_plan_id,
        }

    def __repr__(self):
        return f"<PlannedMeal {self.day}: {self.meal_name}>"
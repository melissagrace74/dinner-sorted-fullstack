import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { DAYS } from "../constants/days";
import { useAuth } from "../context/AuthContext";
import {
  createPlannedMeal,
  getMealPlans,
} from "../services/backendApi";


function AddToMealPlan({ meal }) {
  const { user } = useAuth();

  const [mealPlans, setMealPlans] = useState([]);
  const [selectedMealPlanId, setSelectedMealPlanId] = useState("");
  const [selectedDay, setSelectedDay] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (!user) {
      return;
    }

    async function loadMealPlans() {
      setIsLoading(true);
      setError("");

      try {
        const data = await getMealPlans();
        setMealPlans(data.meal_plans);

        if (data.meal_plans.length > 0) {
          setSelectedMealPlanId(
            String(data.meal_plans[0].id)
          );
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    }

    loadMealPlans();
  }, [user]);

  async function handleAddMeal(event) {
    event.preventDefault();

    if (!selectedMealPlanId || !selectedDay) {
      return;
    }

    setIsAdding(true);
    setError("");
    setSuccessMessage("");

    try {
      await createPlannedMeal(
        Number(selectedMealPlanId),
        {
          day: selectedDay,
          mealdb_id: meal.idMeal,
          meal_name: meal.strMeal,
          thumbnail: meal.strMealThumb,
        }
      );

      setSuccessMessage(
        `${meal.strMeal} was added to ${selectedDay}.`
      );

      setSelectedDay("");
    } catch (error) {
      setError(error.message);
    } finally {
      setIsAdding(false);
    }
  }

  if (!user) {
    return (
      <section>
        <h2>Add to Meal Plan</h2>

        <p>
          <Link to="/login">Log in</Link> to add this recipe
          to your meal plan.
        </p>
      </section>
    );
  }

  if (isLoading) {
    return (
      <section>
        <h2>Add to Meal Plan</h2>
        <p>Loading your meal plans...</p>
      </section>
    );
  }

  if (mealPlans.length === 0) {
    return (
      <section>
        <h2>Add to Meal Plan</h2>

        <p>
          You don't have a meal plan yet.{" "}
          <Link to="/meal-plans">
            Create a meal plan
          </Link>{" "}
          first.
        </p>
      </section>
    );
  }

  return (
    <section>
      <h2>Add to Meal Plan</h2>

      <form onSubmit={handleAddMeal}>
        <div>
          <label htmlFor="add-meal-plan">
            Meal plan
          </label>

          <select
            id="add-meal-plan"
            value={selectedMealPlanId}
            onChange={(event) => {
              setSelectedMealPlanId(event.target.value);
              setSuccessMessage("");
              setError("");
            }}
          >
            {mealPlans.map((mealPlan) => (
              <option
                key={mealPlan.id}
                value={mealPlan.id}
              >
                {mealPlan.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="add-meal-day">
            Day
          </label>

          <select
            id="add-meal-day"
            value={selectedDay}
            onChange={(event) => {
              setSelectedDay(event.target.value);
              setSuccessMessage("");
              setError("");
            }}
          >
            <option value="">
              Choose a day
            </option>

            {DAYS.map((day) => (
              <option
                key={day}
                value={day}
              >
                {day}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={
            isAdding ||
            !selectedMealPlanId ||
            !selectedDay
          }
        >
          {isAdding ? "Adding..." : "Add to Meal Plan"}
        </button>
      </form>

      {successMessage && (
        <p role="status">
          {successMessage}
        </p>
      )}

      {error && (
        <p role="alert">
          {error}
        </p>
      )}
    </section>
  );
}

export default AddToMealPlan;
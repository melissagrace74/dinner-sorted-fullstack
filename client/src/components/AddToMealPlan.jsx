import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { DAYS } from "../constants/days";
import { useAuth } from "../context/AuthContext";
import {
  createPlannedMeal,
  getMealPlans,
  getPlannedMeals,
} from "../services/backendApi";


function AddToMealPlan({ meal }) {
  const { user } = useAuth();

  const [mealPlans, setMealPlans] = useState([]);
  const [plannedMeals, setPlannedMeals] = useState([]);
  const [selectedMealPlanId, setSelectedMealPlanId] = useState("");
  const [selectedDay, setSelectedDay] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMeals, setIsLoadingMeals] = useState(false);
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

  useEffect(() => {
    if (!selectedMealPlanId) {
      setPlannedMeals([]);
      return;
    }

    async function loadPlannedMeals() {
      setIsLoadingMeals(true);
      setError("");

      try {
        const data = await getPlannedMeals(
          Number(selectedMealPlanId)
        );

        setPlannedMeals(data.planned_meals);
      } catch (error) {
        setPlannedMeals([]);
        setError(error.message);
      } finally {
        setIsLoadingMeals(false);
      }
    }

    loadPlannedMeals();
  }, [selectedMealPlanId]);

  async function handleAddMeal(event) {
    event.preventDefault();

    if (!selectedMealPlanId || !selectedDay) {
      return;
    }

    setIsAdding(true);
    setError("");
    setSuccessMessage("");

    try {
      const data = await createPlannedMeal(
        Number(selectedMealPlanId),
        {
          day: selectedDay,
          mealdb_id: meal.idMeal,
          meal_name: meal.strMeal,
          thumbnail: meal.strMealThumb,
        }
      );

      setPlannedMeals((currentMeals) => [
        ...currentMeals,
        data.planned_meal,
      ]);

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
              setSelectedDay("");
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
            disabled={isLoadingMeals}
          >
            <option value="">
              {isLoadingMeals
                ? "Loading days..."
                : "Choose a day"}
            </option>

            {DAYS.map((day) => {
              const dayIsOccupied = plannedMeals.some(
                (plannedMeal) => plannedMeal.day === day
              );

              return (
                <option
                  key={day}
                  value={day}
                  disabled={dayIsOccupied}
                >
                  {day}
                  {dayIsOccupied ? " — already planned" : ""}
                </option>
              );
            })}
          </select>
        </div>

        <button
          type="submit"
          disabled={
            isAdding ||
            isLoadingMeals ||
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
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
  const [selectedMealPlanId, setSelectedMealPlanId] =
    useState("");
  const [selectedDay, setSelectedDay] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMeals, setIsLoadingMeals] =
    useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] =
    useState("");

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

  const weekIsFull =
    !isLoadingMeals &&
    DAYS.every((day) =>
      plannedMeals.some(
        (plannedMeal) => plannedMeal.day === day
      )
    );

  if (!user) {
    return (
      <section className="add-to-plan">
        <h2>Plan Your Week</h2>

        <p>
          <Link to="/login">Log in</Link> to add this
          recipe to your meal plan.
        </p>
      </section>
    );
  }

  if (isLoading) {
    return (
      <section className="add-to-plan">
        <h2>Plan Your Week</h2>
        <p>Loading your meal plans...</p>
      </section>
    );
  }

  if (mealPlans.length === 0) {
    return (
      <section className="add-to-plan">
        <h2>Plan Your Week</h2>

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
    <section className="add-to-plan">
      <h2>Plan Your Week</h2>

      <form
        className="add-to-plan-form"
        onSubmit={handleAddMeal}
      >
        <div className="add-to-plan-field">
          <label htmlFor="add-meal-plan">
            Meal Plan
          </label>

          <select
            id="add-meal-plan"
            value={selectedMealPlanId}
            onChange={(event) => {
              setSelectedMealPlanId(
                event.target.value
              );
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

        {isLoadingMeals ? (
          <p className="day-loading">
            Loading days...
          </p>
        ) : successMessage ? (
          <div
            className="add-to-plan-success"
            role="status"
          >
            <p>{successMessage}</p>

            <Link
              className="back-link"
              to="/meal-plans"
            >
              Go to My Meal Plans
            </Link>
          </div>
        ) : weekIsFull ? (
          <div className="add-to-plan-full">
            <p>
              <strong>Your week is full.</strong>
            </p>

            <p>
              All seven days already have a meal
              planned.
            </p>

            <Link
              className="back-link"
              to="/meal-plans"
            >
              Go to My Meal Plans
            </Link>
          </div>
        ) : (
          <>
            <fieldset className="meal-plan-days">
              <legend>Choose a Day</legend>

              <div className="day-button-grid">
                {DAYS.map((day) => {
                  const dayIsOccupied =
                    plannedMeals.some(
                      (plannedMeal) =>
                        plannedMeal.day === day
                    );

                  const dayIsSelected =
                    selectedDay === day;

                  return (
                    <button
                      key={day}
                      className={
                        dayIsSelected
                          ? "day-button selected-day"
                          : "day-button"
                      }
                      type="button"
                      disabled={dayIsOccupied}
                      aria-pressed={dayIsSelected}
                      onClick={() => {
                        setSelectedDay(
                          dayIsSelected ? "" : day
                        );
                        setSuccessMessage("");
                        setError("");
                      }}
                    >
                      {dayIsSelected && (
                        <span className="day-check">
                          ✓
                        </span>
                      )}
                      {day}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <button
              className="add-to-plan-button"
              type="submit"
              disabled={
                isAdding ||
                !selectedMealPlanId ||
                !selectedDay
              }
            >
              {isAdding
                ? "Adding..."
                : "Add This Recipe"}
            </button>
          </>
        )}
      </form>

      {error && (
        <p
          className="add-to-plan-error"
          role="alert"
        >
          {error}
        </p>
      )}
    </section>
  );
}

export default AddToMealPlan;
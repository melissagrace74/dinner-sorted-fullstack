import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { DAYS } from "../constants/days";
import useAuth from "../context/useAuth";
import {
  createPlannedMeal,
  getMealPlans,
  getPlannedMeals,
} from "../services/backendApi";


const ACTIVE_MEAL_PLAN_KEY =
  "dinnerSortedActiveMealPlanId";


function AddToMealPlan({ meal }) {
  const { user } = useAuth();

  const [mealPlans, setMealPlans] = useState([]);
  const [plannedMeals, setPlannedMeals] = useState([]);

  const [selectedMealPlanId, setSelectedMealPlanId] =
    useState("");

  const [selectedDays, setSelectedDays] = useState([]);

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
        const plans = data.meal_plans;

        setMealPlans(plans);

        if (plans.length > 0) {
          const savedPlanId = sessionStorage.getItem(
            ACTIVE_MEAL_PLAN_KEY
          );

          const savedPlanExists = plans.some(
            (mealPlan) =>
              String(mealPlan.id) === savedPlanId
          );

          const initialPlanId = savedPlanExists
            ? savedPlanId
            : String(plans[0].id);

          setSelectedMealPlanId(initialPlanId);

          sessionStorage.setItem(
            ACTIVE_MEAL_PLAN_KEY,
            initialPlanId
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
      return;
    }

    let isCancelled = false;

    async function loadPlannedMeals() {
      setIsLoadingMeals(true);
      setError("");

      try {
        const data = await getPlannedMeals(
          Number(selectedMealPlanId)
        );

        if (!isCancelled) {
          setPlannedMeals(data.planned_meals);
        }
      } catch (error) {
        if (!isCancelled) {
          setPlannedMeals([]);
          setError(error.message);
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingMeals(false);
        }
      }
    }

    loadPlannedMeals();

    return () => {
      isCancelled = true;
    };
  }, [selectedMealPlanId]);


  function handleMealPlanChange(event) {
    const mealPlanId = event.target.value;

    setSelectedMealPlanId(mealPlanId);
    setPlannedMeals([]);
    setSelectedDays([]);
    setSuccessMessage("");
    setError("");

    sessionStorage.setItem(
      ACTIVE_MEAL_PLAN_KEY,
      mealPlanId
    );
  }


  function handleDayToggle(day) {
    setSelectedDays((currentDays) => {
      if (currentDays.includes(day)) {
        return currentDays.filter(
          (selectedDay) => selectedDay !== day
        );
      }

      return [...currentDays, day];
    });

    setSuccessMessage("");
    setError("");
  }


  async function handleAddMeal(event) {
    event.preventDefault();

    if (
      !selectedMealPlanId ||
      selectedDays.length === 0
    ) {
      return;
    }

    setIsAdding(true);
    setError("");
    setSuccessMessage("");

    try {
      const addedMeals = [];

      for (const day of selectedDays) {
        const data = await createPlannedMeal(
          Number(selectedMealPlanId),
          {
            day,
            mealdb_id: meal.idMeal,
            meal_name: meal.strMeal,
            thumbnail: meal.strMealThumb,
          }
        );

        addedMeals.push(data.planned_meal);
      }

      setPlannedMeals((currentMeals) => [
        ...currentMeals,
        ...addedMeals,
      ]);

      const orderedSelectedDays = DAYS.filter((day) =>
        selectedDays.includes(day)
      );

      if (orderedSelectedDays.length === 1) {
        setSuccessMessage(
          `${meal.strMeal} was added to ${orderedSelectedDays[0]}.`
        );
      } else {
        setSuccessMessage(
          `${meal.strMeal} was added to ${orderedSelectedDays.join(
            ", "
          )}.`
        );
      }

      setSelectedDays([]);
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
            onChange={handleMealPlanChange}
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
              <legend>Choose Day(s)</legend>

              <div className="day-button-grid">
                {DAYS.map((day) => {
                  const dayIsOccupied =
                    plannedMeals.some(
                      (plannedMeal) =>
                        plannedMeal.day === day
                    );

                  const dayIsSelected =
                    selectedDays.includes(day);

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
                      onClick={() =>
                        handleDayToggle(day)
                      }
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
                selectedDays.length === 0
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
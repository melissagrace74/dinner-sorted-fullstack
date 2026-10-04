import { useEffect, useState } from "react";

import MealPlanSelector from "../components/MealPlanSelector";
import WeeklyPlanner from "../components/WeeklyPlanner";
import {
  createMealPlan,
  deleteMealPlan,
  deletePlannedMeal,
  getMealPlans,
  getPlannedMeals,
  updateMealPlan,
  updatePlannedMeal,
} from "../services/backendApi";


function MealPlanPage() {
  const [mealPlans, setMealPlans] = useState([]);
  const [selectedMealPlanId, setSelectedMealPlanId] = useState(null);
  const [plannedMeals, setPlannedMeals] = useState([]);

  const [newPlanName, setNewPlanName] = useState("");
  const [editingPlanId, setEditingPlanId] = useState(null);
  const [editingPlanName, setEditingPlanName] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMeals, setIsLoadingMeals] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadMealPlans() {
      setIsLoading(true);
      setError("");

      try {
        const data = await getMealPlans();
        setMealPlans(data.meal_plans);

        if (data.meal_plans.length > 0) {
          setSelectedMealPlanId(data.meal_plans[0].id);
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    }

    loadMealPlans();
  }, []);

  useEffect(() => {
    if (!selectedMealPlanId) {
      setPlannedMeals([]);
      return;
    }

    async function loadPlannedMeals() {
      setIsLoadingMeals(true);
      setError("");

      try {
        const data = await getPlannedMeals(selectedMealPlanId);
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

  async function handleCreatePlan(event) {
    event.preventDefault();

    const planName = newPlanName.trim();

    if (!planName) {
      return;
    }

    setIsCreating(true);
    setError("");

    try {
      const data = await createMealPlan(planName);

      setMealPlans((currentPlans) => [
        data.meal_plan,
        ...currentPlans,
      ]);

      setSelectedMealPlanId(data.meal_plan.id);
      setNewPlanName("");
    } catch (error) {
      setError(error.message);
    } finally {
      setIsCreating(false);
    }
  }

  function handleStartEditing(mealPlan) {
    setEditingPlanId(mealPlan.id);
    setEditingPlanName(mealPlan.name);
    setError("");
  }

  function handleCancelEditing() {
    setEditingPlanId(null);
    setEditingPlanName("");
  }

  async function handleUpdatePlan(event, mealPlanId) {
    event.preventDefault();

    const planName = editingPlanName.trim();

    if (!planName) {
      return;
    }

    setError("");

    try {
      const data = await updateMealPlan(mealPlanId, planName);

      setMealPlans((currentPlans) =>
        currentPlans.map((mealPlan) =>
          mealPlan.id === mealPlanId
            ? data.meal_plan
            : mealPlan
        )
      );

      setEditingPlanId(null);
      setEditingPlanName("");
    } catch (error) {
      setError(error.message);
    }
  }

  async function handleDeletePlan(mealPlanId) {
    const shouldDelete = window.confirm(
      "Delete this meal plan and all of its planned meals?"
    );

    if (!shouldDelete) {
      return;
    }

    setError("");

    try {
      await deleteMealPlan(mealPlanId);

      const remainingPlans = mealPlans.filter(
        (mealPlan) => mealPlan.id !== mealPlanId
      );

      setMealPlans(remainingPlans);

      if (selectedMealPlanId === mealPlanId) {
        setSelectedMealPlanId(
          remainingPlans.length > 0
            ? remainingPlans[0].id
            : null
        );
      }

      if (editingPlanId === mealPlanId) {
        setEditingPlanId(null);
        setEditingPlanName("");
      }
    } catch (error) {
      setError(error.message);
    }
  }

  async function handleMoveMeal(plannedMealId, newDay) {
    setError("");

    try {
      const data = await updatePlannedMeal(
        plannedMealId,
        {
          day: newDay,
        }
      );

      setPlannedMeals((currentMeals) =>
        currentMeals.map((plannedMeal) =>
          plannedMeal.id === plannedMealId
            ? data.planned_meal
            : plannedMeal
        )
      );

      return true;
    } catch (error) {
      setError(error.message);
      return false;
    }
  }

  async function handleRemoveMeal(plannedMealId) {
    const shouldRemove = window.confirm(
      "Remove this meal from the meal plan?"
    );

    if (!shouldRemove) {
      return;
    }

    setError("");

    try {
      await deletePlannedMeal(plannedMealId);

      setPlannedMeals((currentMeals) =>
        currentMeals.filter(
          (plannedMeal) => plannedMeal.id !== plannedMealId
        )
      );
    } catch (error) {
      setError(error.message);
    }
  }

  return (
    <main>
      <h1>Meal Plans</h1>

      <p>
        Create a meal plan and organize your dinners for the week.
      </p>

      <section>
        <h2>Create a Meal Plan</h2>

        <form onSubmit={handleCreatePlan}>
          <label htmlFor="meal-plan-name">
            Meal plan name
          </label>

          <input
            id="meal-plan-name"
            type="text"
            value={newPlanName}
            onChange={(event) => setNewPlanName(event.target.value)}
            placeholder="This Week"
            disabled={isCreating}
            maxLength="100"
          />

          <button
            type="submit"
            disabled={isCreating || !newPlanName.trim()}
          >
            {isCreating ? "Creating..." : "Create Plan"}
          </button>
        </form>
      </section>

      {error && (
        <p role="alert">
          {error}
        </p>
      )}

      <section>
        <h2>Your Meal Plans</h2>

        {isLoading ? (
          <p>Loading meal plans...</p>
        ) : mealPlans.length === 0 ? (
          <p>
            You don't have any meal plans yet. Create one to get started.
          </p>
        ) : (
          <ul>
            {mealPlans.map((mealPlan) => (
              <li key={mealPlan.id}>
                {editingPlanId === mealPlan.id ? (
                  <form
                    onSubmit={(event) =>
                      handleUpdatePlan(event, mealPlan.id)
                    }
                  >
                    <label htmlFor={`plan-name-${mealPlan.id}`}>
                      Meal plan name
                    </label>

                    <input
                      id={`plan-name-${mealPlan.id}`}
                      type="text"
                      value={editingPlanName}
                      onChange={(event) =>
                        setEditingPlanName(event.target.value)
                      }
                      maxLength="100"
                    />

                    <button
                      type="submit"
                      disabled={!editingPlanName.trim()}
                    >
                      Save
                    </button>

                    <button
                      type="button"
                      onClick={handleCancelEditing}
                    >
                      Cancel
                    </button>
                  </form>
                ) : (
                  <>
                    <span>{mealPlan.name}</span>

                    <button
                      type="button"
                      onClick={() => handleStartEditing(mealPlan)}
                    >
                      Rename
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeletePlan(mealPlan.id)}
                    >
                      Delete
                    </button>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {!isLoading && mealPlans.length > 0 && (
        <>
          <MealPlanSelector
            mealPlans={mealPlans}
            selectedMealPlanId={selectedMealPlanId}
            onSelectMealPlan={setSelectedMealPlanId}
          />

          {isLoadingMeals ? (
            <p>Loading planned meals...</p>
          ) : (
            <WeeklyPlanner
              plannedMeals={plannedMeals}
              onMoveMeal={handleMoveMeal}
              onRemoveMeal={handleRemoveMeal}
            />
          )}
        </>
      )}
    </main>
  );
}

export default MealPlanPage;
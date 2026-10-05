import { useEffect, useState } from "react";

import WeeklyPlanner from "../components/WeeklyPlanner";

import {
  createMealPlan,
  createPlannedMeal,
  deleteMealPlan,
  deletePlannedMeal,
  getMealPlans,
  getPlannedMeals,
  moveOrSwapPlannedMeal,
  updateMealPlan,
} from "../services/backendApi";

import "./MealPlanPage.css";


const ACTIVE_MEAL_PLAN_KEY =
  "dinnerSortedActiveMealPlanId";


function sortMealPlans(plans) {
  return [...plans].sort((a, b) => {
    if (a.created_at && b.created_at) {
      return new Date(a.created_at) - new Date(b.created_at);
    }

    return a.id - b.id;
  });
}


function MealPlanPage() {
  const [mealPlans, setMealPlans] = useState([]);
  const [selectedMealPlanId, setSelectedMealPlanId] =
    useState(null);
  const [plannedMeals, setPlannedMeals] = useState([]);

  const [newPlanName, setNewPlanName] = useState("");
  const [editingPlanId, setEditingPlanId] = useState(null);
  const [editingPlanName, setEditingPlanName] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMeals, setIsLoadingMeals] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");


  useEffect(() => {
    let isCancelled = false;

    async function loadMealPlans() {
      setIsLoading(true);
      setError("");

      try {
        const data = await getMealPlans();
        const sortedPlans = sortMealPlans(data.meal_plans);

        if (isCancelled) {
          return;
        }

        setMealPlans(sortedPlans);

        if (sortedPlans.length > 0) {
          const savedPlanId = sessionStorage.getItem(
            ACTIVE_MEAL_PLAN_KEY
          );

          const savedPlan = sortedPlans.find(
            (mealPlan) =>
              String(mealPlan.id) === savedPlanId
          );

          const initialPlanId = savedPlan
            ? savedPlan.id
            : sortedPlans[0].id;

          setSelectedMealPlanId(initialPlanId);

          sessionStorage.setItem(
            ACTIVE_MEAL_PLAN_KEY,
            String(initialPlanId)
          );
        }
      } catch (error) {
        if (!isCancelled) {
          setError(error.message);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    loadMealPlans();

    return () => {
      isCancelled = true;
    };
  }, []);


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
          selectedMealPlanId
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

      setMealPlans((currentPlans) =>
        sortMealPlans([
          ...currentPlans,
          data.meal_plan,
        ])
      );

      setPlannedMeals([]);
      setSelectedMealPlanId(data.meal_plan.id);

      sessionStorage.setItem(
        ACTIVE_MEAL_PLAN_KEY,
        String(data.meal_plan.id)
      );

      setNewPlanName("");
    } catch (error) {
      setError(error.message);
    } finally {
      setIsCreating(false);
    }
  }


  function handleSelectPlan(mealPlanId) {
    setPlannedMeals([]);
    setSelectedMealPlanId(mealPlanId);
    setEditingPlanId(null);
    setEditingPlanName("");
    setError("");

    sessionStorage.setItem(
      ACTIVE_MEAL_PLAN_KEY,
      String(mealPlanId)
    );
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
      const data = await updateMealPlan(
        mealPlanId,
        planName
      );

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
        const nextPlanId =
          remainingPlans.length > 0
            ? remainingPlans[0].id
            : null;

        setPlannedMeals([]);
        setSelectedMealPlanId(nextPlanId);

        if (nextPlanId) {
          sessionStorage.setItem(
            ACTIVE_MEAL_PLAN_KEY,
            String(nextPlanId)
          );
        } else {
          sessionStorage.removeItem(
            ACTIVE_MEAL_PLAN_KEY
          );
        }
      }

      if (editingPlanId === mealPlanId) {
        setEditingPlanId(null);
        setEditingPlanName("");
      }
    } catch (error) {
      setError(error.message);
    }
  }


  async function handleMoveOrSwapMeal(
    plannedMealId,
    newDay
  ) {
    setError("");

    try {
      const data = await moveOrSwapPlannedMeal(
        plannedMealId,
        newDay
      );

      setPlannedMeals((currentMeals) =>
        currentMeals.map((currentMeal) => {
          const updatedMeal = data.planned_meals.find(
            (meal) => meal.id === currentMeal.id
          );

          return updatedMeal || currentMeal;
        })
      );

      return true;
    } catch (error) {
      setError(error.message);
      return false;
    }
  }


  async function handleCopyMeal(plannedMeal, newDay) {
    if (!selectedMealPlanId) {
      return false;
    }

    const dayIsOccupied = plannedMeals.some(
      (meal) => meal.day === newDay
    );

    if (dayIsOccupied) {
      setError(
        `${newDay} already has a planned meal.`
      );

      return false;
    }

    setError("");

    try {
      const data = await createPlannedMeal(
        selectedMealPlanId,
        {
          day: newDay,
          mealdb_id: plannedMeal.mealdb_id,
          meal_name: plannedMeal.meal_name,
          thumbnail: plannedMeal.thumbnail,
        }
      );

      setPlannedMeals((currentMeals) => [
        ...currentMeals,
        data.planned_meal,
      ]);

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
          (plannedMeal) =>
            plannedMeal.id !== plannedMealId
        )
      );
    } catch (error) {
      setError(error.message);
    }
  }


  const selectedMealPlan = mealPlans.find(
    (mealPlan) => mealPlan.id === selectedMealPlanId
  );


  return (
    <main className="meal-plan-page">
      <section className="meal-plan-intro">
        <p className="meal-plan-page-eyebrow">
          Plan your week
        </p>

        <h1>My Meal Plans</h1>

        <p className="meal-plan-page-description">
          Create a new meal plan or choose an existing
          one, and organize your dinners for the week.
        </p>
      </section>

      <section className="meal-plan-management">
        {error && (
          <p
            className="meal-plan-error"
            role="alert"
          >
            {error}
          </p>
        )}

        <div className="meal-plan-management-grid">
          <section className="meal-plan-management-column">
            <div className="meal-plan-column-heading">
              <p className="meal-plan-column-eyebrow">
                Start fresh
              </p>

              <h2>New Meal Plan</h2>
            </div>

            <form
              className="create-plan-form"
              onSubmit={handleCreatePlan}
            >
              <div className="create-plan-field">
                <input
                  id="meal-plan-name"
                  type="text"
                  value={newPlanName}
                  onChange={(event) =>
                    setNewPlanName(event.target.value)
                  }
                  placeholder="Enter name"
                  aria-label="Meal plan name"
                  disabled={isCreating}
                  maxLength="100"
                />
              </div>

              <button
                className="create-plan-button"
                type="submit"
                disabled={
                  isCreating || !newPlanName.trim()
                }
              >
                {isCreating
                  ? "Creating..."
                  : "Create Plan"}
              </button>
            </form>
          </section>

          <section className="meal-plan-management-column">
            <div className="meal-plan-column-heading">
              <p className="meal-plan-column-eyebrow">
                Choose a plan
              </p>

              <h2>Existing Meal Plans</h2>
            </div>

            {isLoading ? (
              <p className="meal-plan-status">
                Loading meal plans...
              </p>
            ) : mealPlans.length === 0 ? (
              <div className="meal-plan-empty-state">
                <p>
                  You don't have any meal plans yet.
                  Create one to get started.
                </p>
              </div>
            ) : (
              <ul className="meal-plan-list">
                {mealPlans.map((mealPlan) => {
                  const isSelected =
                    selectedMealPlanId === mealPlan.id;

                  return (
                    <li
                      className={[
                        "meal-plan-list-item",
                        isSelected
                          ? "selected-meal-plan"
                          : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      key={mealPlan.id}
                    >
                      {editingPlanId ===
                      mealPlan.id ? (
                        <form
                          className="rename-plan-form"
                          onSubmit={(event) =>
                            handleUpdatePlan(
                              event,
                              mealPlan.id
                            )
                          }
                        >
                          <div className="rename-plan-field">
                            <label
                              htmlFor={`plan-name-${mealPlan.id}`}
                            >
                              Meal plan name
                            </label>

                            <input
                              id={`plan-name-${mealPlan.id}`}
                              type="text"
                              value={editingPlanName}
                              onChange={(event) =>
                                setEditingPlanName(
                                  event.target.value
                                )
                              }
                              maxLength="100"
                            />
                          </div>

                          <div className="rename-plan-actions">
                            <button
                              className="save-plan-button"
                              type="submit"
                              disabled={
                                !editingPlanName.trim()
                              }
                            >
                              Save
                            </button>

                            <button
                              className="cancel-plan-button"
                              type="button"
                              onClick={
                                handleCancelEditing
                              }
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      ) : (
                        <>
                          <div className="meal-plan-list-info">
                            <span className="meal-plan-list-name">
                              {mealPlan.name}
                            </span>

                            {isSelected && (
                              <span className="selected-plan-label">
                                Selected
                              </span>
                            )}
                          </div>

                          <div className="meal-plan-list-actions">
                            {!isSelected && (
                              <button
                                className="select-plan-button"
                                type="button"
                                onClick={() =>
                                  handleSelectPlan(
                                    mealPlan.id
                                  )
                                }
                              >
                                Use Plan
                              </button>
                            )}

                            <button
                              className="rename-plan-button"
                              type="button"
                              onClick={() =>
                                handleStartEditing(
                                  mealPlan
                                )
                              }
                            >
                              Rename
                            </button>

                            <button
                              className="delete-plan-button"
                              type="button"
                              onClick={() =>
                                handleDeletePlan(
                                  mealPlan.id
                                )
                              }
                            >
                              Delete
                            </button>
                          </div>
                        </>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>
      </section>

      {!isLoading &&
        mealPlans.length > 0 &&
        selectedMealPlanId && (
          <>
            {isLoadingMeals ? (
              <p className="meal-plan-status">
                Loading planned meals...
              </p>
            ) : (
              <WeeklyPlanner
                mealPlanName={
                  selectedMealPlan?.name
                }
                plannedMeals={plannedMeals}
                onMoveOrSwapMeal={
                  handleMoveOrSwapMeal
                }
                onCopyMeal={handleCopyMeal}
                onRemoveMeal={handleRemoveMeal}
              />
            )}
          </>
        )}
    </main>
  );
}


export default MealPlanPage;
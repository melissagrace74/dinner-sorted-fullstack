import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { DAYS } from "../constants/days";
import { getMealById } from "../services/mealApi";

import "./WeeklyPlanner.css";

function WeeklyPlanner({
  mealPlanName,
  plannedMeals,
  onMoveOrSwapMeal,
  onCopyMeal,
  onRemoveMeal,
}) {
  const [movingMealId, setMovingMealId] = useState(null);
  const [copyingMealId, setCopyingMealId] = useState(null);
  const [selectedDay, setSelectedDay] = useState("");
  const [copyDay, setCopyDay] = useState("");
  const [mealDetails, setMealDetails] = useState({});
  const [draggedMealId, setDraggedMealId] = useState(null);
  const [dragOverDay, setDragOverDay] = useState("");

  useEffect(() => {
    let isActive = true;

    async function loadMealDetails() {
      const missingMeals = plannedMeals.filter(
        (plannedMeal) =>
          plannedMeal.mealdb_id &&
          !mealDetails[plannedMeal.mealdb_id]
      );

      if (missingMeals.length === 0) {
        return;
      }

      const uniqueMealIds = [
        ...new Set(
          missingMeals.map(
            (plannedMeal) => plannedMeal.mealdb_id
          )
        ),
      ];

      try {
        const results = await Promise.all(
          uniqueMealIds.map(async (mealId) => {
            const meal = await getMealById(mealId);
            return [mealId, meal];
          })
        );

        if (!isActive) {
          return;
        }

        setMealDetails((currentDetails) => {
          const updatedDetails = {
            ...currentDetails,
          };

          results.forEach(([mealId, meal]) => {
            if (meal) {
              updatedDetails[mealId] = meal;
            }
          });

          return updatedDetails;
        });
      } catch (error) {
        console.error(
          "Unable to load planner recipe details:",
          error
        );
      }
    }

    loadMealDetails();

    return () => {
      isActive = false;
    };
  }, [plannedMeals, mealDetails]);

  function getMealForDay(day) {
    return plannedMeals.find(
      (plannedMeal) => plannedMeal.day === day
    );
  }

  function startMovingMeal(plannedMeal) {
    setCopyingMealId(null);
    setCopyDay("");

    setMovingMealId(plannedMeal.id);
    setSelectedDay(plannedMeal.day);
  }

  function cancelMovingMeal() {
    setMovingMealId(null);
    setSelectedDay("");
  }

  async function handleMoveOrSwap(
    event,
    plannedMeal
  ) {
    event.preventDefault();

    if (
      !selectedDay ||
      selectedDay === plannedMeal.day
    ) {
      cancelMovingMeal();
      return;
    }

    const wasSuccessful =
      await onMoveOrSwapMeal(
        plannedMeal.id,
        selectedDay
      );

    if (wasSuccessful) {
      cancelMovingMeal();
    }
  }

  function startCopyingMeal(plannedMeal) {
    setMovingMealId(null);
    setSelectedDay("");

    const firstEmptyDay = DAYS.find(
      (day) => !getMealForDay(day)
    );

    setCopyingMealId(plannedMeal.id);
    setCopyDay(firstEmptyDay || "");
  }

  function cancelCopyingMeal() {
    setCopyingMealId(null);
    setCopyDay("");
  }

  async function handleCopyMeal(
    event,
    plannedMeal
  ) {
    event.preventDefault();

    if (!copyDay) {
      return;
    }

    const wasSuccessful = await onCopyMeal(
      plannedMeal,
      copyDay
    );

    if (wasSuccessful) {
      cancelCopyingMeal();
    }
  }

  function handleDragStart(
    event,
    plannedMeal
  ) {
    setDraggedMealId(plannedMeal.id);

    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData(
      "text/plain",
      String(plannedMeal.id)
    );
  }

  function handleDragOver(event, day) {
    if (!draggedMealId) {
      return;
    }

    event.preventDefault();
    event.dataTransfer.dropEffect = "move";

    setDragOverDay(day);
  }

  function handleDragLeave(event, day) {
    if (
      event.currentTarget.contains(
        event.relatedTarget
      )
    ) {
      return;
    }

    if (dragOverDay === day) {
      setDragOverDay("");
    }
  }

  async function handleDrop(event, day) {
    event.preventDefault();

    const transferredMealId =
      event.dataTransfer.getData("text/plain");

    const mealId =
      draggedMealId ||
      Number(transferredMealId);

    const draggedMeal = plannedMeals.find(
      (plannedMeal) =>
        plannedMeal.id === Number(mealId)
    );

    setDragOverDay("");

    if (!draggedMeal) {
      setDraggedMealId(null);
      return;
    }

    if (draggedMeal.day === day) {
      setDraggedMealId(null);
      return;
    }

    await onMoveOrSwapMeal(
      draggedMeal.id,
      day
    );

    setDraggedMealId(null);
  }

  function handleDragEnd() {
    setDraggedMealId(null);
    setDragOverDay("");
  }

  return (
    <section className="weekly-planner">
      <div className="planner-heading">
        <h2>
          {mealPlanName || "Weekly Planner"}
        </h2>
      </div>

      <p className="desktop-drag-tip">
        Drag meals between days to rearrange your week.
      </p>

      <div className="planner-grid">
        {DAYS.map((day) => {
          const plannedMeal =
            getMealForDay(day);

          const recipeDetails =
            plannedMeal
              ? mealDetails[
                  plannedMeal.mealdb_id
                ]
              : null;

          const isBeingDragged =
            plannedMeal &&
            draggedMealId ===
              plannedMeal.id;

          const isDragTarget =
            dragOverDay === day &&
            draggedMealId !== null;

          const dayClassName = [
            "planner-day",
            isDragTarget
              ? "drag-over"
              : "",
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <article
              className={dayClassName}
              key={day}
              onDragOver={(event) =>
                handleDragOver(
                  event,
                  day
                )
              }
              onDragLeave={(event) =>
                handleDragLeave(
                  event,
                  day
                )
              }
              onDrop={(event) =>
                handleDrop(event, day)
              }
            >
              <h3>{day}</h3>

              {plannedMeal ? (
                <div
                  className={[
                    "planned-meal",
                    isBeingDragged
                      ? "is-dragging"
                      : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  draggable
                  onDragStart={(event) =>
                    handleDragStart(
                      event,
                      plannedMeal
                    )
                  }
                  onDragEnd={
                    handleDragEnd
                  }
                >
                  {plannedMeal.thumbnail && (
                    <img
                      className="planned-meal-image"
                      src={
                        plannedMeal.thumbnail
                      }
                      alt={
                        plannedMeal.meal_name
                      }
                      draggable="false"
                    />
                  )}

                  <div className="planned-meal-content">
                    <h4 className="planned-meal-name">
                      {
                        plannedMeal.meal_name
                      }
                    </h4>

                    {recipeDetails && (
                      <div className="planned-meal-meta">
                        {recipeDetails.strCategory && (
                          <p>
                            <strong>
                              Category:
                            </strong>{" "}
                            {
                              recipeDetails.strCategory
                            }
                          </p>
                        )}

                        {recipeDetails.strArea && (
                          <p>
                            <strong>
                              Cuisine:
                            </strong>{" "}
                            {
                              recipeDetails.strArea
                            }
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {movingMealId ===
                  plannedMeal.id ? (
                    <form
                      className="move-meal-form"
                      onSubmit={(event) =>
                        handleMoveOrSwap(
                          event,
                          plannedMeal
                        )
                      }
                    >
                      <label
                        htmlFor={`move-meal-${plannedMeal.id}`}
                      >
                        Move or Swap With
                      </label>

                      <select
                        id={`move-meal-${plannedMeal.id}`}
                        value={selectedDay}
                        onChange={(event) =>
                          setSelectedDay(
                            event.target.value
                          )
                        }
                      >
                        {DAYS.map(
                          (moveDay) => {
                            const destinationMeal =
                              getMealForDay(
                                moveDay
                              );

                            return (
                              <option
                                key={
                                  moveDay
                                }
                                value={
                                  moveDay
                                }
                              >
                                {moveDay}
                                {destinationMeal &&
                                destinationMeal.id !==
                                  plannedMeal.id
                                  ? ` — swap with ${destinationMeal.meal_name}`
                                  : ""}
                              </option>
                            );
                          }
                        )}
                      </select>

                      <div className="move-meal-actions">
                        <button
                          className="planner-save-button"
                          type="submit"
                        >
                          Save
                        </button>

                        <button
                          className="planner-cancel-button"
                          type="button"
                          onClick={
                            cancelMovingMeal
                          }
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : copyingMealId ===
                    plannedMeal.id ? (
                    <form
                      className="copy-meal-form"
                      onSubmit={(event) =>
                        handleCopyMeal(
                          event,
                          plannedMeal
                        )
                      }
                    >
                      <label
                        htmlFor={`copy-meal-${plannedMeal.id}`}
                      >
                        Choose Another Day
                      </label>

                      <select
                        id={`copy-meal-${plannedMeal.id}`}
                        value={copyDay}
                        onChange={(event) =>
                          setCopyDay(
                            event.target.value
                          )
                        }
                      >
                        {DAYS.map(
                          (destinationDay) => {
                            const destinationMeal =
                              getMealForDay(
                                destinationDay
                              );

                            const isCurrentDay =
                              destinationDay ===
                              plannedMeal.day;

                            const isUnavailable =
                              Boolean(
                                destinationMeal
                              );

                            let label =
                              destinationDay;

                            if (
                              isCurrentDay
                            ) {
                              label +=
                                " — current day";
                            } else if (
                              destinationMeal
                            ) {
                              label +=
                                " — occupied";
                            }

                            return (
                              <option
                                key={
                                  destinationDay
                                }
                                value={
                                  destinationDay
                                }
                                disabled={
                                  isUnavailable
                                }
                              >
                                {label}
                              </option>
                            );
                          }
                        )}
                      </select>

                      <div className="copy-meal-actions">
                        <button
                          className="planner-copy-save-button"
                          type="submit"
                          disabled={!copyDay}
                        >
                          Add
                        </button>

                        <button
                          className="planner-cancel-button"
                          type="button"
                          onClick={
                            cancelCopyingMeal
                          }
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="planned-meal-actions">
                      <button
                        className="planner-move-button"
                        type="button"
                        onClick={() =>
                          startMovingMeal(
                            plannedMeal
                          )
                        }
                      >
                        Move / Swap
                      </button>

                      <button
                        className="planner-copy-button"
                        type="button"
                        onClick={() =>
                          startCopyingMeal(
                            plannedMeal
                          )
                        }
                        disabled={
                          plannedMeals.length >=
                          DAYS.length
                        }
                      >
                        Add to Another Day
                      </button>

                      <button
                        className="planner-remove-button"
                        type="button"
                        onClick={() =>
                          onRemoveMeal(
                            plannedMeal.id
                          )
                        }
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  className="planner-empty planner-add-recipe-link"
                  to="/"
                  aria-label={`Add a recipe for ${day}`}
                >
                  + Add a Recipe
                </Link>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default WeeklyPlanner;
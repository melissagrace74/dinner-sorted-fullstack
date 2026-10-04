import { useState } from "react";

import { DAYS } from "../constants/days";


function WeeklyPlanner({
  plannedMeals,
  onMoveMeal,
  onRemoveMeal,
}) {
  const [movingMealId, setMovingMealId] = useState(null);
  const [selectedDay, setSelectedDay] = useState("");

  function getMealForDay(day) {
    return plannedMeals.find(
      (plannedMeal) => plannedMeal.day === day
    );
  }

  function startMovingMeal(plannedMeal) {
    setMovingMealId(plannedMeal.id);
    setSelectedDay(plannedMeal.day);
  }

  function cancelMovingMeal() {
    setMovingMealId(null);
    setSelectedDay("");
  }

  async function handleMoveMeal(event, plannedMeal) {
    event.preventDefault();

    if (!selectedDay || selectedDay === plannedMeal.day) {
      cancelMovingMeal();
      return;
    }

    const wasMoved = await onMoveMeal(
      plannedMeal.id,
      selectedDay
    );

    if (wasMoved) {
      cancelMovingMeal();
    }
  }

  return (
    <section>
      <h2>Weekly Planner</h2>

      <div>
        {DAYS.map((day) => {
          const plannedMeal = getMealForDay(day);

          return (
            <article key={day}>
              <h3>{day}</h3>

              {plannedMeal ? (
                <div>
                  {plannedMeal.thumbnail && (
                    <img
                      src={plannedMeal.thumbnail}
                      alt={plannedMeal.meal_name}
                    />
                  )}

                  <p>{plannedMeal.meal_name}</p>

                  {movingMealId === plannedMeal.id ? (
                    <form
                      onSubmit={(event) =>
                        handleMoveMeal(event, plannedMeal)
                      }
                    >
                      <label htmlFor={`move-meal-${plannedMeal.id}`}>
                        Move to
                      </label>

                      <select
                        id={`move-meal-${plannedMeal.id}`}
                        value={selectedDay}
                        onChange={(event) =>
                          setSelectedDay(event.target.value)
                        }
                      >
                        {DAYS.map((moveDay) => {
                          const dayIsOccupied = plannedMeals.some(
                            (meal) =>
                              meal.day === moveDay &&
                              meal.id !== plannedMeal.id
                          );

                          return (
                            <option
                              key={moveDay}
                              value={moveDay}
                              disabled={dayIsOccupied}
                            >
                              {moveDay}
                            </option>
                          );
                        })}
                      </select>

                      <button type="submit">
                        Save Move
                      </button>

                      <button
                        type="button"
                        onClick={cancelMovingMeal}
                      >
                        Cancel
                      </button>
                    </form>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => startMovingMeal(plannedMeal)}
                      >
                        Move
                      </button>

                      <button
                        type="button"
                        onClick={() => onRemoveMeal(plannedMeal.id)}
                      >
                        Remove
                      </button>
                    </>
                  )}
                </div>
              ) : (
                <p>No meal planned.</p>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}

export default WeeklyPlanner;
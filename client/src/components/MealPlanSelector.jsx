function MealPlanSelector({
  mealPlans,
  selectedMealPlanId,
  onSelectMealPlan,
}) {
  if (mealPlans.length === 0) {
    return null;
  }

  return (
    <section>
      <h2>Choose a Meal Plan</h2>

      <label htmlFor="meal-plan-select">
        Meal plan
      </label>

      <select
        id="meal-plan-select"
        value={selectedMealPlanId || ""}
        onChange={(event) =>
          onSelectMealPlan(Number(event.target.value))
        }
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
    </section>
  );
}

export default MealPlanSelector;
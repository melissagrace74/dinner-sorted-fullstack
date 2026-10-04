const API_BASE_URL = "http://localhost:5555/api";

async function apiRequest(endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Something went wrong");
  }

  return data;
}


// Authentication

export async function signup(username, password) {
  return apiRequest("/signup", {
    method: "POST",
    body: JSON.stringify({
      username,
      password,
    }),
  });
}


export async function login(username, password) {
  return apiRequest("/login", {
    method: "POST",
    body: JSON.stringify({
      username,
      password,
    }),
  });
}


export async function logout() {
  return apiRequest("/logout", {
    method: "POST",
  });
}


export async function getCurrentUser() {
  return apiRequest("/me");
}


// Meal Plans

export async function getMealPlans(page = 1, perPage = 10) {
  return apiRequest(
    `/meal-plans?page=${page}&per_page=${perPage}`
  );
}


export async function getMealPlan(mealPlanId) {
  return apiRequest(`/meal-plans/${mealPlanId}`);
}


export async function createMealPlan(name) {
  return apiRequest("/meal-plans", {
    method: "POST",
    body: JSON.stringify({
      name,
    }),
  });
}


export async function updateMealPlan(mealPlanId, name) {
  return apiRequest(`/meal-plans/${mealPlanId}`, {
    method: "PATCH",
    body: JSON.stringify({
      name,
    }),
  });
}


export async function deleteMealPlan(mealPlanId) {
  return apiRequest(`/meal-plans/${mealPlanId}`, {
    method: "DELETE",
  });
}


// Planned Meals

export async function getPlannedMeals(mealPlanId) {
  return apiRequest(`/meal-plans/${mealPlanId}/meals`);
}


export async function createPlannedMeal(mealPlanId, meal) {
  return apiRequest(`/meal-plans/${mealPlanId}/meals`, {
    method: "POST",
    body: JSON.stringify(meal),
  });
}


export async function getPlannedMeal(plannedMealId) {
  return apiRequest(`/planned-meals/${plannedMealId}`);
}


export async function updatePlannedMeal(plannedMealId, updates) {
  return apiRequest(`/planned-meals/${plannedMealId}`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  });
}


export async function moveOrSwapPlannedMeal(
  plannedMealId,
  day
) {
  return apiRequest(
    `/planned-meals/${plannedMealId}/move`,
    {
      method: "PATCH",
      body: JSON.stringify({
        day,
      }),
    }
  );
}


export async function deletePlannedMeal(plannedMealId) {
  return apiRequest(`/planned-meals/${plannedMealId}`, {
    method: "DELETE",
  });
}
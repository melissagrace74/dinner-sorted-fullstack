import { useState } from "react";

import RecipeCard from "../components/RecipeCard";
import SearchBar from "../components/SearchBar";
import { searchMeals } from "../services/mealApi";


function HomePage() {
  const [meals, setMeals] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSearch(searchTerm) {
    setIsLoading(true);
    setError("");
    setHasSearched(true);

    try {
      const results = await searchMeals(searchTerm);
      setMeals(results);
    } catch (error) {
      setMeals([]);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main>
      <section>
        <h1>Dinner, Sorted</h1>

        <p>
          Find recipes and plan your week so you can spend less time
          figuring out dinner and more time enjoying it.
        </p>

        <SearchBar
          onSearch={handleSearch}
          isLoading={isLoading}
        />
      </section>

      <section>
        {error && (
          <p role="alert">
            {error}
          </p>
        )}

        {!isLoading && hasSearched && !error && meals.length === 0 && (
          <p>No recipes found. Try another search.</p>
        )}

        {!isLoading && meals.length > 0 && (
          <>
            <p>
              Found {meals.length}{" "}
              {meals.length === 1 ? "recipe" : "recipes"}.
            </p>

            <div>
              {meals.map((meal) => (
                <RecipeCard
                  key={meal.idMeal}
                  meal={meal}
                />
              ))}
            </div>
          </>
        )}
      </section>
    </main>
  );
}

export default HomePage;
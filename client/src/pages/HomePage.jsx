import { useCallback, useEffect, useState } from "react";

import RecipeCard from "../components/RecipeCard";
import SearchBar from "../components/SearchBar";
import { searchMeals } from "../services/mealApi";

const SEARCH_STORAGE_KEY = "dinnerSortedCurrentSearch";


function HomePage() {
  const [meals, setMeals] = useState([]);
  const [searchTerm, setSearchTerm] = useState(
    () => sessionStorage.getItem(SEARCH_STORAGE_KEY) || ""
  );
  const [hasSearched, setHasSearched] = useState(
    () => Boolean(sessionStorage.getItem(SEARCH_STORAGE_KEY))
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const runSearch = useCallback(async (term, saveSearch = true) => {
    const trimmedTerm = term.trim();

    if (!trimmedTerm) {
      return;
    }

    setIsLoading(true);
    setError("");
    setHasSearched(true);

    try {
      const results = await searchMeals(trimmedTerm);

      setMeals(results);
      setSearchTerm(trimmedTerm);

      if (saveSearch && results.length > 0) {
        sessionStorage.setItem(
          SEARCH_STORAGE_KEY,
          trimmedTerm
        );
      }
    } catch (error) {
      setMeals([]);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const savedSearch = sessionStorage.getItem(
      SEARCH_STORAGE_KEY
    );

    if (savedSearch) {
      runSearch(savedSearch, false);
    }
  }, [runSearch]);

  function handleSearch(term) {
    runSearch(term);
  }

  return (
    <main>
      <section className="home-intro">
        <h1>Find recipes. Plan your week.</h1>

        <p>Take dinner off your mind.</p>

        <SearchBar
          key={searchTerm}
          onSearch={handleSearch}
          isLoading={isLoading}
          initialValue={searchTerm}
        />
      </section>

      {isLoading && (
        <p className="search-status">
          Searching for recipes...
        </p>
      )}

      {error && (
        <p className="search-message" role="alert">
          {error}
        </p>
      )}

      {!isLoading &&
        hasSearched &&
        !error &&
        meals.length === 0 && (
          <p className="search-message">
            No recipes found. Try another search.
          </p>
        )}

      {!isLoading && meals.length > 0 && (
        <section className="recipe-results">
          <h2>Recipes</h2>

          <div className="recipe-grid">
            {meals.map((meal) => (
              <RecipeCard
                key={meal.idMeal}
                meal={meal}
              />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

export default HomePage;
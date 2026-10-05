import { useEffect, useState } from "react";

import RecipeCard from "../components/RecipeCard";
import SearchBar from "../components/SearchBar";
import { searchMeals } from "../services/mealApi";

import heroDinner from "../assets/hero-dinner.png";
import "./HomePage.css";

const SEARCH_STORAGE_KEY = "dinnerSortedCurrentSearch";


function HomePage() {
  const [initialSearch] = useState(
    () => sessionStorage.getItem(SEARCH_STORAGE_KEY) || ""
  );
  const [meals, setMeals] = useState([]);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [hasSearched, setHasSearched] = useState(
    () => Boolean(initialSearch)
  );
  const [isLoading, setIsLoading] = useState(
    () => Boolean(initialSearch)
  );
  const [error, setError] = useState("");

  useEffect(() => {
    if (!initialSearch) {
      return;
    }

    let isCancelled = false;

    async function restoreSearch() {
      try {
        const results = await searchMeals(initialSearch);

        if (!isCancelled) {
          setMeals(results);
        }
      } catch (error) {
        if (!isCancelled) {
          setMeals([]);
          setError(error.message);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    restoreSearch();

    return () => {
      isCancelled = true;
    };
  }, [initialSearch]);

  async function runSearch(term) {
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

      if (results.length > 0) {
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
  }

  function handleSearch(term) {
    runSearch(term);
  }

  return (
    <main className="home-page">
      <section className="home-hero">
        <div
          className="home-hero-photo"
          style={{
            backgroundImage: `url(${heroDinner})`,
          }}
          aria-hidden="true"
        />

        <div className="home-hero-overlay" />

        <div className="home-hero-inner">
          <div className="home-hero-content">
            <p className="home-hero-eyebrow">
              Dinner planning made simpler
            </p>

            <h1>
              Find Your Next
              <span>Favorite Dinner</span>
            </h1>

            <p className="home-hero-description">
              Search for recipes, explore new ideas,
              and add them to your weekly meal plan.
            </p>

            <div className="home-search">
              <SearchBar
                key={searchTerm}
                onSearch={handleSearch}
                isLoading={isLoading}
                initialValue={searchTerm}
              />
            </div>
          </div>

          <div
            className="home-hero-message"
            aria-hidden="true"
          >
            <p>
              Good food
              <br />
              brings us
              <br />
              together.
            </p>

            <span className="home-hero-message-line" />
          </div>
        </div>
      </section>

      <section
        className="home-results-area"
        aria-live="polite"
      >
        {isLoading && (
          <p className="search-status">
            Searching for recipes...
          </p>
        )}

        {error && (
          <p
            className="search-message"
            role="alert"
          >
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
            <div className="home-results-heading">
              <div>
                <p className="home-results-eyebrow">
                  Explore recipes
                </p>

                <h2>Recipe Results</h2>
              </div>

              {searchTerm && (
                <p className="home-results-summary">
                  Showing results for{" "}
                  <strong>
                    “{searchTerm}”
                  </strong>
                </p>
              )}
            </div>

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
      </section>
    </main>
  );
}


export default HomePage;
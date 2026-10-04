import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import AddToMealPlan from "../components/AddToMealPlan";
import {
  getIngredients,
  getMealById,
  getYouTubeEmbedUrl,
} from "../services/mealApi";


function RecipeDetailsPage() {
  const { mealId } = useParams();

  const [meal, setMeal] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadMeal() {
      setIsLoading(true);
      setError("");

      try {
        const result = await getMealById(mealId);

        if (!result) {
          setError("Recipe not found.");
          return;
        }

        setMeal(result);
      } catch (error) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    }

    loadMeal();
  }, [mealId]);

  if (isLoading) {
    return (
      <main>
        <p>Loading recipe...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main>
        <section className="recipe-error">
          <h1>Recipe Not Found</h1>

          <p role="alert">{error}</p>

          <Link className="back-link" to="/">
            ← Return to recipe search
          </Link>
        </section>
      </main>
    );
  }

  const ingredients = getIngredients(meal);
  const videoUrl = getYouTubeEmbedUrl(meal.strYoutube);

  const instructionSteps = meal.strInstructions
    ? meal.strInstructions
        .split(/\r?\n/)
        .map((step) => step.trim())
        .filter(Boolean)
    : [];

  return (
    <main className="recipe-details-page">
      <div className="recipe-details-back">
        <Link className="back-link" to="/">
          ← Back to recipes
        </Link>
      </div>

      <article className="recipe-details">
        <img
          className="recipe-details-image"
          src={meal.strMealThumb}
          alt={meal.strMeal}
        />

        <div className="recipe-details-content">
          <h1>{meal.strMeal}</h1>

          <div className="recipe-meta">
            {meal.strCategory && (
              <p>
                <strong>Category:</strong>{" "}
                {meal.strCategory}
              </p>
            )}

            {meal.strArea && (
              <p>
                <strong>Cuisine:</strong>{" "}
                {meal.strArea}
              </p>
            )}
          </div>

          <AddToMealPlan meal={meal} />

          <section className="recipe-section">
            <h2>Ingredients</h2>

            <ul className="ingredient-list">
              {ingredients.map(
                ({ ingredient, measure }, index) => (
                  <li key={`${ingredient}-${index}`}>
                    {measure && `${measure} `}
                    {ingredient}
                  </li>
                )
              )}
            </ul>
          </section>

          <section className="recipe-section">
            <h2>Instructions</h2>

            <div className="instruction-list">
              {instructionSteps.length > 0 ? (
                instructionSteps.map((step, index) => (
                  <p key={index}>{step}</p>
                ))
              ) : (
                <p>
                  No instructions are available for this recipe.
                </p>
              )}
            </div>
          </section>

          {videoUrl && (
            <section className="recipe-section recipe-video">
              <h2>Video</h2>

              <div className="video-wrapper">
                <iframe
                  src={videoUrl}
                  title={`${meal.strMeal} recipe video`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </section>
          )}
        </div>
      </article>
    </main>
  );
}

export default RecipeDetailsPage;
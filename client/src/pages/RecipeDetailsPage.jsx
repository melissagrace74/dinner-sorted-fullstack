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
        <h1>Recipe Not Found</h1>
        <p role="alert">{error}</p>
        <Link to="/">Return to recipe search</Link>
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
    <main>
      <Link to="/">Back to recipe search</Link>

      <article>
        <h1>{meal.strMeal}</h1>

        <p>
          {meal.strCategory}
          {meal.strArea && ` • ${meal.strArea}`}
        </p>

        <img
          src={meal.strMealThumb}
          alt={meal.strMeal}
        />

        <AddToMealPlan meal={meal} />

        <section>
          <h2>Ingredients</h2>

          <ul>
            {ingredients.map(({ ingredient, measure }, index) => (
              <li key={`${ingredient}-${index}`}>
                {measure && `${measure} `}
                {ingredient}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2>Instructions</h2>

          {instructionSteps.length > 0 ? (
            instructionSteps.map((step, index) => (
              <p key={index}>{step}</p>
            ))
          ) : (
            <p>No instructions are available for this recipe.</p>
          )}
        </section>

        {videoUrl && (
          <section>
            <h2>Recipe Video</h2>

            <iframe
              src={videoUrl}
              title={`${meal.strMeal} recipe video`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </section>
        )}
      </article>
    </main>
  );
}

export default RecipeDetailsPage;
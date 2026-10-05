import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import AddToMealPlan from "../components/AddToMealPlan";
import {
  getIngredients,
  getMealById,
  getYouTubeEmbedUrl,
} from "../services/mealApi";

import "./RecipeDetailsPage.css";


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
      <main className="recipe-details-page">
        <p className="recipe-details-status">
          Loading recipe...
        </p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="recipe-details-page">
        <section className="recipe-error">
          <h1>Recipe Not Found</h1>

          <p role="alert">{error}</p>

          <Link
            className="back-link"
            to="/"
          >
            ← Return to recipe search
          </Link>
        </section>
      </main>
    );
  }

  const ingredients = getIngredients(meal);
  const videoUrl = getYouTubeEmbedUrl(meal.strYoutube);

  const instructions = meal.strInstructions
    ? meal.strInstructions.trim()
    : "";

  const normalizedInstructions = instructions
    .replace(/\r\n?/g, "\n")
    .replace(
      /(?:^|\s)step\s*(\d+)\s*[-:–—.]?\s*/gi,
      "\nSTEP_MARKER_$1 "
    )
    .trim();

  const instructionSections = normalizedInstructions
    .split(/\n+/)
    .map((section) => section.trim())
    .filter(Boolean);

  const instructionSteps = [];

  instructionSections.forEach((section) => {
    const stepMatch = section.match(
      /^STEP_MARKER_(\d+)\s*(.*)$/i
    );

    if (stepMatch) {
      const stepText = stepMatch[2].trim();

      if (stepText) {
        instructionSteps.push({
          heading: "",
          text: stepText,
        });
      }

      return;
    }

    const currentStep =
      instructionSteps[instructionSteps.length - 1];

    if (currentStep) {
      currentStep.text =
        `${currentStep.text} ${section}`.trim();
      return;
    }

    instructionSteps.push({
      heading: "",
      text: section,
    });
  });

  return (
    <main className="recipe-details-page">
      <div className="recipe-details-container">
        <div className="recipe-details-back">
          <Link
            className="back-link"
            to="/"
          >
            ← Back to recipes
          </Link>
        </div>

        <article className="recipe-details">
          <div className="recipe-details-intro">
            <div className="recipe-details-image-wrap">
              <img
                className="recipe-details-image"
                src={meal.strMealThumb}
                alt={meal.strMeal}
              />
            </div>

            <div className="recipe-details-summary">
              <header className="recipe-details-header">
                <p className="recipe-details-eyebrow">
                  Recipe
                </p>

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
              </header>

              <AddToMealPlan meal={meal} />
            </div>
          </div>

          <div className="recipe-details-content">
            <div className="recipe-main-content">
              <section className="recipe-section recipe-ingredients">
                <div className="recipe-section-heading">
                  <p className="recipe-section-eyebrow">
                    What you'll need
                  </p>

                  <h2>Ingredients</h2>
                </div>

                <ul className="ingredient-list">
                  {ingredients.map(
                    ({ ingredient, measure }, index) => (
                      <li key={`${ingredient}-${index}`}>
                        {measure && (
                          <span className="ingredient-measure">
                            {measure}
                          </span>
                        )}

                        <span className="ingredient-name">
                          {ingredient}
                        </span>
                      </li>
                    )
                  )}
                </ul>
              </section>

              <section className="recipe-section recipe-instructions">
                <div className="recipe-section-heading">
                  <p className="recipe-section-eyebrow">
                    Step by step
                  </p>

                  <h2>Instructions</h2>
                </div>

                <div className="instruction-list">
                  {instructionSteps.length > 0 ? (
                    instructionSteps.map((step, index) => (
                      <div
                        className="instruction-step"
                        key={index}
                      >
                        <span className="instruction-number">
                          {index + 1}
                        </span>

                        <div className="instruction-copy">
                          {step.heading && (
                            <strong>
                              {step.heading}
                            </strong>
                          )}

                          {step.text && (
                            <p>{step.text}</p>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p>
                      No instructions are available for this recipe.
                    </p>
                  )}
                </div>
              </section>
            </div>

            {videoUrl && (
              <section className="recipe-section recipe-video">
                <div className="recipe-section-heading">
                  <p className="recipe-section-eyebrow">
                    Watch and cook
                  </p>

                  <h2>Video</h2>
                </div>

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
      </div>
    </main>
  );
}


export default RecipeDetailsPage;
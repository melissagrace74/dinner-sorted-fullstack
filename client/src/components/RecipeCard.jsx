import { Link } from "react-router-dom";


function RecipeCard({ meal }) {
  return (
    <article className="recipe-card">
      <Link
        className="recipe-card-link"
        to={`/recipes/${meal.idMeal}`}
        aria-label={`View ${meal.strMeal} recipe`}
      >
        <div className="recipe-card-image">
          <img
            src={meal.strMealThumb}
            alt={meal.strMeal}
          />
        </div>

        <div className="recipe-card-content">
          <h3>{meal.strMeal}</h3>

          <div className="recipe-card-meta">
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
        </div>
      </Link>
    </article>
  );
}


export default RecipeCard;
import { Link } from "react-router-dom";


function RecipeCard({ meal }) {
  return (
    <article>
      <img
        src={meal.strMealThumb}
        alt={meal.strMeal}
      />

      <div>
        <h2>{meal.strMeal}</h2>

        <p>
          {meal.strCategory}
          {meal.strArea && ` • ${meal.strArea}`}
        </p>

        <Link to={`/recipes/${meal.idMeal}`}>
          View Recipe
        </Link>
      </div>
    </article>
  );
}

export default RecipeCard;
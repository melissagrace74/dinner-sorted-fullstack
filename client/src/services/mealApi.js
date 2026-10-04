const MEALDB_BASE_URL = "https://www.themealdb.com/api/json/v1/1";


async function mealDbRequest(endpoint) {
  const response = await fetch(`${MEALDB_BASE_URL}${endpoint}`);

  if (!response.ok) {
    throw new Error("Unable to connect to the recipe service");
  }

  return response.json();
}


export async function searchMeals(searchTerm) {
  const term = searchTerm.trim();

  if (!term) {
    return [];
  }

  const data = await mealDbRequest(
    `/search.php?s=${encodeURIComponent(term)}`
  );

  return data.meals || [];
}


export async function getMealById(mealId) {
  const data = await mealDbRequest(
    `/lookup.php?i=${encodeURIComponent(mealId)}`
  );

  return data.meals?.[0] || null;
}


export function getIngredients(meal) {
  if (!meal) {
    return [];
  }

  return Object.keys(meal)
    .filter((key) => key.startsWith("strIngredient"))
    .map((ingredientKey) => {
      const number = ingredientKey.replace("strIngredient", "");
      const ingredient = meal[ingredientKey]?.trim();
      const measure = meal[`strMeasure${number}`]?.trim();

      return {
        ingredient,
        measure: measure || "",
      };
    })
    .filter(({ ingredient }) => ingredient);
}


export function getYouTubeEmbedUrl(youtubeUrl) {
  if (!youtubeUrl) {
    return null;
  }

  try {
    const url = new URL(youtubeUrl);
    let videoId = "";

    if (url.hostname.includes("youtu.be")) {
      videoId = url.pathname.slice(1);
    } else {
      videoId = url.searchParams.get("v");
    }

    if (!videoId) {
      return null;
    }

    return `https://www.youtube.com/embed/${videoId}`;
  } catch {
    return null;
  }
}
const NUTRITIONIX_APP_ID = process.env.REACT_APP_NUTRITIONIX_APP_ID;
const NUTRITIONIX_API_KEY = process.env.REACT_APP_NUTRITIONIX_API_KEY;

export const fetchFoodSuggestions = async (query) => {
  try {
    const response = await fetch(
      `https://trackapi.nutritionix.com/v2/search/instant?query=${query}`,
      {
        headers: {
          "x-app-id": NUTRITIONIX_APP_ID,
          "x-app-key": NUTRITIONIX_API_KEY,
        },
      }
    );
    const data = await response.json();
    return data.common; // List of common food suggestions
  } catch (error) {
    console.error("Error fetching food suggestions:", error);
    return [];
  }
};

export const fetchFoodCalories = async (query) => {
  try {
    const response = await fetch(
      `https://trackapi.nutritionix.com/v2/natural/nutrients`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-app-id": NUTRITIONIX_APP_ID,
          "x-app-key": NUTRITIONIX_API_KEY,
        },
        body: JSON.stringify({ query }),
      }
    );
    const data = await response.json();
    return data.foods[0]?.nf_calories || null; // Return calories of the food
  } catch (error) {
    console.error("Error fetching calories:", error);
    return null;
  }
};

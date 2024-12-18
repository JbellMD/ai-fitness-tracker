import React, { useState, useEffect } from "react";
import axios from "axios";

const NutrientSuggestions = ({ loggedMeals, dietGoals }) => {
  const [remainingNutrients, setRemainingNutrients] = useState({});
  const [suggestions, setSuggestions] = useState([]);

  const calculateLoggedNutrients = (meals) => {
    return meals.reduce(
      (acc, meal) => {
        const nutrients = meal.nutrients || {};
        acc.calories += nutrients.calories || 0;
        acc.protein += nutrients.protein || 0;
        acc.carbohydrates += nutrients.carbohydrates || 0;
        acc.fats += nutrients.fats || 0;
        acc.fiber += nutrients.fiber || 0;
        acc.sugar += nutrients.sugar || 0;
        return acc;
      },
      { calories: 0, protein: 0, carbohydrates: 0, fats: 0, fiber: 0, sugar: 0 }
    );
  };

  const calculateRemainingNutrients = (dietGoals, loggedNutrients) => {
    return {
      calories: (dietGoals.calories || 0) - (loggedNutrients.calories || 0),
      protein: (dietGoals.protein || 0) - (loggedNutrients.protein || 0),
      carbohydrates: (dietGoals.carbohydrates || 0) - (loggedNutrients.carbohydrates || 0),
      fats: (dietGoals.fats || 0) - (loggedNutrients.fats || 0),
      fiber: (dietGoals.fiber || 0) - (loggedNutrients.fiber || 0),
      sugar: (dietGoals.sugar || 0) - (loggedNutrients.sugar || 0),
    };
  };

  const fetchFoodSuggestions = async (nutrient, amount) => {
    try {
      const response = await axios.get(
        `https://trackapi.nutritionix.com/v2/search/instant`,
        {
          params: { query: nutrient },
          headers: {
            "x-app-id": process.env.REACT_APP_NUTRITIONIX_APP_ID,
            "x-app-key": process.env.REACT_APP_NUTRITIONIX_API_KEY,
          },
        }
      );
      return response.data.common || [];
    } catch (error) {
      console.error("Error fetching food suggestions:", error);
      return [];
    }
  };

  useEffect(() => {
    if (!loggedMeals || loggedMeals.length === 0) {
      setRemainingNutrients({});
      setSuggestions([]);
      return;
    }

    const loggedNutrients = calculateLoggedNutrients(loggedMeals);
    const remaining = calculateRemainingNutrients(dietGoals, loggedNutrients);
    setRemainingNutrients(remaining);

    const mostDeficientNutrient = Object.keys(remaining).reduce((a, b) =>
      remaining[a] > remaining[b] ? a : b
    );

    fetchFoodSuggestions(mostDeficientNutrient, remaining[mostDeficientNutrient]).then(
      setSuggestions
    );
  }, [loggedMeals, dietGoals]);

  return (
    <div className="suggestions-container">
      <h3>Nutrient Suggestions</h3>
      <div className="remaining-nutrients">
        <h4>Remaining Nutrients:</h4>
        <ul>
          {Object.keys(remainingNutrients).map((key) => (
            <li key={key}>
              <strong>{key}:</strong> {remainingNutrients[key]} remaining
            </li>
          ))}
        </ul>
      </div>
      <div className="food-suggestions">
        <h4>Suggested Foods:</h4>
        <ul>
          {suggestions.map((food, index) => (
            <li key={index}>{food.food_name}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default NutrientSuggestions;

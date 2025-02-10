import React, { useState, useEffect } from "react";
import { database, auth } from "../firebase";
import { ref, push, onValue } from "firebase/database";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { motion } from "framer-motion";
import NutrientSuggestions from "./NutrientSuggestions";
import axios from "axios"; // Import axios for API calls

ChartJS.register(ArcElement, Tooltip, Legend);

const NutritionTracker = () => {
  const [foodName, setFoodName] = useState("");
  const [calories, setCalories] = useState("");
  const [mealType, setMealType] = useState("breakfast");
  const [chartData, setChartData] = useState(null);
  const [allMeals, setAllMeals] = useState([]);
  const [suggestions, setSuggestions] = useState([]); // Food suggestions state
  const [successMessage, setSuccessMessage] = useState("");
  const [totalCalories, setTotalCalories] = useState(0);

  const dietGoals = {
    calories: 2000,
    protein: 50,
    carbohydrates: 275,
    fats: 70,
    fiber: 28,
    sugar: 36,
  };

  // Fetch meals from Firebase
  useEffect(() => {
    const fetchMeals = () => {
      const user = auth.currentUser;
      if (!user) return;

      const logsRef = ref(database, `users/${user.uid}/nutritionLogs`);

      onValue(logsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const fetchedMeals = Object.entries(data)
            .map(([key, value]) => ({ id: key, ...value }))
            .sort((a, b) => b.timestampNum - a.timestampNum);

          setAllMeals(fetchedMeals);
          prepareChartData(fetchedMeals);
          calculateTotalCalories(fetchedMeals);
        }
      });
    };

    fetchMeals();
  }, []);

  // Fetch food suggestions
  useEffect(() => {
    const fetchFoodSuggestions = async () => {
      if (foodName.trim() === "") {
        setSuggestions([]);
        return;
      }

      try {
        const response = await axios.get(
          `https://trackapi.nutritionix.com/v2/search/instant`,
          {
            params: { query: foodName },
            headers: {
              "x-app-id": process.env.REACT_APP_NUTRITIONIX_APP_ID,
              "x-app-key": process.env.REACT_APP_NUTRITIONIX_API_KEY,
            },
          }
        );

        setSuggestions(response.data.common || []);
      } catch (error) {
        console.error("Error fetching food suggestions: ", error);
      }
    };

    fetchFoodSuggestions();
  }, [foodName]);

  const prepareChartData = (data) => {
    const caloriesByMealType = data.reduce((acc, meal) => {
      acc[meal.mealType] = (acc[meal.mealType] || 0) + meal.calories;
      return acc;
    }, {});

    setChartData({
      labels: Object.keys(caloriesByMealType),
      datasets: [
        {
          data: Object.values(caloriesByMealType),
          backgroundColor: ["#028090", "#02c39a", "#fcbf49", "#f77f00"],
        },
      ],
    });
  };

  const calculateTotalCalories = (data) => {
    const total = data.reduce((sum, meal) => sum + meal.calories, 0);
    setTotalCalories(total);
  };

  const handleAddMeal = async (e) => {
    e.preventDefault();
    try {
      const user = auth.currentUser;
      if (!user) return;

      const newMeal = {
        foodName,
        calories: parseFloat(calories),
        mealType,
        nutrients: {
          calories: parseFloat(calories),
          protein: Math.random() * 20,
          carbohydrates: Math.random() * 50,
          fats: Math.random() * 10,
          fiber: Math.random() * 5,
          sugar: Math.random() * 10,
        },
        timestamp: new Date().toISOString(),
        timestampNum: Date.now(),
      };

      await push(ref(database, `users/${user.uid}/nutritionLogs`), newMeal);
      setSuccessMessage("Meal logged successfully!");
      setFoodName("");
      setCalories("");
      setMealType("breakfast");

      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error adding meal:", error);
    }
  };

  return (
    <div className="logger-chart-container">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        className="white-box logger-box"
      >
        <h2>Log Your Meal</h2>
        <form onSubmit={handleAddMeal} className="nutrition-form">
          <div className="form-group">
            <label>Food Name</label>
            <input
              type="text"
              value={foodName}
              onChange={(e) => setFoodName(e.target.value)}
              placeholder="Enter food name"
              required
            />
            {suggestions.length > 0 && (
              <ul className="suggestions-list">
                {suggestions.map((item, index) => (
                  <li
                    key={index}
                    onClick={() => {
                      setFoodName(item.food_name);
                      setSuggestions([]);
                    }}
                  >
                    {item.food_name}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="form-group">
            <label>Calories</label>
            <input
              type="number"
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              placeholder="Enter calories"
              step="0.01"
              min="0.01"
              required
            />
          </div>
          <div className="form-group">
            <label>Meal Type</label>
            <select
              value={mealType}
              onChange={(e) => setMealType(e.target.value)}
              required
            >
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
              <option value="snack">Snack</option>
            </select>
          </div>
          <button type="submit" className="auth-btn">
            Log Meal
          </button>
        </form>
        {successMessage && <p className="success-text">{successMessage}</p>}
      </motion.div>

      <div className="white-box list-box">
        <h2>Nutrition Logs</h2>
        <ul className="nutrition-list">
          {allMeals.map((meal) => (
            <li key={meal.id} className="log-entry">
              <strong>{meal.foodName}</strong> - {meal.calories} kcal ({meal.mealType})
              <br />
              <span>Logged at: {new Date(meal.timestamp).toLocaleString()}</span>
            </li>
          ))}
        </ul>
        <div className="total-calories">
          <h4>Total Calories: {totalCalories} kcal</h4>
        </div>
      </div>

      {chartData ? (
        <div className="nutrition-chart-box">
          <Pie data={chartData} />
        </div>
      ) : (
        <div className="chart-box">
          <p>No meal data to display yet. Please add one now!</p>
        </div>
      )}

      <NutrientSuggestions loggedMeals={allMeals} dietGoals={dietGoals} />
    </div>
  );
};

export default NutritionTracker;

import React, { useState, useEffect } from "react";
import { database, auth } from "../firebase";
import { ref, push, onValue } from "firebase/database";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { fetchFoodSuggestions, fetchFoodCalories } from "../utils/nutritionix";
import { filterDataByDate } from "../utils/dateFilters";
import { motion } from "framer-motion";

ChartJS.register(ArcElement, Tooltip, Legend);

const NutritionTracker = () => {
  const [foodName, setFoodName] = useState("");
  const [calories, setCalories] = useState("");
  const [mealType, setMealType] = useState("breakfast");
  const [suggestions, setSuggestions] = useState([]); // Food suggestions
  const [chartData, setChartData] = useState(null);
  const [allMeals, setAllMeals] = useState([]);
  const [filterType, setFilterType] = useState("day");
  const [successMessage, setSuccessMessage] = useState("");

  // Fetch meals from Firebase
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const logsRef = ref(database, `users/${user.uid}/nutritionLogs`);
    onValue(logsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const fetchedMeals = Object.values(data);
        setAllMeals(fetchedMeals);
      }
    });
  }, []);

  // Filter meals for the chart
  useEffect(() => {
    const filteredMeals = filterDataByDate(allMeals, filterType);
    prepareChartData(filteredMeals);
  }, [allMeals, filterType]);

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

  // Fetch suggestions as user types
  const handleFoodSearch = async (query) => {
    setFoodName(query);
    if (query.trim() === "") {
      setSuggestions([]);
      return;
    }
    const results = await fetchFoodSuggestions(query);
    setSuggestions(results);
  };

  // Auto-fill calories on suggestion selection
  const handleSuggestionClick = async (item) => {
    setFoodName(item.food_name);
    const fetchedCalories = await fetchFoodCalories(item.food_name);
    if (fetchedCalories !== null) {
      setCalories(fetchedCalories.toFixed(2)); // Set calories to 2 decimals
    }
    setSuggestions([]);
  };

  const handleAddMeal = async (e) => {
    e.preventDefault();
    try {
      const user = auth.currentUser;
      if (!user) return;
  
      const newMeal = {
        foodName,
        calories: parseFloat(calories), // Use parseFloat instead of parseInt
        mealType,
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
      {/* Logger Component */}
      <motion.div initial={{ opacity: 0, y: -50 }} animate={{ opacity: 1, y: 0 }} className="white-box logger-box">
        <h2>Log Your Meal</h2>
        <form onSubmit={handleAddMeal} className="nutrition-form">
          <div className="form-group">
            <label>Food Name</label>
            <input
              type="text"
              value={foodName}
              onChange={(e) => handleFoodSearch(e.target.value)}
              placeholder="Search food name"
              required
            />
            {/* Suggestions */}
            {suggestions.length > 0 && (
              <ul className="suggestions-list">
                {suggestions.map((item, index) => (
                  <li key={index} onClick={() => handleSuggestionClick(item)}>
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
                step="0.01"   /* Allows decimal inputs */
                min="0.01"    /* Ensures positive values */
                required
/>

          </div>
          <div className="form-group">
            <label>Meal Type</label>
            <select value={mealType} onChange={(e) => setMealType(e.target.value)} required>
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

      {/* Chart Component */}
      {chartData && (
        <div className="chart-box">
          <Pie data={chartData} />
        </div>
      )}
    </div>
  );
};

export default NutritionTracker;

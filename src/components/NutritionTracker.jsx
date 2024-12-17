import React, { useState, useEffect } from "react";
import { database, auth } from "../firebase";
import { ref, push, onValue } from "firebase/database";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { motion } from "framer-motion";

ChartJS.register(ArcElement, Tooltip, Legend);

const NutritionTracker = () => {
  const [foodName, setFoodName] = useState("");
  const [calories, setCalories] = useState("");
  const [mealType, setMealType] = useState("breakfast");
  const [nutritionLogs, setNutritionLogs] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [chartData, setChartData] = useState(null);

  // Fetch data from Firebase
  useEffect(() => {
    const fetchNutritionLogs = () => {
      const user = auth.currentUser;
      if (!user) return;

      const logsRef = ref(database, `users/${user.uid}/nutritionLogs`);

      onValue(logsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const logs = Object.values(data);
          setNutritionLogs(logs);
          prepareChartData(logs);
        }
      });
    };

    fetchNutritionLogs();
  }, []);

  // Prepare chart data
  const prepareChartData = (data) => {
    const caloriesByMeal = data.reduce((acc, meal) => {
      acc[meal.mealType] = (acc[meal.mealType] || 0) + meal.calories;
      return acc;
    }, {});

    setChartData({
      labels: Object.keys(caloriesByMeal),
      datasets: [
        {
          data: Object.values(caloriesByMeal),
          backgroundColor: ["#028090", "#02c39a", "#fcbf49", "#f77f00"],
        },
      ],
    });
  };

  // Handle meal addition
  const handleAddMeal = async (e) => {
    e.preventDefault();
    try {
      const user = auth.currentUser;
      if (!user) return;

      const newMeal = {
        foodName,
        calories: parseInt(calories, 10),
        mealType,
        timestamp: new Date().toISOString(),
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
          </div>
          <div className="form-group">
            <label>Calories</label>
            <input
              type="number"
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              placeholder="Enter calories"
              min="1"
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


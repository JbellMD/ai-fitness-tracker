import React, { useState, useEffect } from "react";
import { database, auth } from "../firebase";
import { ref, push, onValue } from "firebase/database";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { filterDataByDate } from "../utils/dateFilters";
import { motion } from "framer-motion";

ChartJS.register(ArcElement, Tooltip, Legend);

const NutritionTracker = () => {
  const [foodName, setFoodName] = useState("");
  const [calories, setCalories] = useState("");
  const [mealType, setMealType] = useState("breakfast");
  const [chartData, setChartData] = useState(null);
  const [allMeals, setAllMeals] = useState([]);
  const [filterType, setFilterType] = useState("day");
  const [successMessage, setSuccessMessage] = useState("");

  // Fetch meals from Firebase
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const mealsRef = ref(database, `users/${user.uid}/nutritionLogs`);

    onValue(mealsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const fetchedMeals = Object.values(data);
        setAllMeals(fetchedMeals);
      }
    });
  }, []);

  // Filter meals and prepare chart data
  useEffect(() => {
    if (allMeals.length > 0) {
      const filteredMeals = filterDataByDate(allMeals, filterType);
      prepareChartData(filteredMeals);
    }
  }, [allMeals, filterType]);

  // Prepare chart data
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

  // Handle adding a meal
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
    <>
      {/* Filter Dropdown */}
      <div className="filter-dropdown">
        <label>Filter By:</label>
        <select onChange={(e) => setFilterType(e.target.value)} value={filterType}>
          <option value="day">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
        </select>
      </div>

      {/* Logger and Chart Container */}
      <div className="logger-chart-container">
        {/* Logger Box */}
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

        {/* Chart Box */}
        {chartData ? (
          <div className="chart-box">
            <Pie
              data={chartData}
              options={{
                responsive: true,
                plugins: {
                  legend: { position: "top" },
                  title: { display: true, text: "Calories by Meal Type" },
                },
              }}
            />
          </div>
        ) : (
          <div className="chart-box">
            <p>No meal data to display yet.</p>
          </div>
        )}
      </div>
    </>
  );
};

export default NutritionTracker;

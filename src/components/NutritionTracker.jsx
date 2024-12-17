import React, { useState, useEffect } from "react";
import { database, auth } from "../firebase"; // Import updated `database`
import { ref, push, onValue, query, orderByChild } from "firebase/database"; // Realtime Database methods

const NutritionTracker = () => {
  const [foodName, setFoodName] = useState("");
  const [calories, setCalories] = useState("");
  const [mealType, setMealType] = useState("breakfast");
  const [nutritionLogs, setNutritionLogs] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");

  const fetchNutritionLogs = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const logsRef = query(
        ref(database, `users/${user.uid}/nutritionLogs`),
        orderByChild("timestamp")
      );

      onValue(logsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const logs = Object.entries(data).map(([key, value]) => ({
            id: key,
            ...value,
          }));
          setNutritionLogs(logs.reverse()); // Reverse to show most recent first
        }
      });
    } catch (error) {
      console.error("Error fetching nutrition logs:", error);
    }
  };

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
      fetchNutritionLogs(); // Refresh the list
      setFoodName("");
      setCalories("");
      setMealType("breakfast");

      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error adding meal:", error);
    }
  };

  useEffect(() => {
    fetchNutritionLogs();
  }, []);

  return (
    <div className="white-box nutrition-tracker">
      <h2>Nutrition Tracker</h2>
      <form onSubmit={handleAddMeal} className="nutrition-form">
        <input
          type="text"
          placeholder="Food Name"
          value={foodName}
          onChange={(e) => setFoodName(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Calories"
          value={calories}
          onChange={(e) => setCalories(e.target.value)}
          required
        />
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
        <button type="submit" className="auth-btn">
          Log Meal
        </button>
      </form>

      {successMessage && <p className="success-text">{successMessage}</p>}

      <div className="nutrition-logs">
        <h3>Logged Meals</h3>
        <ul>
          {nutritionLogs.map((log) => (
            <li key={log.id}>
              <strong>{log.foodName}</strong> - {log.calories} kcal ({log.mealType})
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default NutritionTracker;

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import { MdDirectionsRun, MdSelfImprovement, MdFitnessCenter } from "react-icons/md";

const ActivityLogger = () => {
  console.log("ActivityLogger component rendering...");
  const { register, handleSubmit, reset } = useForm();
  const [successMessage, setSuccessMessage] = useState(""); // Success message state

  const onSubmit = async (data) => {
    try {
      const caloriesBurned = calculateCalories(data.activity, data.duration);

      await addDoc(collection(db, "activities"), {
        activity: data.activity,
        duration: parseInt(data.duration, 10), // Convert to number
        calories: caloriesBurned, // Add calorie estimate
        timestamp: new Date(), // Timestamp for trends
      });

      setSuccessMessage("Activity logged successfully!");
      reset(); // Clear the form

      // Clear the success message after 3 seconds
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error adding activity: ", error);
    }
  };

  // Example calorie calculation logic (adjust as needed)
  const calculateCalories = (activity, duration) => {
    const activityCalories = {
      running: 10, // Calories per minute
      yoga: 4,
      weightlifting: 6,
    };
    return (activityCalories[activity] || 5) * duration; // Default 5 cal/min
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      className="activity-logger card"
    >
      <h2>Log Your Activity</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="activity-form">
        <div className="form-group">
          <label>Activity Type</label>
          <select {...register("activity")} required>
            <option value="running">Running</option>
            <option value="yoga">Yoga</option>
            <option value="weightlifting">Weightlifting</option>
          </select>
        </div>
        <div className="form-group">
          <label>Duration (minutes)</label>
          <input
            type="number"
            {...register("duration")}
            placeholder="Enter duration"
            min="1"
            required
          />
        </div>
        <button type="submit" className="auth-btn">
          Log Activity
        </button>
      </form>

      {/* Success Message */}
      {successMessage && <p className="success-text">{successMessage}</p>}

      <div className="activity-icons">
        <MdDirectionsRun size={40} />
        <MdSelfImprovement size={40} />
        <MdFitnessCenter size={40} />
      </div>
    </motion.div>
  );
};

export default ActivityLogger;


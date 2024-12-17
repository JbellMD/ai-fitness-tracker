import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { database } from "../firebase";
import { ref, push, onValue } from "firebase/database";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ActivityLogger = () => {
  const { register, handleSubmit, reset } = useForm();
  const [successMessage, setSuccessMessage] = useState("");
  const [chartData, setChartData] = useState(null);

  // Fetch activities from Firebase Realtime Database
  useEffect(() => {
    const activitiesRef = ref(database, "activities");

    onValue(activitiesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const fetchedActivities = Object.values(data);
        prepareChartData(fetchedActivities);
      }
    });
  }, []);

  // Prepare chart data
  const prepareChartData = (data) => {
    const activityDurations = data.reduce((acc, activity) => {
      acc[activity.activity] = (acc[activity.activity] || 0) + activity.duration;
      return acc;
    }, {});

    setChartData({
      labels: Object.keys(activityDurations),
      datasets: [
        {
          label: "Total Duration (minutes)",
          data: Object.values(activityDurations),
          backgroundColor: ["#028090", "#02c39a", "#fcbf49"],
        },
      ],
    });
  };

  // Handle form submission
  const onSubmit = async (data) => {
    try {
      const newActivity = {
        activity: data.activity,
        duration: parseInt(data.duration, 10),
        timestamp: new Date().toISOString(),
      };

      await push(ref(database, "activities"), newActivity);
      setSuccessMessage("Activity logged successfully!");
      reset();

      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error adding activity: ", error);
    }
  };

  return (
    <div className="logger-chart-container">
      {/* Logger Section */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        className="white-box logger-box"
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
        {successMessage && <p className="success-text">{successMessage}</p>}
      </motion.div>

      {/* Chart Section */}
      {chartData ? (
        <div className="chart-box">
          <Bar
            data={chartData}
            options={{
              responsive: true,
              plugins: {
                legend: { position: "top" },
                title: { display: true, text: "Activity Durations" },
              },
            }}
          />
        </div>
      ) : (
        <div className="chart-box">
          <p>No activity data to display yet.</p>
        </div>
      )}
    </div>
  );
};

export default ActivityLogger;

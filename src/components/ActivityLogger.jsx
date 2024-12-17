import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { filterDataByDate } from "../utils/dateFilters";
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
  const [allActivities, setAllActivities] = useState([]);
  const [filterType, setFilterType] = useState("day");

  // Fetch activities from Firebase
  useEffect(() => {
    const activitiesRef = ref(database, "activities");

    onValue(activitiesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const fetchedActivities = Object.values(data);
        setAllActivities(fetchedActivities);
      }
    });
  }, []);

  // Filter and prepare chart data
  useEffect(() => {
    const filteredActivities = filterDataByDate(allActivities, filterType);
    prepareChartData(filteredActivities);
  }, [allActivities, filterType]);

  const prepareChartData = (data) => {
    const activityDurations = data.reduce((acc, activity) => {
      acc[activity.activity] = (acc[activity.activity] || 0) + activity.duration;
      return acc;
    }, {});
  
    // Map activity names to their respective colors
    const activityColors = {
      running: "#4caf50",      // Green for Running
      yoga: "#f44336",         // Red for Yoga
      weightlifting: "#2196f3" // Blue for Weightlifting
    };
  
    // Assign colors based on the activities
    const labels = Object.keys(activityDurations);
    const backgroundColors = labels.map((label) => activityColors[label] || "#ccc"); // Default to grey if not mapped
  
    setChartData({
      labels: labels,
      datasets: [
        {
          label: "Total Duration (minutes)",
          data: Object.values(activityDurations),
          backgroundColor: backgroundColors, // Use dynamic colors
        },
      ],
    });
  };
  

  const onSubmit = async (data) => {
    try {
      await push(ref(database, "activities"), {
        activity: data.activity,
        duration: parseInt(data.duration, 10),
        timestamp: new Date().toISOString(),
        timestampNum: Date.now(),
      });
      setSuccessMessage("Activity logged successfully!");
      reset();
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error adding activity: ", error);
    }
  };

  return (
    <>
      {/* Filter By Dropdown */}
      <div className="filter-dropdown">
        <label>Filter By:</label>
        <select onChange={(e) => setFilterType(e.target.value)} value={filterType}>
          <option value="day">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
        </select>
      </div>

      <div className="logger-chart-container">
        {/* Logger Box */}
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

        {/* Chart Box */}
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
    </>
  );
};

export default ActivityLogger;

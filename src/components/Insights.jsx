import React, { useEffect, useState } from "react";
import { database } from "../firebase";
import { ref, onValue } from "firebase/database";
import axios from "axios";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Insights = () => {
  const [activities, setActivities] = useState([]); // Store fetched activities
  const [insight, setInsight] = useState(""); // AI-driven insights
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState(null); // Line chart data
  const [recommendations, setRecommendations] = useState([]); // Suggested activities

  // Fetch activities from Firebase
  useEffect(() => {
    const fetchActivities = () => {
      const activitiesRef = ref(database, "activities");

      onValue(
        activitiesRef,
        (snapshot) => {
          const data = snapshot.val();
          if (data) {
            const fetchedActivities = Object.values(data).reverse();
            setActivities(fetchedActivities);
            prepareChartData(fetchedActivities);
            generateRecommendations(fetchedActivities);
            generateInsight(fetchedActivities);
          } else {
            setActivities([]);
            setInsight("No activities logged yet to generate insights.");
            setLoading(false);
          }
        },
        (error) => {
          console.error("Error fetching activities: ", error);
          setInsight("Unable to fetch activities at this time.");
          setLoading(false);
        }
      );
    };

    fetchActivities();
  }, []);

  // Prepare chart data for Line graph
  const prepareChartData = (data) => {
    const sortedData = data
      .map((activity) => ({
        date: new Date(activity.timestamp).toLocaleDateString(),
        duration: activity.duration,
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    const labels = sortedData.map((entry) => entry.date);
    const durations = sortedData.map((entry) => entry.duration);

    setChartData({
      labels,
      datasets: [
        {
          label: "Activity Duration (minutes)",
          data: durations,
          borderColor: "#028090",
          backgroundColor: "rgba(2, 128, 144, 0.2)",
          tension: 0.4,
        },
      ],
    });
  };

  // Generate simple recommendations
  const generateRecommendations = (data) => {
    const activityTypes = [...new Set(data.map((item) => item.activity))];

    const allActivities = ["running", "yoga", "weightlifting", "swimming", "pilates"];
    const recommendationsList = allActivities.filter((rec) => !activityTypes.includes(rec));

    setRecommendations(recommendationsList);
  };

  // Generate AI-driven insights
  const generateInsight = async (data) => {
    try {
      const activitySummary = data
        .map((activity) => `${activity.activity}: ${activity.duration} mins`)
        .join(", ");

      const prompt = `
        Analyze the following fitness activities and provide motivational feedback:
        ${activitySummary}.
        Focus on celebrating progress and encouraging consistency.
      `;

      const response = await axios.post(
        "https://api.openai.com/v1/completions",
        {
          model: "text-davinci-003",
          prompt,
          max_tokens: 100,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
          },
        }
      );

      setInsight(response.data.choices[0]?.text.trim() || "No meaningful insights available.");
      setLoading(false);
    } catch (error) {
      console.error("Error generating insights: ", error);
      setInsight("Unable to generate insights at this time.");
      setLoading(false);
    }
  };

  // Assign a class based on activity type
  const getActivityClass = (activityType) => {
    switch (activityType) {
      case "running":
        return "activity-running";
      case "yoga":
        return "activity-yoga";
      case "weightlifting":
        return "activity-weightlifting";
      case "swimming":
        return "activity-swimming";
      case "pilates":
        return "activity-pilates";
      default:
        return "";
    }
  };

  return (
    <div className="insights-container">
      {/* Left Section: Logged Activities */}
      <div className="activity-log">
        <h3>Logged Activities</h3>
        <ul>
          {activities.map((activity, index) => (
            <li key={index} className={`activity-item ${getActivityClass(activity.activity)}`}>
              {activity.activity}: {activity.duration} mins
            </li>
          ))}
        </ul>
      </div>

      {/* Right Section: Recommendations and Line Graph */}
      <div className="right-insights">
        {/* Recommendations */}
        <div className="recommendations">
          <h3>Recommended Activities</h3>
          {recommendations.length > 0 ? (
            <ul>
              {recommendations.map((rec, index) => (
                <li key={index} className={`activity-item activity-${rec}`}>
                  Try {rec} to mix up your routine!
                </li>
              ))}
            </ul>
          ) : (
            <p>You're already doing a balanced set of activities! Keep it up!</p>
          )}
        </div>

        {/* Line Chart */}
        <div className="chart-box">
          {chartData ? (
            <Line
              data={chartData}
              options={{
                responsive: true,
                plugins: {
                  title: {
                    display: true,
                    text: "Activity Duration Over Time",
                  },
                  legend: {
                    display: true,
                    position: "top",
                  },
                },
              }}
            />
          ) : (
            <p>No chart data available yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Insights;

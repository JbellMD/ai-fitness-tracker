import React, { useEffect, useState } from "react";
import { database } from "../firebase";
import { ref, onValue } from "firebase/database";
import axios from "axios";
import { CircularProgress } from "@mui/material";

const Insights = () => {
  const [activities, setActivities] = useState([]); // Store fetched activities
  const [insight, setInsight] = useState(""); // AI-driven insights
  const [loading, setLoading] = useState(true);

  // Fetch activities from Realtime Database
  useEffect(() => {
    const fetchActivities = () => {
      const activitiesRef = ref(database, "activities");

      onValue(
        activitiesRef,
        (snapshot) => {
          const data = snapshot.val();
          if (data) {
            const fetchedActivities = Object.values(data).reverse(); // Reverse the order
            setActivities(fetchedActivities);
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
      default:
        return "";
    }
  };

  return (
    <div className="white-box insights">
      <h2>Activity Insights</h2>

      {loading ? (
        <CircularProgress />
      ) : (
        <>
          {/* Display the list of activities */}
          {activities.length > 0 && (
            <div className="activity-summary">
              <h3>Logged Activities</h3>
              <ul>
                {activities.map((activity, index) => (
                  <li key={index} className={`activity-item ${getActivityClass(activity.activity)}`}>
                    {activity.activity}: {activity.duration} mins
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* AI-generated Insight */}
          <p className="insight-text">{insight}</p>
        </>
      )}
    </div>
  );
};

export default Insights;


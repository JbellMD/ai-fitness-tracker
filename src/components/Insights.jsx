import React, { useEffect, useState } from "react";
import { database } from "../firebase";
import { ref, onValue } from "firebase/database"; // Import Realtime Database methods
import axios from "axios";
import { CircularProgress } from "@mui/material";

const Insights = () => {
  const [activities, setActivities] = useState([]); // Store activity data
  const [insight, setInsight] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch activities from Realtime Database
  useEffect(() => {
    const fetchActivities = () => {
      const activitiesRef = ref(database, "activities"); // Path to activities in Realtime Database

      onValue(activitiesRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const fetchedActivities = Object.values(data);
          setActivities(fetchedActivities);
          generateInsight(fetchedActivities);
        } else {
          setActivities([]);
          setInsight("No activities logged yet to generate insights.");
          setLoading(false);
        }
      }, (error) => {
        console.error("Error fetching activities: ", error);
        setLoading(false);
      });
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

  return (
    <div className="white-box insights">
      <h2>Activity Insights</h2>
      {loading ? (
        <CircularProgress />
      ) : (
        <p>{insight}</p>
      )}
    </div>
  );
};

export default Insights;

import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import axios from "axios";
import { CircularProgress } from "@mui/material";

const Insights = () => {
    const [, setActivities] = useState([]); // Ignore the first value
    const [insight, setInsight] = useState("");
    const [loading, setLoading] = useState(true);

    // Fetch activities from Firestore
    useEffect(() => {
        const fetchActivities = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "activities"));
                const fetchedActivities = [];
                querySnapshot.forEach((doc) => {
                    fetchedActivities.push(doc.data());
                });
                setActivities(fetchedActivities);
                generateInsight(fetchedActivities);
            } catch (error) {
                console.error("Error fetching activities: ", error);
            }
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

            setInsight(response.data.choices[0].text.trim());
            setLoading(false);
        } catch (error) {
            console.error("Error generating insights: ", error);
            setInsight("Unable to generate insights at this time.");
            setLoading(false);
        }
    };


    return (
        <div className="insights">
            <h2>Activity Insights</h2>
            {loading ? (
                <CircularProgress />
            ) : (
                <p>{insight || "No activities logged yet to generate insights."}</p>
            )}
        </div>
    );
};

export default Insights;

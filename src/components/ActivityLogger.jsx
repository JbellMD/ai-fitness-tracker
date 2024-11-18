import React from "react";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import { MdDirectionsRun, MdSelfImprovement, MdFitnessCenter } from "react-icons/md";

const ActivityLogger = () => {
    console.log("ActivityLogger component rendering...");
    const { register, handleSubmit, reset } = useForm();

    const onSubmit = async (data) => {
        try {
            await addDoc(collection(db, "activities"), {
                activity: data.activity,
                duration: parseInt(data.duration, 10), // Convert to number
                calories: calculateCalories(data.activity, data.duration), // Add calorie estimate
                timestamp: new Date(), // Timestamp for trends
            });
            alert("Activity logged successfully!");
            reset(); // Clear the form
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
            className="activity-logger"
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
                <button type="submit" className="submit-button">
                    Log Activity
                </button>
            </form>
            <div className="activity-icons">
                <MdDirectionsRun size={40} />
                <MdSelfImprovement size={40} />
                <MdFitnessCenter size={40} />
            </div>
        </motion.div>
    );
};

export default ActivityLogger;

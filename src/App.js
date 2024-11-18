import React, { useEffect } from "react";
import './App.css'; // Import the App.css file for global styles
import ActivityLogger from "./components/ActivityLogger";
import Insights from "./components/Insights";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";

function App() {
  // Fetch data from Firestore on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "activities"));
        querySnapshot.forEach((doc) => {
          console.log(doc.id, "=>", doc.data());
        });
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };

    fetchData();
  }, []); // Empty dependency array ensures it runs once on mount

  return (
    <div className="App">
      {/* Header Section */}
      <header className="App-header">
        <h1>AI Fitness Tracker</h1>
        <p>Log your activities and gain insights into your fitness journey!</p>
      </header>

      {/* Main Content */}
      <main>
        <ActivityLogger />
        <Insights />
      </main>
    </div>
  );
}

export default App;

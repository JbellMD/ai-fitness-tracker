import React from "react";
import './App.css'; // Import the App.css file for global styles
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import ActivityLogger from "./components/ActivityLogger";
import Insights from "./components/Insights";

function App() {
  console.log("App is rendering...");
  return (
    <Router>
      <div className="App">
        {/* Header Section */}
        <header className="App-header">
          <h1>AI Fitness Tracker</h1>
          <p>Log your activities and gain insights into your fitness journey!</p>
        </header>

        {/* Routes */}
        <Routes>
          <Route path="/" element={<ActivityLogger />} />
          <Route path="/insights" element={<Insights />} />
          {/* Redirect unknown routes to the home page */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;


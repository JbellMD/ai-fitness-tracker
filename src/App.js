import React, { useState, useEffect } from "react";
import './App.css'; // Import global styles
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from "react-router-dom";
import ActivityLogger from "./components/ActivityLogger";
import Insights from "./components/Insights";
import NutritionTracker from "./components/NutritionTracker";
import Login from "./components/Login";
import Register from "./components/Register";
import { auth } from "./firebase";
import { signOut } from "firebase/auth";

function App() {
  const [user, setUser] = useState(null); // State to track the logged-in user

  // Monitor Firebase authentication state
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe(); // Cleanup subscription on unmount
  }, []);

  // Handle Logout
  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        console.log("User signed out");
        setUser(null); // Clear the user state
      })
      .catch((error) => {
        console.error("Error signing out:", error);
      });
  };

  return (
    <Router>
      <div className="App">
        {/* Header Section */}
        <header className="App-header">
          <h1>AI Fitness Tracker</h1>
          <p>Log your activities and gain insights into your fitness journey!</p>

          {/* Navigation Links */}
          {user && (
            <nav className="nav-links">
              <Link to="/">Activity Logger</Link>
              <Link to="/insights">Insights</Link>
              <Link to="/nutrition">Nutrition Tracker</Link>
              <button onClick={handleLogout} className="logout-btn">
                Sign Out
              </button>
            </nav>
          )}
        </header>

        {/* Routes */}
        <Routes>
          {/* Login Route */}
          <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />

          {/* Register Route */}
          <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />

          {/* Protected Routes */}
          <Route
            path="/"
            element={user ? <ActivityLogger /> : <Navigate to="/login" />}
          />
          <Route
            path="/insights"
            element={user ? <Insights /> : <Navigate to="/login" />}
          />
          <Route
            path="/nutrition"
            element={user ? <NutritionTracker /> : <Navigate to="/login" />}
          />

          {/* Fallback for unknown routes */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

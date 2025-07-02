// src/Home.js
import React from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css"; // for custom styles

function Home() {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate("/signup"); // we'll create this later
  };

  return (
    <div className="home-container">
      <h1 className="title">Study Buddy 📚</h1>
      <p className="subtitle">Find the perfect partner to study smarter, not harder.</p>
      <button className="get-started-button" onClick={handleStart}>
        Get Started
      </button>
    </div>
  );
}

export default Home;

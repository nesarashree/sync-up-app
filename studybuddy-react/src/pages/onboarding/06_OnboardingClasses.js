// src/pages/OnboardingClasses.js

import React, { useState } from 'react';
import '../../styles/OnboardingBase.css';
import { useNavigate } from 'react-router-dom';
import ProgressBar from '../../components/ProgressBar';

function OnboardingClasses() {
  const [classes, setClasses] = useState(localStorage.getItem('classes') || '');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Process classes into an array and save to localStorage
    const classesArray = classes.split(',').map(cls => cls.trim()).filter(cls => cls !== '');
    localStorage.setItem('classes', JSON.stringify(classesArray));
    console.log('Classes saved:', classesArray);
    navigate('/onboarding/helptype');
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="profile-container">
      <div className="exit" onClick={handleBack}>←</div>
      <div className="profile-box">
        <ProgressBar currentStep={6} totalSteps={10} />

        <h2><strong>Classes I’m taking this quarter are...</strong></h2>
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <input
            type="text"
            className="profile-input"
            placeholder="CS 278, CHEM 33"
            value={classes}
            onChange={(e) => setClasses(e.target.value)}
            required
          />
          <p className="subtext">
            List your classes by code, separated by a single space and a comma.
          </p>
          <button type="submit" className="continue-btn">CONTINUE</button>
        </form>
      </div>
    </div>
  );
}

export default OnboardingClasses;

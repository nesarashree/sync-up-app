import React, { useState } from 'react';
import '../../styles/OnboardingBase.css';
import { useNavigate } from 'react-router-dom';
import ProgressBar from '../../components/ProgressBar';

function OnboardingName() {
  const [name, setName] = useState(localStorage.getItem('name') || '');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Save name to localStorage
    localStorage.setItem('name', name);
    // Navigate to next step
    navigate('/onboarding/gender');
  };

  const handleBack = () => {
    navigate(-1); // go back one page
  };

  return (
    <div className="profile-container">
      <div className="exit" onClick={handleBack}>←</div>

      <div className="profile-box">
        <ProgressBar currentStep={1} totalSteps={5} />

        <h2><strong>My name is</strong></h2>
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <input
            type="text"
            className="profile-input"
            placeholder="First name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <p className="subtext">
            This is how it will appear on your profile.<br />
            You will not be able to change it.
          </p>
          <button type="submit" className="continue-btn">CONTINUE</button>
        </form>
      </div>
    </div>
  );
}

export default OnboardingName;

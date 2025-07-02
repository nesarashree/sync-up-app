// OnboardingConnectionType.js
import React, { useState } from 'react';
import '../../styles/OnboardingBase.css';
import { useNavigate } from 'react-router-dom';
import ProgressBar from '../../components/ProgressBar';

const connectionOptions = [
  "Short-term partnership",
  "Long-term partnership",
  "Open to both!"
];

function OnboardingConnectionType() {
  const [selected, setSelected] = useState(localStorage.getItem('connectionType') || '');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Save to localStorage
    localStorage.setItem('connectionType', selected);
    console.log('Connection type saved:', selected);
    navigate('/onboarding/workstyle');
  };

  return (
    <div className="profile-container">
      <div className="exit" onClick={() => navigate(-1)}>←</div>
      <div className="profile-box">
        <ProgressBar currentStep={7} totalSteps={10} />
        <h2><strong>What kind of connection are you hoping for?</strong></h2>
        <p className="subtext">I'm committing to a...</p>
        <form onSubmit={handleSubmit}>
          {connectionOptions.map((option) => (
            <button
              type="button"
              key={option}
              className={`option-button ${selected === option ? 'selected' : ''}`}
              onClick={() => setSelected(option)}
            >
              {option}
            </button>
          ))}
          <button type="submit" className="continue-btn">CONTINUE</button>
        </form>
      </div>
    </div>
  );
}

export default OnboardingConnectionType;
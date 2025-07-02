import React, { useState } from 'react';
import '../../styles/OnboardingBase.css';
import { useNavigate } from 'react-router-dom';
import ProgressBar from '../../components/ProgressBar';

const workOptions = [
  { label: "Silence", example: "e.g. Green or law library" },
  { label: "Noise", example: "e.g. CoHo café, outside" },
  { label: "Collaborative work-spaces", example: "e.g. CODA, Tressider" },
  { label: "Online-only", example: "e.g. Zoom" },
  { label: "I'm good with anything!", example: "" }
];

function OnboardingWorkStyle() {
  const [selected, setSelected] = useState(() => {
    const savedWorkStyle = localStorage.getItem('workStyle');
    return savedWorkStyle ? JSON.parse(savedWorkStyle)[0] || '' : '';
  });
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Save to localStorage as an array (for consistency with other multi-select fields)
    localStorage.setItem('workStyle', JSON.stringify([selected]));
    console.log('Work environment saved:', selected);
    navigate('/onboarding/photo');
  };

  return (
    <div className="profile-container">
      <div className="exit" onClick={() => navigate(-1)}>←</div>
      <div className="profile-box">
        <ProgressBar currentStep={8} totalSteps={10} />
        <h2><strong>Preferred work environment?</strong></h2>
        <p className="subtext">I work/study best in...</p>

        <form onSubmit={handleSubmit}>
          {workOptions.map((option) => (
            <button
              type="button"
              key={option.label}
              className={`option-button ${selected === option.label ? 'selected' : ''}`}
              onClick={() => setSelected(option.label)}
            >
              {option.label}
              {option.example && (
                <span className="button-subtext">{option.example}</span>
              )}
            </button>
          ))}
          <button type="submit" className="continue-btn">CONTINUE</button>
        </form>
      </div>
    </div>
  );
}

export default OnboardingWorkStyle;

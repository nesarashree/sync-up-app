import React, { useState } from 'react';
import '../../styles/OnboardingBase.css';
import { useNavigate } from 'react-router-dom';
import ProgressBar from '../../components/ProgressBar';

function OnboardingGender() {
  const [gender, setGender] = useState(localStorage.getItem('gender') || '');
  const [showGender, setShowGender] = useState(localStorage.getItem('showGender') === 'true');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Save to localStorage
    localStorage.setItem('gender', gender);
    localStorage.setItem('showGender', showGender);
    console.log('Gender saved:', gender, ' | Show on profile:', showGender);
    navigate('/onboarding/gradyear');
  };

  const handleBack = () => {
    navigate(-1);
  };

  const options = ['Woman', 'Man', 'Non-binary', 'Other / Prefer not to say'];

  return (
    <div className="profile-container">
      <div className="exit" onClick={handleBack}>←</div>
      <div className="profile-box">
        <ProgressBar currentStep={2} totalSteps={10} />
        <h2><strong>I am a</strong></h2>

        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          {options.map((opt) => (
            <button
              type="button"
              key={opt}
              className={`option-button ${gender === opt ? 'selected' : ''}`}
              onClick={() => setGender(opt)}
            >
              {opt.toUpperCase()}
            </button>
          ))}

        <div className="checkbox-wrapper">
          <input
            id="showGender"
            type="checkbox"
            checked={showGender}
            onChange={() => setShowGender(!showGender)}
          />
          <label htmlFor="showGender">Display my gender on my profile</label>
        </div>


          <button type="submit" className="continue-btn">
            CONTINUE
          </button>
        </form>
      </div>
    </div>
  );
}

export default OnboardingGender;

import React, { useState } from 'react';
import '../../styles/OnboardingBase.css';
import { useNavigate } from 'react-router-dom';
import ProgressBar from '../../components/ProgressBar';

function OnboardingBio() {
  const [bio, setBio] = useState(localStorage.getItem('bio') || '');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Save bio to localStorage
    localStorage.setItem('bio', bio);
    console.log('Bio saved:', bio);
    navigate('/onboarding/houserules');
  };

  return (
    <div className="profile-container">
      <div className="exit" onClick={() => navigate(-1)}>←</div>
      <div className="profile-box">
        <ProgressBar currentStep={10} totalSteps={10} />
        <h2><strong>Almost there!</strong></h2>
        <p className="subtext">Add a short bio. You can edit this later.</p>
        <form onSubmit={handleSubmit}>
          <textarea
            className="profile-input"
            placeholder="CS + SymSys major trying to survive 154 + 221. Prefer structured study blocks w/Pomodoro. Down to review notes, quiz each other, or debug together!"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={5}
            maxLength={300}
            style={{ resize: 'none' }}
          />
          <button type="submit" className="continue-btn">CONTINUE</button>
        </form>
      </div>
    </div>
  );
}

export default OnboardingBio;

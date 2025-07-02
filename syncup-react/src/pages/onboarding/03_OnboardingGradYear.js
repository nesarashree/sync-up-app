import React, { useState } from 'react';
import '../../styles/OnboardingBase.css';
import { useNavigate } from 'react-router-dom';
import ProgressBar from '../../components/ProgressBar';

function OnboardingGradYear() {
  const [gradYear, setGradYear] = useState(localStorage.getItem('gradYear') || '');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Save to localStorage
    localStorage.setItem('gradYear', gradYear);
    console.log('Grad year saved:', gradYear);
    navigate('/onboarding/majorminor');
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleChange = (e) => {
    const input = e.target.value;
    const onlyDigits = input.replace(/\D/g, '');
    if (onlyDigits.length <= 4) {
      setGradYear(onlyDigits);
    }
  };

  return (
    <div className="profile-container">
      <div className="exit" onClick={handleBack}>←</div>

      <div className="profile-box">
        <ProgressBar currentStep={3} totalSteps={10} />

        <h2><strong>I am graduating in</strong></h2>
        <form onSubmit={handleSubmit} style={{ width: '100%', textAlign: 'center' }}>
          <input
            type="text"
            inputMode="numeric"
            className="profile-input year-input"
            placeholder="YYYY"
            value={gradYear}
            onChange={handleChange}
            required
            style={{
              textAlign: 'center',
              letterSpacing: '12px',
              fontSize: '28px',
              fontWeight: '500',
              borderBottom: '2px solid #ccc',
              background: 'transparent',
              marginBottom: '40px',
              outline: 'none',
              width: '200px'
            }}
          />
          <button type="submit" className="continue-btn" disabled={gradYear.length !== 4}>
            CONTINUE
          </button>
        </form>
      </div>
    </div>
  );
}

export default OnboardingGradYear;

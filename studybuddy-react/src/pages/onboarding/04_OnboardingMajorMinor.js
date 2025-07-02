import React, { useState } from 'react';
import '../../styles/OnboardingBase.css';
import { useNavigate } from 'react-router-dom';
import ProgressBar from '../../components/ProgressBar';
import Select from 'react-select';
import majorsList from '../../data/majors'; // array of { label, value }

function OnboardingMajorMinor() {
  const [major, setMajor] = useState(null);
  const [minor, setMinor] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Major:', major, '| Minor:', minor);
    
    // Save to localStorage
    localStorage.setItem('major', JSON.stringify(major));
    if (minor) {
      localStorage.setItem('minor', JSON.stringify(minor));
    }
    
    navigate('/onboarding/interests');
  };

  const handleBack = () => {
    navigate(-1);
  };

  const customStyles = {
    control: (base) => ({
      ...base,
      borderRadius: 30,
      borderColor: '#aaa',
      padding: '2px 4px',
      minHeight: '50px',
      fontSize: '16px',
      boxShadow: 'none',
      '&:hover': { borderColor: '#555' },
    }),
    menu: (base) => ({
      ...base,
      borderRadius: 12,
      zIndex: 100,
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected ? '#e75480' : state.isFocused ? '#f2f2f2' : 'white',
      color: state.isSelected ? 'white' : '#333',
      padding: 12,
    }),
  };

  return (
    <div className="profile-container">
      <div className="exit" onClick={handleBack}>←</div>
      <div className="profile-box">
        <ProgressBar currentStep={4} totalSteps={10} />
        <h2><strong>Major & Minor</strong></h2>
        <p className="subtext">What are you studying?</p>
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <Select
            styles={customStyles}
            options={majorsList}
            value={major}
            onChange={setMajor}
            placeholder="e.g. Symbolic Systems"
            className="dropdown"
            isSearchable
          />
          <p className="subtext">Major</p>

          <Select
            styles={customStyles}
            options={majorsList}
            value={minor}
            onChange={setMinor}
            placeholder="e.g. Music"
            className="dropdown"
            isSearchable
            isClearable
          />
          <p className="subtext">Minor (Optional)</p>

          <button type="submit" className="continue-btn">CONTINUE</button>
        </form>
      </div>
    </div>
  );
}

export default OnboardingMajorMinor;

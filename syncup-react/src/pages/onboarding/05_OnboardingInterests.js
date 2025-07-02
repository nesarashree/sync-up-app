import React, { useState } from 'react';
import '../../styles/OnboardingBase.css';
import { useNavigate } from 'react-router-dom';
import ProgressBar from '../../components/ProgressBar';

const interestOptions = [
  "AI / ML", "UX / Design Thinking", "Health Tech", "Startups / VC", "Finance / Quant",
  "Sustainability", "Pre-Law", "Pre-Med", "Social Impact / Ethics", "Research",
  "Journalism", "Studio Art", "Social Justice", "GenAI", "Social Entrepreneurship",
  "Neuroscience", "Consulting", "Advocacy", "Public Service", "Education",
  "Public Speaking / Debate", "Volunteering", "Humanities", "Media/Film",
  "Robotics", "Reading", "Foreign languages"
];

function OnboardingInterests() {
  const [selected, setSelected] = useState(() => {
    const savedInterests = localStorage.getItem('interests');
    return savedInterests ? JSON.parse(savedInterests) : [];
  });
  const navigate = useNavigate();

  const toggleInterest = (interest) => {
    setSelected((prev) =>
      prev.includes(interest)
        ? prev.filter((item) => item !== interest)
        : [...prev, interest]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Save to localStorage
    localStorage.setItem('interests', JSON.stringify(selected));
    console.log('Saved interests:', selected);
    navigate('/onboarding/classes');
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="profile-container">
      <div className="exit" onClick={handleBack}>←</div>

      <div className="profile-box">
        <ProgressBar currentStep={5} totalSteps={10} />
        <h2><strong>Academic Interests</strong></h2>
        <p className="subtext">Let your peers know what you’re interested in by adding it to your profile.</p>

        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <div className="interests-grid">
            {interestOptions.map((interest) => (
              <button
                key={interest}
                type="button"
                className={`interest-tag ${selected.includes(interest) ? 'selected' : ''}`}
                onClick={() => toggleInterest(interest)}
              >
                {interest}
              </button>
            ))}
          </div>

          <button type="submit" className="continue-btn">CONTINUE</button>
        </form>
      </div>
    </div>
  );
}

export default OnboardingInterests;

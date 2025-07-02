// components/ProgressBar.js
import React from 'react';

function ProgressBar({ currentStep, totalSteps }) {
  const percent = `${(currentStep / totalSteps) * 100}%`;

  return (
    <div className="progress-bar">
      <div className="progress" style={{ width: percent }}></div>
    </div>
  );
}

export default ProgressBar;

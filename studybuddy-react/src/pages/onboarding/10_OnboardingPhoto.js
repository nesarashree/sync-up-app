import React, { useState } from 'react';
import '../../styles/OnboardingBase.css';
import { useNavigate } from 'react-router-dom';
import ProgressBar from '../../components/ProgressBar';
import cameraIcon from '../../assets/camera.png'; // replace with your actual path

function OnboardingPhoto() {
  const navigate = useNavigate();
  const [photoFile, setPhotoFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setPhotoFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (photoFile) {
      // We can't store the file in localStorage, but we can store it in sessionStorage temporarily
      // We'll save the actual file object reference to window for Firebase upload later
      window.photoFileForUpload = photoFile;
      localStorage.setItem('photoSelected', 'true');
    }
    
    navigate('/onboarding/bio');
  };

  return (
    <div className="profile-container">
      <div className="exit" onClick={() => navigate(-1)}>←</div>
      <div className="profile-box">
        <ProgressBar currentStep={9} totalSteps={10} />
        <h2><strong>Profile Photo</strong></h2>
        <p className="subtext">LinkedIn-style headshot.</p>

        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <label className="photo-upload-label">
            <div className="upload-content">
              <img src={cameraIcon} alt="camera icon" className="upload-icon" />
              <span className="upload-text">Click to upload</span>
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              hidden
            />
          </label>

          {preview && <img src={preview} className="photo-preview" alt="preview" />}

          <button type="submit" className="continue-btn">CONTINUE</button>
        </form>
      </div>
    </div>
  );
}

export default OnboardingPhoto;

import React, { useState } from 'react';
import '../../styles/OnboardingBase.css';
import { useNavigate } from 'react-router-dom';
import ProgressBar from '../../components/ProgressBar';
import { saveOnboardingData } from '../../services/userService';
import { useUser } from '../../contexts/UserContext';

function OnboardingHouseRules() {
  const [accepted, setAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { refreshUserData, forceUpdateOnboardingStatus } = useUser();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!accepted) {
      setError('You must accept the house rules to continue');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    console.log('Starting profile creation...');
    
    try {
      // Collect all data from previous steps
      const onboardingData = {
        name: localStorage.getItem('name') || 'User',
        gender: localStorage.getItem('gender') || 'Not specified',
        gradYear: localStorage.getItem('gradYear') || '2025',
        major: localStorage.getItem('major') ? JSON.parse(localStorage.getItem('major')) : null,
        minor: localStorage.getItem('minor') ? JSON.parse(localStorage.getItem('minor')) : null,
        interests: localStorage.getItem('interests') ? JSON.parse(localStorage.getItem('interests')) : [],
        classes: localStorage.getItem('classes') ? JSON.parse(localStorage.getItem('classes')) : [],
        helpType: localStorage.getItem('helpType') ? JSON.parse(localStorage.getItem('helpType')) : [],
        connectionType: localStorage.getItem('connectionType') || '',
        workStyle: localStorage.getItem('workStyle') ? JSON.parse(localStorage.getItem('workStyle')) : [],
        bio: localStorage.getItem('bio') || '',
        houseRules: accepted
      };
      
      console.log('Collected onboarding data:', onboardingData);
      
      // Photo upload is handled separately and can cause CORS issues in development
      // Skip photo upload for now if it's causing freezing
      const skipPhotoUpload = true; // Change to false if you want to enable photo upload
      
      if (window.photoFileForUpload && !skipPhotoUpload) {
        console.log('Photo file found, preparing to upload...');
        onboardingData.photoFile = window.photoFileForUpload;
      } else {
        console.log('Skipping photo upload for now');
        // Set a default photo URL
        onboardingData.defaultPhotoURL = 'https://i.imgur.com/JWzFXby.jpg';
      }
      
      console.log('Saving data to Firebase...');
      // Save all onboarding data to Firebase with a timeout
      const savePromise = saveOnboardingData(onboardingData);
      
      // Add a timeout to prevent hanging indefinitely
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Profile creation timed out')), 15000)
      );
      
      // Race between the save operation and the timeout
      const result = await Promise.race([savePromise, timeoutPromise]);
      
      console.log('Save result:', result);
      
      if (result.success) {
        // Clear temporary data
        window.photoFileForUpload = null;
        
        // Clear localStorage items related to onboarding
        const onboardingKeys = [
          'name', 'gender', 'gradYear', 'major', 'minor', 'interests',
          'classes', 'helpType', 'connectionType', 'workStyle', 'bio', 'photoSelected'
        ];
        onboardingKeys.forEach(key => localStorage.removeItem(key));
        
        console.log('Profile created successfully');
        
        // Force update the onboarding status immediately
        forceUpdateOnboardingStatus(true);
        
        // Also refresh user data as a backup
        console.log('Refreshing user data before navigating...');
        await refreshUserData();
        
        console.log('Manually setting localStorage flag for onboarding...');
        localStorage.setItem('onboardingCompleted', 'true');
        
        // Add a small delay to ensure context updates are processed
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Navigate to the home page using absolute path
        console.log('User data refreshed, navigating to home');
        navigate('/home', { replace: true });
      } else {
        throw new Error(result.error || 'Failed to save data');
      }
    } catch (err) {
      console.error('Failed to complete onboarding:', err);
      setError(`Something went wrong: ${err.message}. Please try again.`);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="profile-container">
      <div className="exit" onClick={() => navigate(-1)}>←</div>
      <div className="profile-box">
        <ProgressBar currentStep={10} totalSteps={10} />
        <h2><strong>Welcome to Study Buddy.</strong></h2>
        <p className="subtext">Please follow these House Rules.</p>
        
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <ul className="rules-list">
            <li><strong>✔ Be authentic.</strong><br />Make sure you are genuine with your partner preferences and expectations.</li>
            <li><strong>✔ Stay on topic.</strong><br />Only use this platform for finding a compatible study partner.</li>
            <li><strong>✔ Be respectful.</strong><br />Treat others how you'd like to be treated.</li>
            <li><strong>✔ Respect Privacy.</strong><br />Please respect other users' privacy.</li>
          </ul>
          
          {error && <div className="error-message">{error}</div>}
          
          <label className="checkbox-container">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
            />
            <span className="checkmark"></span>
            I agree to StudyBuddy's house rules, including respectful communication and ethical behavior.
          </label>

          <button 
            type="submit" 
            className="continue-btn"
            disabled={isSubmitting || !accepted}
          >
            {isSubmitting ? 'CREATING PROFILE...' : 'COMPLETE PROFILE'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default OnboardingHouseRules;

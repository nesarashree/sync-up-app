import React, { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveOnboardingData } from '../services/userService';
import { auth } from '../firebase';

// Create context
const OnboardingContext = createContext();

// Custom hook to use the onboarding context
export const useOnboarding = () => {
  return useContext(OnboardingContext);
};

// Provider component
export const OnboardingProvider = ({ children }) => {
  const navigate = useNavigate();
  
  // State to store all onboarding data
  const [onboardingData, setOnboardingData] = useState({
    name: '',
    gender: '',
    gradYear: '',
    major: null,
    minor: null,
    interests: [],
    classes: [],
    helpType: [],
    connectionType: '',
    workStyle: [],
    photoFile: null,
    photoURL: '',
    bio: '',
    houseRules: false
  });
  
  // State to track onboarding progress
  const [onboardingStep, setOnboardingStep] = useState(1);
  
  // Update onboarding data
  const updateOnboardingData = (newData) => {
    setOnboardingData(prevData => ({
      ...prevData,
      ...newData
    }));
  };

  // Go to the next onboarding step
  const nextStep = (stepData) => {
    // Update data with the current step's data
    updateOnboardingData(stepData);
    
    // Increment step
    setOnboardingStep(prevStep => prevStep + 1);
    
    // Define all onboarding routes in order
    const onboardingRoutes = [
      '/onboarding/name',
      '/onboarding/gender',
      '/onboarding/gradyear',
      '/onboarding/majors',
      '/onboarding/interests',
      '/onboarding/classes',
      '/onboarding/helptype',
      '/onboarding/connectiontype',
      '/onboarding/workstyle',
      '/onboarding/photo',
      '/onboarding/bio',
      '/onboarding/houserules'
    ];
    
    // Navigate to next route if there's one, or to the dashboard
    if (onboardingStep < onboardingRoutes.length) {
      navigate(onboardingRoutes[onboardingStep]);
    } else {
      // Final step - submit all data to Firebase
      submitOnboardingData();
    }
  };

  // Go to the previous onboarding step
  const prevStep = () => {
    if (onboardingStep > 1) {
      setOnboardingStep(prevStep => prevStep - 1);
      navigate(-1); // Go back to the previous page
    }
  };

  // Submit all onboarding data to Firebase
  const submitOnboardingData = async () => {
    try {
      // Check if user is authenticated
      const user = auth.currentUser;
      if (!user) {
        console.error('No authenticated user');
        navigate('/login');
        return;
      }
      
      // Save the onboarding data
      const result = await saveOnboardingData(onboardingData);
      
      if (result.success) {
        // Navigate to dashboard or home
        navigate('/home');
      } else {
        console.error('Failed to save onboarding data:', result.error);
        // Handle error - maybe show a message to the user
      }
    } catch (error) {
      console.error('Error submitting onboarding data:', error);
    }
  };

  // Value object to be provided to consumers
  const value = {
    onboardingData,
    onboardingStep,
    updateOnboardingData,
    nextStep,
    prevStep,
    submitOnboardingData
  };
  
  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
};

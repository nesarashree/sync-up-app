import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import { getUserData, checkOnboardingStatus } from '../services/userService';

// Create context
const UserContext = createContext();

// Custom hook to use the user context
export const useUser = () => {
  return useContext(UserContext);
};

// Provider component
export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [onboardingComplete, setOnboardingComplete] = useState(false);

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        try {
          // Get user data from Firestore
          const result = await getUserData(user.uid);
          if (result.success) {
            setUserData(result.data);
            
            // Check if onboarding is complete
            if (result.data && result.data.onboardingComplete) {
              setOnboardingComplete(true);
            } else {
              setOnboardingComplete(false);
              console.log('Onboarding not complete or not found in user data');
            }
          } else {
            setUserData(null);
            setOnboardingComplete(false);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setUserData(null);
          setOnboardingComplete(false);
        }
      } else {
        setUserData(null);
        setOnboardingComplete(false);
      }
      
      setLoading(false);
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  // Refresh user data
  const refreshUserData = async () => {
    if (currentUser) {
      try {
        console.log('Refreshing user data for:', currentUser.uid);
        const result = await getUserData(currentUser.uid);
        if (result.success) {
          console.log('User data refreshed:', result.data);
          setUserData(result.data);
          
          // Explicitly check and update onboarding status
          if (result.data && result.data.onboardingComplete) {
            console.log('Setting onboardingComplete to true');
            setOnboardingComplete(true);
          }
          
          return result.data;
        } else {
          console.log('Failed to refresh user data:', result.error);
        }
      } catch (error) {
        console.error('Error refreshing user data:', error);
      }
    } else {
      console.log('No current user, cannot refresh data');
    }
    return null;
  };
  
  // Manual method to force update onboarding status
  const forceUpdateOnboardingStatus = (status) => {
    console.log(`Manually setting onboarding status to: ${status}`);
    setOnboardingComplete(status);
  };

  // Value object to be provided to consumers
  const value = {
    currentUser,
    userData,
    loading,
    onboardingComplete,
    refreshUserData,
    setUserData,
    forceUpdateOnboardingStatus
  };
  
  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

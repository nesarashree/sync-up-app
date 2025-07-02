import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';

/**
 * Protected route component to control access based on authentication and onboarding status
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render if conditions are met
 * @param {boolean} props.requireAuth - Whether authentication is required
 * @param {boolean} props.requireOnboarding - Whether completed onboarding is required
 * @param {boolean} props.redirectIfOnboardingComplete - Whether to redirect if onboarding is complete
 * @returns {React.ReactNode} Either the protected component or a redirect
 */
const ProtectedRoute = ({ 
  children, 
  requireAuth = true,
  requireOnboarding = false,
  redirectIfOnboardingComplete = false
}) => {
  const { currentUser, loading, onboardingComplete, forceUpdateOnboardingStatus } = useUser();
  
  // Also check localStorage for onboarding status
  const localStorageOnboardingComplete = localStorage.getItem('onboardingCompleted') === 'true';
  
  // Combine context and localStorage values
  const isOnboardingComplete = onboardingComplete || localStorageOnboardingComplete;
  
  // If localStorage shows onboarding is complete but context doesn't, update context
  React.useEffect(() => {
    if (localStorageOnboardingComplete && !onboardingComplete && forceUpdateOnboardingStatus) {
      console.log('Syncing onboarding status from localStorage to context');
      forceUpdateOnboardingStatus(true);
    }
  }, [localStorageOnboardingComplete, onboardingComplete, forceUpdateOnboardingStatus]);
  
  console.log('ProtectedRoute check - Context onboardingComplete:', onboardingComplete);
  console.log('ProtectedRoute check - localStorage onboardingComplete:', localStorageOnboardingComplete);
  console.log('ProtectedRoute check - Combined isOnboardingComplete:', isOnboardingComplete);
  
  // Show loading state while auth state is being determined
  if (loading) {
    return <div className="loading">Loading...</div>;
  }
  
  // Check authentication requirement
  if (requireAuth && !currentUser) {
    return <Navigate to="/" replace />;
  }
  
  // Check onboarding status requirements
  if (requireOnboarding && !isOnboardingComplete) {
    return <Navigate to="/onboarding/name" replace />;
  }
  
  // Redirect if onboarding complete but trying to access onboarding pages
  if (redirectIfOnboardingComplete && isOnboardingComplete) {
    return <Navigate to="/home" replace />;
  }
  
  // If all checks pass, render the protected content
  return children;
};

export default ProtectedRoute;

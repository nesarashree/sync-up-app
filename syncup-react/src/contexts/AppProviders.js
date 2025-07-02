import React from 'react';
import { UserProvider } from './UserContext';
import { OnboardingProvider } from './OnboardingContext';

// Combine all providers into one component
const AppProviders = ({ children }) => {
  return (
    <UserProvider>
      <OnboardingProvider>
        {children}
      </OnboardingProvider>
    </UserProvider>
  );
};

export default AppProviders;

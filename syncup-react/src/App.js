import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { signInWithPopup } from 'firebase/auth';
import { auth, provider } from './firebase';
import './App.css';
import ProtectedRoute from './components/ProtectedRoute';
import AppProviders from './contexts/AppProviders';
import { useUser } from './contexts/UserContext';

import OnboardingName from './pages/onboarding/01_OnboardingName';
import OnboardingGender from './pages/onboarding/02_OnboardingGender';
import OnboardingGradYear from './pages/onboarding/03_OnboardingGradYear';
import OnboardingMajorMinor from './pages/onboarding/04_OnboardingMajorMinor';
import OnboardingInterests from './pages/onboarding/05_OnboardingInterests';
import OnboardingClasses from './pages/onboarding/06_OnboardingClasses';
import OnboardingHelpType from './pages/onboarding/07_OnboardingHelpType';
import OnboardingConnectionType from './pages/onboarding/08_OnboardingConnectionType';
import OnboardingWorkStyle from './pages/onboarding/09_OnboardingWorkStyle';
import OnboardingPhoto from './pages/onboarding/10_OnboardingPhoto';
import OnboardingBio from './pages/onboarding/11_OnboardingBio';
import OnboardingHouseRules from './pages/onboarding/12_OnboardingHouseRules';
import AppHome from './pages/home/AppHome';
import Calendar from './pages/calendar/Calendar';
import NormViolationForm from "./components/NormViolationForm";
import Report from "./components/ReportPage";





function Home() {
  const navigate = useNavigate();
  const { currentUser, onboardingComplete, loading } = useUser();
  
  // Redirect user based on auth and onboarding status when component mounts
  React.useEffect(() => {
    // Don't redirect while still loading
    if (loading) return;
    
    if (currentUser) {
      console.log('User is authenticated:', currentUser.uid);
      console.log('Onboarding status:', onboardingComplete);
      
      // If onboarding is complete, redirect to home
      if (onboardingComplete) {
        console.log('Redirecting to home page');
        navigate('/home');
      } else {
        console.log('Redirecting to onboarding');
        navigate('/onboarding/name');
      }
    } else {
      // User is not authenticated, stay on the welcome page
      console.log('No user is authenticated, showing welcome page');
    }
  }, [currentUser, onboardingComplete, loading, navigate]);

  const handleGoogleLogin = async () => {
    try {
      console.log('Starting Google login process');
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      console.log('User signed in:', user.uid);
      
      // User context will handle the redirection based on onboarding status
      // (The useEffect above will run after the auth state updates)
    } catch (error) {
      console.error("Error during authentication:", error);
    }
  };
  
  // No development shortcuts in production mode

  return (
    <div className="App">
      <header className="App-header">
        <h1>Welcome to SyncUp 📚</h1>
        <p>Find your perfect study match and stay accountable!</p>
        <button className="App-button" onClick={handleGoogleLogin}>
          Login with Google
        </button>
        
        {/* No development shortcuts in production */}
      </header>
    </div>
  );
}

function App() {
  return (
    <AppProviders>
      <Routes>
        <Route path="/" element={<Home />} />
        
        {/* Onboarding Routes - require auth but redirect if onboarding is already complete */}
        <Route path="/onboarding/name" element={
          <ProtectedRoute requireAuth={true} redirectIfOnboardingComplete={true}>
            <OnboardingName />
          </ProtectedRoute>
        } />
        <Route path="/onboarding/gender" element={
          <ProtectedRoute requireAuth={true} redirectIfOnboardingComplete={true}>
            <OnboardingGender />
          </ProtectedRoute>
        } />
        <Route path="/onboarding/gradyear" element={
          <ProtectedRoute requireAuth={true} redirectIfOnboardingComplete={true}>
            <OnboardingGradYear />
          </ProtectedRoute>
        } />
        <Route path="/onboarding/majorminor" element={
          <ProtectedRoute requireAuth={true} redirectIfOnboardingComplete={true}>
            <OnboardingMajorMinor />
          </ProtectedRoute>
        } />
        <Route path="/onboarding/interests" element={
          <ProtectedRoute requireAuth={true} redirectIfOnboardingComplete={true}>
            <OnboardingInterests />
          </ProtectedRoute>
        } />
        <Route path="/onboarding/classes" element={
          <ProtectedRoute requireAuth={true} redirectIfOnboardingComplete={true}>
            <OnboardingClasses />
          </ProtectedRoute>
        } />
        <Route path="/onboarding/helptype" element={
          <ProtectedRoute requireAuth={true} redirectIfOnboardingComplete={true}>
            <OnboardingHelpType />
          </ProtectedRoute>
        } />
        <Route path="/onboarding/connection" element={
          <ProtectedRoute requireAuth={true} redirectIfOnboardingComplete={true}>
            <OnboardingConnectionType />
          </ProtectedRoute>
        } />
        <Route path="/onboarding/workstyle" element={
          <ProtectedRoute requireAuth={true} redirectIfOnboardingComplete={true}>
            <OnboardingWorkStyle />
          </ProtectedRoute>
        } />
        <Route path="/onboarding/photo" element={
          <ProtectedRoute requireAuth={true} redirectIfOnboardingComplete={true}>
            <OnboardingPhoto />
          </ProtectedRoute>
        } />
        <Route path="/onboarding/bio" element={
          <ProtectedRoute requireAuth={true} redirectIfOnboardingComplete={true}>
            <OnboardingBio />
          </ProtectedRoute>
        } />
        <Route path="/onboarding/houserules" element={
          <ProtectedRoute requireAuth={true} redirectIfOnboardingComplete={true}>
            <OnboardingHouseRules />
          </ProtectedRoute>
        } />
        
        {/* Home route - requires auth and completed onboarding */}
        <Route path="/home" element={
          <ProtectedRoute requireAuth={true} requireOnboarding={true}>
            <AppHome />
          </ProtectedRoute>
        } />
        
        {/* Calendar route - requires auth and completed onboarding */}
        <Route path="/calendar" element={
          <ProtectedRoute requireAuth={true} requireOnboarding={true}>
            <Calendar />
          </ProtectedRoute>
        } />

        <Route path="/safety" element={<NormViolationForm />} /> {/* connecting norm violation report */}
        <Route path="/safety" element={<Report />} />

      </Routes>
    </AppProviders>
  );
}

export default App;

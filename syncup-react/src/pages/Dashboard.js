import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { getPotentialMatches } from '../services/userService';
import '../styles/Dashboard.css'; // We'll create this style file after

function Dashboard() {
  const { userData, currentUser } = useUser();
  const [potentialMatches, setPotentialMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchMatches = async () => {
      if (currentUser) {
        try {
          setLoading(true);
          const result = await getPotentialMatches(currentUser.uid);
          
          if (result.success) {
            setPotentialMatches(result.matches);
          } else {
            setError('Failed to load potential matches');
          }
        } catch (err) {
          console.error('Error fetching matches:', err);
          setError('An error occurred while fetching matches');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchMatches();
  }, [currentUser]);

  const handleSwipeLeft = () => {
    // In a real application, you'd record this as a "no" in the database
    console.log('Swiped left (no) on:', potentialMatches[currentIndex]?.name);
    moveToNextProfile();
  };

  const handleSwipeRight = () => {
    // In a real application, you'd record this as a "yes" in the database
    // and check for mutual matches
    console.log('Swiped right (yes) on:', potentialMatches[currentIndex]?.name);
    moveToNextProfile();
  };

  const moveToNextProfile = () => {
    if (currentIndex < potentialMatches.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // No more profiles
      setCurrentIndex(-1);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container loading-container">
        <h2>Finding study buddies for you...</h2>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container error-container">
        <h2>Oops!</h2>
        <p>{error}</p>
        <button 
          className="retry-button"
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    );
  }

  if (potentialMatches.length === 0 || currentIndex === -1) {
    return (
      <div className="dashboard-container no-matches-container">
        <h2>No study buddies at this time!</h2>
        <p>You're the first one here or there are no matches yet.</p>
        <button 
          className="action-button generate-button"
          onClick={async () => {
            try {
              // Import only when needed to avoid circular dependencies
              const { createSampleUsers } = await import('../utils/firebaseUtils');
              
              setLoading(true);
              const result = await createSampleUsers(5); // Create 5 sample users
              
              if (result.success) {
                // Refetch matches
                const matchesResult = await getPotentialMatches(currentUser.uid);
                
                if (matchesResult.success) {
                  setPotentialMatches(matchesResult.matches);
                  setCurrentIndex(0); // Reset to first match
                }
              }
            } catch (err) {
              console.error('Error creating sample users:', err);
              setError('Failed to create sample users');
            } finally {
              setLoading(false);
            }
          }}
        >
          Generate Sample Study Buddies
        </button>
      </div>
    );
  }

  // Current profile to display
  const currentProfile = potentialMatches[currentIndex];

  return (
    <div className="dashboard-container">
      <div className="user-stats">
        <h2>Hello, {userData?.name || 'Student'}</h2>
        <p>{userData?.major?.label || 'Your Major'}</p>
      </div>
      
      <div className="match-card">
        <div 
          className="profile-image" 
          style={{
            backgroundImage: currentProfile.photoURL 
              ? `url(${currentProfile.photoURL})` 
              : 'url(/default-avatar.png)'
          }}
        >
          <div className="profile-details">
            <h3>{currentProfile.name}, {currentProfile.gradYear}</h3>
            <p>{currentProfile.major?.label}</p>
          </div>
        </div>
        
        <div className="profile-bio">
          <p>{currentProfile.bio || 'No bio available'}</p>
        </div>
        
        <div className="match-details">
          <div className="match-section">
            <h4>Classes</h4>
            <ul className="tags-list">
              {currentProfile.classes?.map((cls, index) => (
                <li key={index} className="tag">{cls}</li>
              )) || <li className="tag">No classes listed</li>}
            </ul>
          </div>
          
          <div className="match-section">
            <h4>Interests</h4>
            <ul className="tags-list">
              {currentProfile.interests?.map((interest, index) => (
                <li key={index} className="tag">{interest}</li>
              )) || <li className="tag">No interests listed</li>}
            </ul>
          </div>
          
          <div className="match-section">
            <h4>Work Style</h4>
            <ul className="tags-list">
              {currentProfile.workStyle?.map((style, index) => (
                <li key={index} className="tag">{style}</li>
              )) || <li className="tag">No work style listed</li>}
            </ul>
          </div>
        </div>
        
        <div className="action-buttons">
          <button 
            className="action-button reject"
            onClick={handleSwipeLeft}
          >
            👎 Pass
          </button>
          <button 
            className="action-button accept"
            onClick={handleSwipeRight}
          >
            👍 Connect
          </button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

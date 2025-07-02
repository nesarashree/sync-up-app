import { doc, setDoc, getDoc, updateDoc, serverTimestamp, collection, getDocs, query, where } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from '../firebase';

/**
 * Creates or updates a user document in Firestore
 * @param {string} userId - The user's ID
 * @param {Object} userData - The user data to save
 */
export const saveUserData = async (userId, userData) => {
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, userData, { merge: true });
    return { success: true };
  } catch (error) {
    console.error('Error saving user data:', error);
    return { success: false, error };
  }
};

/**
 * Fetches a user document from Firestore
 * @param {string} userId - The user's ID
 */
export const getUserData = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return { success: true, data: userSnap.data() };
    } else {
      return { success: false, error: 'User not found' };
    }
  } catch (error) {
    console.error('Error fetching user data:', error);
    return { success: false, error };
  }
};

/**
 * Uploads a profile photo to Firebase Storage and returns the download URL
 * @param {File} file - The profile photo file
 * @param {string} userId - The user's ID
 */
export const uploadProfilePhoto = async (file, userId) => {
  try {
    if (!file) {
      console.log('No file provided for upload');
      return { success: false, error: 'No file provided' };
    }
    
    // Create a reference to the file location
    const storageRef = ref(storage, `profile_photos/${userId}`);
    
    // Upload the file
    const snapshot = await uploadBytes(storageRef, file);
    
    // Get the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    console.log('Photo uploaded successfully:', downloadURL);
    
    // Update the user's document with the photo URL
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      photoURL: downloadURL
    });
    
    return { success: true, photoURL: downloadURL };
  } catch (error) {
    console.error('Error uploading profile photo:', error);
    return { success: false, error };
  }
};

/**
 * Save onboarding data to Firestore
 * @param {Object} data - The onboarding data
 */
export const saveOnboardingData = async (data) => {
  try {
    console.log('Starting saveOnboardingData with:', { ...data, photoFile: data.photoFile ? 'File present' : 'No file' });
    const user = auth.currentUser;
    
    if (!user) {
      console.error('No authenticated user');
      return { success: false, error: 'No authenticated user' };
    }
    
    const userId = user.uid;
    console.log('User ID:', userId);
    
    // Extract photoFile and defaultPhotoURL from the data object
    const { photoFile, defaultPhotoURL, ...dataToSave } = data;
    
    // If photoFile exists, upload it
    let photoURL = null;
    if (photoFile) {
      try {
        console.log('Uploading photo to Firebase Storage...');
        const photoResult = await uploadProfilePhoto(photoFile, userId);
        if (photoResult.success) {
          photoURL = photoResult.photoURL;
          console.log('Photo uploaded successfully:', photoURL);
        } else {
          console.error('Photo upload failed:', photoResult.error);
        }
      } catch (photoError) {
        console.error('Error during photo upload:', photoError);
        // Continue with profile creation even if photo upload fails
      }
    } else if (defaultPhotoURL) {
      // Use the default photo URL if provided and no photo was uploaded
      photoURL = defaultPhotoURL;
      console.log('Using default photo URL:', photoURL);
    }
    
    // Ensure interests are properly formatted as an array
    const interests = data.interests || [];
    console.log('Storing interests:', interests);
    
    // Prepare the user data object with exactly the same fields as sample profiles
    const userData = {
      // Basic information
      name: data.name || user.displayName || 'User',
      email: user.email,
      displayName: user.displayName || data.name,
      uid: userId,
      
      // Profile data
      gender: data.gender || 'Not specified',
      gradYear: data.gradYear || '2025',
      major: data.major || null,
      minor: data.minor || null,
      bio: data.bio || '',
      
      // Preferences
      interests: Array.isArray(interests) ? interests : [],
      classes: Array.isArray(data.classes) ? data.classes : [],
      helpType: Array.isArray(data.helpType) ? data.helpType : [],
      connectionType: data.connectionType || '',
      workStyle: Array.isArray(data.workStyle) ? data.workStyle : [],
      
      // Photo
      photoURL: photoURL || 'https://i.imgur.com/JWzFXby.jpg',
      
      // Status flags
      onboardingComplete: true,
      houseRules: data.houseRules || true,
      
      // Timestamps
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    // Remove any undefined or null values to avoid Firestore errors
    Object.keys(userData).forEach(key => {
      if (userData[key] === undefined || userData[key] === null) {
        delete userData[key];
      }
    });
    
    console.log('Saving user data to Firestore...');
    
    // Save the user data to Firestore
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, userData, { merge: true });
    
    console.log('User data saved successfully');
    return { success: true };
  } catch (error) {
    console.error('Error saving onboarding data:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Checks if the user has completed onboarding
 * @param {string} userId - The user's ID
 */
export const checkOnboardingStatus = async (userId) => {
  try {
    const userResult = await getUserData(userId);
    
    if (userResult.success) {
      return { 
        success: true, 
        onboardingComplete: userResult.data.onboardingComplete || false 
      };
    } else {
      return { success: false, onboardingComplete: false };
    }
  } catch (error) {
    console.error('Error checking onboarding status:', error);
    return { success: false, error };
  }
};

/**
 * Gets all potential matches for a user (other users they can swipe on)
 * @param {string} userId - The user's ID
 */
export const getPotentialMatches = async (userId) => {
  try {
    console.log('Getting potential matches for user:', userId)

    // retrieve all users 
    const usersSnapshot = await getDocs(collection(db, 'users'))
    const allUsers = []

    let currentUserData = null

    usersSnapshot.forEach(doc => {
      const userData = doc.data()
      if (doc.id === userId) {
        currentUserData = userData
      }
      if (userData.onboardingComplete) {
        allUsers.push({ id: doc.id, ...userData })
      }
    });

    if (!currentUserData) {
      console.error("Current user data not found or incomplete.")
      return { success: false, error: "User not found" }
    }

    // calculate score
    const scoredUsers = allUsers
      .filter(user => user.id !== userId)
      .map(user => {
        let score = 0

        // interests and classes contribute one point
        const sharedInterests = user.interests?.filter(i => currentUserData.interests?.includes(i)) || []
        score += sharedInterests.length

        const sharedClasses = user.classes?.filter(c => currentUserData.classes?.includes(c)) || []
        score += sharedClasses.length

        // other features contribute half point
        const sharedHelp = user.helpType?.filter(h => currentUserData.helpType?.includes(h)) || []
        score += 0.5 * sharedHelp.length

        if (user.connectionType && user.connectionType === currentUserData.connectionType) {
          score += 0.5
        }

        const sharedWorkStyle = user.workStyle?.filter(w => currentUserData.workStyle?.includes(w)) || []
        score += 0.5 * sharedWorkStyle.length

        return { ...user, score }
      })

    // sort
    scoredUsers.sort((a, b) => b.score - a.score)

    console.log(`Matched ${scoredUsers.length} users, sorted by similarity`)
    return { success: true, matches: scoredUsers }

  } catch (error) {
    console.error('Error getting potential matches:', error)
    return { success: false, error: error.message }
  }
}


/**
 * Records a user's swipe action (like/dislike)
 * @param {string} userId - The user's ID 
 * @param {string} targetUserId - The ID of the user they swiped on
 * @param {boolean} liked - Whether the user liked or disliked the target
 */
export const recordSwipe = async (userId, targetUserId, liked) => {
  try {
    const swipeRef = doc(db, 'swipes', `${userId}_${targetUserId}`);
    await setDoc(swipeRef, {
      userId,
      targetUserId,
      liked,
      timestamp: serverTimestamp()
    });

    // Check if this is a match (both users liked each other)
    if (liked) {
      const oppositeSwipeRef = doc(db, 'swipes', `${targetUserId}_${userId}`);
      const oppositeSwipe = await getDoc(oppositeSwipeRef);

      if (oppositeSwipe.exists() && oppositeSwipe.data().liked) {
        // It's a match! Create a match document
        const matchId = crypto.randomUUID();
        const matchRef = doc(db, 'matches', matchId);
        await setDoc(matchRef, {
          users: [userId, targetUserId],
          timestamp: serverTimestamp()
        });

        return { success: true, match: true, matchId };
      }
    }

    return { success: true, match: false };
  } catch (error) {
    console.error('Error recording swipe:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Gets all matches for a user
 * @param {string} userId - The user's ID
 */
export const getUserMatches = async (userId) => {
  try {
    const matchesQuery = query(
      collection(db, 'matches'),
      where('users', 'array-contains', userId)
    );
    
    const matchesSnapshot = await getDocs(matchesQuery);
    const matches = [];
    
    for (const matchDoc of matchesSnapshot.docs) {
      const matchData = matchDoc.data();
      const otherUserId = matchData.users.find(id => id !== userId);
      
      // Get the other user's data
      const otherUserData = await getUserData(otherUserId);
      
      if (otherUserData.success) {
        matches.push({
          id: matchDoc.id,
          user: otherUserData.data,
          timestamp: matchData.timestamp
        });
      }
    }
    
    return { success: true, matches };
  } catch (error) {
    console.error('Error getting user matches:', error);
    return { success: false, error: error.message };
  }
};

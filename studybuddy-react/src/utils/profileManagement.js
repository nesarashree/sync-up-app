import { doc, setDoc, updateDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, auth } from '../firebase';

/**
 * Creates a new user profile in Firebase after onboarding
 * @param {Object} userData - Profile data from onboarding
 * @param {File} photoFile - Optional profile photo file
 * @returns {Promise<Object>} - Result of profile creation
 */
export const createUserProfile = async (userData, photoFile = null) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    console.log('Creating user profile for', user.uid);

    // Format the data for Firebase storage
    const profileData = {
      id: user.uid, // Use Firebase auth ID as profile ID
      name: userData.name,
      gender: userData.gender,
      major: userData.major?.value || userData.major || '',
      minor: userData.minor?.value || userData.minor || '',
      majorMinor: `${userData.major?.value || userData.major || ''}${userData.minor?.value || userData.minor ? ' & ' + (userData.minor?.value || userData.minor) : ''}`,
      gradYear: userData.gradYear || '',
      classYear: userData.gradYear ? `Class of ${userData.gradYear}` : '',
      bio: userData.bio || '',
      classes: Array.isArray(userData.classes) ? userData.classes : [],
      interests: Array.isArray(userData.interests) 
        ? userData.interests.map(i => typeof i === 'object' ? i.value : i)
        : [],
      connectionType: userData.connectionType || 'Study partner',
      workStyle: Array.isArray(userData.workStyle) ? userData.workStyle : [userData.workStyle],
      helpType: Array.isArray(userData.helpType) ? userData.helpType : [userData.helpType],
      onboardingComplete: true,
      profileType: 'user', // To distinguish from migrated profiles
      photoURL: user.photoURL || '', // Will be updated after photo upload
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    // Save profile to Firestore using user's auth ID
    await setDoc(doc(db, 'profiles', user.uid), profileData);
    console.log('✅ Profile saved to Firebase');

    // Handle profile photo upload if provided
    if (photoFile) {
      const photoURL = await uploadProfilePhoto(user.uid, photoFile);
      if (photoURL) {
        await updateDoc(doc(db, 'profiles', user.uid), { 
          photoURL,
          updatedAt: serverTimestamp() 
        });
        profileData.photoURL = photoURL;
      }
    }

    return { success: true, profile: profileData };
  } catch (error) {
    console.error('❌ Error creating profile:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Updates an existing user profile in Firebase
 * @param {Object} userData - Updated profile data
 * @param {File} photoFile - Optional new profile photo
 * @returns {Promise<Object>} - Result of profile update
 */
export const updateUserProfile = async (userData, photoFile = null) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    // Check if profile exists
    const profileRef = doc(db, 'profiles', user.uid);
    const profileSnap = await getDoc(profileRef);
    
    if (!profileSnap.exists()) {
      return { success: false, error: 'Profile not found' };
    }

    // Prepare update data
    const updateData = {
      name: userData.name,
      gender: userData.gender,
      major: userData.major?.value || userData.major || '',
      minor: userData.minor?.value || userData.minor || '',
      majorMinor: `${userData.major?.value || userData.major || ''}${userData.minor?.value || userData.minor ? ' & ' + (userData.minor?.value || userData.minor) : ''}`,
      gradYear: userData.gradYear || '',
      classYear: userData.gradYear ? `Class of ${userData.gradYear}` : '',
      bio: userData.bio || '',
      classes: Array.isArray(userData.classes) ? userData.classes : [],
      interests: Array.isArray(userData.interests) 
        ? userData.interests.map(i => typeof i === 'object' ? i.value : i)
        : [],
      connectionType: userData.connectionType || profileSnap.data().connectionType,
      workStyle: Array.isArray(userData.workStyle) ? userData.workStyle : [userData.workStyle],
      helpType: Array.isArray(userData.helpType) ? userData.helpType : [userData.helpType],
      updatedAt: serverTimestamp()
    };

    // Update profile in Firestore
    await updateDoc(profileRef, updateData);
    
    // Handle profile photo upload if provided
    if (photoFile) {
      const photoURL = await uploadProfilePhoto(user.uid, photoFile);
      if (photoURL) {
        await updateDoc(profileRef, { 
          photoURL,
          updatedAt: serverTimestamp() 
        });
        updateData.photoURL = photoURL;
      }
    }

    return { 
      success: true, 
      profile: {
        ...profileSnap.data(),
        ...updateData
      }
    };
  } catch (error) {
    console.error('❌ Error updating profile:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Gets the current user's profile from Firebase
 * @returns {Promise<Object>} - User profile data
 */
export const getCurrentUserProfile = async () => {
  try {
    const user = auth.currentUser;
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    const profileRef = doc(db, 'profiles', user.uid);
    const profileSnap = await getDoc(profileRef);
    
    if (profileSnap.exists()) {
      return { 
        success: true, 
        profile: {
          id: profileSnap.id,
          ...profileSnap.data()
        }
      };
    } else {
      return { success: false, error: 'Profile not found' };
    }
  } catch (error) {
    console.error('❌ Error getting profile:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Uploads a profile photo to Firebase Storage
 * @param {string} userId - User ID for the photo
 * @param {File} file - Photo file to upload
 * @returns {Promise<string|null>} - Download URL or null
 */
const uploadProfilePhoto = async (userId, file) => {
  try {
    if (!file) return null;
    
    // Create reference to storage
    const storageRef = ref(storage, `profile_photos/${userId}`);
    
    // Upload file
    await uploadBytes(storageRef, file);
    
    // Get download URL
    const downloadURL = await getDownloadURL(storageRef);
    console.log('✅ Profile photo uploaded:', downloadURL);
    
    return downloadURL;
  } catch (error) {
    console.error('❌ Error uploading profile photo:', error);
    return null;
  }
};

export default {
  createUserProfile,
  updateUserProfile,
  getCurrentUserProfile
};

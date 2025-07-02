/**
 * Firebase utility functions for testing and debugging
 */
import { auth, db, storage } from '../firebase';
import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  setDoc, 
  addDoc, 
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

/**
 * Create or update sample user data for development and testing
 * @param {string} userId - User ID to create/update or undefined for current user
 * @param {Object} customData - Optional custom data to merge with default data
 * @returns {Promise<Object>} - Result of the operation
 */
export const createSampleUser = async (userId, customData = {}) => {
  try {
    // Use current user ID if not provided
    const uid = userId || auth.currentUser?.uid;
    
    if (!uid) {
      return { success: false, error: 'No user ID provided and no user is signed in' };
    }
    
    // Default sample user data
    const defaultUserData = {
      name: 'Sample User',
      gender: 'Other',
      gradYear: '2025',
      major: { value: 'computer-science', label: 'Computer Science' },
      minor: null,
      interests: ['AI / ML', 'UX / Design Thinking', 'GenAI'],
      classes: ['CS106A', 'CS107', 'CS110'],
      helpType: ['Debugging', 'Concept explanation'],
      connectionType: 'Virtual and In-Person',
      workStyle: ['Visual learner', 'Deep dives into concepts'],
      bio: 'CS major looking for study partners for algorithm courses',
      onboardingComplete: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Merge default data with custom data
    const userData = {
      ...defaultUserData,
      ...customData,
      uid
    };
    
    // Save to Firestore
    const userRef = doc(db, 'users', uid);
    await setDoc(userRef, userData, { merge: true });
    
    return { success: true, data: userData };
  } catch (error) {
    console.error('Error creating sample user:', error);
    return { success: false, error };
  }
};

/**
 * Create multiple sample users for testing the matching system
 * @param {number} count - Number of sample users to create
 * @returns {Promise<Array>} - Array of created users
 */
export const createSampleUsers = async (count = 5) => {
  try {
    const majors = [
      { value: 'computer-science', label: 'Computer Science' },
      { value: 'psychology', label: 'Psychology' },
      { value: 'biology', label: 'Biology' },
      { value: 'economics', label: 'Economics' },
      { value: 'english', label: 'English' }
    ];
    
    const interests = [
      'AI / ML', 'UX / Design Thinking', 'Health Tech', 'Startups / VC',
      'Finance / Quant', 'Sustainability', 'Pre-Law', 'Pre-Med',
      'Social Impact / Ethics', 'Research', 'Journalism', 'Studio Art'
    ];
    
    const classes = [
      'CS106A', 'CS107', 'CS110', 'CS161', 'CS229', 'CS230', 'CS231N',
      'PSYCH 1', 'ECON 1', 'BIO 41', 'MATH 51', 'PHIL 1', 'ENGLISH 9'
    ];
    
    const workStyles = [
      'Visual learner', 'Deep dives into concepts', 'Practice problems',
      'Group study', 'Solo learning', 'Pomodoro technique', 'Long sessions'
    ];
    
    const usersCollection = collection(db, 'users');
    const createdUsers = [];
    
    for (let i = 0; i < count; i++) {
      // Generate random user data
      const randomMajor = majors[Math.floor(Math.random() * majors.length)];
      
      // Select 2-4 random interests
      const randomInterests = [];
      const interestCount = Math.floor(Math.random() * 3) + 2; // 2-4 interests
      for (let j = 0; j < interestCount; j++) {
        const interest = interests[Math.floor(Math.random() * interests.length)];
        if (!randomInterests.includes(interest)) {
          randomInterests.push(interest);
        }
      }
      
      // Select 1-3 random classes
      const randomClasses = [];
      const classCount = Math.floor(Math.random() * 3) + 1; // 1-3 classes
      for (let j = 0; j < classCount; j++) {
        const cls = classes[Math.floor(Math.random() * classes.length)];
        if (!randomClasses.includes(cls)) {
          randomClasses.push(cls);
        }
      }
      
      // Select 1-2 random work styles
      const randomWorkStyles = [];
      const workStyleCount = Math.floor(Math.random() * 2) + 1; // 1-2 work styles
      for (let j = 0; j < workStyleCount; j++) {
        const style = workStyles[Math.floor(Math.random() * workStyles.length)];
        if (!randomWorkStyles.includes(style)) {
          randomWorkStyles.push(style);
        }
      }
      
      const userData = {
        name: `Test User ${i + 1}`,
        gender: ['Male', 'Female', 'Non-binary', 'Other'][Math.floor(Math.random() * 4)],
        gradYear: `202${Math.floor(Math.random() * 5) + 3}`, // 2023-2027
        major: randomMajor,
        minor: Math.random() > 0.7 ? majors[Math.floor(Math.random() * majors.length)] : null,
        interests: randomInterests,
        classes: randomClasses,
        helpType: Math.random() > 0.5 ? ['Debugging', 'Concept explanation'] : ['Concept explanation', 'Study sessions'],
        connectionType: Math.random() > 0.5 ? 'Virtual and In-Person' : 'Virtual Only',
        workStyle: randomWorkStyles,
        bio: `I'm a ${randomMajor.label} student looking for study buddies for ${randomClasses.join(', ')}.`,
        onboardingComplete: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Add to Firestore
      const docRef = await addDoc(usersCollection, userData);
      createdUsers.push({ id: docRef.id, ...userData });
    }
    
    return { success: true, users: createdUsers };
  } catch (error) {
    console.error('Error creating sample users:', error);
    return { success: false, error };
  }
};

/**
 * List all users in the database
 * @param {number} limitCount - Maximum number of users to retrieve
 * @returns {Promise<Array>} - Array of users
 */
export const listAllUsers = async (limitCount = 50) => {
  try {
    const usersCollection = collection(db, 'users');
    const q = query(
      usersCollection,
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    const users = [];
    
    querySnapshot.forEach((doc) => {
      users.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return { success: true, users };
  } catch (error) {
    console.error('Error listing users:', error);
    return { success: false, error };
  }
};

/**
 * Delete a user from Firestore
 * @param {string} userId - ID of the user to delete
 * @returns {Promise<Object>} - Result of the operation
 */
export const deleteUser = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    
    // Check if user exists
    const docSnap = await getDoc(userRef);
    if (!docSnap.exists()) {
      return { success: false, error: 'User not found' };
    }
    
    // Delete user document
    await deleteDoc(userRef);
    
    // Try to delete profile photo if it exists
    try {
      const photoRef = ref(storage, `profile_photos/${userId}`);
      await deleteObject(photoRef);
    } catch (storageError) {
      console.log('No profile photo found or error deleting it:', storageError);
      // Continue even if photo deletion fails
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting user:', error);
    return { success: false, error };
  }
};

/**
 * Clear all sample users (use with caution for testing only)
 * @returns {Promise<Object>} - Result of the operation
 */
export const clearSampleUsers = async () => {
  try {
    // Query for test users (those with name starting with 'Test User')
    const usersCollection = collection(db, 'users');
    const q = query(
      usersCollection,
      where('name', '>=', 'Test User'),
      where('name', '<=', 'Test User\uf8ff') // Unicode range query
    );
    
    const querySnapshot = await getDocs(q);
    const deletePromises = [];
    
    querySnapshot.forEach((doc) => {
      deletePromises.push(deleteDoc(doc.ref));
    });
    
    await Promise.all(deletePromises);
    
    return { 
      success: true, 
      deletedCount: deletePromises.length 
    };
  } catch (error) {
    console.error('Error clearing sample users:', error);
    return { success: false, error };
  }
};

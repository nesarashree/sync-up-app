import { collection, doc, setDoc, getDocs, query, where, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';

// Convert hardcoded profiles to the Firebase format
const formatProfileForFirebase = (profile) => {
  // Extract major and minor from the combined string
  const majorMinorParts = profile.majorMinor.split('&').map(part => part.trim());
  const major = majorMinorParts[0];
  const minor = majorMinorParts.length > 1 ? majorMinorParts[1] : '';
  
  // Parse classYear to just the year (remove "Class of ")
  const gradYear = profile.classYear?.replace('Class of ', '') || '';
  
  // Parse classes into an array if it's a string
  const classes = typeof profile.classes === 'string' 
    ? profile.classes.split(',').map(c => c.trim())
    : profile.classes || [];
    
  // Create a stable ID for the profile based on name
  // This ensures we always have the same ID for the same profile
  const stableId = `profile_${profile.name.toLowerCase().replace(/\s+/g, '_')}`;
  
  return {
    id: stableId,
    profileType: 'hardcoded', // Mark these as hardcoded profiles
    name: profile.name,
    major: major,
    minor: minor,
    majorMinor: profile.majorMinor, // Keep the original for compatibility
    gradYear: gradYear,
    classYear: profile.classYear, // Keep the original for compatibility
    bio: profile.bio || '',
    classes: classes,
    interests: profile.interests || [],
    gender: profile.gender || '',
    connectionType: profile.connectionType || 'Study partner',
    workStyle: profile.workStyle || ['Collaborative work-spaces'],
    helpType: profile.helpType || ['Study partner'],
    photoURL: profile.image || '',
    imageSource: 'hardcoded', // To indicate where the image comes from
    onboardingComplete: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };
};

// Migrate a collection of profiles to Firebase
export const migrateProfilesToFirebase = async (profiles) => {
  const results = { success: [], failed: [] };
  
  if (!profiles || profiles.length === 0) {
    return { success: false, error: 'No profiles provided' };
  }
  
  console.log(`Starting migration of ${profiles.length} profiles to Firebase...`);
  
  try {
    for (const profile of profiles) {
      try {
        const formattedProfile = formatProfileForFirebase(profile);
        const profileId = formattedProfile.id;
                
        // Check if profile already exists
        const existingProfileQuery = query(
          collection(db, 'profiles'),
          where('id', '==', profileId)
        );
        const existingSnapshot = await getDocs(existingProfileQuery);
        
        if (!existingSnapshot.empty) {
          console.log(`Profile ${profile.name} already exists, skipping`);
          results.success.push({ id: profileId, name: profile.name, status: 'skipped' });
          continue;
        }
        
        // Save to Firestore
        const profileRef = doc(db, 'profiles', profileId);
        await setDoc(profileRef, formattedProfile);
        
        console.log(`Successfully migrated profile for ${profile.name}`);
        results.success.push({ id: profileId, name: profile.name, status: 'migrated' });
      } catch (error) {
        console.error(`Failed to migrate profile for ${profile.name}:`, error);
        results.failed.push({ name: profile.name, error: error.message });
      }
    }
    
    return { 
      success: results.failed.length === 0, 
      migrated: results.success.length,
      skipped: results.success.filter(r => r.status === 'skipped').length,
      failed: results.failed.length,
      results
    };
  } catch (error) {
    console.error('Error in profile migration:', error);
    return { success: false, error: error.message };
  }
};

// Check if profiles have been migrated
export const checkProfilesMigrated = async () => {
  try {
    const profilesQuery = query(
      collection(db, 'profiles'),
      where('profileType', '==', 'hardcoded')
    );
    
    const snapshot = await getDocs(profilesQuery);
    return {
      migrated: !snapshot.empty,
      count: snapshot.size
    };
  } catch (error) {
    console.error('Error checking migrated profiles:', error);
    return { migrated: false, error: error.message };
  }
};

// Get all profiles from Firebase
export const getAllProfilesFromFirebase = async () => {
  try {
    const profilesQuery = query(collection(db, 'profiles'));
    const snapshot = await getDocs(profilesQuery);
    
    const profiles = snapshot.docs.map(doc => {
      const data = doc.data();
      // Format for UI consistency
      return {
        id: doc.id,
        name: data.name,
        image: data.photoURL,
        majorMinor: data.majorMinor || `${data.major}${data.minor ? ' & ' + data.minor : ''}`,
        classYear: data.classYear || `Class of ${data.gradYear}`,
        bio: data.bio || '',
        classes: Array.isArray(data.classes) ? data.classes.join(', ') : data.classes || '',
        interests: data.interests || [],
        // Include all other fields
        ...data
      };
    });
    
    console.log(`Retrieved ${profiles.length} profiles from Firebase`);
    return { success: true, profiles };
  } catch (error) {
    console.error('Error getting profiles from Firebase:', error);
    return { success: false, error: error.message };
  }
};

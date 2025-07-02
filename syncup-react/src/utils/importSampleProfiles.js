import { collection, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { auth, db, storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Import the sample profile images
import profile1 from '../assets/Nesara.jpeg';
import profile2 from '../assets/Mahathi.jpeg';
import profile3 from '../assets/Kevin.jpeg';
import profile4 from '../assets/Luke.jpeg';

// Skip image upload for now due to CORS issues with local development
const mockPhotoURLs = {
  'Nesara': 'https://i.imgur.com/1bZiRZL.jpg',
  'Kevin': 'https://i.imgur.com/rVl2TyG.jpg',
  'Luke': 'https://i.imgur.com/QNPhbQZ.jpg',
  'Mahathi': 'https://i.imgur.com/9nFPlZU.jpg'
};

// Mock image upload that returns a placeholder URL
const uploadProfileImage = async (imageUrl, userId, userName) => {
  try {
    console.log(`Simulating photo upload for ${userName} (CORS issue workaround)`);
    // Return a mock image URL instead of trying to upload
    // In a production environment, you would upload the actual file
    return mockPhotoURLs[userName] || 'https://i.imgur.com/JWzFXby.jpg';
  } catch (error) {
    console.error('Error with mock image URL:', error);
    return 'https://i.imgur.com/JWzFXby.jpg'; // Default fallback
  }
};

// Sample profiles data
const sampleProfiles = [
  {
    name: 'Nesara',
    image: profile1,
    majorMinor: 'Biomedical Computation & French',
    gradYear: '2028',
    bio: `Freshman struggling to survive O-Chem and CS 106B with Keith. Looking for a committed chemistry (or pre-med?) study-buddy to meet...`,
    classes: ['CS 278', 'CHEM 33'],
    interests: ['Startups / VC', 'Pre-Med', 'French', 'Social Entrepreneurship'],
    gender: 'Female',
    connectionType: 'Long-term partnership',
    workStyle: ['Silence', 'Collaborative work-spaces'],
    helpType: ['Homework help'],
    onboardingComplete: true
  },
  {
    name: 'Kevin',
    image: profile3,
    majorMinor: 'Human–Computer Interaction',
    gradYear: '2025',
    bio: `Usually camped at Green with headphones on. Open to anything from grind-mode to chatty review. If we match...`,
    classes: ['CS 278', 'CS 377U', 'PSYC 135'],
    interests: ['Economics', 'HCI', 'AI / ML', 'Education'],
    gender: 'Male',
    connectionType: 'Open to both!',
    workStyle: ['Noise', 'Collaborative work-spaces'],
    helpType: ['Study partner'],
    onboardingComplete: true
  },
  {
    name: 'Luke',
    image: profile4,
    majorMinor: 'MS&E and CS',
    gradYear: '2026',
    bio: `Junior trying to get through the MS&E core and survive CS 221. Looking for a committed study-buddy to hold me accountable.`,
    classes: ['CS 221', 'MS&E 140', 'CS 152'],
    interests: ['Economics', 'AI', 'Pre-Finance', 'Entrepreneurship'],
    gender: 'Male',
    connectionType: 'Long-term partnership',
    workStyle: ['Silence'],
    helpType: ['Study partner', 'Accountability partner'],
    onboardingComplete: true
  },
  {
    name: 'Mahathi',
    image: profile2,
    majorMinor: 'Computer Science & Sustainability',
    gradYear: '2025',
    bio: `Looking for a consistent buddy to meet weekly — same classes = bonus. I'm in HumBio + Psych, mostly reading-heavy stuff, but I make it fun :)`,
    classes: ['CS 278', 'CS 103', 'CS 111'],
    interests: ['Neuroscience', 'Pre-Med', 'Social Psychology', 'Psychology'],
    gender: 'Female',
    connectionType: 'Long-term partnership',
    workStyle: ['Collaborative work-spaces', 'Noise'],
    helpType: ['Study partner'],
    onboardingComplete: true
  }
];

// Function to import sample profiles to Firestore
export const importSampleProfiles = async () => {
  try {
    if (!auth.currentUser) {
      console.error('Please sign in first to import sample profiles');
      return { success: false, error: 'Authentication required' };
    }

    const results = [];

    for (const profile of sampleProfiles) {
      try {
        // Parse major/minor from combined field
        const majorMinorParts = profile.majorMinor.split('&').map(part => part.trim());
        const major = majorMinorParts[0];
        const minor = majorMinorParts.length > 1 ? majorMinorParts[1] : '';
        
        // Format the data for Firestore
        const profileData = {
          name: profile.name,
          major: major,
          minor: minor,
          gradYear: profile.gradYear,
          bio: profile.bio,
          classes: profile.classes,
          interests: profile.interests,
          gender: profile.gender,
          connectionType: profile.connectionType,
          workStyle: profile.workStyle,
          helpType: profile.helpType,
          onboardingComplete: true,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        
        // Add the document to get an ID first
        const docRef = await addDoc(collection(db, 'users'), profileData);
        
        // Use mock images instead of actually uploading to avoid CORS issues
        const photoURL = await uploadProfileImage(null, docRef.id, profile.name);
        if (photoURL) {
          // Update the document with the photo URL
          const userDocRef = doc(db, 'users', docRef.id);
          await updateDoc(userDocRef, { photoURL });
          profileData.photoURL = photoURL;
        }
        
        results.push({
          success: true,
          id: docRef.id,
          name: profile.name
        });
        
        console.log(`Successfully imported profile for ${profile.name}`);
      } catch (error) {
        console.error(`Error importing profile for ${profile.name}:`, error);
        results.push({
          success: false,
          name: profile.name,
          error: error.message
        });
      }
    }

    return {
      success: true,
      results
    };
  } catch (error) {
    console.error('Error importing sample profiles:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export default importSampleProfiles;

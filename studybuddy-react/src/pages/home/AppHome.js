import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import TinderCard from 'react-tinder-card';
import '../../styles/AppHome.css';

import logo from '../../assets/logo.png';
import { db, auth } from '../../firebase';
import { signOut } from 'firebase/auth';
import { collection, query, where, getDocs, doc, setDoc, serverTimestamp, addDoc, orderBy, writeBatch, getDoc } from 'firebase/firestore';

// Import profile migration utilities
import { migrateProfilesToFirebase, getAllProfilesFromFirebase, checkProfilesMigrated } from '../../utils/profileMigration';



// Current user (demo)
const kevinProfile = {
  name: 'Kevin',
  image: require('../../assets/Kevin.jpeg'),
  majorMinor: 'Computer Science',
  classYear: 'Class of 2025',
  bio: `Usually camped at Green with headphones on. Open to anything from grind-mode to chatty review!`,
  classes: 'CS 278, CS 377U, PSYC 135',
  interests: ['AI / ML', 'UX / Design Thinking', 'Startups / VC']
};

// Master list of profiles (other users)
const allProfiles = [
  {
    name: 'Nesara',
    image: require('../../assets/Nesara.jpeg'),
    majorMinor: 'Biomedical Computation & French',
    classYear: 'Class of 2028',
    bio: `Freshman struggling to survive O-Chem and CS 106B with Keith. Looking for a committed chemistry (or pre-med?) study-buddy to meet...`,
    classes: 'CS 278, CHEM 33',
    interests: ['Startups / VC', 'Pre-Med', 'French', 'Social Entrepreneurship']
  },
  {
    name: 'Luke',
    image: require('../../assets/Luke.jpeg'),
    majorMinor: 'MS&E and CS',
    classYear: 'Class of 2026',
    bio: `Junior trying to get through the MS&E core and survive CS 221. Looking for a committed study-buddy to hold me accountable.`,
    classes: 'CS 221, MS&E 140, CS 152',
    interests: ['Economics', 'AI', 'Pre-Finance', 'Entrepreneurship']
  },
  {
    name: 'Mahathi',
    image: require('../../assets/Mahathi.jpeg'),
    majorMinor: 'Computer Science & Sustainability',
    classYear: 'Class of 2025',
    bio: `Looking for a consistent buddy to meet weekly — same classes = bonus. I'm in HumBio + Psych, mostly reading-heavy stuff, but I make it fun :)`,
    classes: 'CS 278, CS 103, CS 111',
    interests: ['Neuroscience', 'Pre-Med', 'Social Psychology', 'Psychology']
  },
  {
    name: 'Anya Bulchandani',
    image: require('../../assets/Anya Bulchandani.jpeg'),
    majorMinor: 'Data Science & Mathematics',
    classYear: 'Class of 2027',
    bio: `Math-turned-data science major. Down to co-work quietly (even if we're doing different subjects) or walk through psets out loud. Preferably someone also in DS 112 or math 158`,
    classes: 'MATH 158, DATASCI 112',
    interests: ['UX / Design Thinking', 'Finance / Quant', 'Research', 'Mathematics']
  },
  {
    name: 'Susie Guo',
    image: require('../../assets/Susie Guo.jpeg'),
    majorMinor: 'Symbolic Systems & Computer Science',
    classYear: 'Class of 2027',
    bio: `Hey! I'm a SymSys major taking 106B, Phil80, Psych 1, and English 66 this quarter (CS+humanities). I study best with my friends, where we can mix silent lock-in times with some conversation. Feel free to reach out!`,
    classes: 'CS 106B, PSYCH 1, PHIL 80',
    interests: ['AI / ML', 'Startups / VC', 'Social Impact / Ethics', 'Computer Science']
  },
  {
    name: 'Anura Bracey',
    image: require('../../assets/Anura Bracey.jpg'),
    majorMinor: 'Linguistics & Public Policy',
    classYear: 'Class of 2028',
    bio: `I have to take Math 20 this quarter to fulfill a pubpol requirement and I'm suffering as a humanities student lol. Down to collab on psets and study for the final this week`,
    classes: 'MATH 20',
    interests: ['Pre-Law', 'Social Impact / Ethics', 'Humanities', 'Foreign languages']
  },
  {
    name: 'Sid Suresh',
    image: require('../../assets/Sid Suresh.JPG'),
    majorMinor: 'Computer Science & Econ',
    classYear: 'Class of 2028',
    bio: `Taking math 51 this quarter and interested in finding a study buddy to prep for the final. Love working in CODA/Green library basement!`,
    classes: 'MATH 51',
    interests: ['AI / ML', 'Social Impact / Ethics', 'Mathematics', 'Computer Science']
  },
  {
    name: 'Disha C',
    image: require('../../assets/Disha C.jpeg'),
    majorMinor: 'Undeclared',
    classYear: 'Class of 2028',
    bio: `Hi! I'm Disha. I love to write—anything from scripts to short-stories—and would love to get feedback on some of my work. I'm also in CS 106B this quarter and am looking for a study group. Don't hesitate to reach out (about either)! :)`,
    classes: 'CS 106B, ENGLISH 161',
    interests: ['Social Impact / Ethics', 'Humanities', 'Computer Science', 'Data Science']
  },
  {
    name: 'Piper Diehn',
    image: require('../../assets/Piper Diehn.png'),
    majorMinor: 'Humbio',
    classYear: 'Class of 2028',
    bio: `I'm a humbio major interested in pre-med/pre-dental. Currently taking math 21 and orgo—brutal combination for the Spring. I usually lock in at Green library on my own while listening to music, so I'm just looking for an accountability buddy/pset partner!`,
    classes: 'MATH 21, CHEM 33',
    interests: ['Health Tech', 'Pre-Med', 'Journalism', 'Computer Science']
  },
  {
    name: 'Dalia Ovadia',
    image: require('../../assets/Dalia Ovadia.webp'),
    majorMinor: 'EE & Computer Science',
    classYear: 'Class of 2028',
    bio: `I'm considering EE as a potential major but also interested in CS and math. If anyone wants to study for the 51 final lmk!!`,
    classes: 'MATH 51, ENGR 21',
    interests: ['AI / ML', 'Research', 'Robotics', 'Computer Science']
  },
  {
    name: 'Jasper Karlson',
    image: require('../../assets/Jasper Karlson.png'),
    majorMinor: 'Mathematics',
    classYear: 'Class of 2028',
    bio: `Math major and dancer! Taking 53 right now (but down to help with any other classes in the 50 series) and CS 106B`,
    classes: 'CS 106B, MATH 53',
    interests: ['AI / ML', 'Studio Art', 'Mathematics', 'Computer Science']
  },
  {
    name: 'Mahi Jarwala',
    image: require('../../assets/Mahi Jarwala.jpeg'),
    majorMinor: 'Computer Science',
    classYear: 'Class of 2028',
    bio: `in cs 106B and math 21 this quarter`,
    classes: 'CS 106B, MATH 21',
    interests: ['AI / ML', 'Startups / VC', 'Research', 'Computer Science']
  },
  {
    name: 'Rohan Karunaratne',
    image: require('../../assets/rohan karunaratne.png'),
    majorMinor: 'EE',
    classYear: 'Class of 2026',
    bio: `EE Major here for the vibes`,
    classes: 'EE42, EE65, MSE140, EE259, FRENCH 3',
    interests: ['Startups / VC', 'Finance / Quant', 'Pre-Law', 'Robotics']
  },
  {
    name: 'Sophia Browder',
    image: require('../../assets/Sophia Browder.jpeg'),
    majorMinor: 'EE',
    classYear: 'Class of 2028',
    bio: `Interested in health startups and precision medicine. In math 51 and starting to study for the final!`,
    classes: 'MATH 51',
    interests: ['AI / ML', 'Health Tech', 'Startups / VC', 'Computer Science']
  },
  {
    name: 'Amari Porter',
    image: require('../../assets/Amari Porter.jpeg'),
    majorMinor: 'Symbolic Systems & Computer Science',
    classYear: 'Class of 2027',
    bio: `Hi! I am majoring in Symbolic Systems with a concentration in Human-Centered Artificial Intelligence. Open to meeting and working with new people!`,
    classes: 'CS 106B, CS 103, PSYCH 1',
    interests: ['AI / ML', 'Social Impact / Ethics', 'Research', 'Computer Science']
  },
  {
    name: 'Luc Giraud',
    image: require('../../assets/Luc Giraud .jpeg'),
    majorMinor: 'International Relations',
    classYear: 'Class of 2024',
    bio: `Hi, I'm Luc and I'm studying economics and energy within IR.`,
    classes: 'PSYCH 70',
    interests: ['AI / ML', 'Startups / VC', 'Sustainability', 'Social Entrepreneurship']
  },
  {
    name: 'Ben O\'Keefe',
    image: require('../../assets/Ben OKeefe.jpeg'),
    majorMinor: 'Computer Science',
    classYear: 'Class of 2026',
    bio: `CS Major trying to get through the quarter. Typically study in quiet locations with earbuds. Happy to review notes and quiz for exams.`,
    classes: 'CS 166, CS 323, CS 199, CS 155, HISTORY 111B',
    interests: ['AI / ML', 'Startups / VC', 'GenAI', 'Computer Science']
  },
  {
    name: 'Megan Chiang',
    image: require('../../assets/Megan Chiang.jpg'),
    majorMinor: 'Computer Science',
    classYear: 'Class of 2027',
    bio: `Pre-med CS major hoping to work on psets with each other together`,
    classes: 'STATS 202, CHEM 143, BIO 86, NBIO 101',
    interests: ['Health Tech', 'Pre-Med', 'Research', 'Neuroscience']
  },
  {
    name: 'Hannah',
    image: require('../../assets/Hannah.png'),
    majorMinor: 'Symsys',
    classYear: 'Class of 2028',
    bio: `Still exploring, open to anything!`,
    classes: 'CS106B, COLLEGE 113, PSYCH1, PHIL2, GOLF(advanced)',
    interests: ['UX / Design Thinking', 'Startups / VC', 'Finance / Quant', 'Sustainability']
  }
];

// Shuffle function to randomize profiles and assign unique IDs
function shuffle(array) {
  // First assign IDs if they don't exist
  const arrayWithIds = array.map(profile => {
    if (!profile.id) {
      return { ...profile, id: `profile-${profile.name.toLowerCase().replace(/\s+/g, '-')}-${Math.random().toString(36).substring(2, 10)}` };
    }
    return profile;
  });
  
  // Then shuffle the array
  const newArray = [...arrayWithIds];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

function AppHome() {
  const [showSafetyModal, setShowSafetyModal] = useState(false);

  const navigate = useNavigate();
  
  // Set Kevin as the current user profile with ability to update
  const [currentUserProfile, setCurrentUserProfile] = useState(kevinProfile);
  const [isEditing, setIsEditing] = useState(false);
  
  // Temporary form values during editing
  const [editFormValues, setEditFormValues] = useState({
    bio: currentUserProfile.bio,
    classes: currentUserProfile.classes,
    interests: currentUserProfile.interests.join(', ')
  });
  
  // Use Firebase to get profiles instead of hardcoded ones
  const [profileDeck, setProfileDeck] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lastDirection, setLastDirection] = useState();
  const [loading, setLoading] = useState(true); // Start with loading state
  const [migrationStatus, setMigrationStatus] = useState({ status: 'pending', message: null });
  
  // Track who was swiped left/right
  const [rightSwipes, setRightSwipes] = useState([]);
  const [leftSwipes, setLeftSwipes] = useState([]);
  
  // Show instructional overlay at first
  const [showInstructions, setShowInstructions] = useState(true);
  
  // Active tab state (swipe or messages)
  const [activeTab, setActiveTab] = useState('swipe');
  
  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    // Reset current chat when switching away from messages
    if (tab !== 'messages') {
      setCurrentChat(null);
    }
  };
  
  // Messages state
  const [messages, setMessages] = useState({});
  const [currentChat, setCurrentChat] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [messagesLoaded, setMessagesLoaded] = useState(false); // Track if messages have been loaded
  
  // Demo preprogrammed responses with sequence tracking
  const [responseIndex, setResponseIndex] = useState({});
  const automatedResponses = [
    "Nice to meet you too!",
    "I'm free to study from 3:00 to 4:00pm!",
    "How about Coda?"
  ];

  // Computed property to check if we've seen all prçofiles
  const allProfilesSeen = currentIndex >= profileDeck.length;

  // Handle card swiping with proper state management
  const swiped = async (direction, nameToDelete, index) => {
    console.log(`Swiped ${direction} on ${nameToDelete}`);
    setLastDirection(direction);
    
    // Get the actual profile that was swiped by its index in the deck
    const actualIndex = currentIndex + (index - currentIndex);
    const swipedProfile = profileDeck[actualIndex];
    
    console.log('Swiped profile:', swipedProfile);
    
    // Update state based on swipe direction
    if (direction === 'right') {
      // Make sure we don't add duplicates
      setRightSwipes(prev => {
        // Check if this profile is already in the rightSwipes array
        const isDuplicate = prev.some(p => p.id === swipedProfile.id);
        if (isDuplicate) {
          console.log('Profile already in right swipes:', swipedProfile.name);
          return prev;
        }
        return [...prev, swipedProfile];
      });
      console.log('Right swiped (liked):', swipedProfile.name);
    } else {
      // Make sure we don't add duplicates
      setLeftSwipes(prev => {
        // Check if this profile is already in the leftSwipes array
        const isDuplicate = prev.some(p => p.id === swipedProfile.id);
        if (isDuplicate) {
          console.log('Profile already in left swipes:', swipedProfile.name);
          return prev;
        }
        return [...prev, swipedProfile];
      });
      console.log('Left swiped (passed):', swipedProfile.name);
    }
    
    // Persist swipe to Firestore if user is authenticated
    try {
      if (auth.currentUser) {
        const isLiked = direction === 'right';
        const swipeId = `${auth.currentUser.uid}_${swipedProfile.id}`;
        
        // Store additional profile information for better retrieval
        await setDoc(doc(db, 'swipes', swipeId), {
          userId: auth.currentUser.uid,
          profileId: swipedProfile.id,
          profileName: swipedProfile.name,
          majorMinor: swipedProfile.majorMinor,
          classYear: swipedProfile.classYear,
          image: swipedProfile.image,
          liked: isLiked,
          timestamp: serverTimestamp()
        });
        
        // Double-check storage by immediately reading it back
        const swipeRef = doc(db, 'swipes', swipeId);
        console.log(`🔄 Saved swipe to Firebase with ID ${swipeId}:`, swipedProfile.name, isLiked ? '❤️ liked' : '👎 passed');
      } else {
        console.warn('⚠️ Cannot save swipe - user not authenticated');
      }
    } catch (error) {
      console.error('Error saving swipe to Firebase:', error);
    }
    
    // Hide instructions after first swipe
    if (showInstructions) {
      setShowInstructions(false);
    }
    
    // Move to the next card with a slight delay for animation
    setTimeout(() => {
      setCurrentIndex(prevIndex => prevIndex + 1);
    }, 300);
  }

  // Handle when card leaves screen (optional, for additional effects)
  const outOfFrame = (name) => {
    console.log(`${name} left the screen!`);
  }

  // Get only the profiles we need to render (current and a few ahead)
  const activeProfiles = profileDeck.slice(currentIndex, currentIndex + 5);

  // Reset function with loading state to avoid UI glitches
  const resetProfiles = async () => {
    // Set loading state to prevent UI flicker
    setLoading(true);
    
    try {
      // Fetch profiles from Firebase
      const result = await getAllProfilesFromFirebase();
      
      if (result.success) {
        // Generate a completely new shuffled deck
        setProfileDeck(shuffle(result.profiles));
        // Reset the index
        setCurrentIndex(0);
        // Clear the last direction
        setLastDirection(undefined);
        // Show instructions again
        setShowInstructions(true);
        console.log('Reshuffled and reset all profiles from Firebase');
      } else {
        console.error('Failed to reset profiles:', result.error);
      }
    } catch (error) {
      console.error('Error resetting profiles:', error);
    } finally {
      // End loading state
      setLoading(false);
    }
  };
  
  // Migrate hardcoded profiles to Firebase if needed
  const migrateProfiles = async () => {
    try {
      setMigrationStatus({ status: 'migrating', message: 'Migrating profiles to Firebase...' });
      
      // Check if profiles have already been migrated
      const checkResult = await checkProfilesMigrated();
      
      if (checkResult.migrated) {
        console.log(`Found ${checkResult.count} already migrated profiles, skipping migration`);
        setMigrationStatus({ status: 'completed', message: `Found ${checkResult.count} already migrated profiles` });
        return true;
      }
      
      // If not migrated, perform migration
      const result = await migrateProfilesToFirebase(allProfiles);
      
      if (result.success) {
        console.log(`Successfully migrated ${result.migrated} profiles to Firebase`);
        setMigrationStatus({ 
          status: 'completed', 
          message: `Successfully migrated ${result.migrated} profiles to Firebase` 
        });
        return true;
      } else {
        console.error('Failed to migrate profiles:', result.error);
        setMigrationStatus({ 
          status: 'failed', 
          message: `Failed to migrate profiles: ${result.error}` 
        });
        return false;
      }
    } catch (error) {
      console.error('Error migrating profiles:', error);
      setMigrationStatus({ 
        status: 'failed', 
        message: `Error migrating profiles: ${error.message}` 
      });
      return false;
    }
  };
  
  // Load profiles from Firebase when component mounts
  useEffect(() => {
    const loadProfiles = async () => {
      setLoading(true);
      
      try {
        // First, ensure profiles are migrated
        await migrateProfiles();
        
        // Then load profiles from Firebase
        const result = await getAllProfilesFromFirebase();
        
        if (result.success && result.profiles.length > 0) {
          setProfileDeck(shuffle(result.profiles));
          console.log(`Loaded ${result.profiles.length} profiles from Firebase`);
        } else {
          console.warn('No profiles found in Firebase, falling back to hardcoded profiles');
          // Fallback to hardcoded profiles in case of error
          setProfileDeck(shuffle(allProfiles));
        }
      } catch (error) {
        console.error('Error loading profiles:', error);
        // Fallback to hardcoded profiles in case of error
        setProfileDeck(shuffle(allProfiles));
      } finally {
        setLoading(false);
      }
    };
    
    loadProfiles();
  }, []);

  // Load swipe history from Firebase when component mounts or auth state changes
  useEffect(() => {
    const loadSwipeHistory = async () => {
      try {
        console.log('Checking auth state for loading swipes:', auth.currentUser ? 'User is signed in' : 'User is not signed in');
        if (auth.currentUser) {
          // Query for right swipes
          const rightSwipesQuery = query(
            collection(db, 'swipes'),
            where('userId', '==', auth.currentUser.uid),
            where('liked', '==', true)
          );
          
          const rightSwipesSnapshot = await getDocs(rightSwipesQuery);
          const loadedRightSwipes = [];
          
          // Extract profiles that were right-swiped
          rightSwipesSnapshot.forEach((doc) => {
            const data = doc.data();
            
            // Try to find matching profile in allProfiles
            const matchingProfile = allProfiles.find(p => p.id === data.profileId);
            
            if (matchingProfile) {
              console.log('✅ Found matching right-swiped profile in allProfiles:', matchingProfile.name);
              loadedRightSwipes.push(matchingProfile);
            } else if (data.profileId) {
              // If we can't find it in allProfiles, create a profile from Firebase data
              console.log('⚠️ Creating right-swiped profile from Firebase data:', data.profileName || data.profileId);
              
              const reconstructedProfile = {
                id: data.profileId,
                name: data.profileName || 'Unknown Match',
                image: data.image || 'https://via.placeholder.com/400',
                majorMinor: data.majorMinor || 'Unknown Major',
                classYear: data.classYear || 'Unknown Year',
                bio: 'Profile data reconstructed from swipe history',
                classes: 'Classes data not available',
                interests: ['Study Buddy']
              };
              
              loadedRightSwipes.push(reconstructedProfile);
            }
          });
          
          console.log(`📊 Loaded ${loadedRightSwipes.length} right swipes from Firebase`);
          
          // Query for left swipes
          const leftSwipesQuery = query(
            collection(db, 'swipes'),
            where('userId', '==', auth.currentUser.uid),
            where('liked', '==', false)
          );
          
          const leftSwipesSnapshot = await getDocs(leftSwipesQuery);
          const loadedLeftSwipes = [];
          
          // Extract profiles that were left-swiped
          leftSwipesSnapshot.forEach((doc) => {
            const data = doc.data();
            
            // Try to find matching profile in allProfiles
            const matchingProfile = allProfiles.find(p => p.id === data.profileId);
            
            if (matchingProfile) {
              console.log('✅ Found matching left-swiped profile in allProfiles:', matchingProfile.name);
              loadedLeftSwipes.push(matchingProfile);
            } else if (data.profileId) {
              // If we can't find it in allProfiles, create a profile from Firebase data
              console.log('⚠️ Creating left-swiped profile from Firebase data:', data.profileName || data.profileId);
              
              const reconstructedProfile = {
                id: data.profileId,
                name: data.profileName || 'Unknown Profile',
                image: data.image || 'https://via.placeholder.com/400',
                majorMinor: data.majorMinor || 'Unknown Major',
                classYear: data.classYear || 'Unknown Year',
                bio: 'Profile data reconstructed from swipe history',
                classes: 'Classes data not available',
                interests: ['Study Buddy']
              };
              
              loadedLeftSwipes.push(reconstructedProfile);
            }
          });
          
          console.log(`📊 Loaded ${loadedLeftSwipes.length} left swipes from Firebase`);
          
          // Update state with loaded swipes
          setRightSwipes(loadedRightSwipes);
          setLeftSwipes(loadedLeftSwipes);
          
          console.log(`✅ Swipe states updated: ${loadedRightSwipes.length} right swipes, ${loadedLeftSwipes.length} left swipes`);
        }
      } catch (error) {
        console.error('Error loading swipe history:', error);
      }
    };
    
    // Set up auth state listener
    const unsubscribe = auth.onAuthStateChanged(async user => {
      console.log('Auth state changed:', user ? 'User signed in' : 'User not signed in');
      if (user) {
        // Load swipe history
        loadSwipeHistory();
        
        // Migrate any old messages that don't have participants field
        await migrateMessages();
        
        // Then load all messages
        loadAllMessages();
      }
    });
    
    // Clean up listener on unmount
    return () => unsubscribe();
  }, []);
  
  // Function to clear swipe history and messages
  const clearSwipeHistory = async () => {
    // Clear local state
    setRightSwipes([]);
    setLeftSwipes([]);
    setMessages({});
    setMessagesLoaded(false);
    setCurrentChat(null);
    
    // Also delete from Firebase if user is authenticated
    try {
      if (auth.currentUser) {
        // Get all user's swipes
        const userSwipesQuery = query(
          collection(db, 'swipes'),
          where('userId', '==', auth.currentUser.uid)
        );
        
        const swipeSnapshot = await getDocs(userSwipesQuery);
        
        // Create a batch for efficient deletion
        const batch = writeBatch(db);
        
        swipeSnapshot.forEach((document) => {
          batch.delete(document.ref);
        });
        
        // Commit the batch
        await batch.commit();
        console.log('✓ Swipe history cleared from Firebase');
        
        // Also clear messages
        const messagesQuery = query(
          collection(db, 'messages'),
          where('participants', 'array-contains', auth.currentUser.uid)
        );
        
        const messagesSnapshot = await getDocs(messagesQuery);
        
        if (!messagesSnapshot.empty) {
          // Create another batch for message deletion
          const msgBatch = writeBatch(db);
          
          messagesSnapshot.forEach((document) => {
            msgBatch.delete(document.ref);
          });
          
          // Commit the batch
          await msgBatch.commit();
          console.log(`✓ Deleted ${messagesSnapshot.size} messages from Firebase`);
        }
      }
    } catch (error) {
      console.error('Error clearing history from Firebase:', error);
    }
    console.log('✓ Cleared all swipe and message history locally and in Firebase');
    
    // Reset the active tab to 'swipe'
    handleTabChange('swipe');
  };
  
  // Migration function to update existing messages to include participants field
  const migrateMessages = async () => {
    try {
      if (!auth.currentUser) return;
      
      console.log('Checking for messages that need migration...');
      
      // Find messages without participants field
      const oldMessagesQuery = query(
        collection(db, 'messages'),
        where('senderId', '==', auth.currentUser.uid)
      );
      
      const oldMessagesSnapshot = await getDocs(oldMessagesQuery);
      
      // If we found messages that need migration
      if (!oldMessagesSnapshot.empty) {
        console.log(`Found ${oldMessagesSnapshot.size} messages that might need migration`);
        
        // Create a batch update
        const batch = writeBatch(db);
        let updateCount = 0;
        
        oldMessagesSnapshot.forEach((document) => {
          const data = document.data();
          
          // Check if it needs migration (no participants field)
          if (!data.participants && data.senderId && data.receiverId) {
            batch.update(document.ref, {
              participants: [data.senderId, data.receiverId]
            });
            updateCount++;
          }
        });
        
        // If we have updates to make
        if (updateCount > 0) {
          await batch.commit();
          console.log(`✅ Successfully migrated ${updateCount} messages`);
        } else {
          console.log('No messages needed migration');
        }
      }
    } catch (error) {
      console.error('Error during message migration:', error);
    }
  };
  
  // Function to load all messages from Firebase
  const loadAllMessages = async () => {
    try {
      if (!auth.currentUser) {
        console.log('⚠️ Cannot load messages: User not authenticated');
        return;
      }

      console.log('🔄 Loading all messages from Firebase...');
      
      // Get the current user ID
      const currentUserId = auth.currentUser.uid;
      
      // Query for messages using participants field (most reliable method)
      const participantsQuery = query(
        collection(db, 'messages'),
        where('participants', 'array-contains', currentUserId)
      );
      
      // Execute query
      const messagesSnapshot = await getDocs(participantsQuery);
      
      console.log(`Found ${messagesSnapshot.size} messages for current user`);
      
      // Create a messages map to avoid duplicates (using document ID as key)
      const messagesMap = {};
      
      // Process messages
      messagesSnapshot.forEach((doc) => {
        const data = doc.data();
        
        // Skip messages without text
        if (!data.text) {
          console.warn('⚠️ Skipping message without text content:', doc.id);
          return;
        }
        
        // Store message data with all relevant information
        messagesMap[doc.id] = {
          id: doc.id,
          senderId: data.senderId,
          receiverId: data.receiverId,
          text: data.text,
          conversationId: data.conversationId,
          timestamp: data.timestamp?.toDate()?.toISOString() || data.clientTimestamp || new Date().toISOString(),
          profileInfo: data.profileInfo || null, // Profile info is now consistently stored
        };
      });
      
      console.log(`Processed ${Object.keys(messagesMap).length} unique messages`);
      
      // Group messages by conversation
      const messagesByConversation = {};
      
      // Process each message and organize by profile ID
      Object.values(messagesMap).forEach((messageData) => {
        // Find the other participant in the conversation
        const otherId = messageData.senderId === currentUserId ? messageData.receiverId : messageData.senderId;
        
        // Skip if missing critical data
        if (!otherId) {
          console.warn('⚠️ Skipping message with missing participant ID:', messageData);
          return;
        }
        
        // Use the profileInfo.id if available (most reliable), otherwise fall back to the otherId
        let chatId = messageData.profileInfo?.id || otherId;
        
        // For UI consistency, create an entry using the profile's Firebase ID
        if (!messagesByConversation[chatId]) {
          messagesByConversation[chatId] = [];
        }
        
        // Add formatted message to the conversation
        messagesByConversation[chatId].push({
          id: messageData.id,
          sender: messageData.senderId === currentUserId ? 'me' : 'other',
          text: messageData.text,
          timestamp: messageData.timestamp,
          profileInfo: messageData.profileInfo // Include profile info for UI
        });
      });
      
      // Sort messages by timestamp for each conversation
      Object.keys(messagesByConversation).forEach(chatId => {
        messagesByConversation[chatId].sort((a, b) => {
          return new Date(a.timestamp) - new Date(b.timestamp);
        });
      });
      
      // Update state with all loaded messages
      setMessages(messagesByConversation);
      setMessagesLoaded(true);
      console.log(`✅ Loaded messages for ${Object.keys(messagesByConversation).length} conversations`);
      
      // Debug output the first few messages of each conversation
      Object.entries(messagesByConversation).forEach(([chatId, msgs]) => {
        console.log(`Conversation with ${chatId}: ${msgs.length} messages`);
        if (msgs.length > 0) {
          console.log(`- First message: ${msgs[0].text.substring(0, 20)}... (from ${msgs[0].sender})`);
          if (msgs[0].profileInfo) {
            console.log(`  Profile info: ${msgs[0].profileInfo.name}`);
          }
        }
      });
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };
  
  // Function to send a message and trigger automated responses for demo purposes
  const sendMessage = async () => {
    if (!messageText.trim() || !currentChat) return;
    
    const trimmedMessage = messageText.trim();
    
    // Clear the input
    setMessageText('');
    
    // Generate a unique message ID
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    // Format the user message for display
    const newMessage = {
      id: messageId,
      sender: 'me',
      text: trimmedMessage,
      timestamp: new Date().toISOString()
    };
    
    // Add to messages state
    setMessages(prevMessages => {
      const chatId = currentChat.id;
      const chatMessages = prevMessages[chatId] || [];
      return {
        ...prevMessages,
        [chatId]: [...chatMessages, newMessage]
      };
    });
    
    // Get the next automated response index for this chat
    const chatId = currentChat.id;
    const currentResponseIdx = responseIndex[chatId] || 0;
    
    // Only if we have more automated responses available
    if (currentResponseIdx < automatedResponses.length) {
      // Schedule the automated response with a 3-second delay
      setTimeout(() => {
        const responseText = automatedResponses[currentResponseIdx];
        const responseId = `resp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        
        // Add the automated response to the chat
        const automatedResponse = {
          id: responseId,
          sender: 'other',
          text: responseText,
          timestamp: new Date().toISOString()
        };
        
        setMessages(prevMessages => {
          const chatMessages = prevMessages[chatId] || [];
          return {
            ...prevMessages,
            [chatId]: [...chatMessages, automatedResponse]
          };
        });
        
        // Update the response index for next time
        setResponseIndex(prev => ({
          ...prev,
          [chatId]: currentResponseIdx + 1
        }));
      }, 3000); // 3-second delay
    }
    
    try {
      // Save message to Firebase if user is authenticated
      if (auth.currentUser) {
        const userId = auth.currentUser.uid;
        
        // Use the profile's Firebase ID directly
        // The ID should already be in Firebase format
        const profileId = currentChat.id;
        
        console.log(`💬 Sending message to ${currentChat.name} with profileId: ${profileId}`);
        
        // Create a conversation ID that combines the real user ID with the profile ID
        const conversationId = `${userId}_${profileId}`;
        
        // Full profile information to store with the message
        const profileInfo = {
          id: profileId,
          name: currentChat.name,
          majorMinor: currentChat.majorMinor || '',
          classYear: currentChat.classYear || '',
          image: currentChat.photoURL || currentChat.image || ''
        };
        
        // Save message to Firestore
        const messageData = {
          senderId: userId,
          receiverId: profileId,
          senderName: 'Current User',
          receiverName: currentChat.name,
          text: trimmedMessage,
          conversationId: conversationId,
          participants: [userId, profileId],
          profileInfo: profileInfo, // Store profile info with the message
          read: false,
          timestamp: serverTimestamp(),
          clientTimestamp: new Date().toISOString(),
          messageId: messageId
        };
        
        console.log('Sending message data:', messageData);
        
        // Use doc reference with ID to better track message
        const messageRef = await addDoc(collection(db, 'messages'), messageData);
        console.log(`✅ Message saved to Firebase with ID: ${messageRef.id}`);
      } else {
        console.warn('⚠️ Failed to save message - user not authenticated');
      }
    } catch (error) {
      console.error('❌ Error saving message to Firebase:', error, error.stack);
      
      // Show error in UI but don't interrupt UX
      console.error('Failed to send message. Please try again.');
    }
  };
  
  
  // Function to start a new chat and load previous messages
  const startChat = async (profile) => {
    setCurrentChat(profile);
    
    try {
      // If we already have messages loaded, we don't need to query again
      if (messagesLoaded && messages[profile.id]) {
        console.log(`Using cached messages for chat with ${profile.name} (${messages[profile.id].length} messages)`);
        return;
      }
      
      // Initialize empty message array if none exists
      setMessages(prev => {
        if (!prev[profile.id]) {
          return {
            ...prev,
            [profile.id]: []
          };
        }
        return prev;
      });
      
      // Load messages from Firebase if user is authenticated
      if (auth.currentUser) {
        console.log(`Loading messages for chat with ${profile.name}...`);
        
        // Get the current user ID
        const userId = auth.currentUser.uid;
        
        // Use the profile's Firebase ID directly (no prefix needed now)
        const profileId = profile.id;
        
        console.log(`Using Firebase profile ID: ${profileId} for profile: ${profile.name}`);
        
        // Create a conversation ID using the profile's Firebase ID
        const conversationId = `${userId}_${profileId}`;
        
        console.log(`Conversation ID for chat with ${profile.name}: ${conversationId}`);
        
        // Find messages by participants array (most reliable)
        const participantsQuery = query(
          collection(db, 'messages'),
          where('participants', 'array-contains', userId)
        );
        
        const participantsSnapshot = await getDocs(participantsQuery);
        
        console.log(`Found ${participantsSnapshot.size} total messages for current user`);
        
        // Track processed messages to avoid duplicates
        const processedMessageIds = new Set();
        const loadedMessages = [];
        
        // Process messages for this specific chat
        participantsSnapshot.forEach(doc => {
          const data = doc.data();
          
          // Skip if already processed
          if (processedMessageIds.has(doc.id)) return;
          
          // Only include messages for this specific conversation
          // Check if the other participant is the profile we're looking for
          const otherParticipant = data.participants?.find(p => p !== userId);
          
          // Skip if not related to current profile
          if (otherParticipant !== profileId) return;
          
          // Skip if missing text
          if (!data.text) {
            console.warn(`Skipping message without text: ${doc.id}`);
            return;
          }
          
          processedMessageIds.add(doc.id);
          
          // Extract profile info if available
          const profileInfo = data.profileInfo || null;
          
          loadedMessages.push({
            id: doc.id,
            sender: data.senderId === userId ? 'me' : 'other',
            text: data.text,
            timestamp: data.timestamp?.toDate()?.toISOString() || 
                    data.clientTimestamp || 
                    new Date().toISOString(),
            profileInfo: profileInfo // Include profile info
          });
        });
        
        // Sort messages by timestamp
        loadedMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        
        // Update messages state with loaded messages
        if (loadedMessages.length > 0) {
          console.log(`✅ Loaded ${loadedMessages.length} messages for chat with ${profile.name}`);
          setMessages(prev => ({
            ...prev,
            [profile.id]: loadedMessages
          }));
        } else {
          console.log(`No existing messages found for chat with ${profile.name}`);
        }
      }
    } catch (error) {
      console.error('❌ Error loading messages for chat:', error);
    }
  };

  return (
    <div className="app-home">
      <div className="home-header">
        <img src={logo} alt="StudyBuddy Logo" className="home-logo" />
        <div className="swipe-stats">
          <span className="swipe-count liked">❤️ {rightSwipes.length}</span>
          <span className="swipe-count passed">✕ {leftSwipes.length}</span>
          {(rightSwipes.length > 0 || leftSwipes.length > 0) && (
            <button className="clear-history" onClick={clearSwipeHistory}>Clear</button>
          )}
        </div>
      </div>
      
      {/* Tab navigation */}
      <div className="tabs-container">
        <div 
          className={`tab ${activeTab === 'swipe' ? 'active' : ''}`}
          onClick={() => handleTabChange('swipe')}
        >
          🔥 Swipe
        </div>
        <div 
          className={`tab ${activeTab === 'messages' ? 'active' : ''}`}
          onClick={() => handleTabChange('messages')}
        >
          💬 Messages {rightSwipes.length > 0 && `(${rightSwipes.length})`}
        </div>
        <div 
          className={`tab ${activeTab === 'calendar' ? 'active' : ''}`}
          onClick={() => handleTabChange('calendar')}
        >
          📅 Calendar
        </div>
        <div 
          className={`tab ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => handleTabChange('profile')}
        >
          👤 Profile
        </div>
      </div>

      <div>
        {activeTab === 'swipe' && (
          <div className="swipe-container">
            <div className="swipe-info">
              {lastDirection ? <p>You swiped {lastDirection === 'right' ? '❤️ like' : '✕ pass'}</p> : <p>Swipe a card!</p>}
            </div>
          
            {/* Instructional overlay */}
            {showInstructions && !loading && !allProfilesSeen && profileDeck.length > currentIndex && (
              <div className="swipe-instructions">
                <div className="instructions-content">
                  <h3>How to use StudyBuddy</h3>
                  <div className="instruction-row">
                    <div className="instruction-action">
                      <div className="swipe-arrow left">←</div>
                      <p>Swipe <strong>LEFT</strong> to pass</p>
                    </div>
                    <div className="instruction-action">
                      <div className="swipe-arrow right">→</div>
                      <p>Swipe <strong>RIGHT</strong> to connect</p>
                    </div>
                  </div>
                  <button className="got-it-button" onClick={() => setShowInstructions(false)}>Got it!</button>
                </div>
              </div>
            )}
            {loading ? (
              <div className="loading-profiles">
                <h3>Loading profiles...</h3>
              </div>
            ) : allProfilesSeen ? (
              <div className="no-more-profiles">
                <h3>No more profiles to swipe</h3>
                <p>You've seen all available study buddies!</p>
                <p>Check the chat section to connect with your matches.</p>
                <button 
                  className="restart-button"
                  onClick={() => {
                    // Set loading state to prevent UI glitches
                    setLoading(true);
                    
                    // Give time for state update to finish
                    setTimeout(() => {
                      // Generate a completely new shuffled deck
                      setProfileDeck(shuffle(allProfiles));
                      // Reset the index
                      setCurrentIndex(0);
                      // Clear the last direction
                      setLastDirection(undefined);
                      // Show instructions again
                      setShowInstructions(true);
                      // Keep swipe history for reference
                      // End loading state
                      setLoading(false);
                      console.log('Reshuffled and reset all profiles');
                    }, 300);
                  }}
                >
                  See All Profiles Again
                </button>
              </div>
            ) : (
              profileDeck.slice(currentIndex, currentIndex + 5).map((profile, i) => (
              <TinderCard
                key={profile.id}
                className="swipe"
                preventSwipe={['up', 'down']}
                onSwipe={(dir) => swiped(dir, profile.name, currentIndex + i)}
                onCardLeftScreen={() => outOfFrame(profile.name)}
                swipeRequirementType="position"
                swipeThreshold={80}
              >
                <div className="profile-card" style={{ zIndex: 1000 - i }}>
                  <img src={profile.image} alt="Profile" className="profile-image" />
                  <h2>{profile.name}</h2>
                  <p className="major-minor">{profile.majorMinor}</p>
                  <p className="class-year"><em>{profile.classYear}</em></p>

                  <div className="bio-section">
                    <strong>About</strong>
                    <p className="bio-preview">{profile.bio}</p>
                  </div>

                  <div className="classes-section">
                    <strong>Classes</strong>
                    <p>{profile.classes}</p>
                  </div>

                  <div className="interests-section">
                    <strong>Interests</strong>
                    <div className="interest-tags">
                      {profile.interests.map((tag) => (
                        <span key={tag} className="interest-pill">{tag}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </TinderCard>
          )))}
          </div>
        )}

        {/* Messages tab */}
        {activeTab === 'messages' && (
          <div className="messages-container">
            {rightSwipes.length === 0 ? (
              <div className="no-messages">
                <h3>No matches yet</h3>
                <p>Swipe right on profiles you'd like to connect with!</p>
                <button 
                  className="go-swipe-button"
                  onClick={() => handleTabChange('swipe')}
                >
                  Go Swipe
                </button>
              </div>
            ) : (
              <div className="chat-interface">
                {/* Chat sidebar - list of matched users */}
                <div className="chat-sidebar">
                  <h3>Your Matches</h3>
                  <div className="matches-list">
                    {rightSwipes.map(profile => (
                      <div 
                        key={profile.id} 
                        className={`match-item ${currentChat?.id === profile.id ? 'active' : ''}`}
                        onClick={() => startChat(profile)}
                      >
                        <div className="match-avatar">
                          <img src={profile.image} alt={profile.name} />
                        </div>
                        <div className="match-info">
                          <div className="match-name">{profile.name}</div>
                          <div className="match-preview">{profile.majorMinor}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Chat main area */}
                <div className="chat-main">
                  {!currentChat ? (
                    <div className="select-chat">
                      <p>Select a match to start chatting</p>
                    </div>
                  ) : (
                    <>
                      <div className="chat-header">
                        <div className="chat-recipient">
                          <img src={currentChat.image} alt={currentChat.name} className="recipient-avatar" />
                          <div className="recipient-info">
                            <div className="recipient-name">{currentChat.name}</div>
                            <div className="recipient-status">Send a message and they'll see it once they log on</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="chat-messages">
                        {/* First message is always the welcome */}
                        <div className="message-bubble system">
                          <p>You matched with {currentChat.name}! Start a conversation about your classes or study interests.</p>
                        </div>
                        
                        {/* User messages */}
                        {messages[currentChat.id]?.map(msg => (
                          <div key={msg.id} className={`message-bubble ${msg.sender}`}>
                            <p>{msg.text}</p>
                            <span className="message-time">
                              {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                          </div>
                        ))}
                      </div>
                      
                      <div className="chat-input">
                        <input
                          type="text"
                          placeholder="Type a message..."
                          value={messageText}
                          onChange={(e) => setMessageText(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        />
                        <button onClick={sendMessage}>Send</button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Calendar tab content */}
      {activeTab === 'calendar' && (
        <div className="calendar-container">
          <div className="calendar-link-container">
            <h3>Study Calendar</h3>
            <p>Schedule and manage your study sessions</p>
            <Link to="/calendar" className="calendar-link-button">
              Open Full Calendar
            </Link>
          </div>
        </div>
      )}
      
      {/* Profile tab content - Display Kevin's profile */}
      {activeTab === 'profile' && (
        <div className="profile-container">
          <div className="user-profile-card">
            <div className="profile-header">
              <img src={currentUserProfile.image} alt="Your profile" className="profile-avatar" />
              <div className="profile-name-container">
                <h2>{currentUserProfile.name}</h2>
                <p className="major-minor">{currentUserProfile.majorMinor}</p>
                <p className="class-year"><em>{currentUserProfile.classYear}</em></p>
              </div>
              <button 
                className="edit-profile-button" 
                onClick={() => {
                  if (isEditing) {
                    // Reset form values when cancelling
                    setEditFormValues({
                      bio: currentUserProfile.bio,
                      classes: currentUserProfile.classes,
                      interests: currentUserProfile.interests.join(', ')
                    });
                  }
                  setIsEditing(!isEditing);
                }}
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>
            
            {/* About Me Section */}
            <div className="profile-section">
              <h3>About Me</h3>
              {isEditing ? (
                <textarea 
                  className="profile-edit-field" 
                  value={editFormValues.bio}
                  onChange={(e) => setEditFormValues({...editFormValues, bio: e.target.value})}
                  placeholder="Tell others about yourself..."
                />
              ) : (
                <p>{currentUserProfile.bio}</p>
              )}
            </div>
            
            {/* Classes Section */}
            <div className="profile-section">
              <h3>My Classes</h3>
              {isEditing ? (
                <input 
                  type="text" 
                  className="profile-edit-field" 
                  value={editFormValues.classes}
                  onChange={(e) => setEditFormValues({...editFormValues, classes: e.target.value})}
                  placeholder="Enter your classes (e.g. CS 278, PSYC 135)"
                />
              ) : (
                <p>{currentUserProfile.classes}</p>
              )}
            </div>
            
            {/* Interests Section */}
            <div className="profile-section">
              <h3>My Interests</h3>
              {isEditing ? (
                <input 
                  type="text" 
                  className="profile-edit-field" 
                  value={editFormValues.interests}
                  onChange={(e) => setEditFormValues({...editFormValues, interests: e.target.value})}
                  placeholder="Enter interests separated by commas"
                />
              ) : (
                <div className="interest-tags">
                  {currentUserProfile.interests.map((tag) => (
                    <span key={tag} className="interest-pill">{tag}</span>
                  ))}
                </div>
              )}
            </div>
            
            {/* Save Button when editing */}
            {isEditing && (
              <button 
                className="save-profile-button" 
                onClick={() => {
                  // Save the changes to the current user profile
                  const updatedProfile = {
                    ...currentUserProfile,
                    bio: editFormValues.bio,
                    classes: editFormValues.classes,
                    interests: editFormValues.interests.split(',').map(item => item.trim())
                  };
                  
                  // Update the profile
                  setCurrentUserProfile(updatedProfile);
                  
                  // Exit editing mode
                  setIsEditing(false);
                  
                  console.log('Profile updated:', updatedProfile);
                }}
              >
                Save Changes
              </button>
            )}
            
            {/* Logout Button */}
            <div className="logout-container">
              <button
                className="logout-button"
                onClick={() => {
                  signOut(auth).then(() => {
                    navigate('/');
                    console.log('User logged out successfully');
                  }).catch(error => {
                    console.error('Error logging out:', error);
                  });
                }}
              >
                Logout
              </button>

              <button
                className="logout-button"
                style={{ backgroundColor: "#e53e3e", marginLeft: "0.5rem" }}
                onClick={() => navigate("/safety")}
              >
                Safety
              </button>

            </div>

          </div>
        </div>
      )}

    </div>
    
  );
  
}

export default AppHome;
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  setDoc,
  deleteDoc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  onSnapshot
} from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import CryptoJS from 'crypto-js';

// Collections
const USERS_COLLECTION = 'users';
const NOTES_COLLECTION = 'notes';

// User Management
export const userService = {
  // Create or update user profile
  async createOrUpdateUser(userData) {
    try {
      const userRef = doc(db, USERS_COLLECTION, auth.currentUser.uid);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        // Create new user with wallet info
        const walletInfo = await generateWalletInfo(auth.currentUser.uid);
        
        const newUserData = {
          ...userData,
          ...walletInfo,
          createdAt: serverTimestamp(),
          lastLoginAt: serverTimestamp(),
          isActive: true
        };
        
        await setDoc(userRef, newUserData);
        
        return { ...newUserData, isNew: true };
      } else {
        // Update existing user
        await updateDoc(userRef, {
          lastLoginAt: serverTimestamp()
        });
        
        return { ...userDoc.data(), isNew: false };
      }
    } catch (error) {
      console.error('Error creating/updating user:', error);
      throw error;
    }
  },

  // Get user profile
  async getUserProfile() {
    try {
      const userRef = doc(db, USERS_COLLECTION, auth.currentUser.uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        return userDoc.data();
      }
      return null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  }
};

// Notes Management
export const notesService = {
  // Create a new note
  async createNote(noteData) {
    try {
      const userId = auth.currentUser.uid;
      const noteId = generateNoteId(userId);
      const contentHash = generateContentHash(noteData.title, noteData.content);
      
      const note = {
        id: noteId,
        userId: userId,
        title: noteData.title,
        content: noteData.content,
        contentHash: contentHash,
        onChainStatus: 'pending',
        transactionHash: null,
        blockNumber: null,
        userOpHash: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        onChainTimestamp: null
      };

      const docRef = await addDoc(collection(db, NOTES_COLLECTION), note);
      
      // Process blockchain registration asynchronously
      processBlockchainRegistration(docRef.id, noteId, contentHash);
      
      return { ...note, docId: docRef.id };
    } catch (error) {
      console.error('Error creating note:', error);
      throw error;
    }
  },

  // Get all notes for current user
  async getNotes(limitCount = 50) {
    try {
      const userId = auth.currentUser.uid;
      
      // Simplified query to avoid index issues
      const q = query(
        collection(db, NOTES_COLLECTION),
        where('userId', '==', userId),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      const notes = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        notes.push({
          docId: doc.id,
          ...data
        });
      });
      
      // Sort by createdAt on client side to avoid index requirement
      notes.sort((a, b) => {
        const aTime = a.createdAt?.toDate?.() || new Date(0);
        const bTime = b.createdAt?.toDate?.() || new Date(0);
        return bTime - aTime;
      });
      
      return notes;
    } catch (error) {
      console.error('Error getting notes:', error);
      throw error;
    }
  },

  // Get a specific note
  async getNote(docId) {
    try {
      const noteRef = doc(db, NOTES_COLLECTION, docId);
      const noteDoc = await getDoc(noteRef);
      
      if (noteDoc.exists() && noteDoc.data().userId === auth.currentUser.uid) {
        return { docId: noteDoc.id, ...noteDoc.data() };
      }
      return null;
    } catch (error) {
      console.error('Error getting note:', error);
      throw error;
    }
  },

  // Update a note
  async updateNote(docId, noteData) {
    try {
      const contentHash = generateContentHash(noteData.title, noteData.content);
      
      const updateData = {
        title: noteData.title,
        content: noteData.content,
        contentHash: contentHash,
        onChainStatus: 'pending', // Reset status for re-verification
        updatedAt: serverTimestamp()
      };

      const noteRef = doc(db, NOTES_COLLECTION, docId);
      await updateDoc(noteRef, updateData);
      
      // Get the note ID for blockchain update
      const noteDoc = await getDoc(noteRef);
      if (noteDoc.exists()) {
        const noteId = noteDoc.data().id;
        processBlockchainUpdate(docId, noteId, contentHash);
      }
      
      return { docId, ...updateData };
    } catch (error) {
      console.error('Error updating note:', error);
      throw error;
    }
  },

  // Delete a note
  async deleteNote(docId) {
    try {
      const noteRef = doc(db, NOTES_COLLECTION, docId);
      const noteDoc = await getDoc(noteRef);
      
      // Verify ownership
      if (noteDoc.exists() && noteDoc.data().userId === auth.currentUser.uid) {
        await deleteDoc(noteRef);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting note:', error);
      throw error;
    }
  },

  // Listen to notes changes in real-time
  subscribeToNotes(callback) {
    const userId = auth.currentUser.uid;
    
    // Simplified query without orderBy to avoid index requirement
    const q = query(
      collection(db, NOTES_COLLECTION),
      where('userId', '==', userId)
    );
    
    return onSnapshot(q, (querySnapshot) => {
      const notes = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        notes.push({
          docId: doc.id,
          ...data
        });
      });
      
      // Sort by createdAt on client side
      notes.sort((a, b) => {
        const aTime = a.createdAt?.toDate?.() || new Date(0);
        const bTime = b.createdAt?.toDate?.() || new Date(0);
        return bTime - aTime;
      });
      
      callback(notes);
    }, (error) => {
      console.error('Error in notes subscription:', error);
      callback([]); // Return empty array on error
    });
  }
};

// Wallet Service
export const walletService = {
  // Get wallet info for current user
  async getWalletInfo() {
    try {
      const userProfile = await userService.getUserProfile();
      return {
        address: userProfile?.walletAddress,
        salt: userProfile?.walletSalt,
        ownerAddress: userProfile?.ownerAddress,
        createdAt: userProfile?.createdAt
      };
    } catch (error) {
      console.error('Error getting wallet info:', error);
      throw error;
    }
  },

  // Get transaction history
  async getTransactions() {
    try {
      const userId = auth.currentUser.uid;
      
      // Simplified query to get all user notes first
      const q = query(
        collection(db, NOTES_COLLECTION),
        where('userId', '==', userId)
      );
      
      const querySnapshot = await getDocs(q);
      const transactions = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        // Only include notes that have transaction hashes
        if (data.transactionHash) {
          transactions.push({
            noteId: data.id,
            noteTitle: data.title,
            transactionHash: data.transactionHash,
            userOpHash: data.userOpHash,
            blockNumber: data.blockNumber,
            status: data.onChainStatus,
            timestamp: data.onChainTimestamp,
            type: 'note_registration'
          });
        }
      });
      
      // Sort by timestamp on client side
      transactions.sort((a, b) => {
        const aTime = a.timestamp?.toDate?.() || new Date(0);
        const bTime = b.timestamp?.toDate?.() || new Date(0);
        return bTime - aTime;
      });
      
      return transactions;
    } catch (error) {
      console.error('Error getting transactions:', error);
      throw error;
    }
  }
};

// Utility Functions
function generateNoteId(userId) {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `note_${userId}_${timestamp}_${random}`;
}

function generateContentHash(title, content) {
  const contentToHash = `${title}|${content}`;
  return CryptoJS.SHA256(contentToHash).toString();
}

async function generateWalletInfo(userUid) {
  // Simulate wallet generation (in production, this would call your backend)
  const ownerAddress = CryptoJS.SHA256(userUid).toString().slice(0, 40);
  const walletAddress = `0x${CryptoJS.SHA256(ownerAddress + '0').toString().slice(0, 40)}`;
  
  return {
    walletAddress: walletAddress,
    ownerAddress: `0x${ownerAddress}`,
    walletSalt: 0
  };
}

// Blockchain Processing (Simulated)
async function processBlockchainRegistration(docId, noteId, contentHash) {
  try {
    console.log(`🔗 Processing blockchain registration for note: ${noteId}`);
    
    // Simulate blockchain processing delay
    setTimeout(async () => {
      try {
        // Simulate successful blockchain registration
        const mockTxHash = `0x${CryptoJS.SHA256(noteId + Date.now()).toString().slice(0, 64)}`;
        const mockBlockNumber = Math.floor(Math.random() * 1000000) + 18000000;
        
        // Update note with blockchain info
        const noteRef = doc(db, NOTES_COLLECTION, docId);
        await updateDoc(noteRef, {
          onChainStatus: 'confirmed',
          transactionHash: mockTxHash,
          blockNumber: mockBlockNumber,
          onChainTimestamp: serverTimestamp()
        });
        
        console.log(`✅ Blockchain registration completed for note: ${noteId}`);
      } catch (error) {
        console.error(`❌ Blockchain registration failed for note: ${noteId}`, error);
        
        // Update note status to failed
        const noteRef = doc(db, NOTES_COLLECTION, docId);
        await updateDoc(noteRef, {
          onChainStatus: 'failed'
        });
      }
    }, 2000 + Math.random() * 3000); // Random delay 2-5 seconds
    
  } catch (error) {
    console.error('Error in blockchain registration:', error);
  }
}

async function processBlockchainUpdate(docId, noteId, contentHash) {
  // For updates, use the same registration process
  await processBlockchainRegistration(docId, noteId, contentHash);
}
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
import toast from 'react-hot-toast';

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
      
      console.log(`📝 Note created in Firebase with docId: ${docRef.id}`);
      
      // Add a small delay to prevent rate limiting issues
      setTimeout(() => {
        // Process blockchain registration asynchronously (don't wait)
        processBlockchainRegistration(docRef.id, noteId, contentHash)
          .then((result) => {
            console.log('✅ Blockchain registration completed:', result);
            // Show success notification after blockchain completion
            if (result?.erc4337 && result?.paymasterUsed) {
              toast.success('🎉 Note verified on blockchain with zero gas fees!', {
                duration: 4000
              });
            }
          })
          .catch((error) => {
            console.error('❌ Blockchain registration failed:', error);
          });
      }, 1000); // 1 second delay to prevent rate limiting
      
      return { 
        ...note, 
        docId: docRef.id
      };
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

  // Update note status (for blockchain confirmations)
  async updateNoteStatus(docId, statusData) {
    try {
      const noteRef = doc(db, NOTES_COLLECTION, docId);
      await updateDoc(noteRef, {
        ...statusData,
        updatedAt: serverTimestamp()
      });
      
      return true;
    } catch (error) {
      console.error('Error updating note status:', error);
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
  try {
    // Call backend to get real wallet address
    const response = await fetch('http://localhost:3001/api/wallet/address', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userUid: userUid
      })
    });
    
    const walletInfo = await response.json();
    
    if (walletInfo.walletAddress) {
      return {
        walletAddress: walletInfo.walletAddress,
        ownerAddress: walletInfo.ownerAddress,
        walletSalt: walletInfo.salt
      };
    } else {
      throw new Error('Failed to generate wallet info');
    }
  } catch (error) {
    console.error('Error generating wallet info:', error);
    
    // Fallback to deterministic generation if backend fails
    const ownerAddress = CryptoJS.SHA256(userUid).toString().slice(0, 40);
    const walletAddress = `0x${CryptoJS.SHA256(ownerAddress + '0').toString().slice(0, 40)}`;
    
    return {
      walletAddress: walletAddress,
      ownerAddress: `0x${ownerAddress}`,
      walletSalt: 0
    };
  }
}

// Blockchain Processing (Real Backend Integration)
async function processBlockchainRegistration(docId, noteId, contentHash) {
  try {
    console.log(`🔗 Processing real blockchain registration for note: ${noteId}`);
    
    // Update status to processing
    const noteRef = doc(db, NOTES_COLLECTION, docId);
    await updateDoc(noteRef, {
      onChainStatus: 'processing',
      processingStarted: serverTimestamp()
    });
    
    console.log(`📝 Updated note ${noteId} status to 'processing'`);
    
    // Call backend to register note on Sepolia with retry logic
    console.log(`🚀 Calling backend API for note ${noteId}...`);
    
    let response;
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount <= maxRetries) {
      try {
        response = await fetch('http://localhost:3001/api/notes/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            noteId: noteId,
            noteHash: contentHash,
            userUid: auth.currentUser.uid
          })
        });
        
        console.log(`📡 Backend response status: ${response.status} ${response.statusText}`);
        
        // If rate limited, wait and retry
        if (response.status === 429 && retryCount < maxRetries) {
          const retryAfter = response.headers.get('Retry-After') || '60';
          const waitTime = Math.min(parseInt(retryAfter) * 1000, 60000); // Max 60 seconds
          
          console.log(`⏳ Rate limited, retrying in ${waitTime/1000} seconds... (attempt ${retryCount + 1}/${maxRetries + 1})`);
          
          await new Promise(resolve => setTimeout(resolve, waitTime));
          retryCount++;
          continue;
        }
        
        // Break out of retry loop for any other response
        break;
        
      } catch (fetchError) {
        if (retryCount < maxRetries) {
          console.log(`🔄 Network error, retrying in 5 seconds... (attempt ${retryCount + 1}/${maxRetries + 1})`);
          await new Promise(resolve => setTimeout(resolve, 5000));
          retryCount++;
          continue;
        }
        throw fetchError;
      }
    }
    
    // Check if HTTP response was successful
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error(`❌ HTTP Error ${response.status}:`, errorData);
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    console.log(`🔍 Backend response for note ${noteId}:`, result);
    
    if (result.status === 'confirmed') {
      console.log(`✅ Blockchain registration successful, updating Firebase...`);
      
      // Update note with real blockchain info
      await updateDoc(noteRef, {
        onChainStatus: 'confirmed',
        transactionHash: result.transactionHash,
        blockNumber: result.blockNumber,
        gasUsed: result.gasUsed,
        smartWallet: result.smartWallet,
        erc4337: result.erc4337,
        paymasterUsed: result.paymasterUsed,
        onChainTimestamp: serverTimestamp()
      });
      
      console.log(`✅ Real blockchain registration completed for note: ${noteId}`);
      console.log(`📍 Transaction: ${result.transactionHash}`);
      console.log(`📍 Block: ${result.blockNumber}`);
      console.log(`🎯 ERC-4337: ${result.erc4337}, Paymaster: ${result.paymasterUsed}`);
      console.log(`🔥 Firebase document updated successfully!`);
      
      return result; // Return the blockchain result
    } else {
      console.error(`❌ Unexpected status from backend:`, result);
      throw new Error(result.error || `Unexpected status: ${result.status}`);
    }
    
  } catch (error) {
    console.error(`❌ Real blockchain registration failed for note: ${noteId}`, error);
    
    // Update status to failed
    const noteRef = doc(db, NOTES_COLLECTION, docId);
    await updateDoc(noteRef, {
      onChainStatus: 'failed',
      error: error.message,
      failedAt: serverTimestamp()
    });
    
    console.log(`💥 Updated note ${noteId} status to 'failed'`);
    
    throw error;
  }
}

// Verification Service
export const verificationService = {
  // Verify note integrity on blockchain
  async verifyNote(noteId, expectedHash) {
    try {
      const response = await fetch('http://localhost:3001/api/notes/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          noteId: noteId,
          expectedHash: expectedHash
        })
      });
      
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error verifying note:', error);
      return { verified: false, error: error.message };
    }
  },

  // Check transaction status
  async checkTransactionStatus(transactionHash) {
    try {
      const response = await fetch(`http://localhost:3001/api/transaction/${transactionHash}`);
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error checking transaction status:', error);
      return { status: 'unknown', error: error.message };
    }
  },

  // Get blockchain status
  async getBlockchainStatus() {
    try {
      const response = await fetch('http://localhost:3001/api/blockchain/status');
      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error getting blockchain status:', error);
      return { status: 'error', error: error.message };
    }
  }
};

async function processBlockchainUpdate(docId, noteId, contentHash) {
  // For updates, use the same registration process
  await processBlockchainRegistration(docId, noteId, contentHash);
}

// Recover stuck transactions on app load
export async function recoverStuckTransactions() {
  if (!auth.currentUser) return;
  
  try {
    console.log('🔄 Checking for stuck transactions...');
    
    const notesRef = collection(db, NOTES_COLLECTION);
    const q = query(
      notesRef,
      where('userId', '==', auth.currentUser.uid),
      where('onChainStatus', 'in', ['processing'])
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.log('✅ No stuck transactions found');
      return;
    }
    
    console.log(`🔍 Found ${querySnapshot.size} processing notes to check`);
    
    for (const docSnap of querySnapshot.docs) {
      const note = docSnap.data();
      const docId = docSnap.id;
      
      console.log(`🔍 Checking note: ${note.id}, status: ${note.onChainStatus}`);
      
      // For processing notes, check if they've been processing too long
      if (note.onChainStatus === 'processing') {
        const processingStarted = note.processingStarted?.toDate();
        if (processingStarted && Date.now() - processingStarted.getTime() > 5 * 60 * 1000) { // 5 minutes
          console.log(`⏰ Note ${note.id} has been processing for too long, checking blockchain...`);
          await checkAndUpdateNoteStatus(docId, note);
        } else {
          console.log(`⏳ Note ${note.id} is still within processing time limit`);
        }
      }
    }
  } catch (error) {
    console.error('Error recovering stuck transactions:', error);
  }
}

// Check blockchain status and update note
async function checkAndUpdateNoteStatus(docId, note) {
  try {
    // Try to check if the transaction actually succeeded on blockchain
    const response = await fetch('http://localhost:3001/api/notes/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        noteId: note.id,
        expectedHash: note.contentHash
      })
    });
    
    const result = await response.json();
    
    if (result.verified) {
      // Transaction actually succeeded! Update to confirmed
      const noteRef = doc(db, NOTES_COLLECTION, docId);
      await updateDoc(noteRef, {
        onChainStatus: 'confirmed',
        recoveredAt: serverTimestamp(),
        blockchainData: result.blockchainData
      });
      
      console.log(`✅ Recovered note ${note.id} - was actually confirmed on blockchain!`);
      
      // Show success notification
      toast.success(`🎉 Note "${note.title}" was successfully verified on blockchain!`, {
        duration: 4000
      });
      
      return true;
    } else {
      // Still not on blockchain, check if we should retry or mark as truly failed
      const noteRef = doc(db, NOTES_COLLECTION, docId);
      const timeSinceCreation = Date.now() - note.createdAt?.toDate()?.getTime();
      
      if (timeSinceCreation > 15 * 60 * 1000) { // 15 minutes
        // Too old, mark as truly failed
        await updateDoc(noteRef, {
          onChainStatus: 'failed',
          error: 'Transaction timeout - blockchain verification failed',
          finalFailedAt: serverTimestamp()
        });
        console.log(`❌ Note ${note.id} marked as permanently failed`);
      } else {
        // Still within reasonable time, try to re-process
        console.log(`🔄 Re-attempting blockchain registration for note ${note.id}`);
        await updateDoc(noteRef, {
          onChainStatus: 'processing',
          retryAttempt: (note.retryAttempt || 0) + 1,
          processingStarted: serverTimestamp()
        });
        
        // Re-trigger blockchain processing
        processBlockchainRegistration(docId, note.id, note.contentHash)
          .then((result) => {
            console.log(`✅ Retry successful for note ${note.id}`);
          })
          .catch((error) => {
            console.error(`❌ Retry failed for note ${note.id}:`, error);
          });
      }
    }
  } catch (error) {
    console.error(`Error checking note ${note.id}:`, error);
  }
  
  return false;
}

// Manual transaction status check for specific note
export async function checkNoteTransactionStatus(noteId) {
  if (!auth.currentUser) return null;
  
  try {
    console.log(`🔍 Manually checking transaction status for note: ${noteId}`);
    
    const notesRef = collection(db, NOTES_COLLECTION);
    const q = query(
      notesRef,
      where('userId', '==', auth.currentUser.uid),
      where('id', '==', noteId)
    );
    
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const noteDoc = querySnapshot.docs[0];
      const note = noteDoc.data();
      
      // Check if note is actually verified on blockchain
      const response = await fetch('http://localhost:3001/api/notes/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          noteId: note.id,
          expectedHash: note.contentHash
        })
      });
      
      const result = await response.json();
      
      if (result.verified) {
        // Update note status to confirmed
        const noteRef = doc(db, NOTES_COLLECTION, noteDoc.id);
        await updateDoc(noteRef, {
          onChainStatus: 'confirmed',
          manuallyVerifiedAt: serverTimestamp(),
          blockchainData: result.blockchainData
        });
        
        console.log(`✅ Manual verification successful for note: ${noteId}`);
        return 'confirmed';
      } else {
        // Check if we should retry the blockchain registration
        const timeSinceCreation = Date.now() - note.createdAt?.toDate()?.getTime();
        
        if (timeSinceCreation < 15 * 60 * 1000 && (note.retryAttempt || 0) < 3) {
          // Retry blockchain registration
          console.log(`🔄 Retrying blockchain registration for note: ${noteId}`);
          
          const noteRef = doc(db, NOTES_COLLECTION, noteDoc.id);
          await updateDoc(noteRef, {
            onChainStatus: 'processing',
            retryAttempt: (note.retryAttempt || 0) + 1,
            processingStarted: serverTimestamp()
          });
          
          // Re-trigger blockchain processing
          processBlockchainRegistration(noteDoc.id, note.id, note.contentHash)
            .then((result) => {
              console.log(`✅ Manual retry successful for note ${noteId}`);
            })
            .catch((error) => {
              console.error(`❌ Manual retry failed for note ${noteId}:`, error);
            });
          
          return 'retrying';
        } else {
          console.log(`❌ Note ${noteId} could not be verified on blockchain`);
          return 'failed';
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error checking note transaction status:', error);
    return null;
  }
}
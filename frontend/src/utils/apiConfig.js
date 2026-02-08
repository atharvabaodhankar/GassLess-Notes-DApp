// API Configuration utility
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

// Helper function to build API URLs
export const buildApiUrl = (endpoint) => {
  if (!API_BASE_URL) {
    console.warn('Backend API not configured - running in Firebase-only mode');
    return null;
  }
  return `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
};

// Common API endpoints
export const API_ENDPOINTS = {
  WALLET_ADDRESS: '/wallet/address',
  NOTES_REGISTER: '/notes/register',
  NOTES_VERIFY: '/notes/verify',
  TRANSACTION_STATUS: '/transaction',
  BLOCKCHAIN_STATUS: '/blockchain/status',
};

// Fetch wrapper with proper error handling
export const apiRequest = async (endpoint, options = {}) => {
  const url = buildApiUrl(endpoint);
  
  // If no backend configured, return graceful fallback
  if (!url) {
    console.warn('Backend API not available - running in Firebase-only mode');
    return { error: 'Backend not configured', fallback: true };
  }
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`API request failed for ${endpoint}:`, error);
    
    // If it's a network error (backend not available), return a graceful fallback
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      console.warn('Backend API not available - running in Firebase-only mode');
      return { error: 'Backend not available', fallback: true };
    }
    
    throw error;
  }
};
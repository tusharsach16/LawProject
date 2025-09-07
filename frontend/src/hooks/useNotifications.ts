import { useState, useEffect } from 'react';
import { getFriendRequests, respondToFriendRequest } from '../services/authService'; 

interface FriendRequest {
  _id: string;
  senderId: {
    _id: string;
    name: string;
    username: string;
    profileImageUrl?: string;
  };
}

interface User {
  name: string;
  // user object ke baaki fields
}

// Yeh hamara naya custom hook hai
export const useNotifications = (user: User | null) => {
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Friend requests ko fetch karne ke liye
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const data = await getFriendRequests();
        setRequests(data);
      } catch (err) {
        console.error('Failed to load friend requests:', err);
      }
    };
    
    // Sirf jab user logged-in ho tabhi requests fetch karein
    if (user) {
        fetchRequests();
    }
  }, [user]); 

  const handleResponse = async (requestId: string, action: 'accept' | 'reject') => {
    setProcessingId(requestId);
    try {
      await respondToFriendRequest(requestId, action);
      setRequests(prevRequests => prevRequests.filter(req => req._id !== requestId));
    } catch (err) {
      console.error(`Failed to ${action} request:`, err);
      alert(`Could not ${action} the request. Please try again.`);
    } finally {
      setProcessingId(null);
    }
  };

  return { requests, processingId, handleResponse };
};

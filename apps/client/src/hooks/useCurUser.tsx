import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const BACKEND_URL = "http://localhost:3000"


export const fetchSession = async () => {
  try {
    const response = await axios.get(`${BACKEND_URL}/api/auth/session`, {
      withCredentials: true, 
    });
    console.log("Session user:", response.data.user);
    return response.data.user;
  } catch (err: any) {
    console.error("Session fetch failed:", err.response?.data || err.message);
    return null;
  }
};

export const useCurrentUser = () => {
    return useQuery({
        queryKey: ['currentUser'],
        queryFn: fetchSession,
        retry: false,
        staleTime: 5 * 60 * 1000, 
    });
};
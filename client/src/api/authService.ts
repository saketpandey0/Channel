import axios from "axios";
import { BACKEND_URL } from "../const";
import type { UserProfile } from "../types/profile";





export const AuthWithEmail = async (email: string, password: string, authType: 'signin' | 'signup') => {
    const response = await axios.post(`${BACKEND_URL}/api/auth/${authType}`, {
        email, 
        password
    }, {
        withCredentials: true,
        headers: {
        'Content-Type': 'application/json',
        }
    });
    return response.data;
}

export const AuthWithProviders = async (provider: 'google' | 'github') => {
    window.location.href = `${BACKEND_URL}/api/auth/${provider}`;
};


export const getCurrentUser = async () => {
  try {
    console.log("Fetching session user");
    const response = await axios.get(`${BACKEND_URL}/api/auth/session`, {
      withCredentials: true, 
    });
    console.log("Session user:", response.data.user);
    if (response.data.user) {
        sessionStorage.setItem('user', JSON.stringify(response.data.user));
    } else {
        sessionStorage.removeItem('user');
    }
    return response.data.user;
  } catch (err: any) {
    console.error("Session fetch failed:", err.response?.data || err.message);
     const cachedUser = sessionStorage.getItem('user');
    if (cachedUser) {
        try {
            return JSON.parse(cachedUser);
        } catch {
            sessionStorage.removeItem('user');
        }
    }
    return null;
  }
};


export const logoutUser = async () => {
    const response = await axios.post(`${BACKEND_URL}/api/auth/logout`, null, {
        withCredentials: true,
      });
    return response.data;
}   

export const fetchUserProfile = async (username: string) => {
  try{
    console.log(username);
    const response = await axios.get(`${BACKEND_URL}/api/auth/profile/${username}`, {
      withCredentials: true,
    });
    console.log("response: ",response.data);
    if (!response) throw new Error('Failed to fetch profile');
    return response.data;
  }catch(e){
    console.error("Failed To load profile: ",e)
    return null
  }
};


export const editProfile = async (userId: string, profile: UserProfile) => {
  const response = await axios.put(`/api/users/${userId}/profile`, {
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profile)
  });
  if (!response) throw new Error('Failed to edit profile');
}
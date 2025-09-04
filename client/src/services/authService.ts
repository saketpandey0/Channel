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
    try {
    await axios.post(`${BACKEND_URL}/api/auth/logout`, {}, { withCredentials: true });
    sessionStorage.removeItem("user"); 
    return true;
  } catch (err: any) {
    console.error("Logout failed:", err.response?.data || err.message);
    return false;
  }
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
  try {
    const response = await axios.put(`${BACKEND_URL}/api/auth/update/${userId}/profile`, profile, {
      headers: { 
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error: any) {
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    throw new Error('Failed to update profile');
  }
};

export const checkUsernameAvailability = async (username: string): Promise<boolean> => {
  try {
    const response = await axios.get(`${BACKEND_URL}/api/auth/check-username/${encodeURIComponent(username)}`);
    return response.data.available;
  } catch (error: any) {
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error);
    }
    throw new Error('Failed to check username availability');
  }
};
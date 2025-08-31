import axios from  'axios';
import { BACKEND_URL } from '../const';









export const getCurrentAdmin = async () => {
  try {
    const response = await axios.get(`${BACKEND_URL}/api/admin/me`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching admin profile:", error);
    throw error;
  }
};


export const getAdminUsers = async (
  page: number,
  limit: number,
  search?: string,
  status?: string,
  role?: string
) => {
    try {
        const response = await axios.get(
          `${BACKEND_URL}/api/admin/users?page=${page}&limit=${limit}&search=${search || ""}&status=${status || ""}&role=${role || ""}`,
          { withCredentials: true }
        );
        return response.data;
    }catch(error){
        console.error("Error fetching admin users", error);
        throw error;
    }
};


export const updateUserStatus = async (id: string, status: string, reason: string) => {
    try {
        const response = await axios.put(`${BACKEND_URL}/api/admin/users/${id}/status`, {
            status,
            reason
        }, {
            withCredentials: true
        });
        return response.data;
    }catch(error){
        console.error("Error updating user status", error);
        throw error;
    }
};


export const deleteUserAccount = async (id: string) => {
    try {
        const response = await axios.delete(`${BACKEND_URL}/api/admin/users/${id}`, {
            withCredentials: true
        });
        return response.data;
    }catch(error){
        console.error("Error deleting user account", error);
        throw error;
    }
};


export const getAdminStories = async (
  page: number,
  limit: number,
  status?: string,
  search?: string
) => {
    try {
        const response = await axios.get(
          `${BACKEND_URL}/api/admin/stories?page=${page}&limit=${limit}&status=${status || ""}&search=${search || ""}`,
          { withCredentials: true }
        );
        return response.data;
    }catch(error){
        console.error("Error fetching admin stories", error);
        throw error;
    }
};


export const moderateStory = async (id: string, status: string, reason: string) => {
    try {
        const response = await axios.put(`${BACKEND_URL}/api/admin/stories/${id}/status`, {
            status,
            reason
        }, {
            withCredentials: true
        });
        return response.data;
    }catch(error){
        console.error("Error moderating story", error);
        throw error;
    }
};


export const removeStory = async (id: string) => {
    try {
        const response = await axios.delete(`${BACKEND_URL}/api/admin/stories/${id}`, {
            withCredentials: true
        });
        return response.data;
    }catch(error){
        console.error("Error removing story", error);
        throw error;
    }
};


export const getAdminPublications = async (
  page: number,
  limit: number,
  status?: string,
  search?: string
)  => {
    try {
        const response = await axios.get(
          `${BACKEND_URL}/api/admin/publications?page=${page}&limit=${limit}&status=${status || ""}&search=${search || ""}`,
          { withCredentials: true }
        );
        return response.data;
    }catch(error){
        console.error("Error fetching admin publications", error);
        throw error;
    }
};

export const moderatePublication = async (id: string, status: string, reason: string) => {
    try {
        const response = await axios.put(`${BACKEND_URL}/api/admin/publications/${id}/status`, {
            status,
            reason
        }, {
            withCredentials: true
        });
        return response.data;
    }catch(error){
        console.error("Error moderating publication", error);
        throw error;
    }
};


export const getAdminReports = async (
  page: number,
  limit: number,
  status?: string,
  search?: string
) => {
    try {
        const response = await axios.get(
          `${BACKEND_URL}/api/admin/reports?page=${page}&limit=${limit}&status=${status || ""}&search=${search || ""}`,
          { withCredentials: true }
        );
        return response.data;
    }catch(error){
        console.error("Error fetching admin reports", error);
        throw error;
    }
};

export const resolveReport = async (id: string, status: string, action: string) => {
    try {
        const response = await axios.put(`${BACKEND_URL}/api/admin/reports/${id}/resolve`, {
            status,
            action
        }, {
            withCredentials: true
        });
        return response.data;
    }catch(error){
        console.error("Error resolving report", error);
        throw error;
    }
};

export const getAdminAnalytics = async (
  page: number,
  limit: number,
  timeframe?: string
) => {
    try {
        const response = await axios.get(
          `${BACKEND_URL}/api/admin/analytics?page=${page}&limit=${limit}&timeframe=${timeframe || ""}`,
          { withCredentials: true }
        );
        return response.data;
    }catch(error){
        console.error("Error fetching admin analytics", error);
        throw error;
    }
};

export const getSystemHealth = async () => {
    try {
        const response = await axios.get(
          `${BACKEND_URL}/api/admin/system-health`,
          { withCredentials: true }
        );
        return response.data;
    }catch(error){
        console.error("Error fetching system health", error);
        throw error;
    }
};


export const getAdminDashboard = async () => {
    try {
        const response = await axios.get(
          `${BACKEND_URL}/api/admin/dashboard}`,
          { withCredentials: true }
        );
        return response.data;
    }catch(error){
        console.error("Error fetching admin dashboard", error);
        throw error;
    }
};


export const getUserActivityLogs = async (userId: string, page: number, limit: number) => {
    try {
        const response = await axios.get(
          `${BACKEND_URL}/api/admin/users/${userId}/activity-logs?page=${page}&limit=${limit}`,
          { withCredentials: true }
        );
        return response.data;
    }catch(error){
        console.error("Error fetching user activity logs", error);
        throw error;
    }
};


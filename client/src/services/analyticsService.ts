import axios from "axios";
import { BACKEND_URL } from "../const";


export const getStoryAnalytics = async (storyId: string) => {
    try {
        const response = await axios.get(`${BACKEND_URL}/api/analytics/story/${storyId}`, {
            withCredentials: true,
        });
        return response.data;
    } catch (err) {
        console.error("Failed to get story analytics:", err);
        return null;
    }
}


export const getPublicationAnalytics = async (publicationId: string) => {
    try {
        const response = await axios.get(`${BACKEND_URL}/api/analytics/publication/${publicationId}`, {
            withCredentials: true,
        });
        return response.data;
    } catch (err) {
        console.error("Failed to get publication analytics:", err);
        return null;
    }
}


export const getDashboardAnalytics = async () => {
    try {
        const response = await axios.get(`${BACKEND_URL}/api/analytics/dashboard`, {
            withCredentials: true,
        });
        return response.data;
    } catch (err) {
        console.error("Failed to get dashboard analytics:", err);
        return null;
    }
}


export const getEarningsAnalytics = async () => {
    try {
        const response = await axios.get(`${BACKEND_URL}/api/analytics/earnings`, {
            withCredentials: true,
        });
        return response.data;
    } catch (err) {
        console.error("Failed to get earnings analytics:", err);
        return null;
    }
}
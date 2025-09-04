import axios from "axios";
import { BACKEND_URL } from "../const";


export const getUserNotification = async () => {
    try {
        const response = await axios.get(`${BACKEND_URL}/api/notifications` , {
            withCredentials: true,
        });
        return response.data;
    }catch(err){
        console.error(" Failed to fetch user notifications");
        return null;
    }
}


export const markNotificationRead = async (notificationId: string) => {
    try {
        const response = await axios.put(`${BACKEND_URL}/api/notifications/${notificationId}/read`, null, {
            withCredentials: true,
        });
        return response.data;
    } catch (err) {
        console.error("Failed to mark notification read:", err);
        return null;
    }
}


export const markAllNotificationRead = async () => {
    try {
        const response = await axios.put(`${BACKEND_URL}/api/notifications/read`, null, {
            withCredentials: true,
        });
        return response.data;
    } catch (err) {
        console.error("Failed to mark all notifications read:", err);
        return null;
    }
}


export const deleteNotification = async (notificationId: string) => {
    try {
        const response = await axios.delete(`${BACKEND_URL}/api/notifications/${notificationId}`, {
            withCredentials: true,
        });
        return response.data;
    } catch (err) {
        console.error("Failed to delete notification:", err);
        return null;
    }
}


export const sendNewsletter = async (publicationId: string, subject: string, content: string, storyIds: string[]) => {
    try {
        const response = await axios.post(`${BACKEND_URL}/api/publications/${publicationId}/newsletter`, {
            subject,
            content,
            storyIds
        }, {
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json',
            }
        });
        return response.data;
    } catch (err) {
        console.error("Failed to send newsletter:", err);
        return null;
    }
}


export const getPublicationSubscribers = async (publicationId: string) => {
    try {
        const response = await axios.get(`${BACKEND_URL}/api/publications/${publicationId}/subscribers`, {
            withCredentials: true,
        });
        return response.data;
    } catch (err) {
        console.error("Failed to get publication subscribers:", err);
        return null;
    }
}


export const subscribeToPublication = async (publicationId: string) => {
    try {
        const response = await axios.post(`${BACKEND_URL}/api/publications/${publicationId}/subscribe`, null, {
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json',
            }
        });
        return response.data;
    } catch (err) {
        console.error("Failed to subscribe to publication:", err);
        return null;
    }
}


export const unsubscribeFromPublication = async (publicationId: string) => {
    try {
        const response = await axios.delete(`${BACKEND_URL}/api/publications/${publicationId}/subscribe`, {
            withCredentials: true,
        });
        return response.data;
    } catch (err) {
        console.error("Failed to unsubscribe from publication:", err);
        return null;
    }
}
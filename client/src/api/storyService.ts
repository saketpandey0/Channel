import axios from "axios";
import { BACKEND_URL } from "../const";



export const createStory = async (payload: any) => {
    const response = await axios.post(`${BACKEND_URL}/api/story/create`, {payload}, {
        withCredentials: true
    });
    return response.data
}


export const updateStory = async (id: string, payload: any) => {
    const response = await axios.put(`${BACKEND_URL}/api/story/update/story/${id}`, {payload}, {
        withCredentials: true,
        headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
}


export const getStories = async (page: number, limit: number)=>{
    try{
        const response = await axios.get(`${BACKEND_URL}/api/story/getstories?page=${page}&limit=${limit}`, {
            withCredentials: true
        });
        return response.data;
    }catch(err: any){
        console.error('getStories error', err);
    }
}

export const getStory = async (id: string) => {
    try {
        const response = await axios.get(`${BACKEND_URL}/api/story/getstory/${id}`, {
            withCredentials: true
        });
        return response.data;
    } catch (error: any) {
        console.error("Failed to get story:", error.message);
        throw error;
    }
}


export const deleteStory = async (id: string) => {
    try {
        const response = await axios.delete(`${BACKEND_URL}/api/story/delete/${id}`, {
            withCredentials: true
        });
        return response.data;
    } catch (error: any) {      
        console.error("Failed to delete story:", error.message);
        throw error;
    }
}


export const getFeed = async (page: number, limit: number) => {
    try {
        const response = await axios.get(`${BACKEND_URL}/api/story/getfeed?page=${page}&limit=${limit}`, {
            withCredentials: true
        });
        return response.data;
    } catch (error: any) {
        console.error("Failed to get feed:", error.message);
        throw error;
    }
}


export const getTrendingStories = async (page: number, limit: number) => {
    try {
        const response = await axios.get(`${BACKEND_URL}/api/story/gettrendingstories?page=${page}&limit=${limit}`, {
            withCredentials: true
        });
        return response.data;
    } catch (error: any) {
        console.error("Failed to get trending stories:", error.message);
        throw error;
    }
}


export const publishStory = async (id: string) => {
    try {
        const response = await axios.post(`${BACKEND_URL}/api/story/publish/${id}`, {
            withCredentials: true
        });
        return response.data;
    } catch (error: any) {
        console.error("Failed to publish story:", error.message);
        throw error;
    }
}


export const unpublishStory = async (id: string) => {
    try {
        const response = await axios.post(`${BACKEND_URL}/api/story/unpublish/${id}`, {
            withCredentials: true
        });
        return response.data;
    } catch (error: any) {
        console.error("Failed to unpublish story:", error.message);
        throw error;
    }
}

export const getUserDrafts = async (page: number, limit: number) => {
    try {
        const response = await axios.get(`${BACKEND_URL}/api/story/drafts?page=${page}&limit=${limit}`, {
            withCredentials: true
        });
        return response.data;
    } catch (error: any) {
        console.error("Failed to get user drafts:", error.message);
        throw error;
    }
}


export const getUserPublishedStories = async (page: number, limit: number) => {
    try {
        const response = await axios.get(`${BACKEND_URL}/api/story/published?page=${page}&limit=${limit}`, {
            withCredentials: true
        });
        return response.data;
    } catch (error: any) {
        console.error("Failed to get user published stories:", error.message);
        throw error;
    }
}


export const getStoriesStats = async (id: string) => {
    try {
        const response = await axios.get(`${BACKEND_URL}/api/story/stats/${id}`, {
            withCredentials: true
        });
        return response.data;
    } catch (error: any) {
        console.error("Failed to get story stats:", error.message);
        throw error;
    }
}


export const getStoryVersions = async (id: string) => {
    try {
        const response = await axios.get(`${BACKEND_URL}/api/story/versions/${id}`, {
            withCredentials: true
        });
        return response.data;
    } catch (error: any) {
        console.error("Failed to get story versions:", error.message);
        throw error;
    }
}

export const restoreStoryVersion = async (storyId: string, versionId: string) => {
    try {
        const response = await axios.post(`${BACKEND_URL}/api/story/restore/${storyId}/${versionId}`, {}, {
            withCredentials: true
        });
        return response.data;
    } catch (error: any) {
        console.error("Failed to restore story version:", error.message);
        throw error;
    }
}
import axios from "axios";
import { BACKEND_URL } from "../const";



export const uploadImageService = async (file: File) => {
  try {
    const formData = new FormData();
    formData.append("image", file);

    const response = await axios.post(`${BACKEND_URL}/api/upload/image`, formData, {
        withCredentials: true, 
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data; 
  } catch (error: any) {
    console.error("Upload failed:", error.response?.data || error.message);
    throw error.response?.data || { error: "Upload failed" };
  }
};


export const uploadVideoService = async (file: File) => {
  try {
    const formData = new FormData();
    formData.append("video", file);

    const response = await axios.post(`${BACKEND_URL}/api/upload/video`, formData, {
        withCredentials: true, 
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data; 
  } catch (error: any) {
    console.error("Upload failed:", error.response?.data || error.message);
    throw error.response?.data || { error: "Upload failed" };
  }
};


export const getMediaService = async (id: string) => {
  try {
    const response = await axios.get(`${BACKEND_URL}/api/media/${id}`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error: any) {
    console.error("Failed to get media:", error.response?.data || error.message);
    throw error.response?.data || { error: "Failed to get media" };
  }
};


export const getRelatedStoriesService = async (id: string) => {
  try {
    const response = await axios.get(`${BACKEND_URL}/api/stories/${id}/related`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error: any) {
    console.error("Failed to get related stories:", error.response?.data || error.message);
    throw error.response?.data || { error: "Failed to get related stories" };
  }
};


export const reportStory = async (storyId: string, reason: string, description?: string) => {
  try {
    const response = await axios.post(
      `${BACKEND_URL}/api/story/${storyId}/report`,
      { reason, description },
      {
        withCredentials: true, 
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data; 
  } catch (error: any) {
    console.error("Error reporting story:", error.response?.data || error.message);
    throw error.response?.data || error;
  }
};
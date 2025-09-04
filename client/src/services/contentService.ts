import axios from "axios";
import { BACKEND_URL } from "../const";



export const uploadImageService = async (id: string, formData: FormData) => {
  try {
    console.log("uploading")
    const response = await axios.post(`${BACKEND_URL}/api/content/upload/${id}/image`, formData, {
      withCredentials: true,
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
    );
    console.log("response.data", response.data)
    return response.data;
  } catch (error: any) {
    console.error("Upload failed:", error.response?.data || error.message);
    throw error.response?.data || { error: "Upload failed" };
  }
};


export const uploadVideoService = async (id: string, formData: FormData) => {
  try {
    const response = await axios.post(`${BACKEND_URL}/api/content/upload/${id}/video`, formData, {
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
    const response = await axios.get(`${BACKEND_URL}/api/content/media/${id}`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error: any) {
    console.error("Failed to get media:", error.response?.data || error.message);
    throw error.response?.data || { error: "Failed to get media" };
  }
};


export const reportStory = async (storyId: string, reason: string, description?: string) => {
  try {
    const response = await axios.post(
      `${BACKEND_URL}/api/contetn/story/${storyId}/report`,
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


export const translateWithMyMemory = async (
  text: string,
  targetLang: string,
  sourceLang: string = "en"
) => {
  try {
    const res = await axios.get("https://api.mymemory.translated.net/get", {
      params: {
        q: text,
        langpair: `${sourceLang}|${targetLang}`,
      },
    });

    return res.data.responseData.translatedText;
  } catch (err) {
    console.error("MyMemory translation failed", err);
    throw err;
  }
};
import axios from "axios";



const BACKEND_URL = "http://localhost:3000";





export const toggleStoryClap = async (storyId: string) => {
    const response = await axios.post(`${BACKEND_URL}/api/feature/story/${storyId}/clap`, {},{
        withCredentials: true,
        headers: {
        'Content-Type': 'application/json',
        }
    });
    return response.data;
}

export const getStoryClapData = async (storyId: string) => {
    const response = await axios.get(`${BACKEND_URL}/api/feature/story/${storyId}/clap`, {
        withCredentials: true,
    });
    return response.data;
}

export const getBatchStoryMetaData = async (storyIds: string[]) => {
    const response = await axios.post(`${BACKEND_URL}/api/feature/story/metadata`, {ids:storyIds},  {
        withCredentials: true
    });
    return response.data;
}

export const getStoryComments = async (storyId: string, page: number, limit: number) => {
    const response = await axios.get(`${BACKEND_URL}/api/feature/story/${storyId}/comments/?page=${page}&limit=${limit}`, {
        withCredentials: true,
    });
    return response.data;
}

export const commentStory = async (storyId: string, comment: string) => {
    const response = await axios.post(`${BACKEND_URL}/api/feature/story/${storyId}/comment`, {
        content: comment
    }, {
        withCredentials: true,
        headers: {
        'Content-Type': 'application/json',
        }
    });
    return response.data;
}

export const deleteComment = async (commentId: string) => {
    const response = await axios.delete(`${BACKEND_URL}/api/feature/story/comments/${commentId}`, {
        withCredentials: true,
        headers: {
        'Content-Type': 'application/json',
        }
    });
    return response.data;
}

export const replyComment = async ( commentId: string, comment: string) => {
    const response = await axios.post(`${BACKEND_URL}/api/feature/story/comments/${commentId}/reply`, {
        content: comment
    }, {
        withCredentials: true,
        headers: {
        'Content-Type': 'application/json',
    }
    });
    return response.data;
}

export const updateComment = async (commentId: string, comment: string) => {
    const response = await axios.put(`${BACKEND_URL}/api/feature/story/comments/${commentId}`, {
        comment
    }, {
        withCredentials: true,
        headers: {
            'Content-Type': 'application/json',
        }
    });
    return response.data;
}

export const toggleCommentClap = async (commentId: string) => {
    try{
        const response = await axios.post(`${BACKEND_URL}/api/feature/story/comment/${commentId}/clap`,{}, {
            withCredentials: true,
            headers: {
            'Content-Type': 'application/json',
            }
        });
        return response.data;
    }catch(error){
        console.error("Error toggling comment clap", error);
        throw error;
    }
}

export const getBatchCommentClapData = async (storyId: string, commentId: string[]) => {
    try {
        const response = await axios.post(`${BACKEND_URL}/api/feature/story/${storyId}/comment/clap`, {
            commentIds: commentId
        }, {
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json',
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching comment clap data", error);
        throw error;
    }
}

export const toggleUserFollow = async (userId: string) => {
    try{
        console.log("calling toggleUserFollow");
        const reponse = await axios.post(`${BACKEND_URL}/api/feature/user/${userId}/follow`, {}, {
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json',
            }
        });
        console.log("reponse.data", reponse.data);
        return reponse.data;
    }catch(error){
        console.error("Error fetching follow data", error);
        throw error;
    }
}

export const getUserFollowData = async (userId: string) => {
    const reponse = await axios.get(`${BACKEND_URL}/api/feature/user/${userId}/follow`, {
        withCredentials: true,
    });
    return reponse.data;
}

export const getBatchFollowData = async (userIds: string[]) => {
    const reponse = await axios.post(`${BACKEND_URL}/api/feature/user/follow`, { userIds }, {
        withCredentials: true,
    });
    return reponse.data;
}

export const toogleBookmark = async (storyId: string) => {  
    try {
        const response = await axios.post(`${BACKEND_URL}/api/feature/story/${storyId}/bookmark`, {}, {
            withCredentials: true,
            headers: {
            'Content-Type': 'application/json',
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error toggling bookmark", error);    
        throw error;
    }
}

export const getUserBookmarks = async () => {
    try {
        const response = await axios.get(`${BACKEND_URL}/api/feature/user/bookmarks`, {
            withCredentials: true,
        });
        return response.data;
    }
    catch (error) {
        console.error("Error fetching bookmarks", error);
        throw error;
    }
}

export const getStoryBookmarks = async (storyId: string) => {
    try {
        const response = await axios.get(`${BACKEND_URL}/api/feature/story/${storyId}/bookmarks`, {
            withCredentials: true,
        });
        return response.data;   
    } catch (error) {
        console.error("Error fetching bookmarks", error);
        throw error;
    }
}

export const contentSearch = async (q: string) => {
    try {
        const response = await axios.get(`${BACKEND_URL}/api/feature/search?q=${q}`, {
            withCredentials: true,
        });
        return response.data;
    } catch (error) {
        console.error("Error while searching content", error);
        throw error;    
    }
}
import axios from "axios";



const BACKEND_URL = "http://localhost:3000";





export const clapStory = async (storyId: string) => {
    const response = await axios.post(`${BACKEND_URL}/api/feature/story/${storyId}/clap`, {},{
        withCredentials: true,
        headers: {
        'Content-Type': 'application/json',
        }
    });
    return response.data;
}

export const storyClapStatus = async (storyId: string) => {
    const response = await axios.get(`${BACKEND_URL}/api/feature/story/${storyId}/clap-status`, {
        withCredentials: true,
    });
    return response.data;
}

export const removeClap = async (storyId: string) => {
    const response = await axios.delete(`${BACKEND_URL}/api/feature/story/${storyId}/clap`, {
        withCredentials: true
    });
    return response.data;
}

export const getStoryClaps = async (storyId: string) => {
    const response = await axios.get(`${BACKEND_URL}/api/feature/stories/${storyId}/claps`, {
        withCredentials: true
    });
    return response.data;
}

export const getStoryComments = async (storyId: string) => {
    const response = await axios.get(`${BACKEND_URL}/api/feature/story/${storyId}/comments`, {
        withCredentials: true,
    });
    return response.data;
}

export const updateComment = async (storyId: string, commentId: string, comment: string) => {
    const response = await axios.put(`${BACKEND_URL}/api/feature/story/${storyId}/comments/${commentId}`, {
        comment
    }, {
        withCredentials: true,
        headers: {
            'Content-Type': 'application/json',
        }
    });
    return response.data;
}

export const removeClapComment = async (storyId: string, commentId: string) => {
    const response = await axios.delete(`${BACKEND_URL}/api/feature/story/${storyId}/comments/${commentId}/clap`, {
        withCredentials: true,
        headers: {
        'Content-Type': 'application/json',
    }
});
return response.data;
}

export const commentStory = async (storyId: string, comment: string) => {
    const response = await axios.post(`${BACKEND_URL}/api/feature/story/${storyId}/comment`, {
        comment
    }, {
        withCredentials: true,
        headers: {
        'Content-Type': 'application/json',
        }
    });
    return response.data;
}

export const deleteComment = async (storyId: string, commentId: string) => {
    const response = await axios.delete(`${BACKEND_URL}/api/feature/story/${storyId}/comments/${commentId}`, {
        withCredentials: true,
        headers: {
        'Content-Type': 'application/json',
        }
    });
    return response.data;
}

export const replycomment = async (storyId: string, commentId: string, comment: string) => {
    const response = await axios.post(`${BACKEND_URL}/api/feature/stories/${storyId}/comments/${commentId}/reply`, {
        comment
    }, {
        withCredentials: true,
        headers: {
        'Content-Type': 'application/json',
    }
    });
    return response.data;
}

export const clapComment = async (storyId: string, commentId: string) => {
    const response = await axios.post(`${BACKEND_URL}/api/feature/stories/${storyId}/comments/${commentId}/clap`, null, {
        withCredentials: true,
        headers: {
        'Content-Type': 'application/json',
        }
    });
    return response.data;
}

export const removeCommentClap = async (storyId: string, commentId: string) => {
    await axios.delete(`${BACKEND_URL}/api/feature/story/${storyId}/comments/${commentId}/clap`, {
        withCredentials: true,
    });
}

export const followUser = async (userId: string) => {
    const reponse = await axios.post(`${BACKEND_URL}/api/feature/follow/${userId}`, null, {
        withCredentials: true,
        headers: {
            'Content-Type': 'application/json',
        }
    });
    return reponse.data;
}

export const followStatus = async (userId: string) => {
    const reponse = await axios.get(`${BACKEND_URL}/api/feature/follow/${userId}/status`, {
        withCredentials: true,
    });
    return reponse.data;
}

export const unfollowUser = async (userId: string) => {
    const reponse = await axios.delete(`${BACKEND_URL}/api/feature/follow/${userId}`, {
        withCredentials: true,
    });
    return reponse.data;
}

export const getUserFollowers = async (userId: string) => {
    const reponse = await axios.get(`${BACKEND_URL}/api/feature/followers/${userId}`, {
        withCredentials: true,
    });
    return reponse.data;
}

export const getUserFollowing = async (userId: string) => {
    const reponse = await axios.get(`${BACKEND_URL}/api/feature/following/${userId}`, {
        withCredentials: true,
    });
    return reponse.data;
}

export const bookmarkStory = async (storyId: string) => {
    const response = await axios.post(`${BACKEND_URL}/api/feature/story/${storyId}/bookmark`, null, {
        withCredentials: true,
        headers: {
        'Content-Type': 'application/json',
        }
    });
    return response.data;
}

export const removeBookmark = async (storyId: string) => {
    const response = await axios.delete(`${BACKEND_URL}/api/feature/story/${storyId}/bookmark`, {
        withCredentials: true,
    });
    return response.data;
}

export const getUserBookmarks = async (userId: string) => {
    const response = await axios.get(`${BACKEND_URL}/api/feature/user/${userId}/bookmarks`, {
        withCredentials: true,
    });
    return response.data;
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
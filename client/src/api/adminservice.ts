import axios from  'axios';


export const getAdminUsers = async (page: number, limit: number) => {
    const response = await axios.get(`/api/admin/users?page=${page}&limit=${limit}`,{
        withCredentials: true
    });
    return response.data;
}
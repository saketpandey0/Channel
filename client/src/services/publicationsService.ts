import axios from 'axios'
import { BACKEND_URL } from '../const'


export const createPublication = async (payload: any) => {
    try {
        const response = await axios.post(`${BACKEND_URL}/api/publication/create`, {payload}, {
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json',
            }
        })
        return response.data;
    } catch(err: any){
        console.error('error while creating publication: ', err);
    }
}


export const getPublication = async (publicationId: string)=>{
    try{
        const response = await axios.get(`${BACKEND_URL}/api/publication/${publicationId}`, {
            withCredentials: true
        });
        return response.data;
    }catch(err: any){
        console.error('getPublication error', err);
    }
}


export const getPublications = async (page: number, limit: number)=>{
    try{
        const response = await axios.get(`${BACKEND_URL}/api/publications?page=${page}&limit=${limit}`, {
            withCredentials: true
        });
        return response.data;
    }catch(err: any){
        console.error('getPublications error', err);
    }
}

export const deletePublication = async (publicationId: string)=>{
    try{
        const response = await axios.delete(`${BACKEND_URL}/api/publication/delete/${publicationId}`, {
            withCredentials: true
        });
        return response.data;
    }catch(err: any){
        console.error('deletePublication error', err);
    }
}

export const updatePublication = async (publicationId: string, payload: any)=>{
    try{
        const response = await axios.put(`${BACKEND_URL}/api/publication/update/${publicationId}`, {payload}, {
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json',
            }
        });
        return response.data;
    }catch(err: any){
        console.error('updatePublication error', err);
    }
}


export const getPublicationStories = async (publicationId: string, page: number, limit: number)=>{
    try{
        const response = await axios.get(`${BACKEND_URL}/api/publication/${publicationId}/stories?page=${page}&limit=${limit}`, {
            withCredentials: true
        });
        return response.data;
    }catch(err: any){
        console.error('getPublicationStories error', err);
    }
}


export const submitStoryToPublication = async (publicationId: string, storyId: string)=>{
    try{
        const response = await axios.post(`${BACKEND_URL}/api/publication/submit/${publicationId}`, {storyId}, {
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json',
            }
        });
        return response.data;
    }catch(err: any){
        console.error('submitStoryToPublication error', err);
    }
}


export const updateSubmissionStatus = async (publicationId: string, storyId: string, status: string)=>{
    try{
        const response = await axios.put(`${BACKEND_URL}/api/publication/update/${publicationId}/submission/${storyId}`, {status}, {    
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json',
            }
        });
        return response.data;
    }catch(err: any){
        console.error('updateSubmissionStatus error', err);
    }
}



export const getPublicationWriters = async (publicationId: string)=>{
    try{
        const response = await axios.get(`${BACKEND_URL}/api/publication/writers/${publicationId}`, {
            withCredentials: true
        });
        return response.data;
    }catch(err: any){
        console.error('getPublicationWriters error', err);
    }
}

export const addPublicationWriter = async (publicationId: string, writerId: string)=>{
    try{
        const response = await axios.post(`${BACKEND_URL}/api/publication/writers/${publicationId}`, {writerId}, {
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json',
            }
        });
        return response.data;
    }catch(err: any){
        console.error('addPublicationWriter error', err);
    }
}

export const removePublicationWriter = async (publicationId: string, writerId: string)=>{
    try{
        const response = await axios.delete(`${BACKEND_URL}/api/publication/writers/${publicationId}`, {
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json',
            }
        });
        return response.data;
    }catch(err: any){
        console.error('removePublicationWriter error', err);
    }
}


export const getPublicationEditors = async (publicationId: string)=>{
    try{
        const response = await axios.get(`${BACKEND_URL}/api/publication/editors/${publicationId}`, {
            withCredentials: true
        });
        return response.data;
    }catch(err: any){
        console.error('getPublicationEditors error', err);
    }
}

export const addPublicationEditor = async (publicationId: string, editorId: string, role: string)=>{
    try{
        const response = await axios.post(`${BACKEND_URL}/api/publication/editors/${publicationId}`, {editorId, role}, {
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json',
            }
        });
        return response.data;
    }catch(err: any){
        console.error('addPublicationEditor error', err);
    }
}


export const removePublicationEditor = async (publicationId: string, editorId: string)=>{
    try{
        const response = await axios.delete(`${BACKEND_URL}/api/publication/editors/${publicationId}`, {
            withCredentials: true,
            headers: {
                'Content-Type': 'application/json',
            }
        });
        return response.data;
    }catch(err: any){
        console.error('removePublicationEditor error', err);
    }
}       


export const getPublicationStats = async (publicationId: string)=>{
    try{
        const response = await axios.get(`${BACKEND_URL}/api/publication/stats/${publicationId}`, {
            withCredentials: true
        });
        return response.data;
    }catch(err: any){
        console.error('getPublicationStats error', err);
    }
}
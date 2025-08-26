import axios from 'axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';

const BACKEND_URL = "http://localhost:3000"


const logoutUser = async () => {
  const response = await axios.post(`${BACKEND_URL}/api/auth/logout`, null, {
    withCredentials: true,
  });
  return response.data;
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      localStorage.removeItem('user'); // optional if used only for client display
      queryClient.clear(); // clears React Query cache
      navigate('/login');
    },
    onError: (err) => {
      console.error("Logout failed:", err);
    },
  });
};

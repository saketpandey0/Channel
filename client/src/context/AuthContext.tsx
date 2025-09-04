import { createContext, useContext,  } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AuthWithEmail, AuthWithProviders, logoutUser, getCurrentUser } from "../services/authService";


const AuthContext = createContext<any>(null);


export const AuthProvider = ({children}: {children: React.ReactNode}) => {
    const queryClient = useQueryClient();

    const useCurrentUser = () => {
        return useQuery({
            queryKey: ['currentUser'],
            queryFn: getCurrentUser,
            retry: false,
            staleTime: 5 * 60 * 1000, 
        });
    };


    const AuthEmail = useMutation({
        mutationFn: ({ email, password, authType }: { email: string; password: string; authType: 'signin' | 'signup' }) => {
            return AuthWithEmail(email, password, authType);
        },
        onSuccess: (data)=>{
            console.log("successful post request", data)
            if (data.user) {
                queryClient.setQueryData(['currentUser'], data.user);
                sessionStorage.setItem('user', JSON.stringify(data.user));
            }
        },
        onError: (error) => {
            console.error("Authentication error:", error);
        }
    });


    const loginOAuth = (provider: "google" | "github") => {
        AuthWithProviders(provider);
    };


    const logoutAuth = useMutation({
        mutationFn: logoutUser,
        onSuccess: () => {
            sessionStorage.removeItem('user'); 
            queryClient.setQueryData(['currentUser'], null);
            queryClient.invalidateQueries({ queryKey: ['currentUser'] });
        },
        onError: (err) => {
            console.error("Logout failed:", err);
        },
    });

    return (
        <AuthContext.Provider value={{useCurrentUser, AuthEmail, loginOAuth, logoutAuth}}>
            {children}
        </AuthContext.Provider>
    )
}


export const useAuth = () => useContext(AuthContext);
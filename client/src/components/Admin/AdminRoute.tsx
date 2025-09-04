import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import type React from "react";

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
    const { useCurrentUser } = useAuth();
    const { data: user } = useCurrentUser();

    if (!user) {
        return <Navigate to="/login" />;
    }

    if (user.role !== "ADMIN") {
        return <Navigate to="/unauthorized" />;
    }

    return children;
};

export default AdminRoute;

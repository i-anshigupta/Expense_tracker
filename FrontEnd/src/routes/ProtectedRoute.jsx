import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
    const { token } = useSelector((state) => state.auth);

    // If no token, redirect to login
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // If logged in, render child routes
    return <Outlet />;
};

export default ProtectedRoute;

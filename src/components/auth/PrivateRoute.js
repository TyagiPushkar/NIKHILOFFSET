import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const PrivateRoute = ({ element: Component, requiredRole, ...rest }) => {
    const { user, loading } = useAuth();

    if (loading) {
        // Optionally return a loading spinner or null while checking auth state
        return <div>Loading...</div>;
    }

    // Check if the user is authenticated and if the required role matches
    if (user && (!requiredRole || user.role === requiredRole)) {
        return <Component {...rest} />;
    }

    // Redirect to login page if not authenticated or if the role doesn't match
    return <Navigate to="/" />;
};

export default PrivateRoute;

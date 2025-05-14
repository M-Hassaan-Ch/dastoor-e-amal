import { Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { authService } from '../services/authService';

const ProtectedRoute = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(authService.isAuthenticated());

    useEffect(() => {
        const handleAuthChange = () => {
            setIsAuthenticated(authService.isAuthenticated());
        };

        window.addEventListener('authStateChange', handleAuthChange);
        return () => window.removeEventListener('authStateChange', handleAuthChange);
    }, []);

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    return children;
};

export default ProtectedRoute; 
const API_BASE_URL = 'http://localhost:5000/api/auth';

// Event to notify about auth state changes
const authStateChangeEvent = new Event('authStateChange');

export const authService = {
    async signup(userData) {
        const response = await fetch(`${API_BASE_URL}/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to sign up');
        }

        const data = await response.json();
        this.setAuthData(data);
        return data;
    },

    async login(credentials) {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to log in');
        }

        const data = await response.json();
        this.setAuthData(data);
        return data;
    },

    setAuthData(data) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        window.dispatchEvent(authStateChangeEvent);
    },

    clearAuthData() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.dispatchEvent(authStateChangeEvent);
    },

    logout() {
        this.clearAuthData();
        // Clear any other app state if needed
        window.location.href = '/login';
    },

    getCurrentUser() {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },

    getToken() {
        return localStorage.getItem('token');
    },

    isAuthenticated() {
        const token = this.getToken();
        if (!token) return false;

        // Basic token expiration check
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.exp > Date.now() / 1000;
        } catch (error) {
            return false;
        }
    },
}; 
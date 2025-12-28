import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkLoggedIn = async () => {
            const token = localStorage.getItem('token') || sessionStorage.getItem('token');
            if (token) {
                try {
                    const { data } = await api.get('/users/me');
                    setUser(data);
                } catch (error) {
                    console.error("Auth check failed:", error);
                    localStorage.removeItem('token');
                    sessionStorage.removeItem('token');
                }
            }
            setLoading(false);
        };

        checkLoggedIn();
    }, []);

    const login = async (email, password, rememberMe = false) => {
        const { data } = await api.post('/users/login', { email, password, rememberMe });

        if (rememberMe) {
            localStorage.setItem('token', data.token);
        } else {
            sessionStorage.setItem('token', data.token);
        }

        setUser(data);
        return data;
    };

    const register = async (name, email, password) => {
        const { data } = await api.post('/users', { name, email, password });
        // Default to localStorage for registration, or ask? Usually assume persistent or ephemeral?
        // Let's assume persistent for new registrations for better UX
        localStorage.setItem('token', data.token);
        setUser(data);
        return data;
    };

    const logout = () => {
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        setUser(null);
        window.location.href = '/login';
    };

    const updateProfile = async (formData) => {
        // Handle multipart/form-data for photo upload or regular JSON for text update
        // We will separate logic in component, but here we can have a generic refresher
        // Or specific methods. Let's make a generic re-fetch or manual update.
        // Actually best to return the updated user from API and set it.
    };

    // Helper to manually update local user state (e.g. after photo upload)
    const setUserData = (userData) => {
        setUser(userData);
    }

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading, setUserData }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

import React, { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useQuery } from '@apollo/client';
import { GET_CURRENT_USER } from '../lib/graphql';
import type { User } from '../types';
import { isAuthenticated, logout } from '../lib/apollo-client';
import { AuthContext, type AuthContextType } from './AuthContextTypes';
import { AuthService } from '../services/auth';
import { useTokenRefresh } from '../hooks/useTokenRefresh';
import { useCacheManagement } from '../hooks/useCacheUpdates';

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isAuth, setIsAuth] = useState(() => {
        // Check both new and old auth systems
        return AuthService.isAuthenticated() || isAuthenticated();
    });

    // Set up automatic token refresh for new auth system
    useTokenRefresh();

    // Cache management hooks
    const { clearUserSpecificData } = useCacheManagement();

    const { data, loading, refetch } = useQuery(GET_CURRENT_USER, {
        skip: !isAuth,
        errorPolicy: 'all'
    });

    useEffect(() => {
        if (data?.getCurrentUser) {
            setUser(data.getCurrentUser);
        }
    }, [data]);

    const handleLogin = (token: string) => {
        // Support both auth systems
        localStorage.setItem('token', token); // Legacy
        localStorage.setItem('accessToken', token); // New system
        setIsAuth(true);
        refetch();
    };

    const handleLoginNew = async (email: string, password: string) => {
        const tokens = await AuthService.login(email, password);
        setIsAuth(true);
        refetch();
        return tokens;
    };

    const handleLogout = async () => {
        // Check which auth system to use at runtime
        const useNewAuth = AuthService.shouldUseNewAuth();

        if (useNewAuth && AuthService.isAuthenticated()) {
            // Use new logout system
            await AuthService.logout();
        } else {
            // Use legacy logout
            logout();
        }

        // Clear user-specific data from Apollo cache
        clearUserSpecificData();

        setUser(null);
        setIsAuth(false);
    };

    const contextValue: AuthContextType = {
        user,
        loading,
        login: handleLogin,
        loginNew: handleLoginNew,
        logout: handleLogout,
        isAuthenticated: isAuth,
        refetchUser: refetch
    };

    return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};


import React, { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { GET_CURRENT_USER, LOGIN_USER, LOGOUT_USER } from '../lib/graphql';
import type { User } from '../types';
import { isAuthenticated, logout } from '../lib/apollo-client';
import { AuthContext, type AuthContextType } from './AuthContextTypes';
import { AuthService, type AuthTokens } from '../services/auth';
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

    // GraphQL mutations
    const [loginUserMutation] = useMutation(LOGIN_USER);
    const [logoutUserMutation] = useMutation(LOGOUT_USER);

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
        // Support legacy auth system
        localStorage.setItem('token', token); // Legacy
        localStorage.setItem('accessToken', token); // New system

        // Clear any corrupted cache data to ensure fresh queries
        clearUserSpecificData();

        setIsAuth(true);
        refetch();
    };

    const handleLoginNew = async (email: string, password: string): Promise<AuthTokens> => {
        try {
            const result = await loginUserMutation({
                variables: { email, password }
            });

            if (result.data?.loginUser) {
                const { accessToken, refreshToken } = result.data.loginUser;

                // Store tokens
                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('refreshToken', refreshToken);

                // Clear any corrupted cache data to ensure fresh queries
                clearUserSpecificData();

                setIsAuth(true);
                await refetch();

                return { accessToken, refreshToken };
            }

            throw new Error('No login data received');
        } catch (error) {
            console.error('Login failed:', error);
            const message = error instanceof Error ? error.message : 'Login failed';
            throw new Error(message);
        }
    };

    const handleLogout = async () => {
        try {
            const refreshToken = localStorage.getItem('refreshToken');

            if (refreshToken && AuthService.isAuthenticated()) {
                // Use GraphQL mutation for logout
                await logoutUserMutation({
                    variables: { refreshToken }
                });
            } else if (localStorage.getItem('token')) {
                // Use legacy logout
                logout();
            }
        } catch (error) {
            console.error('Logout error:', error);
            // Continue with logout even if server request fails
        } finally {
            // Always clear local storage and state
            AuthService.clearTokens();

            // Clear user-specific data from Apollo cache
            clearUserSpecificData();

            setUser(null);
            setIsAuth(false);
        }
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


import React, { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useQuery } from '@apollo/client';
import { GET_CURRENT_USER } from '../lib/graphql';
import type { User } from '../types';
import { isAuthenticated, logout } from '../lib/apollo-client';
import { AuthContext, type AuthContextType } from './AuthContextTypes';

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isAuth, setIsAuth] = useState(isAuthenticated());

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
        localStorage.setItem('token', token);
        setIsAuth(true);
        refetch();
    };

    const handleLogout = () => {
        logout();
        setUser(null);
        setIsAuth(false);
    };

    const contextValue: AuthContextType = {
        user,
        loading,
        login: handleLogin,
        logout: handleLogout,
        isAuthenticated: isAuth,
        refetchUser: refetch
    };

    return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};


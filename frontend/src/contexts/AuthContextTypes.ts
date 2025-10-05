import { createContext } from 'react';
import type { User } from '../types';

export interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (token: string) => void;
    logout: () => void;
    isAuthenticated: boolean;
    refetchUser: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
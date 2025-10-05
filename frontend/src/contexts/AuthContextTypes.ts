import { createContext } from 'react';
import type { User } from '../types';
import type { AuthTokens } from '../services/auth';

export interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (token: string) => void;
    loginNew: (email: string, password: string) => Promise<AuthTokens>;
    logout: () => Promise<void>;
    isAuthenticated: boolean;
    refetchUser: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
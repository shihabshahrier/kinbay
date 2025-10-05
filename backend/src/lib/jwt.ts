import JWT from 'jsonwebtoken';
import crypto from 'crypto';

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET as string;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET as string;
const ACCESS_TOKEN_EXPIRES_IN = process.env.ACCESS_TOKEN_EXPIRES_IN || '15m';
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

if (!JWT_ACCESS_SECRET) {
    throw new Error('JWT_ACCESS_SECRET is not set in environment variables');
}

if (!JWT_REFRESH_SECRET) {
    throw new Error('JWT_REFRESH_SECRET is not set in environment variables');
}

export interface TokenPayload {
    userId: number;
    email: string;
    iat?: number;
    exp?: number;
}

export interface RefreshTokenPayload {
    userId: number;
    tokenId: string;
    iat?: number;
    exp?: number;
}

export interface TokenPair {
    accessToken: string;
    refreshToken: string;
    refreshTokenId: string;
}

/**
 * Generate Access Token (JWT) - Short-lived (15 minutes)
 */
export const signAccessToken = (payload: Omit<TokenPayload, 'iat' | 'exp'>): string => {
    return JWT.sign(payload, JWT_ACCESS_SECRET, {
        expiresIn: '15m',
        issuer: 'kinbay-api',
        audience: 'kinbay-client'
    });
};

/**
 * Generate Refresh Token (JWT) - Long-lived (7 days)
 */
export const signRefreshToken = (payload: Omit<RefreshTokenPayload, 'iat' | 'exp'>): string => {
    return JWT.sign(payload, JWT_REFRESH_SECRET, {
        expiresIn: '7d',
        issuer: 'kinbay-api',
        audience: 'kinbay-client'
    });
};

/**
 * Verify Access Token
 */
export const verifyAccessToken = (token: string): TokenPayload => {
    try {
        return JWT.verify(token, JWT_ACCESS_SECRET, {
            issuer: 'kinbay-api',
            audience: 'kinbay-client'
        }) as TokenPayload;
    } catch (error) {
        throw new Error('Invalid or expired access token');
    }
};

/**
 * Verify Refresh Token
 */
export const verifyRefreshToken = (token: string): RefreshTokenPayload => {
    try {
        return JWT.verify(token, JWT_REFRESH_SECRET, {
            issuer: 'kinbay-api',
            audience: 'kinbay-client'
        }) as RefreshTokenPayload;
    } catch (error) {
        throw new Error('Invalid or expired refresh token');
    }
};

/**
 * Generate a cryptographically secure refresh token ID
 */
export const generateRefreshTokenId = (): string => {
    return crypto.randomBytes(32).toString('hex');
};

/**
 * Calculate refresh token expiration date
 */
export const getRefreshTokenExpirationDate = (): Date => {
    const days = parseInt(REFRESH_TOKEN_EXPIRES_IN.replace('d', ''));
    return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
};

// Legacy functions for backward compatibility
export const signToken = (payload: object, options?: JWT.SignOptions): string => {
    return JWT.sign(payload, JWT_ACCESS_SECRET, {
        expiresIn: "1h",
        ...options,
    });
};

export const verifyToken = (token: string): object | string => {
    return JWT.verify(token, JWT_ACCESS_SECRET);
};


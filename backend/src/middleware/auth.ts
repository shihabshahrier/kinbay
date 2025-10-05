import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from '../lib/jwt.js';
import DB from '../lib/db.js';

export interface AuthenticatedRequest extends Request {
    user?: {
        id: number;
        email: string;
        firstname: string;
        lastname?: string | null;
    };
}

/**
 * Middleware to verify access token and attach user to request
 */
export const authenticateToken = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.startsWith('Bearer ')
            ? authHeader.substring(7)
            : null;

        if (!token) {
            res.status(401).json({
                error: 'Access token required',
                code: 'TOKEN_MISSING'
            });
            return;
        }

        // Verify JWT signature and expiration
        const payload: TokenPayload = verifyAccessToken(token);

        // Get user from database to ensure they still exist
        const user = await DB.user.findUnique({
            where: {
                id: payload.userId,
                deleted: false
            },
            select: {
                id: true,
                email: true,
                firstname: true,
                lastname: true
            }
        });

        if (!user) {
            res.status(401).json({
                error: 'User not found or inactive',
                code: 'USER_NOT_FOUND'
            });
            return;
        }

        // Attach user to request
        req.user = user;
        next();

    } catch (error) {
        if (error instanceof Error) {
            if (error.message.includes('expired')) {
                res.status(401).json({
                    error: 'Access token expired',
                    code: 'TOKEN_EXPIRED'
                });
            } else if (error.message.includes('invalid')) {
                res.status(401).json({
                    error: 'Invalid access token',
                    code: 'TOKEN_INVALID'
                });
            } else {
                res.status(401).json({
                    error: 'Authentication failed',
                    code: 'AUTH_FAILED'
                });
            }
        } else {
            res.status(500).json({
                error: 'Internal server error',
                code: 'INTERNAL_ERROR'
            });
        }
    }
};

/**
 * Optional authentication middleware - doesn't fail if no token provided
 */
export const optionalAuthentication = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.startsWith('Bearer ')
            ? authHeader.substring(7)
            : null;

        if (token) {
            try {
                const payload: TokenPayload = verifyAccessToken(token);
                const user = await DB.user.findUnique({
                    where: {
                        id: payload.userId,
                        deleted: false
                    },
                    select: {
                        id: true,
                        email: true,
                        firstname: true,
                        lastname: true
                    }
                });

                if (user) {
                    req.user = user;
                }
            } catch (error) {
                // Ignore token errors in optional auth
            }
        }

        next();
    } catch (error) {
        // Don't fail the request for optional auth errors
        next();
    }
};

/**
 * Middleware to extract refresh token from HTTP-only cookie
 */
export const extractRefreshToken = (
    req: Request & { refreshToken?: string },
    res: Response,
    next: NextFunction
): void => {
    try {
        // Try to get refresh token from HTTP-only cookie
        const refreshTokenFromCookie = req.cookies?.refreshToken;

        // Fallback to Authorization header for mobile/API usage
        const authHeader = req.headers['authorization'];
        const refreshTokenFromHeader = authHeader && authHeader.startsWith('Bearer ')
            ? authHeader.substring(7)
            : null;

        // Also check request body for refresh token
        const refreshTokenFromBody = req.body?.refreshToken;

        const refreshToken = refreshTokenFromCookie || refreshTokenFromHeader || refreshTokenFromBody;

        if (!refreshToken) {
            res.status(401).json({
                error: 'Refresh token required',
                code: 'REFRESH_TOKEN_MISSING'
            });
            return;
        }

        req.refreshToken = refreshToken;
        next();

    } catch (error) {
        res.status(500).json({
            error: 'Failed to extract refresh token',
            code: 'EXTRACTION_ERROR'
        });
    }
};
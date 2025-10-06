import express from 'express';
import { createGraphQLServer } from './graphql/index.js';
import { expressMiddleware } from '@as-integrations/express5';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { Getenv } from './config/config.js';
import { verifyToken, verifyAccessToken } from './lib/jwt.js';
import DB from './lib/db.js';




async function main(PORT: number) {
    const app = express();

    // Trust proxy for Cloud Run
    app.set('trust proxy', 1);

    // Configure CORS for production and development
    const corsOrigins = process.env.CORS_ORIGIN
        ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
        : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:3000'];

    app.use(cors({
        origin: (origin, callback) => {
            // Allow requests with no origin (mobile apps, curl, etc.)
            if (!origin) return callback(null, true);

            if (corsOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization']
    }));

    app.use(express.json({ limit: '10mb' }));
    app.use(cookieParser());

    // Health check endpoint for Cloud Run
    app.get('/health', (req, res) => {
        res.status(200).json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            version: process.env.npm_package_version || '1.0.0'
        });
    });

    app.get('/', (req, res) => {
        res.json({
            message: 'Kinbay API Server',
            status: 'running',
            endpoints: {
                graphql: '/graphql',
                health: '/health',
                refresh: '/auth/refresh',
                logout: '/auth/logout'
            }
        });
    });

    // Cookie configuration helper for cross-origin support
    const getCookieOptions = (maxAge: number) => ({
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // HTTPS in production
        sameSite: process.env.NODE_ENV === 'production' ? 'none' as const : 'strict' as const, // Cross-origin for production
        maxAge,
        path: '/',
        domain: process.env.COOKIE_DOMAIN || undefined // Optional custom domain
    });

    // Add auth routes for cookie-based authentication
    app.post('/auth/refresh', async (req, res) => {
        try {
            const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

            if (!refreshToken) {
                return res.status(401).json({
                    error: 'Refresh token required',
                    code: 'REFRESH_TOKEN_MISSING'
                });
            }

            const UserService = (await import('./services/user.js')).default;
            const tokens = await UserService.refreshTokens(refreshToken);

            // Set new refresh token as HTTP-only cookie
            res.cookie('refreshToken', tokens.refreshToken, getCookieOptions(7 * 24 * 60 * 60 * 1000));

            res.json({ accessToken: tokens.accessToken });
        } catch (error) {
            res.status(401).json({
                error: error instanceof Error ? error.message : 'Token refresh failed',
                code: 'REFRESH_FAILED'
            });
        }
    });

    // Secure login endpoint with HTTP-only cookies
    app.post('/auth/login', async (req, res) => {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({
                    error: 'Email and password required',
                    code: 'MISSING_CREDENTIALS'
                });
            }

            const UserService = (await import('./services/user.js')).default;
            const tokens = await UserService.getUserToken({ email, password });

            // Set refresh token as HTTP-only cookie
            res.cookie('refreshToken', tokens.refreshToken, getCookieOptions(7 * 24 * 60 * 60 * 1000));

            // Only return access token (never expose refresh token to JavaScript)
            res.json({
                accessToken: tokens.accessToken,
                message: 'Login successful'
            });
        } catch (error) {
            res.status(401).json({
                error: error instanceof Error ? error.message : 'Login failed',
                code: 'LOGIN_FAILED'
            });
        }
    });

    app.post('/auth/logout', async (req, res) => {
        try {
            const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

            if (refreshToken) {
                const UserService = (await import('./services/user.js')).default;
                await UserService.logout(refreshToken);
            }

            // Clear refresh token cookie
            res.clearCookie('refreshToken', getCookieOptions(0));
            res.json({ success: true });
        } catch (error) {
            // Even if logout fails, clear the cookie
            res.clearCookie('refreshToken', getCookieOptions(0));
            res.json({ success: true });
        }
    });

    app.use(
        '/graphql',
        expressMiddleware(await createGraphQLServer(), {
            context: async ({ req, res }) => {
                const authHeader = req.headers['authorization'];
                const token = authHeader && authHeader.startsWith('Bearer ')
                    ? authHeader.substring(7)
                    : null;

                try {
                    if (token) {
                        // Try new access token format first
                        try {
                            const payload = verifyAccessToken(token);

                            // Get user from database
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
                                return { user, res };
                            }
                        } catch (newTokenError) {
                            // Fallback to legacy token format
                            try {
                                const legacyPayload = verifyToken(token) as any;
                                if (legacyPayload.email) {
                                    const user = await DB.user.findUnique({
                                        where: {
                                            email: legacyPayload.email,
                                            deleted: false
                                        }
                                    });

                                    if (user) {
                                        return { user: { email: user.email }, res }; // Legacy format
                                    }
                                }
                            } catch (legacyTokenError) {
                                // Only log if it's not a token expiration (which is expected)
                                const newError = newTokenError as Error;
                                const legacyError = legacyTokenError as any;

                                const isNewTokenExpired = newError.message?.includes('expired') || newError.message?.includes('Invalid or expired');
                                const isLegacyTokenExpired = legacyError.name === 'TokenExpiredError';

                                if (!isNewTokenExpired || !isLegacyTokenExpired) {
                                    // Token verification failed for non-expiration reasons
                                }
                            }
                        }
                    }
                } catch (error) {
                    // Error in GraphQL context
                }

                return { res };
            },
        }),
    );

    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}

const PORT: string | number = Number(Getenv('PORT'));
main(PORT);

import UserService from '../../services/user.js';
import { createUserPayload, getUserTokenPayload } from '../../services/user.js';
import { signToken, verifyAccessToken } from '../../lib/jwt.js';
import RefreshTokenService from '../../services/refreshToken.js';

const queries = {
    // Legacy login method - returns single JWT token
    getToken: async (_: any, payload: getUserTokenPayload) => {
        const token = await UserService.getUserTokenLegacy(payload);
        return token;
    },

    getCurrentUser: async (_: any, __: any, context: { user?: { email: string } }) => {
        if (!context.user) {
            throw new Error('Not authenticated');
        }
        const user = await UserService.getUserByEmail(context.user.email);
        if (!user) {
            throw new Error('User not found');
        }
        return user;
    },

    // Get active refresh tokens for current user
    getMyRefreshTokens: async (_: any, __: any, context: { user?: { id: number } }) => {
        if (!context.user) {
            throw new Error('Not authenticated');
        }
        const tokens = await RefreshTokenService.getUserActiveRefreshTokens(context.user.id);
        return tokens.map(token => ({
            id: token.id,
            createdAt: token.createdAt.toISOString(),
            expiresAt: token.expiresAt.toISOString(),
            isActive: !token.isRevoked && token.expiresAt > new Date()
        }));
    }
}
const mutations = {
    // Legacy user creation - returns single JWT token
    createUser: async (_: any, payload: createUserPayload) => {
        const user = await UserService.createUser(payload);
        const token = signToken({ email: user.email });
        return token;
    },

    // New 2-token authentication system with HTTP-only cookies
    loginUser: async (_: any, payload: getUserTokenPayload, context: { res?: any }) => {
        const tokens = await UserService.getUserToken(payload);

        // Set refresh token as HTTP-only cookie if response is available
        if (context.res) {
            context.res.cookie('refreshToken', tokens.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
                path: '/'
            });

            // Return only access token (don't expose refresh token to JavaScript)
            return {
                accessToken: tokens.accessToken,
                refreshToken: '[SECURE_HTTP_ONLY_COOKIE]' // Placeholder
            };
        }

        // Fallback: return tokens normally if no response object (for testing)
        return tokens;
    },

    refreshTokens: async (_: any, payload: { refreshToken: string }) => {
        const tokens = await UserService.refreshTokens(payload.refreshToken);
        return tokens;
    },

    logoutUser: async (_: any, payload: { refreshToken?: string }, context: { res?: any }) => {
        // Try to get refresh token from payload or cookies
        let refreshToken = payload.refreshToken;

        // If no token provided and we have response context, we might be using cookies
        if (!refreshToken && context.res && context.res.req?.cookies?.refreshToken) {
            refreshToken = context.res.req.cookies.refreshToken;
        }

        if (refreshToken) {
            await UserService.logout(refreshToken);
        }

        // Clear refresh token cookie if response is available
        if (context.res) {
            context.res.clearCookie('refreshToken', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                path: '/'
            });
        }

        return true;
    },

    logoutAllDevices: async (_: any, __: any, context: { user?: { id: number } }) => {
        if (!context.user) {
            throw new Error('Not authenticated');
        }
        await UserService.logoutAllDevices(context.user.id);
        return true;
    },

    updateUser: async (_: any, payload: { id: number; email?: string; firstname?: string; lastname?: string; address?: string; phone?: string; password?: string }, context: { user?: { email: string } }) => {
        if (!context.user) {
            throw new Error('Not authenticated');
        }
        const user = await UserService.getUserByEmail(context.user.email);
        if (!user) {
            throw new Error('User not found');
        }
        return await UserService.updateUser(user.email, payload);
    }
}

export const resolvers = {
    queries,
    mutations,
    User: {
        id: (parent: any) => String(parent.id)
    }
}
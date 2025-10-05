import DB from '../lib/db.js';
import { hashPassword, generateSalt } from '../lib/hash.js';
import { signToken, verifyToken, signAccessToken, TokenPayload } from '../lib/jwt.js';
import RefreshTokenService from './refreshToken.js';

export interface createUserPayload {
    email: string;
    firstname: string;
    lastname?: string;
    address?: string;
    phone?: string;
    password: string;
}

export interface getUserTokenPayload {
    email: string;
    password: string;
}

export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}

class UserService {
    public static async createUser(payload: createUserPayload) {
        const { email, firstname, lastname, address, phone, password } = payload;

        // Check if user already exists
        const existingUser = await DB.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            throw new Error('User already exists');
        }
        const salt = generateSalt();
        const hashedPassword = hashPassword(password, salt);
        return await DB.user.create({
            data: {
                email,
                firstname,
                lastname: lastname || '',
                address: address || '',
                phone: phone || '',
                password: hashedPassword,
                salt,
            },
        });

    }

    public static async getUserByEmail(email: string) {
        return await DB.user.findUnique({
            where: { email },
        });
    }

    public static async getUserToken(payload: getUserTokenPayload): Promise<AuthTokens> {
        const { email, password } = payload;
        const user = await this.getUserByEmail(email);
        if (!user) {
            throw new Error('User not found');
        }
        const hashedPassword = hashPassword(password, user.salt);
        if (hashedPassword !== user.password) {
            throw new Error('Invalid password');
        }

        // Generate tokens
        const accessToken = signAccessToken({
            userId: user.id,
            email: user.email
        });

        const refreshTokenRecord = await RefreshTokenService.createRefreshToken({
            userId: user.id
        });

        return {
            accessToken,
            refreshToken: refreshTokenRecord.token
        };
    }

    // Legacy method for backward compatibility
    public static async getUserTokenLegacy(payload: getUserTokenPayload) {
        const { email, password } = payload;
        const user = await this.getUserByEmail(email);
        if (!user) {
            throw new Error('User not found');
        }
        const hashedPassword = hashPassword(password, user.salt);
        if (hashedPassword !== user.password) {
            throw new Error('Invalid password');
        }

        // Generate legacy JWT token
        const token = signToken({ email: user.email });

        return token;
    }

    /**
     * Refresh access token using refresh token
     */
    public static async refreshTokens(refreshToken: string): Promise<AuthTokens> {
        // Verify refresh token and get user info
        const refreshTokenRecord = await RefreshTokenService.verifyAndGetRefreshToken(refreshToken);

        // Get user details
        const user = await DB.user.findUnique({
            where: { id: refreshTokenRecord.userId }
        });

        if (!user) {
            throw new Error('User not found');
        }

        // Generate new access token
        const accessToken = signAccessToken({
            userId: user.id,
            email: user.email
        });

        // Rotate refresh token (create new, invalidate old)
        const newRefreshTokenRecord = await RefreshTokenService.rotateRefreshToken(
            refreshTokenRecord.id,
            user.id
        );

        return {
            accessToken,
            refreshToken: newRefreshTokenRecord.token
        };
    }

    /**
     * Logout user by revoking refresh token
     */
    public static async logout(refreshToken: string): Promise<void> {
        try {
            const refreshTokenRecord = await RefreshTokenService.verifyAndGetRefreshToken(refreshToken);
            await RefreshTokenService.revokeRefreshToken(refreshTokenRecord.id);
        } catch (error) {
            // Even if token is invalid, we consider logout successful
        }
    }

    /**
     * Logout from all devices by revoking all refresh tokens
     */
    public static async logoutAllDevices(userId: number): Promise<void> {
        await RefreshTokenService.revokeAllUserRefreshTokens(userId);
    }

    public static async updateUser(email: string, payload: Partial<createUserPayload>) {
        if (payload.password) {
            const salt = generateSalt();
            const hashedPassword = hashPassword(payload.password, salt);
            payload.password = hashedPassword;
            (payload as any).salt = salt; // add salt to payload
        }
        return await DB.user.update({
            where: { email },
            data: payload,
        });
    }

}

export default UserService;
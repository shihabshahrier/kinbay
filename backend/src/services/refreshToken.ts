import DB from '../lib/db.js';
import {
    generateRefreshTokenId,
    getRefreshTokenExpirationDate,
    signRefreshToken,
    verifyRefreshToken,
    RefreshTokenPayload
} from '../lib/jwt.js';

export interface CreateRefreshTokenPayload {
    userId: number;
}

export interface RefreshTokenRecord {
    id: string;
    token: string;
    userId: number;
    expiresAt: Date;
    isRevoked: boolean;
    createdAt: Date;
}

class RefreshTokenService {
    /**
     * Create a new refresh token for a user
     */
    public static async createRefreshToken(payload: CreateRefreshTokenPayload): Promise<RefreshTokenRecord> {
        const { userId } = payload;

        const tokenId = generateRefreshTokenId();
        const expiresAt = getRefreshTokenExpirationDate();

        // Sign the JWT refresh token
        const token = signRefreshToken({
            userId,
            tokenId
        });

        // Store in database
        const refreshToken = await DB.refreshToken.create({
            data: {
                id: tokenId,
                token,
                userId,
                expiresAt
            }
        });

        return refreshToken;
    }

    /**
     * Verify and retrieve refresh token from database
     */
    public static async verifyAndGetRefreshToken(token: string): Promise<RefreshTokenRecord> {
        // First verify JWT signature and expiration
        const payload: RefreshTokenPayload = verifyRefreshToken(token);

        // Get token from database
        const refreshToken = await DB.refreshToken.findUnique({
            where: { id: payload.tokenId }
        });

        if (!refreshToken) {
            throw new Error('Refresh token not found');
        }

        if (refreshToken.isRevoked) {
            throw new Error('Refresh token has been revoked');
        }

        if (refreshToken.expiresAt < new Date()) {
            throw new Error('Refresh token has expired');
        }

        if (refreshToken.token !== token) {
            throw new Error('Refresh token mismatch');
        }

        return refreshToken;
    }

    /**
     * Revoke a refresh token (for logout)
     */
    public static async revokeRefreshToken(tokenId: string): Promise<void> {
        await DB.refreshToken.update({
            where: { id: tokenId },
            data: {
                isRevoked: true,
                updatedAt: new Date()
            }
        });
    }

    /**
     * Revoke all refresh tokens for a user (for security purposes)
     */
    public static async revokeAllUserRefreshTokens(userId: number): Promise<void> {
        await DB.refreshToken.updateMany({
            where: {
                userId,
                isRevoked: false
            },
            data: {
                isRevoked: true,
                updatedAt: new Date()
            }
        });
    }

    /**
     * Rotate refresh token - revoke old and create new
     */
    public static async rotateRefreshToken(
        oldTokenId: string,
        userId: number
    ): Promise<RefreshTokenRecord> {
        // Start transaction for atomicity
        return await DB.$transaction(async (tx) => {
            // Revoke the old token
            await tx.refreshToken.update({
                where: { id: oldTokenId },
                data: {
                    isRevoked: true,
                    replacedBy: generateRefreshTokenId(),
                    updatedAt: new Date()
                }
            });

            // Create new token
            const tokenId = generateRefreshTokenId();
            const expiresAt = getRefreshTokenExpirationDate();

            const token = signRefreshToken({
                userId,
                tokenId
            });

            return await tx.refreshToken.create({
                data: {
                    id: tokenId,
                    token,
                    userId,
                    expiresAt
                }
            });
        });
    }

    /**
     * Clean up expired refresh tokens (maintenance task)
     */
    public static async cleanupExpiredTokens(): Promise<number> {
        const result = await DB.refreshToken.deleteMany({
            where: {
                OR: [
                    { expiresAt: { lt: new Date() } },
                    { isRevoked: true }
                ]
            }
        });

        return result.count;
    }

    /**
     * Detect refresh token reuse (security feature)
     */
    public static async detectTokenReuse(token: string): Promise<boolean> {
        try {
            const payload = verifyRefreshToken(token);

            // Check if token exists but is revoked
            const refreshToken = await DB.refreshToken.findUnique({
                where: { id: payload.tokenId }
            });

            if (refreshToken && refreshToken.isRevoked) {
                // This could indicate token theft - revoke all user tokens
                await this.revokeAllUserRefreshTokens(refreshToken.userId);
                return true; // Token reuse detected
            }

            return false;
        } catch (error) {
            return false; // Invalid token, not necessarily reuse
        }
    }

    /**
     * Get active refresh tokens for a user
     */
    public static async getUserActiveRefreshTokens(userId: number): Promise<RefreshTokenRecord[]> {
        return await DB.refreshToken.findMany({
            where: {
                userId,
                isRevoked: false,
                expiresAt: { gt: new Date() }
            },
            orderBy: { createdAt: 'desc' }
        });
    }
}

export default RefreshTokenService;
import crypto from 'crypto';

export function generateSalt(length: number = 16): string {
    return crypto.randomBytes(length).toString('hex');
}
export function hashPassword(password: string, salt: string): string {
    return crypto
        .createHmac('sha256', salt)
        .update(password)
        .digest('hex');
}

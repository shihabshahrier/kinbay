import DB from '../lib/db.js';
import { hashPassword, generateSalt } from '../lib/hash.js';
import { signToken, verifyToken } from '../lib/jwt.js';

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

    public static async getUserToken(payload: getUserTokenPayload) {
        const { email, password } = payload;
        const user = await this.getUserByEmail(email);
        if (!user) {
            throw new Error('User not found');
        }
        const hashedPassword = hashPassword(password, user.salt);
        if (hashedPassword !== user.password) {
            throw new Error('Invalid password');
        }

        // Generate JWT token
        const token = signToken({ email: user.email });

        return token;

    }

}

export default UserService;
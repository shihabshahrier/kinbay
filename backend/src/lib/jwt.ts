import JWT from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET

if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not set in environment variables');
}

export const signToken = (payload: object, options?: JWT.SignOptions): string => {
    return JWT.sign(payload, JWT_SECRET, {
        expiresIn: "1h",
        ...options,
    });
};

export const verifyToken = (token: string): object | string => {
    return JWT.verify(token, JWT_SECRET);
};


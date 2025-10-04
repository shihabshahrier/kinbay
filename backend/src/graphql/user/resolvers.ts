import UserService from '../../services/user.js';
import { createUserPayload } from '../../services/user.js';
import { signToken } from '../../lib/jwt.js';

const queries = {
    getToken: async (_: any, payload: { email: string; password: string }) => {
        const token = await UserService.getUserToken(payload);
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
    }
}
const mutations = {
    createUser: async (_: any, payload: createUserPayload) => {
        const user = await UserService.createUser(payload);
        const token = signToken({ email: user.email });
        return token;
    }
}

export const resolvers = { queries, mutations }
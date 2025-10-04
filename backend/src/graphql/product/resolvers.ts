import { RentOption } from '@prisma/client';
import ProductService from '../../services/product.js';
import UserService from '../../services/user.js';

const queries = {
    getProductById: async (_: any, args: { id: number }) => {
        const product = await ProductService.getProductById(args.id);
        if (!product) {
            throw new Error('Product not found');
        }
        return product;
    },
    getProductsByOwner: async (_: any, __: any, context: { user?: { email: string } }) => {
        if (!context.user) {
            throw new Error('Not authenticated');
        }
        const owner = await UserService.getUserByEmail(context.user.email);
        if (!owner) {
            throw new Error('User not found');
        }
        return await ProductService.getProductsByOwner(owner.id);
    },

    getAllProducts: async () => {
        return await ProductService.getAllProducts();
    },

    getCategories: async () => {
        return await ProductService.getCategories();
    }

}
const mutations = {
    createProduct: async (_: any, args: { name: string; description: string; priceBuy: number; priceRent: number; rentOption: RentOption }, context: { user?: { email: string } }) => {
        if (!context.user) {
            throw new Error('Not authenticated');
        }
        const owner = await UserService.getUserByEmail(context.user.email);
        if (!owner) {
            throw new Error('User not found');
        }
        return await ProductService.createProduct({ ...args, ownerId: owner.id });
    },

    updateProduct: async (_: any, args: { id: number; name?: string; description?: string; priceBuy?: number; priceRent?: number; rentOption?: RentOption }, context: { user?: { email: string } }) => {
        if (!context.user) {
            throw new Error('Not authenticated');
        }
        const owner = await UserService.getUserByEmail(context.user.email);
        if (!owner) {
            throw new Error('User not found');
        }
        return await ProductService.updateProduct(args.id, { ...args, ownerId: owner.id });
    },

    deleteProduct: async (_: any, args: { id: number }, context: { user?: { email: string } }) => {
        if (!context.user) {
            throw new Error('Not authenticated');
        }
        const owner = await UserService.getUserByEmail(context.user.email);
        if (!owner) {
            throw new Error('User not found');
        }
        return await ProductService.deleteProduct(args.id);
    },

    createCategory: async (_: any, args: { name: string }, context: { user?: { email: string } }) => {
        if (!context.user) {
            throw new Error('Not authenticated');
        }
        const owner = await UserService.getUserByEmail(context.user.email);
        if (!owner) {
            throw new Error('User not found');
        }
        return await ProductService.createCategory(args.name);
    }
}

export const resolvers = { queries, mutations }
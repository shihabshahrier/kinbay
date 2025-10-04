import { RentOption, TransactionType } from '@prisma/client';
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
    },

    getUserTransactions: async (_: any, __: any, context: { user?: { email: string } }) => {
        if (!context.user) {
            throw new Error('Not authenticated');
        }
        const user = await UserService.getUserByEmail(context.user.email);
        if (!user) {
            throw new Error('User not found');
        }
        return await ProductService.getUserTransactions(user.id);
    },

    getTransactionById: async (_: any, args: { id: number }) => {
        const transaction = await ProductService.getTransactionById(args.id);
        if (!transaction) {
            throw new Error('Transaction not found');
        }
        return transaction;
    }

}
const mutations = {
    createProduct: async (_: any, args: { name: string; description: string; priceBuy?: number; priceRent?: number; rentOption?: RentOption; categoryIds?: number[] }, context: { user?: { email: string } }) => {
        if (!context.user) {
            throw new Error('Not authenticated');
        }
        const owner = await UserService.getUserByEmail(context.user.email);
        if (!owner) {
            throw new Error('User not found');
        }
        return await ProductService.createProduct({ ...args, ownerId: owner.id });
    },

    updateProduct: async (_: any, args: { id: number; name?: string; description?: string; priceBuy?: number; priceRent?: number; rentOption?: RentOption; categoryIds?: number[] }, context: { user?: { email: string } }) => {
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
    },

    buyProduct: async (_: any, args: { productId: string; price: number }, context: { user?: { email: string } }) => {
        if (!context.user) {
            throw new Error('Not authenticated');
        }
        const user = await UserService.getUserByEmail(context.user.email);
        if (!user) {
            throw new Error('User not found');
        }
        return await ProductService.createTransaction({
            productId: Number(args.productId),
            userId: user.id,
            type: TransactionType.BUY,
            price: args.price
        });
    },

    rentProduct: async (_: any, args: { productId: string; price: number; startDate: string; endDate: string }, context: { user?: { email: string } }) => {
        if (!context.user) {
            throw new Error('Not authenticated');
        }
        const user = await UserService.getUserByEmail(context.user.email);
        if (!user) {
            throw new Error('User not found');
        }
        return await ProductService.createTransaction({
            productId: Number(args.productId),
            userId: user.id,
            type: TransactionType.RENT,
            price: args.price,
            startDate: new Date(args.startDate),
            endDate: new Date(args.endDate)
        });
    },

    completeTransaction: async (_: any, args: { id: string }, context: { user?: { email: string } }) => {
        if (!context.user) {
            throw new Error('Not authenticated');
        }
        const user = await UserService.getUserByEmail(context.user.email);
        if (!user) {
            throw new Error('User not found');
        }
        return await ProductService.completeTransaction(Number(args.id), user.id);
    }
}

export const resolvers = {
    queries,
    mutations,
    Product: {
        categories: (parent: any) => {
            return parent.categories?.map((pc: any) => pc.category) || [];
        }
    }
}
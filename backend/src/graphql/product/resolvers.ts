import { RentOption, TransactionType } from '@prisma/client';
import ProductService from '../../services/product.js';
import UserService from '../../services/user.js';

const queries = {
    getProductById: async (_: any, args: { id: string }) => {
        const productId = parseInt(args.id, 10);
        if (isNaN(productId)) {
            throw new Error('Invalid product ID');
        }
        const product = await ProductService.getProductById(productId);
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

    getTransactionById: async (_: any, args: { id: string }) => {
        const transactionId = parseInt(args.id, 10);
        if (isNaN(transactionId)) {
            throw new Error('Invalid transaction ID');
        }
        const transaction = await ProductService.getTransactionById(transactionId);
        if (!transaction) {
            throw new Error('Transaction not found');
        }
        return transaction;
    },

    checkProductAvailability: async (_: any, args: { productId: string; startDate?: string; endDate?: string }) => {
        const productId = parseInt(args.productId, 10);
        if (isNaN(productId)) {
            throw new Error('Invalid product ID');
        }

        const startDate = args.startDate ? new Date(args.startDate) : undefined;
        const endDate = args.endDate ? new Date(args.endDate) : undefined;

        return await ProductService.checkProductAvailability(productId, startDate, endDate);
    },

    getPendingTransactionsForOwner: async (_: any, __: any, context: { user?: { email: string } }) => {
        if (!context.user) {
            throw new Error('Not authenticated');
        }
        const owner = await UserService.getUserByEmail(context.user.email);
        if (!owner) {
            throw new Error('User not found');
        }
        return await ProductService.getPendingTransactionsForOwner(owner.id);
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

    updateProduct: async (_: any, args: { id: string; name?: string; description?: string; priceBuy?: number; priceRent?: number; rentOption?: RentOption; categoryIds?: number[] }, context: { user?: { email: string } }) => {
        if (!context.user) {
            throw new Error('Not authenticated');
        }
        const productId = parseInt(args.id, 10);
        if (isNaN(productId)) {
            throw new Error('Invalid product ID');
        }
        const owner = await UserService.getUserByEmail(context.user.email);
        if (!owner) {
            throw new Error('User not found');
        }
        const { id, ...updateData } = args;
        return await ProductService.updateProduct(productId, { ...updateData, ownerId: owner.id });
    },

    deleteProduct: async (_: any, args: { id: string }, context: { user?: { email: string } }) => {
        if (!context.user) {
            throw new Error('Not authenticated');
        }
        const productId = parseInt(args.id, 10);
        if (isNaN(productId)) {
            throw new Error('Invalid product ID');
        }
        const owner = await UserService.getUserByEmail(context.user.email);
        if (!owner) {
            throw new Error('User not found');
        }
        return await ProductService.deleteProduct(productId);
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
        id: (parent: any) => String(parent.id),
        categories: (parent: any) => {
            if (!parent.categories || !Array.isArray(parent.categories)) {
                return [];
            }
            return parent.categories
                .filter((pc: any) => pc.category && pc.category.id && pc.category.name)
                .map((pc: any) => ({
                    id: String(pc.category.id),
                    name: pc.category.name
                }));
        }
    },
    Category: {
        id: (parent: any) => String(parent.id)
    },
    Transaction: {
        id: (parent: any) => String(parent.id)
    }
}
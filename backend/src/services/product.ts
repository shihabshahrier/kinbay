import { RentOption, TransactionType, TransactionStatus } from '@prisma/client';
import DB from '../lib/db.js';

export interface createProductPayload {
    name: string;
    description: string;
    priceBuy?: number;
    priceRent?: number;
    rentOption?: RentOption;
    ownerId: number;
    categoryIds?: (number | string)[];
}

export interface createTransactionPayload {
    productId: number;
    userId: number;
    type: TransactionType;
    price: number;
    startDate?: Date;
    endDate?: Date;
}

const rentOption = {
    "daily": 1,
    "weekly": 7,
    "monthly": 30
}


class ProductService {
    public static async createProduct(payload: createProductPayload) {
        const { name, description, priceBuy, priceRent, rentOption, ownerId, categoryIds } = payload
        return await DB.product.create({
            data: {
                name,
                description,
                priceBuy: priceBuy || null,
                priceRent: priceRent || null,
                rentOption: rentOption || null,
                ownerId,
                categories: {
                    create: categoryIds ? categoryIds.map(categoryId => ({
                        category: { connect: { id: Number(categoryId) } }
                    })) : []
                }
            },
            include: {
                categories: {
                    include: {
                        category: true
                    }
                },
                owner: true
            }
        });
    }
    public static async getProductById(id: number) {
        return await DB.product.findUnique({
            where: { id, deleted: false },
            include: {
                categories: {
                    include: {
                        category: true
                    }
                },
                owner: true
            }
        });
    }

    public static async getProductsByOwner(ownerId: number) {
        return await DB.product.findMany({
            where: { ownerId, deleted: false },
            include: {
                categories: {
                    include: {
                        category: true
                    }
                },
                owner: true
            }
        });
    }

    public static async getAllProducts() {
        // Get all products that haven't been deleted
        const products = await DB.product.findMany({
            where: { deleted: false },
            include: {
                categories: {
                    include: {
                        category: true
                    }
                },
                owner: true,
                transactions: {
                    where: {
                        type: TransactionType.BUY,
                        status: { in: [TransactionStatus.PENDING, TransactionStatus.COMPLETED] },
                        deleted: false
                    }
                }
            }
        });

        // Debug: Log products and their transactions
        console.log('All products with completed BUY transactions:');
        products.forEach(product => {
            console.log(`Product ${product.id} (${product.name}): ${product.transactions.length} completed transactions`);
        });

        // Filter out products that have been sold
        const availableProducts = products.filter(product => product.transactions.length === 0);
        console.log(`Returning ${availableProducts.length} available products out of ${products.length} total products`);

        return availableProducts;
    }

    public static async deleteProduct(id: number) {
        // Soft delete
        return await DB.product.update({
            where: { id },
            data: { deleted: true },
        });
    }

    public static async updateProduct(id: number, payload: Partial<createProductPayload>) {
        const { categoryIds, ...updateData } = payload;

        return await DB.product.update({
            where: { id: Number(id) },
            data: {
                ...updateData,
                priceBuy: updateData.priceBuy || null,
                priceRent: updateData.priceRent || null,
                rentOption: updateData.rentOption || null,
                ...(categoryIds && {
                    categories: {
                        deleteMany: {},
                        create: categoryIds.map(categoryId => ({
                            category: { connect: { id: Number(categoryId) } }
                        }))
                    }
                })
            },
            include: {
                categories: {
                    include: {
                        category: true
                    }
                },
                owner: true
            }
        });
    }

    public static async getCategories() {
        return await DB.category.findMany();
    }

    public static async createCategory(name: string) {
        const existingCategory = await DB.category.findUnique({
            where: { name },
        });
        if (existingCategory) {
            throw new Error('Category already exists');
        }
        return await DB.category.create({
            data: { name },
        });
    }

    // Transaction Methods
    public static async createTransaction(payload: createTransactionPayload) {
        const { productId, userId, type, price, startDate, endDate } = payload;

        // Check if product exists and is available
        const product = await DB.product.findUnique({
            where: { id: Number(productId), deleted: false }
        });

        if (!product) {
            throw new Error('Product not found or deleted');
        }

        if (product.ownerId === userId) {
            throw new Error('Cannot buy/rent your own product');
        }

        // Check if product has been sold (for both BUY and RENT transactions)
        const soldTransaction = await DB.transaction.findFirst({
            where: {
                productId,
                type: TransactionType.BUY,
                status: TransactionStatus.COMPLETED,
                deleted: false
            }
        });

        if (soldTransaction) {
            throw new Error('Product is no longer available - it has been sold');
        }

        // For rent transactions, check for overlapping rentals
        if (type === TransactionType.RENT && startDate && endDate) {
            const overlappingRentals = await DB.transaction.findMany({
                where: {
                    productId,
                    type: TransactionType.RENT,
                    status: { in: [TransactionStatus.PENDING, TransactionStatus.COMPLETED] },
                    deleted: false,
                    OR: [
                        {
                            AND: [
                                { startDate: { lte: startDate } },
                                { endDate: { gte: startDate } }
                            ]
                        },
                        {
                            AND: [
                                { startDate: { lte: endDate } },
                                { endDate: { gte: endDate } }
                            ]
                        },
                        {
                            AND: [
                                { startDate: { gte: startDate } },
                                { endDate: { lte: endDate } }
                            ]
                        }
                    ]
                }
            });

            if (overlappingRentals.length > 0) {
                throw new Error('Product is already rented during the selected time period');
            }
        }

        return await DB.transaction.create({
            data: {
                productId,
                userId,
                type,
                price,
                startDate: startDate || null,
                endDate: endDate || null,
                status: TransactionStatus.PENDING
            },
            include: {
                product: {
                    include: {
                        categories: {
                            include: {
                                category: true
                            }
                        },
                        owner: true
                    }
                },
                user: true
            }
        });
    }

    public static async getUserTransactions(userId: number) {
        const bought = await DB.transaction.findMany({
            where: {
                userId,
                type: TransactionType.BUY,
                deleted: false
            },
            include: {
                product: {
                    include: {
                        categories: {
                            include: {
                                category: true
                            }
                        },
                        owner: true
                    }
                },
                user: true
            }
        });

        const borrowed = await DB.transaction.findMany({
            where: {
                userId,
                type: TransactionType.RENT,
                deleted: false
            },
            include: {
                product: {
                    include: {
                        categories: {
                            include: {
                                category: true
                            }
                        },
                        owner: true
                    }
                },
                user: true
            }
        });

        const sold = await DB.transaction.findMany({
            where: {
                product: {
                    ownerId: userId
                },
                type: TransactionType.BUY,
                deleted: false
            },
            include: {
                product: {
                    include: {
                        categories: {
                            include: {
                                category: true
                            }
                        },
                        owner: true
                    }
                },
                user: true
            }
        });

        const lent = await DB.transaction.findMany({
            where: {
                product: {
                    ownerId: userId
                },
                type: TransactionType.RENT,
                deleted: false
            },
            include: {
                product: {
                    include: {
                        categories: {
                            include: {
                                category: true
                            }
                        },
                        owner: true
                    }
                },
                user: true
            }
        });

        return { bought, sold, borrowed, lent };
    }

    public static async getTransactionById(id: number) {
        return await DB.transaction.findUnique({
            where: { id, deleted: false },
            include: {
                product: {
                    include: {
                        categories: {
                            include: {
                                category: true
                            }
                        },
                        owner: true
                    }
                },
                user: true
            }
        });
    }

    public static async completeTransaction(id: number, userId: number) {
        const transaction = await DB.transaction.findUnique({
            where: { id: Number(id), deleted: false },
            include: { product: true }
        });

        if (!transaction) {
            throw new Error('Transaction not found');
        }

        if (transaction.product.ownerId !== userId) {
            throw new Error('Only product owner can complete transactions');
        }

        return await DB.transaction.update({
            where: { id },
            data: { status: TransactionStatus.COMPLETED },
            include: {
                product: {
                    include: {
                        categories: {
                            include: {
                                category: true
                            }
                        },
                        owner: true
                    }
                },
                user: true
            }
        });
    }

    // Check if a product is available for purchase or rental
    public static async checkProductAvailability(productId: number, startDate?: Date, endDate?: Date) {
        const product = await DB.product.findUnique({
            where: { id: Number(productId), deleted: false }
        });

        if (!product) {
            return { available: false, reason: 'Product not found or deleted' };
        }

        // Check if product has been sold
        const soldTransaction = await DB.transaction.findFirst({
            where: {
                productId,
                type: TransactionType.BUY,
                status: TransactionStatus.COMPLETED,
                deleted: false
            }
        });

        if (soldTransaction) {
            return { available: false, reason: 'Product has been sold' };
        }

        // For rental checks, verify no overlapping rentals exist
        if (startDate && endDate) {
            const overlappingRentals = await DB.transaction.findMany({
                where: {
                    productId,
                    type: TransactionType.RENT,
                    status: TransactionStatus.COMPLETED,
                    deleted: false,
                    OR: [
                        {
                            AND: [
                                { startDate: { lte: startDate } },
                                { endDate: { gte: startDate } }
                            ]
                        },
                        {
                            AND: [
                                { startDate: { lte: endDate } },
                                { endDate: { gte: endDate } }
                            ]
                        },
                        {
                            AND: [
                                { startDate: { gte: startDate } },
                                { endDate: { lte: endDate } }
                            ]
                        }
                    ]
                }
            });

            if (overlappingRentals.length > 0) {
                return {
                    available: false,
                    reason: 'Product is already rented during the selected time period',
                    conflictingRentals: overlappingRentals
                };
            }
        }

        return { available: true, reason: 'Product is available' };
    }

    // Get pending transactions for products owned by a user (for approval)
    public static async getPendingTransactionsForOwner(ownerId: number) {
        return await DB.transaction.findMany({
            where: {
                product: {
                    ownerId: ownerId
                },
                status: TransactionStatus.PENDING,
                deleted: false
            },
            include: {
                product: {
                    include: {
                        categories: {
                            include: {
                                category: true
                            }
                        },
                        owner: true
                    }
                },
                user: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    }

}

export default ProductService;
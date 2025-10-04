import { RentOption } from '@prisma/client';
import DB from '../lib/db.js';

export interface createProductPayload {
    name: string;
    description: string;
    priceBuy: number;
    priceRent: number;
    rentOption: RentOption;
    ownerId: number;
    categoryIds?: (number | string)[];
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
                priceBuy,
                priceRent,
                rentOption,
                ownerId,
                categories: {
                    create: categoryIds ? categoryIds.map(categoryId => ({
                        category: { connect: { id: Number(categoryId) } }
                    })) : []
                }
            }
        });
    }
    public static async getProductById(id: number) {
        return await DB.product.findUnique({
            where: { id },
            include: {
                categories: {
                    include: {
                        category: true
                    }
                }
            }
        });
    }

    public static async getProductsByOwner(ownerId: number) {
        return await DB.product.findMany({
            where: { ownerId },
            include: {
                categories: {
                    include: {
                        category: true
                    }
                }
            }
        });
    }

    public static async getAllProducts() {
        return await DB.product.findMany({
            include: {
                categories: {
                    include: {
                        category: true
                    }
                }
            }
        });
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
                ...(categoryIds && {
                    categories: {
                        deleteMany: {},
                        create: categoryIds.map(categoryId => ({
                            category: { connect: { id: Number(categoryId) } }
                        }))
                    }
                })
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

}

export default ProductService;
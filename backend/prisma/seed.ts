import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seeding...');

    // Seed Categories
    console.log('📂 Creating categories...');
    const categories = [
        'ELECTRONICS',
        'FURNITURE',
        'HOME_APPLIANCES',
        'SPORTING_GOODS',
        'OUTDOOR',
        'TOYS',
        'BOOKS',
        'CLOTHING',
        'AUTOMOTIVE',
        'TOOLS'
    ];

    const createdCategories = [];
    for (const categoryName of categories) {
        const existingCategory = await prisma.category.findUnique({
            where: { name: categoryName }
        });

        if (!existingCategory) {
            const category = await prisma.category.create({
                data: { name: categoryName }
            });
            createdCategories.push(category);
            console.log(`   ✓ Created category: ${categoryName}`);
        } else {
            createdCategories.push(existingCategory);
            console.log(`   → Category already exists: ${categoryName}`);
        }
    }

    // Seed Users
    console.log('👥 Creating sample users...');
    const users = [
        {
            email: 'john.doe@example.com',
            firstname: 'John',
            lastname: 'Doe',
            password: 'password123'
        },
        {
            email: 'jane.smith@example.com',
            firstname: 'Jane',
            lastname: 'Smith',
            password: 'password123'
        },
        {
            email: 'mike.wilson@example.com',
            firstname: 'Mike',
            lastname: 'Wilson',
            password: 'password123'
        },
        {
            email: 'sarah.brown@example.com',
            firstname: 'Sarah',
            lastname: 'Brown',
            password: 'password123'
        }
    ];

    const createdUsers = [];
    for (const userData of users) {
        const existingUser = await prisma.user.findUnique({
            where: { email: userData.email }
        });

        if (!existingUser) {
            const hashedPassword = await bcrypt.hash(userData.password, 10);
            const salt = await bcrypt.genSalt(10); // Generate salt for the user
            const user = await prisma.user.create({
                data: {
                    email: userData.email,
                    firstname: userData.firstname,
                    lastname: userData.lastname,
                    password: hashedPassword,
                    salt: salt
                }
            });
            createdUsers.push(user);
            console.log(`   ✓ Created user: ${userData.firstname} ${userData.lastname} (${userData.email})`);
        } else {
            createdUsers.push(existingUser);
            console.log(`   → User already exists: ${userData.email}`);
        }
    }

    // Seed Products
    console.log('🛍️ Creating sample products...');
    const sampleProducts = [
        {
            name: 'MacBook Pro 16"',
            description: 'Apple MacBook Pro with M3 chip, perfect for professional work and creative tasks.',
            priceBuy: 2499,
            priceRent: 150,
            categoryName: 'ELECTRONICS',
            userIndex: 0
        },
        {
            name: 'Modern Office Desk',
            description: 'Spacious wooden desk with built-in drawers, perfect for home office setup.',
            priceBuy: 450,
            priceRent: 30,
            categoryName: 'FURNITURE',
            userIndex: 1
        },
        {
            name: 'KitchenAid Stand Mixer',
            description: 'Professional-grade stand mixer for all your baking needs.',
            priceBuy: 380,
            priceRent: 25,
            categoryName: 'HOME_APPLIANCES',
            userIndex: 0
        },
        {
            name: 'Mountain Bike',
            description: 'High-quality mountain bike with 21-speed gear system, perfect for trails.',
            priceBuy: 750,
            priceRent: 40,
            categoryName: 'SPORTING_GOODS',
            userIndex: 2
        },
        {
            name: 'Camping Tent (4-person)',
            description: 'Waterproof camping tent that comfortably sleeps 4 people.',
            priceBuy: 200,
            priceRent: 15,
            categoryName: 'OUTDOOR',
            userIndex: 1
        },
        {
            name: 'LEGO Creator Set',
            description: 'Large LEGO Creator set with over 1000 pieces, great for kids and adults.',
            priceBuy: 120,
            priceRent: 8,
            categoryName: 'TOYS',
            userIndex: 3
        },
        {
            name: 'Programming Books Collection',
            description: 'Complete collection of modern programming books including React, Node.js, and TypeScript.',
            priceBuy: 200,
            priceRent: 12,
            categoryName: 'BOOKS',
            userIndex: 2
        },
        {
            name: 'Winter Jacket',
            description: 'High-quality winter jacket with down insulation, size L.',
            priceBuy: 180,
            priceRent: 10,
            categoryName: 'CLOTHING',
            userIndex: 3
        },
        {
            name: 'Cordless Drill Set',
            description: 'Professional cordless drill with complete bit set and carrying case.',
            priceBuy: 150,
            priceRent: 12,
            categoryName: 'TOOLS',
            userIndex: 1
        },
        {
            name: 'Gaming Chair',
            description: 'Ergonomic gaming chair with lumbar support and adjustable height.',
            priceBuy: 300,
            priceRent: 20,
            categoryName: 'FURNITURE',
            userIndex: 0
        }
    ];

    for (const productData of sampleProducts) {
        const category = createdCategories.find(c => c.name === productData.categoryName);
        const user = createdUsers[productData.userIndex];

        if (category && user) {
            const existingProduct = await prisma.product.findFirst({
                where: {
                    name: productData.name,
                    ownerId: user.id
                }
            });

            if (!existingProduct) {
                // Create the product first
                const product = await prisma.product.create({
                    data: {
                        name: productData.name,
                        description: productData.description,
                        priceBuy: productData.priceBuy,
                        priceRent: productData.priceRent,
                        ownerId: user.id,
                        rentOption: 'DAILY' // Set a valid RentOption enum value
                    }
                });

                // Create the product-category relationship
                await prisma.productCategory.create({
                    data: {
                        productId: product.id,
                        categoryId: category.id
                    }
                });

                console.log(`   ✓ Created product: ${productData.name} by ${user.firstname} ${user.lastname}`);
            } else {
                console.log(`   → Product already exists: ${productData.name}`);
            }
        }
    }

    console.log('🎉 Database seeded successfully!');
    console.log(`📊 Summary:`);
    console.log(`   • ${createdCategories.length} categories`);
    console.log(`   • ${createdUsers.length} users`);
    console.log(`   • ${sampleProducts.length} products`);
}

main()
    .catch((e) => {
        console.error('Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
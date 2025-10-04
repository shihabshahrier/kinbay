import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

beforeAll(async () => {
    // Connect to test database
    await prisma.$connect();
});

afterAll(async () => {
    // Clean up and disconnect
    await prisma.$disconnect();
});

beforeEach(async () => {
    // Clean up database before each test
    await prisma.transaction.deleteMany({});
    await prisma.productCategory.deleteMany({});
    await prisma.product.deleteMany({});
    await prisma.category.deleteMany({});
    await prisma.user.deleteMany({});
});

export { prisma };
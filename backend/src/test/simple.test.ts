import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('UserService', () => {
    beforeEach(async () => {
        // Clean up database before each test
        await prisma.transaction.deleteMany({});
        await prisma.productCategory.deleteMany({});
        await prisma.product.deleteMany({});
        await prisma.user.deleteMany({});
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    test('should create a new user', async () => {
        const user = await prisma.user.create({
            data: {
                email: 'test@example.com',
                firstname: 'Test',
                lastname: 'User',
                address: '123 Test St',
                phone: '123-456-7890',
                password: 'hashedpassword',
                salt: 'salt123'
            }
        });

        expect(user).toBeDefined();
        expect(user.email).toBe('test@example.com');
    });
});
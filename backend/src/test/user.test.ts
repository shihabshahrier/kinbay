import UserService, { createUserPayload } from '../services/user.js';
import { prisma } from './setup.js';

describe('UserService', () => {
    const testUser: createUserPayload = {
        email: 'test@example.com',
        firstname: 'Test',
        lastname: 'User',
        address: '123 Test St',
        phone: '123-456-7890',
        password: 'testpassword'
    };

    beforeEach(async () => {
        await prisma.user.deleteMany({});
    });

    describe('createUser', () => {
        test('should create a new user with valid data', async () => {
            const user = await UserService.createUser(testUser);

            expect(user).toBeDefined();
            expect(user.email).toBe(testUser.email);
            expect(user.firstname).toBe(testUser.firstname);
            expect(user.lastname).toBe(testUser.lastname);
            expect(user.address).toBe(testUser.address);
            expect(user.phone).toBe(testUser.phone);
            expect(user.password).not.toBe(testUser.password); // should be hashed
            expect(user.salt).toBeDefined();
        });

        test('should throw error when creating user with duplicate email', async () => {
            await UserService.createUser(testUser);

            await expect(UserService.createUser(testUser)).rejects.toThrow('User already exists');
        });

        test('should create user with minimal required fields', async () => {
            const minimalUser: createUserPayload = {
                email: 'minimal@example.com',
                firstname: 'Minimal',
                password: 'password'
            };

            const user = await UserService.createUser(minimalUser);

            expect(user).toBeDefined();
            expect(user.email).toBe(minimalUser.email);
            expect(user.lastname).toBe('');
            expect(user.address).toBe('');
            expect(user.phone).toBe('');
        });
    });

    describe('getUserByEmail', () => {
        test('should return user when found', async () => {
            await UserService.createUser(testUser);

            const user = await UserService.getUserByEmail(testUser.email);

            expect(user).toBeDefined();
            expect(user?.email).toBe(testUser.email);
        });

        test('should return null when user not found', async () => {
            const user = await UserService.getUserByEmail('nonexistent@example.com');

            expect(user).toBeNull();
        });
    });

    describe('getUserToken', () => {
        test('should return token for valid credentials', async () => {
            await UserService.createUser(testUser);

            const token = await UserService.getUserToken({
                email: testUser.email,
                password: testUser.password
            });

            expect(token).toBeDefined();
            expect(typeof token).toBe('string');
        });

        test('should throw error for invalid email', async () => {
            await expect(UserService.getUserToken({
                email: 'invalid@example.com',
                password: testUser.password
            })).rejects.toThrow('User not found');
        });

        test('should throw error for invalid password', async () => {
            await UserService.createUser(testUser);

            await expect(UserService.getUserToken({
                email: testUser.email,
                password: 'wrongpassword'
            })).rejects.toThrow('Invalid password');
        });
    });

    describe('updateUser', () => {
        test('should update user with new data', async () => {
            await UserService.createUser(testUser);

            const updatedUser = await UserService.updateUser(testUser.email, {
                firstname: 'UpdatedName',
                address: '456 New St'
            });

            expect(updatedUser.firstname).toBe('UpdatedName');
            expect(updatedUser.address).toBe('456 New St');
            expect(updatedUser.email).toBe(testUser.email); // should remain same
        });

        test('should update password and salt when password provided', async () => {
            await UserService.createUser(testUser);
            const originalUser = await UserService.getUserByEmail(testUser.email);

            const updatedUser = await UserService.updateUser(testUser.email, {
                password: 'newpassword'
            });

            expect(updatedUser.password).not.toBe(originalUser?.password);
            expect(updatedUser.salt).not.toBe(originalUser?.salt);
        });
    });
});
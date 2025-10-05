// Enums as const assertions
export const RentOption = {
    DAILY: 'DAILY',
    WEEKLY: 'WEEKLY',
    MONTHLY: 'MONTHLY'
} as const;

export type RentOption = typeof RentOption[keyof typeof RentOption];

export const TransactionType = {
    BUY: 'BUY',
    RENT: 'RENT'
} as const;

export type TransactionType = typeof TransactionType[keyof typeof TransactionType];

export const TransactionStatus = {
    PENDING: 'PENDING',
    COMPLETED: 'COMPLETED'
} as const;

export type TransactionStatus = typeof TransactionStatus[keyof typeof TransactionStatus];

// User Types
export interface User {
    id: string;
    email: string;
    firstname: string;
    lastname: string;
    address: string;
    phone: string;
}

export interface CreateUserInput {
    email: string;
    firstname: string;
    lastname: string;
    address: string;
    phone: string;
    password: string;
}

export interface LoginInput {
    email: string;
    password: string;
}

// Category Types
export interface Category {
    id: string;
    name: string;
}

// Product Types
export interface Product {
    id: string;
    name: string;
    description: string;
    priceBuy?: number;
    priceRent?: number;
    rentOption?: RentOption;
    ownerId: string;
    owner: User;
    categories: Category[];
    createdAt: string;
    updatedAt: string;
}

export interface CreateProductInput {
    name: string;
    description: string;
    priceBuy?: number;
    priceRent?: number;
    rentOption?: RentOption;
    categoryIds?: string[];
}

export interface UpdateProductInput {
    id: string;
    name?: string;
    description?: string;
    priceBuy?: number;
    priceRent?: number;
    rentOption?: RentOption;
    categoryIds?: string[];
}

// Transaction Types
export interface Transaction {
    id: string;
    product: Product;
    productId: string;
    user: User;
    userId: string;
    type: TransactionType;
    status: TransactionStatus;
    price: number;
    startDate?: string;
    endDate?: string;
    createdAt: string;
    updatedAt: string;
}

export interface UserTransactions {
    bought: Transaction[];
    sold: Transaction[];
    borrowed: Transaction[];
    lent: Transaction[];
}

export interface BuyProductInput {
    productId: string;
    price: number;
}

export interface RentProductInput {
    productId: string;
    price: number;
    startDate: string;
    endDate: string;
}

// Form Types
export interface LoginFormData {
    email: string;
    password: string;
}

export interface RegisterFormData {
    email: string;
    firstname: string;
    lastname: string;
    address: string;
    phone: string;
    password: string;
    confirmPassword: string;
}

export interface ProductFormData {
    name: string;
    description: string;
    priceBuy: number | undefined;
    priceRent: number | undefined;
    rentOption: RentOption | undefined;
    categoryIds: string[];
}

export interface RentFormData {
    startDate: Date | null;
    duration: number;
    rentOption: RentOption;
}

// API Response Types
export interface AuthResponse {
    token: string;
}

export interface ApiError {
    message: string;
    code?: string;
}
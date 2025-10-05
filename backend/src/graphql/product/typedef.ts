export const typeDefs = `#graphql
    type Product {
        id: ID!
        name: String!
        description: String!
        priceBuy: Float
        priceRent: Float
        rentOption: RentOption
        ownerId: Int!
        owner: User!
        categories: [Category]!
        createdAt: String!
        updatedAt: String!
    }

    enum RentOption {
        DAILY
        WEEKLY
        MONTHLY
    }

    type Category {
        id: ID!
        name: String!
    }

    type Transaction {
        id: ID!
        product: Product!
        productId: Int!
        user: User!
        userId: Int!
        type: TransactionType!
        status: TransactionStatus!
        price: Float!
        startDate: String
        endDate: String
        createdAt: String!
        updatedAt: String!
    }

    enum TransactionType {
        BUY
        RENT
    }

    enum TransactionStatus {
        PENDING
        COMPLETED
    }

    type UserTransactions {
        bought: [Transaction]!
        sold: [Transaction]!
        borrowed: [Transaction]!
        lent: [Transaction]!
    }

    type ProductAvailability {
        available: Boolean!
        reason: String!
        conflictingRentals: [Transaction]
    }
`

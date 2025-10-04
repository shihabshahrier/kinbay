export const typeDefs = `#graphql
    type Product {
        id: ID!
        name: String!
        description: String!
        priceBuy: Float!
        priceRent: Float!
        rentOption: RentOption!
        ownerId: Int!
        categories: [Category]!
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
`

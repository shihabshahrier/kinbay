export const mutations = `#graphql
    createProduct(
        name: String!
        description: String!
        priceBuy: Float
        priceRent: Float
        rentOption: RentOption
        categoryIds: [ID!]
    ): Product

    updateProduct(
        id: ID!
        name: String
        description: String
        priceBuy: Float
        priceRent: Float
        rentOption: RentOption
        categoryIds: [ID!]
    ): Product

    deleteProduct(id: ID!): Product

    createCategory(name: String!): Category

    buyProduct(productId: ID!, price: Float!): Transaction

    rentProduct(
        productId: ID!
        price: Float!
        startDate: String!
        endDate: String!
    ): Transaction

    completeTransaction(id: ID!): Transaction
`;
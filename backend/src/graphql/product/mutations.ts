export const mutations = `#graphql
    createProduct(
        name: String!
        description: String!
        priceBuy: Float!
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
    ): Product

    deleteProduct(id: ID!): Product

    createCategory(name: String!): Category
`;
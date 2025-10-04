export const queries = `#graphql
    getProductById(id: ID!): Product
    getProductsByOwner(ownerId: Int!): [Product]
    getAllProducts: [Product]
    getCategories: [Category]
`;
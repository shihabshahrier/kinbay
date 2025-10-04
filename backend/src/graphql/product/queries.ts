export const queries = `#graphql
    getProductById(id: ID!): Product
    getProductsByOwner: [Product]
    getAllProducts: [Product]
    getCategories: [Category]
    getUserTransactions: UserTransactions
    getTransactionById(id: ID!): Transaction
`;
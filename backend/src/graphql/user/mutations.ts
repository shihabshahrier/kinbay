export const mutations = `#graphql
    createUser(email: String!, firstname: String!, lastname: String!, address: String!, phone: String!, password: String!): String
    updateUser(email: String, firstname: String, lastname: String, address: String, phone: String, password: String): User
`;
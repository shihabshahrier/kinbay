export const mutations = `#graphql
    createUser(email: String!, firstname: String!, lastname: String!, address: String!, phone: String!, password: String!): String
    updateUser(email: String, firstname: String, lastname: String, address: String, phone: String, password: String): User
    
    # New 2-token authentication system
    loginUser(email: String!, password: String!): AuthTokens!
    refreshTokens(refreshToken: String!): AuthTokens!
    logoutUser(refreshToken: String!): Boolean!
    logoutAllDevices: Boolean!
`;
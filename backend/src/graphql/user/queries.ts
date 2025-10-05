export const queries = `#graphql
    getToken(email: String!, password: String!): String
    getCurrentUser: User
    getMyRefreshTokens: [RefreshTokenInfo!]!
`;
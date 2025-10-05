export const typeDefs = `#graphql
    type User {
        id: ID!
        email: String!
        firstname: String!
        lastname: String!
        address: String!
        phone: String!
    }
    
    type AuthTokens {
        accessToken: String!
        refreshToken: String!
    }
    
    type RefreshTokenInfo {
        id: ID!
        createdAt: String!
        expiresAt: String!
        isActive: Boolean!
    }
`
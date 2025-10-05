import { ApolloServer } from '@apollo/server';
import { User } from './user/index.js';
import { Product } from './product/index.js';

export async function createGraphQLServer() {
    const gqlServer = new ApolloServer({
        typeDefs: `
            ${User.typeDefs}
            ${Product.typeDefs}
            type Query {
                ${User.queries}
                ${Product.queries}
            }
            type Mutation {
                ${User.mutations}
                ${Product.mutations}
            }
        `,
        resolvers: {
            Query: {
                ...User.resolvers.queries,
                ...Product.resolvers.queries,
            },
            Mutation: {
                ...User.resolvers.mutations,
                ...Product.resolvers.mutations,
            },
            ...User.resolvers.User && { User: User.resolvers.User },
            ...Product.resolvers.Product && { Product: Product.resolvers.Product },
            ...Product.resolvers.Category && { Category: Product.resolvers.Category },
            ...Product.resolvers.Transaction && { Transaction: Product.resolvers.Transaction },
        },
    });

    await gqlServer.start();

    return gqlServer;
}
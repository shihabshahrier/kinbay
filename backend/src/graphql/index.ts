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
        },
    });

    await gqlServer.start();

    return gqlServer;
}
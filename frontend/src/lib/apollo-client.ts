import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

// HTTP link to GraphQL server
const httpLink = createHttpLink({
    uri: import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000/graphql',
});

// Authentication link to add JWT token to headers
const authLink = setContext((_, { headers }) => {
    const token = localStorage.getItem('token');
    return {
        headers: {
            ...headers,
            authorization: token ? `Bearer ${token}` : "",
        }
    };
});

// Apollo Client configuration
export const client = new ApolloClient({
    link: from([authLink, httpLink]),
    cache: new InMemoryCache({
        typePolicies: {
            Query: {
                fields: {
                    getAllProducts: {
                        merge(_, incoming) {
                            return incoming;
                        }
                    },
                    getUserTransactions: {
                        merge(_, incoming) {
                            return incoming;
                        }
                    }
                }
            }
        }
    }),
    defaultOptions: {
        watchQuery: {
            errorPolicy: 'all'
        },
        query: {
            errorPolicy: 'all'
        }
    }
});

// Helper function to handle authentication
export const isAuthenticated = (): boolean => {
    return !!localStorage.getItem('token');
};

export const logout = (): void => {
    localStorage.removeItem('token');
    client.resetStore();
};
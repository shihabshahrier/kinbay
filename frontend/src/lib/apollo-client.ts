import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { AuthService } from '../services/auth';

// HTTP link to GraphQL server
const httpLink = createHttpLink({
    uri: (import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000') + '/graphql',
    credentials: 'include', // Important for HTTP-only cookies
});

// Authentication link to add JWT token to headers
const authLink = setContext((_, { headers }) => {
    // Try new auth system first, fallback to legacy
    const token = AuthService.getAccessToken() || localStorage.getItem('token');
    return {
        headers: {
            ...headers,
            authorization: token ? `Bearer ${token}` : "",
        }
    };
});

// Simple error link - we'll handle token refresh in the auth context instead
const errorLink = onError(({ graphQLErrors, networkError }) => {
    if (graphQLErrors) {
        graphQLErrors.forEach((err) => {
            // If it's a token expiration error, we'll let the auth context handle it
            if (err.extensions?.code === 'TOKEN_EXPIRED') {
                // Token expired - auth context will handle refresh
            }
        });
    }

    if (networkError) {
        if ('statusCode' in networkError && networkError.statusCode === 401) {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('token');
        }
    }
});

// Enhanced Apollo Client configuration with proper cache policies
export const client = new ApolloClient({
    link: from([errorLink, authLink, httpLink]),
    cache: new InMemoryCache({
        typePolicies: {
            Query: {
                fields: {
                    // Cache policy for products - merge and avoid duplicates
                    getAllProducts: {
                        merge(_, incoming: unknown[]) {
                            return incoming;
                        }
                    },
                    // Cache policy for user transactions
                    getUserTransactions: {
                        merge(_, incoming: unknown[]) {
                            return incoming;
                        }
                    },
                    // Cache policy for pending transactions
                    getPendingTransactionsForOwner: {
                        merge(_, incoming: unknown[]) {
                            return incoming;
                        }
                    },
                    // Cache policy for user's own products
                    getProductsByOwner: {
                        merge(_, incoming: unknown[]) {
                            return incoming;
                        }
                    }
                }
            },
            Product: {
                // Ensure products are normalized by ID
                keyFields: ["id"],
                fields: {
                    categories: {
                        merge(_, incoming: unknown[]) {
                            return incoming;
                        }
                    }
                }
            },
            User: {
                keyFields: ["id"]
            },
            Transaction: {
                keyFields: ["id"]
            },
            Category: {
                keyFields: ["id"]
            }
        },
        // Add data ID from object to help with normalization
        dataIdFromObject(object: Record<string, unknown>) {
            if (object.__typename && object.id) {
                return `${object.__typename}:${object.id}`;
            }
            return undefined;
        }
    }),
    // Add default options for better cache behavior
    defaultOptions: {
        watchQuery: {
            errorPolicy: 'all',
            notifyOnNetworkStatusChange: true,
        },
        query: {
            errorPolicy: 'all',
        }
    },
    // Enable dev tools in development
    connectToDevTools: import.meta.env.DEV
});

// Helper function to handle authentication
export const isAuthenticated = (): boolean => {
    return !!localStorage.getItem('token');
};

export const logout = (): void => {
    localStorage.removeItem('token');
    client.resetStore();
};
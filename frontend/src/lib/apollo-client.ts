import { ApolloClient, InMemoryCache, createHttpLink, from } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { AuthService } from '../services/auth';

// Token refresh function
const refreshTokens = async (): Promise<{ accessToken: string; refreshToken: string } | null> => {
    try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
            throw new Error('No refresh token available');
        }

        const response = await fetch((import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000') + '/graphql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
                query: `
                    mutation RefreshTokens($refreshToken: String!) {
                        refreshTokens(refreshToken: $refreshToken) {
                            accessToken
                            refreshToken
                        }
                    }
                `,
                variables: { refreshToken }
            }),
        });

        const data = await response.json();

        if (data.errors || !data.data?.refreshTokens) {
            throw new Error(data.errors?.[0]?.message || 'Failed to refresh token');
        }

        const { accessToken, refreshToken: newRefreshToken } = data.data.refreshTokens;

        // Update stored tokens
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        return { accessToken, refreshToken: newRefreshToken };
    } catch (error) {
        console.error('Token refresh failed:', error);

        // Clear invalid tokens
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('token'); // Legacy cleanup

        // Redirect to login if we're not already there
        if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
            window.location.href = '/login';
        }

        return null;
    }
};

// HTTP link to GraphQL server
const httpLink = createHttpLink({
    uri: (import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000') + '/graphql',
    credentials: 'include', // Important for HTTP-only cookies
});

// Enhanced authentication link with token refresh
const authLink = setContext(async (_, { headers }) => {
    let token = AuthService.getAccessToken() || localStorage.getItem('token');

    // Check if token is expired and refresh if needed
    if (token && token !== localStorage.getItem('token')) { // New auth system token
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const currentTime = Date.now() / 1000;

            // If token expires in less than 2 minutes, refresh it proactively
            if (payload.exp && payload.exp - currentTime < 120) {
                console.log('Access token expiring soon, refreshing...');
                const refreshResult = await refreshTokens();
                if (refreshResult) {
                    token = refreshResult.accessToken;
                }
            }
        } catch (error) {
            console.error('Error checking token expiration:', error);
            // If we can't decode the token, try to refresh it
            const refreshResult = await refreshTokens();
            if (refreshResult) {
                token = refreshResult.accessToken;
            }
        }
    }

    return {
        headers: {
            ...headers,
            authorization: token ? `Bearer ${token}` : "",
        }
    };
});

// Enhanced error link with automatic retry on authentication errors
const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
    if (graphQLErrors) {
        graphQLErrors.forEach((err) => {
            console.error(`GraphQL error: ${err.message}`);

            // Handle authentication errors
            if (err.extensions?.code === 'UNAUTHENTICATED' ||
                err.message.includes('jwt') ||
                err.message.includes('token') ||
                err.message.includes('Not authenticated')) {

                console.log('Authentication error detected, attempting token refresh...');

                // Try to refresh token and retry the operation
                refreshTokens().then(result => {
                    if (result) {
                        console.log('Token refreshed successfully, retrying operation...');
                        // The operation will be retried automatically with the new token
                        return forward(operation);
                    }
                });
            }
        });
    }

    if (networkError) {
        console.error(`Network error: ${networkError}`);

        // Handle 401 Unauthorized
        if ('statusCode' in networkError && networkError.statusCode === 401) {
            console.log('401 Unauthorized, attempting token refresh...');

            refreshTokens().then(result => {
                if (result) {
                    console.log('Token refreshed successfully, retrying operation...');
                    return forward(operation);
                }
            });
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
                    // Cache policy for user transactions - handle nested structure
                    getUserTransactions: {
                        merge(existing, incoming) {
                            // Handle the nested structure: { bought: [], sold: [], borrowed: [], lent: [] }
                            if (!existing) return incoming;

                            return {
                                bought: incoming?.bought || existing?.bought || [],
                                sold: incoming?.sold || existing?.sold || [],
                                borrowed: incoming?.borrowed || existing?.borrowed || [],
                                lent: incoming?.lent || existing?.lent || []
                            };
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
        // Enhanced data ID from object to handle missing id gracefully
        dataIdFromObject(object: Record<string, unknown>) {
            // Only normalize objects that have both __typename and id
            if (object.__typename && object.id) {
                return `${object.__typename}:${object.id}`;
            }
            // For objects without id (like partial User objects), don't normalize
            // This prevents cache normalization errors
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
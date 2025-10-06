export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}

export class AuthService {
    private static readonly ACCESS_TOKEN_KEY = 'accessToken';
    private static readonly REFRESH_TOKEN_KEY = 'refreshToken';

    // Login with GraphQL mutation
    static async login(email: string, password: string): Promise<AuthTokens> {
        const response = await fetch((import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000') + '/graphql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
                query: `
                    mutation LoginUser($email: String!, $password: String!) {
                        loginUser(email: $email, password: $password) {
                            accessToken
                            refreshToken
                        }
                    }
                `,
                variables: { email, password }
            }),
        });

        const result = await response.json();

        if (result.errors) {
            throw new Error(result.errors[0].message);
        }

        const { accessToken, refreshToken } = result.data.loginUser;

        // Store both tokens in localStorage
        localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
        localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);

        return { accessToken, refreshToken };
    }

    // Refresh access token using GraphQL
    static async refreshToken(): Promise<string | null> {
        try {
            const refreshToken = localStorage.getItem(this.REFRESH_TOKEN_KEY);
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

            const result = await response.json();

            if (result.errors) {
                throw new Error(result.errors[0].message);
            }

            const { accessToken, refreshToken: newRefreshToken } = result.data.refreshTokens;
            localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
            localStorage.setItem(this.REFRESH_TOKEN_KEY, newRefreshToken);

            return accessToken;
        } catch (error) {
            console.error('Token refresh failed:', error);
            // Clear invalid tokens
            this.clearTokens();
            return null;
        }
    }

    // Logout using GraphQL
    static async logout(): Promise<void> {
        try {
            const refreshToken = localStorage.getItem(this.REFRESH_TOKEN_KEY);

            if (refreshToken) {
                await fetch((import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000') + '/graphql', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify({
                        query: `
                            mutation LogoutUser($refreshToken: String!) {
                                logoutUser(refreshToken: $refreshToken)
                            }
                        `,
                        variables: { refreshToken }
                    }),
                });
            }
        } catch (error) {
            console.error('Logout request failed:', error);
        } finally {
            // Always clear local storage
            this.clearTokens();
        }
    }

    // Clear all tokens
    static clearTokens(): void {
        localStorage.removeItem(this.ACCESS_TOKEN_KEY);
        localStorage.removeItem(this.REFRESH_TOKEN_KEY);
        localStorage.removeItem('token'); // Legacy token cleanup
    }

    // Check if user is authenticated
    static isAuthenticated(): boolean {
        return !!localStorage.getItem(this.ACCESS_TOKEN_KEY) && !!localStorage.getItem(this.REFRESH_TOKEN_KEY);
    }

    // Get access token
    static getAccessToken(): string | null {
        return localStorage.getItem(this.ACCESS_TOKEN_KEY);
    }

    // Get refresh token
    static getRefreshToken(): string | null {
        return localStorage.getItem(this.REFRESH_TOKEN_KEY);
    }

    // Legacy login support (for backward compatibility)
    static async loginLegacy(email: string, password: string): Promise<string> {
        const response = await fetch(import.meta.env.VITE_BACKEND_URL + '/graphql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: `
          query GetToken($email: String!, $password: String!) {
            getToken(email: $email, password: $password)
          }
        `,
                variables: { email, password },
            }),
        });

        const result = await response.json();

        if (result.errors) {
            throw new Error(result.errors[0].message);
        }

        const token = result.data.getToken;
        localStorage.setItem('token', token); // Legacy key
        localStorage.setItem(this.ACCESS_TOKEN_KEY, token); // Also store in new key

        return token;
    }

    // Check if we should use new auth system
    static shouldUseNewAuth(): boolean {
        return import.meta.env.VITE_USE_NEW_AUTH === 'true' || true; // Default to new auth
    }
}
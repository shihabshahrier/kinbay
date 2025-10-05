export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}

export class AuthService {
    private static readonly ACCESS_TOKEN_KEY = 'accessToken';

    // Login with secure 2-token system (HTTP-only cookies)
    static async login(email: string, password: string): Promise<AuthTokens> {
        const response = await fetch(import.meta.env.VITE_BACKEND_URL + '/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include', // Important for cookies
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Login failed');
        }

        const result = await response.json();
        const accessToken = result.accessToken;

        // Store access token in localStorage
        localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);

        // Refresh token is automatically stored in HTTP-only cookie by server
        // It's not accessible to JavaScript (secure against XSS)

        return {
            accessToken,
            refreshToken: '[SECURE_HTTP_ONLY_COOKIE]' // Placeholder - actual token is in cookie
        };
    }

    // Refresh access token
    static async refreshToken(): Promise<string | null> {
        try {
            const response = await fetch(import.meta.env.VITE_BACKEND_URL + '/auth/refresh', {
                method: 'POST',
                credentials: 'include', // Send HTTP-only cookie
            });

            if (response.ok) {
                const { accessToken } = await response.json();
                localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
                return accessToken;
            }
        } catch {
            // Token refresh failed
        }

        return null;
    }

    // Logout
    static async logout(): Promise<void> {
        try {
            await fetch(import.meta.env.VITE_BACKEND_URL + '/auth/logout', {
                method: 'POST',
                credentials: 'include',
            });
        } catch {
            // Logout request failed
        } finally {
            // Always clear local storage
            localStorage.removeItem(this.ACCESS_TOKEN_KEY);
            localStorage.removeItem('token'); // Legacy token cleanup
        }
    }

    // Check if user is authenticated
    static isAuthenticated(): boolean {
        return !!localStorage.getItem(this.ACCESS_TOKEN_KEY);
    }

    // Get access token
    static getAccessToken(): string | null {
        return localStorage.getItem(this.ACCESS_TOKEN_KEY);
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
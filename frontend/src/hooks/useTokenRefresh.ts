import { useEffect } from 'react';
import { AuthService } from '../services/auth';

export function useTokenRefresh() {
    const useNewAuth = AuthService.shouldUseNewAuth();

    useEffect(() => {
        // Only set up auto-refresh if using new auth system
        if (!useNewAuth) {
            return;
        }

        // Set up automatic token refresh before expiration
        const refreshInterval = setInterval(async () => {
            if (AuthService.isAuthenticated()) {
                try {
                    await AuthService.refreshToken();
                } catch {
                    console.error('Automatic token refresh failed');
                }
            }
        }, 14 * 60 * 1000); // Refresh every 14 minutes (before 15min expiry)

        return () => clearInterval(refreshInterval);
    }, [useNewAuth]);
}
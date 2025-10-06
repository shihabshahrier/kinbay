// Cache error handling utilities
export const handleCacheError = (error: any) => {
    console.warn('Apollo Cache Error:', error);

    // Check if it's a missing field error
    if (error.message?.includes('missing field') || error.message?.includes('id')) {
        console.warn('Cache normalization issue detected. Consider checking GraphQL fragments.');
        return true; // Handled
    }

    return false; // Not handled
};

// Safe cache write function
export const safeWriteFragment = (cache: any, options: any) => {
    try {
        return cache.writeFragment(options);
    } catch (error) {
        if (handleCacheError(error)) {
            return null; // Silently ignore known cache issues
        }
        throw error; // Re-throw unknown errors
    }
};

// Safe cache modify function
export const safeCacheModify = (cache: any, options: any) => {
    try {
        return cache.modify(options);
    } catch (error) {
        if (handleCacheError(error)) {
            return null; // Silently ignore known cache issues
        }
        throw error; // Re-throw unknown errors
    }
};
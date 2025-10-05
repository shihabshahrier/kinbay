/**
 * Utility function to format dates consistently across the application
 * Handles PostgreSQL timestamp format and various other date formats
 */
export const formatDate = (dateString: string | null | undefined): string => {
    // Handle null, undefined, or string representations of null
    if (!dateString ||
        dateString === 'null' ||
        dateString === 'undefined' ||
        dateString.trim() === '') {
        return 'N/A';
    }

    try {
        let date: Date;

        // Check if it's a timestamp string (all digits)
        if (/^\d+$/.test(dateString)) {
            // Convert timestamp string to number and create date
            const timestamp = parseInt(dateString, 10);
            date = new Date(timestamp);
        } else {
            // Handle ISO date strings and other formats
            date = new Date(dateString);
        }

        // Check if the date is valid
        if (isNaN(date.getTime())) {
            return 'N/A';
        }

        // Return formatted date
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    } catch {
        return 'N/A';
    }
};

/**
 * Format date with time
 */
export const formatDateTime = (dateString: string | null | undefined): string => {
    if (!dateString ||
        dateString === 'null' ||
        dateString === 'undefined' ||
        dateString.trim() === '') {
        return 'N/A';
    }

    try {
        let date: Date;

        // Check if it's a timestamp string (all digits)
        if (/^\d+$/.test(dateString)) {
            const timestamp = parseInt(dateString, 10);
            date = new Date(timestamp);
        } else {
            date = new Date(dateString);
        }

        if (isNaN(date.getTime())) {
            return 'N/A';
        }

        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch {
        return 'N/A';
    }
};

/**
 * Format date range for rentals
 */
export const formatDateRange = (startDate: string | null | undefined, endDate: string | null | undefined): string => {
    const start = formatDate(startDate);
    const end = formatDate(endDate);

    if (start === 'N/A' || end === 'N/A') {
        return 'N/A';
    }

    return `${start} - ${end}`;
};
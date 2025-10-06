/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                'poppins': ['Poppins', 'sans-serif'],
                'inter': ['Inter', 'sans-serif'],
            },
            colors: {
                'ebay-red': '#E53238',
                'ebay-blue': '#0064D2',
                'ebay-yellow': '#F5AF02',
                'ebay-green': '#86B817',
            },
            backdropBlur: {
                xs: '2px',
            },
        },
    },
    plugins: [],
}


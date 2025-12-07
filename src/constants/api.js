// src/constants/api.js
// IMPORTANT: Replace with your local network IP for development
// Find your IP: macOS: System Settings > Network
//               Terminal: ipconfig getifaddr en0

// For iOS Simulator, you can use localhost
// For Android Emulator, use 10.0.2.2
// For physical devices, use your machine's IP address

export const API_BASE_URL = 'http://localhost:5001/api';

// Colors matching the web app's Tailwind config
export const COLORS = {
    primary: {
        50: '#f0fdf4',
        100: '#dcfce7',
        500: '#22c55e',
        600: '#16a34a',
    },
    secondary: {
        50: '#faf5ff',
        100: '#f3e8ff',
        500: '#a855f7',
        600: '#9333ea',
    },
    accent: '#f59e0b',
    danger: '#ef4444',
    gray: {
        50: '#f9fafb',
        100: '#f3f4f6',
        200: '#e5e7eb',
        300: '#d1d5db',
        500: '#6b7280',
        600: '#4b5563',
        700: '#374151',
        800: '#1f2937',
        900: '#111827',
    },
    white: '#ffffff',
    black: '#000000',
};

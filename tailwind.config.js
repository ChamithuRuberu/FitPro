module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#f8fafc', // Light gray background
        primary: '#3B82F6',
        secondary: '#10B981',
        accent: '#F59E0B',
        'dark-primary': '#1E40AF',
        'light-primary': '#60A5FA',
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6',
        // Text colors
        'text-primary': '#1F2937',
        'text-secondary': '#4B5563',
        'text-muted': '#9CA3AF',
        // Background variations
        'bg-light': '#FFFFFF',
        'bg-dark': '#1F2937',
        'bg-muted': '#F3F4F6',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 2px 4px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1)',
        'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
      borderRadius: {
        'card': '0.5rem',
      }
    },
  },
  plugins: [],
} 
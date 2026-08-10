/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
        },
        accent: {
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
        },
      },
      boxShadow: {
        soft: '0 4px 20px rgba(139, 92, 246, 0.10), 0 1px 3px rgba(79, 70, 229, 0.08)',
        card: '0 8px 30px rgba(79, 70, 229, 0.08), 0 2px 8px rgba(79, 70, 229, 0.05)',
        nav: '0 -4px 20px rgba(79, 70, 229, 0.08)',
      },
      fontFamily: {
        sans: ['Inter', 'Poppins', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)',
        'gradient-soft': 'linear-gradient(180deg, #f6f7ff 0%, #f0f2ff 100%)',
      },
    },
  },
  plugins: [],
}

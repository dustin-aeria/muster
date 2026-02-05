/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Muster brand colors
        muster: {
          navy: {
            DEFAULT: '#1E3A5F',
            light: '#2D5A87',
            dark: '#152A45',
          },
          amber: {
            DEFAULT: '#F5A623',
            light: '#FFBD4A',
            dark: '#D4920F',
          },
          slate: {
            DEFAULT: '#5A7B9A',
            light: '#A8C5DB',
            dark: '#3D5A73',
          },
          success: {
            DEFAULT: '#2E7D4A',
            light: '#4CAF50',
            dark: '#1B5E30',
          },
        },
        // Legacy aliases (for backward compatibility during transition)
        aeria: {
          navy: '#1E3A5F',
          blue: '#2D5A87',
          'light-blue': '#4A90D9',
          sky: '#E8F1F8',
        },
        // Risk matrix colors
        risk: {
          critical: '#991B1B',
          high: '#DC2626',
          medium: '#F59E0B',
          low: '#22C55E',
        },
        // Semantic colors
        primary: {
          DEFAULT: '#1E3A5F',
          foreground: '#FFFFFF',
        },
        accent: {
          DEFAULT: '#F5A623',
          foreground: '#0F172A',
        },
      },
      fontFamily: {
        display: ['Outfit', 'Montserrat', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'muster-sm': '0 1px 2px rgba(30, 58, 95, 0.05)',
        'muster-md': '0 4px 6px rgba(30, 58, 95, 0.1)',
        'muster-lg': '0 10px 15px rgba(30, 58, 95, 0.1)',
      },
    },
  },
  plugins: [],
}

/**
 * MUSTER Brand - Tailwind CSS Configuration Extension
 * 
 * Usage: Import and spread into your tailwind.config.js
 * 
 * Example:
 * const musterBrand = require('./muster-tailwind.config.js');
 * 
 * module.exports = {
 *   ...musterBrand,
 *   content: [...],
 *   // your other config
 * }
 * 
 * Or extend specific properties:
 * module.exports = {
 *   theme: {
 *     extend: {
 *       colors: musterBrand.theme.extend.colors,
 *       fontFamily: musterBrand.theme.extend.fontFamily,
 *     }
 *   }
 * }
 */

module.exports = {
  theme: {
    extend: {
      colors: {
        // Primary Brand Colors
        muster: {
          // Navy - Primary brand color
          navy: {
            DEFAULT: '#1E3A5F',
            light: '#2D5A87',
            dark: '#152A45',
          },
          // Signal Amber - Action/accent color
          amber: {
            DEFAULT: '#F5A623',
            light: '#FFBD4A',
            dark: '#D4920F',
          },
          // Slate - Secondary elements
          slate: {
            DEFAULT: '#5A7B9A',
            light: '#A8C5DB',
            dark: '#3D5A73',
          },
          // Operational Green - Success states
          success: {
            DEFAULT: '#2E7D4A',
            light: '#4CAF50',
            dark: '#1B5E30',
          },
        },
        // Semantic aliases
        primary: {
          DEFAULT: '#1E3A5F',
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: '#5A7B9A',
          foreground: '#FFFFFF',
        },
        accent: {
          DEFAULT: '#F5A623',
          foreground: '#0F172A',
        },
        destructive: {
          DEFAULT: '#DC2626',
          foreground: '#FFFFFF',
        },
      },
      
      fontFamily: {
        // Display/Headlines - Outfit
        display: ['Outfit', 'Montserrat', 'system-ui', 'sans-serif'],
        // Body/UI - Inter  
        sans: ['Inter', 'system-ui', 'sans-serif'],
        // Monospace - JetBrains Mono
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      
      fontSize: {
        // Custom type scale
        'display': ['48px', { lineHeight: '1.1', fontWeight: '700' }],
        'h1': ['32px', { lineHeight: '1.2', fontWeight: '700' }],
        'h2': ['24px', { lineHeight: '1.3', fontWeight: '600' }],
        'h3': ['20px', { lineHeight: '1.4', fontWeight: '600' }],
        'body': ['16px', { lineHeight: '1.5', fontWeight: '400' }],
        'small': ['14px', { lineHeight: '1.5', fontWeight: '400' }],
        'caption': ['12px', { lineHeight: '1.4', fontWeight: '500' }],
      },
      
      borderRadius: {
        'muster-sm': '4px',
        'muster-md': '8px',
        'muster-lg': '12px',
        'muster-xl': '16px',
      },
      
      boxShadow: {
        'muster-sm': '0 1px 2px rgba(30, 58, 95, 0.05)',
        'muster-md': '0 4px 6px rgba(30, 58, 95, 0.1)',
        'muster-lg': '0 10px 15px rgba(30, 58, 95, 0.1)',
        'muster-xl': '0 20px 25px rgba(30, 58, 95, 0.15)',
      },
      
      spacing: {
        // Common component spacing
        'muster-xs': '4px',
        'muster-sm': '8px',
        'muster-md': '16px',
        'muster-lg': '24px',
        'muster-xl': '32px',
        'muster-2xl': '48px',
      },
      
      animation: {
        'muster-fade-in': 'musterFadeIn 0.3s ease-out',
        'muster-slide-up': 'musterSlideUp 0.3s ease-out',
        'muster-pulse-amber': 'musterPulseAmber 2s infinite',
      },
      
      keyframes: {
        musterFadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        musterSlideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        musterPulseAmber: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(245, 166, 35, 0.4)' },
          '50%': { boxShadow: '0 0 0 8px rgba(245, 166, 35, 0)' },
        },
      },
      
      backgroundImage: {
        // Gradient presets
        'muster-gradient-navy': 'linear-gradient(135deg, #1E3A5F 0%, #2D5A87 100%)',
        'muster-gradient-amber': 'linear-gradient(135deg, #F5A623 0%, #D4920F 100%)',
        'muster-gradient-hero': 'linear-gradient(180deg, #1E3A5F 0%, #2D5A87 50%, #1E3A5F 100%)',
      },
    },
  },
  
  plugins: [
    // Custom component classes
    function({ addComponents, theme }) {
      addComponents({
        // Primary Button
        '.btn-muster-primary': {
          backgroundColor: theme('colors.muster.amber.DEFAULT'),
          color: theme('colors.gray.900'),
          fontFamily: theme('fontFamily.sans').join(', '),
          fontWeight: '600',
          padding: '12px 24px',
          borderRadius: theme('borderRadius.muster-md'),
          border: 'none',
          cursor: 'pointer',
          transition: 'background-color 150ms ease',
          '&:hover': {
            backgroundColor: theme('colors.muster.amber.dark'),
          },
          '&:focus': {
            outline: 'none',
            boxShadow: `0 0 0 3px rgba(245, 166, 35, 0.3)`,
          },
        },
        
        // Secondary Button
        '.btn-muster-secondary': {
          backgroundColor: 'transparent',
          color: theme('colors.muster.navy.DEFAULT'),
          fontFamily: theme('fontFamily.sans').join(', '),
          fontWeight: '600',
          padding: '12px 24px',
          borderRadius: theme('borderRadius.muster-md'),
          border: `2px solid ${theme('colors.muster.navy.DEFAULT')}`,
          cursor: 'pointer',
          transition: 'all 150ms ease',
          '&:hover': {
            backgroundColor: theme('colors.muster.navy.DEFAULT'),
            color: '#FFFFFF',
          },
        },
        
        // Ghost Button
        '.btn-muster-ghost': {
          backgroundColor: 'transparent',
          color: theme('colors.muster.navy.DEFAULT'),
          fontFamily: theme('fontFamily.sans').join(', '),
          fontWeight: '500',
          padding: '8px 16px',
          borderRadius: theme('borderRadius.muster-md'),
          border: 'none',
          cursor: 'pointer',
          transition: 'background-color 150ms ease',
          '&:hover': {
            backgroundColor: 'rgba(30, 58, 95, 0.1)',
          },
        },
        
        // Card
        '.card-muster': {
          backgroundColor: '#FFFFFF',
          borderRadius: theme('borderRadius.muster-lg'),
          boxShadow: theme('boxShadow.muster-md'),
          padding: '24px',
        },
        
        // Input
        '.input-muster': {
          fontFamily: theme('fontFamily.sans').join(', '),
          fontSize: '16px',
          padding: '12px 16px',
          border: '1px solid #CBD5E1',
          borderRadius: theme('borderRadius.muster-md'),
          transition: 'border-color 150ms ease',
          '&:focus': {
            outline: 'none',
            borderColor: theme('colors.muster.amber.DEFAULT'),
            boxShadow: '0 0 0 3px rgba(245, 166, 35, 0.2)',
          },
        },
        
        // Badge
        '.badge-muster': {
          display: 'inline-flex',
          alignItems: 'center',
          padding: '4px 12px',
          fontSize: '12px',
          fontWeight: '500',
          borderRadius: '9999px',
          backgroundColor: 'rgba(30, 58, 95, 0.1)',
          color: theme('colors.muster.navy.DEFAULT'),
        },
        
        '.badge-muster-amber': {
          backgroundColor: 'rgba(245, 166, 35, 0.15)',
          color: theme('colors.muster.amber.dark'),
        },
        
        '.badge-muster-success': {
          backgroundColor: 'rgba(46, 125, 74, 0.15)',
          color: theme('colors.muster.success.DEFAULT'),
        },
      });
    },
  ],
};

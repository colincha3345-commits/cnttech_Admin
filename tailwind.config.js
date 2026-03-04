/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class', // 시스템 설정 무시, 다크모드 미사용
  theme: {
    extend: {
      /* ===== Pizza Brand Colors ===== */
      colors: {
        pizza: {
          primary: '#25A3E5',
          'primary-dark': '#1E8BC3',
          accent: '#FFDD44',
          'accent-dark': '#E5C53D',
        },
        // Grayscale Palette
        black: '#000000',
        'dark-gray': {
          1: '#1D1D1F',
          2: '#424245',
        },
        gray: {
          1: '#6E6E73',
          2: '#86868B',
        },
        'light-gray': {
          1: '#D2D2D7',
          2: '#E8E8ED',
        },
        silver: '#F5F5F7',
        white: '#FFFFFF',

        // Semantic Colors (Apple Style)
        primary: {
          DEFAULT: '#1D1D1F',
          hover: '#000000',
          light: 'rgba(29, 29, 31, 0.08)',
        },
        secondary: {
          DEFAULT: '#6E6E73',
          hover: '#424245',
          light: 'rgba(110, 110, 115, 0.15)',
        },
        success: {
          DEFAULT: '#34C759',
          hover: '#30B350',
          light: 'rgba(52, 199, 89, 0.1)',
        },
        warning: {
          DEFAULT: '#FF9500',
          hover: '#E68600',
          light: 'rgba(255, 149, 0, 0.1)',
        },
        critical: {
          DEFAULT: '#FF3B30',
          hover: '#FF2D21',
          light: 'rgba(255, 59, 48, 0.1)',
        },
        info: {
          DEFAULT: '#1D1D1F',
          hover: '#000000',
          light: 'rgba(29, 29, 31, 0.08)',
        },
        // Background
        bg: {
          main: '#F5F5F7',
          card: '#FFFFFF',
          input: '#FFFFFF',
          disabled: '#F5F5F7',
          hover: '#F5F5F7',
        },
        // Text
        txt: {
          main: '#1D1D1F',
          muted: '#86868B',
          disabled: '#D2D2D7',
          inverse: '#FFFFFF',
        },
        // Border
        border: {
          DEFAULT: '#D2D2D7',
          focus: '#000000',
          error: '#FF3B30',
        },
      },

      /* ===== Typography ===== */
      fontFamily: {
        sans: ['Inter Variable', '-apple-system', 'BlinkMacSystemFont', 'Pretendard Variable', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        pizza: ['Nanum Gothic', 'Noto Sans KR', 'sans-serif'],
      },
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1.2' }],    // 12px
        sm: ['0.875rem', { lineHeight: '1.5' }],   // 14px
        base: ['1rem', { lineHeight: '1.5' }],     // 16px
        lg: ['1.125rem', { lineHeight: '1.5' }],   // 18px
        xl: ['1.25rem', { lineHeight: '1.2' }],    // 20px
        '2xl': ['1.5rem', { lineHeight: '1.2' }],  // 24px
      },
      letterSpacing: {
        tight: '-0.01em',
      },

      /* ===== Spacing ===== */
      spacing: {
        's-1': '0.25rem',  // 4px
        's-2': '0.5rem',   // 8px
        's-3': '0.75rem',  // 12px
        's-4': '1rem',     // 16px
        's-6': '1.5rem',   // 24px
        's-8': '2rem',     // 32px
        's-12': '3rem',    // 48px
      },

      /* ===== Border Radius (Apple Style) ===== */
      borderRadius: {
        card: '16px',
        button: '10px',
        input: '8px',
        badge: '9999px',
      },

      /* ===== Box Shadow (Apple Style - Subtle) ===== */
      boxShadow: {
        'sm': '0 1px 3px 0 rgba(0, 0, 0, 0.04)',
        'card': '0 2px 8px 0 rgba(0, 0, 0, 0.08)',
        'card-hover': '0 4px 16px 0 rgba(0, 0, 0, 0.12)',
        'focus': '0 0 0 3px rgba(0, 0, 0, 0.08)',
        'focus-error': '0 0 0 3px rgba(255, 59, 48, 0.15)',
        'button': '0 1px 3px rgba(0, 0, 0, 0.12)',
        'button-hover': '0 2px 6px rgba(0, 0, 0, 0.16)',
      },

      /* ===== Animation (Apple Style - Smooth) ===== */
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(-8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(100%)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
      animation: {
        'spin-slow': 'spin 0.8s linear infinite',
        'fadeIn': 'fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        'slideUp': 'slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        'slide-in-right': 'slideInRight 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      },
      transitionTimingFunction: {
        'apple': 'cubic-bezier(0.4, 0, 0.2, 1)',
      },

      /* ===== Z-Index ===== */
      zIndex: {
        'sidebar-overlay': '40',
        'sidebar': '50',
        'modal': '60',
        'toast': '70',
      },
    },
  },
  plugins: [],
};

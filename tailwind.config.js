/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--primary-color)',
        'primary-hover': 'var(--primary-color-hover)',
        'primary-light': 'var(--primary-color-light)',
        'primary-foreground': 'var(--primary-color-foreground)',
        brand: {
          50: '#eefbfa',
          100: '#d5f7f3',
          200: '#b0eee8',
          300: '#7ae0d7',
          400: '#3ec9be',
          500: '#25ada3',
          600: '#1a8b84',
          700: '#19706b',
          800: '#185956',
          900: '#184a48',
          950: '#082c2b',
        },
        whatsapp: {
          light: '#25D366',
          dark: '#075E54',
          teal: '#128C7E',
          chat: '#0b141a',
          bubbleIn: '#202c33',
          bubbleOut: '#005c4b',
        },
      },

    },
  },
  plugins: [],
};

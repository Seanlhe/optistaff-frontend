/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary-text': 'var(--color-primary-text)',
        'secondary-text': 'var(--color-secondary-text)',
        'primary-blue': 'var(--color-primary-blue)',
        'card-color': 'var(--color-card-color)',
        'bg': 'var(--color-bg)',
        'secondary-bg': 'var(--color-secondary-bg)',
        'gradient-end': 'var(--color-gradient-end)',
        'border': 'var(--color-border)',
      }
    },
  },
  plugins: [],
}

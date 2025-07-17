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
        'desc-text': 'var(--color-desc-text)',
        'blue-text': 'var(--color-blue-text)',
        'bg': 'var(--color-bg)',
        'card': 'var(--color-card)',
        'button': 'var(--color-button)',
        'hover-btnlight': 'var(--color-hover-btnlight)',
        'hover-btndark': 'var(--color-hover-btndark)',
        'red': 'var(--color-red)',
        'green': 'var(--color-green)',
        'outline': 'var(--color-outline)',
      },
      fontFamily: {
        'montserrat': 'var(--font-montserrat)',
        'montserrat-smb': 'var(--font-montserrat-smb)',
        'montserrat-b': 'var(--font-montserrat-b)',
      }
    },
  },
  plugins: [],
}

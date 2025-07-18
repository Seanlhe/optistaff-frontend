import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Text colors
        'primary-text': 'var(--color-primary-text)',
        'secondary-text': 'var(--color-secondary-text)',
        
        // Brand colors
        'primary-blue': 'var(--color-primary-blue)',
        
        // Background colors
        'card-color': 'var(--color-card-color)',
        'bg-primary': 'var(--color-bg)',
        'secondary-bg': 'var(--color-secondary-bg)',
        'tertiary-bg': 'var(--color-tertiary-bg)',
        
        // State colors
        'success': 'var(--color-green)',
        'success-dark': 'var(--color-green-dark)',
        'green': 'var(--color-green)',
        'green-dark': 'var(--color-green-dark)',
        'error': 'var(--color-red)',
        'error-dark': 'var(--color-red-dark)',
        
        // Utility colors
        'border-color': 'var(--color-border)',
        'landing-bg': 'var(--color-landing-bg)',
      },
    },
  },
  plugins: [],
}

export default config

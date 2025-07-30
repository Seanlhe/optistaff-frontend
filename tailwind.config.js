/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "primary-text": "var(--color-primary-text)",
        "secondary-text": "var(--color-secondary-text)",
        "primary-blue": "var(--color-primary-blue)",
        "card-color": "var(--color-card-color)",
        bg: "var(--color-bg)",
        "secondary-bg": "var(--color-secondary-bg)",
        "tertiary-bg": "var(--color-tertiary-bg)",
        red: "var(--color-red)",
        "red-dark": "var(--color-red-dark)",
        green: "var(--color-green)",
        "green-dark": "var(--color-green-dark)",
        "landing-bg": "var(--color-landing-bg)",
        border: "var(--color-border)",
        // Legacy aliases for compatibility
        card: "var(--color-card-color)",
        error: "var(--color-red)",
        "error-dark": "var(--color-red-dark)",
        "border-color": "var(--color-border)",
      },
      fontFamily: {
        sans: [
          "var(--font-montserrat)",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ], // Added by Jovita
        montserrat: "var(--font-montserrat)",
        "montserrat-smb": "var(--font-montserrat-smb)",
        "montserrat-b": "var(--font-montserrat-b)",
      },
    },
  },
  plugins: [],
};

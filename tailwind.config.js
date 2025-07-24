/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'sans-serif'],
      },
      colors: {
        primary: "#4F46E5",
        secondary: "#6366F1",
        background: "#F9FAFB",
        text: "#111827",
        textSecondary: "#6B7280",
        border: "#E5E7EB",
        success: "#10B981",
        error: "#EF4444",
      },
    },
  },
  plugins: [],
}
 
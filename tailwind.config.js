/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html"
  ],
  theme: {
    extend: {
      colors: {
        'tradesync': {
          primary: '#2563eb',
          secondary: '#10b981',
          background: '#f3f4f6',
          text: '#1f2937'
        }
      },
      fontFamily: {
        'sans': ['Inter', 'ui-sans-serif', 'system-ui'],
        'mono': ['Roboto Mono', 'ui-monospace', 'SFMono-Regular']
      }
    },
  },
  plugins: [],
}
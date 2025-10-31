/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html","./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: { devBlue:"#4F7EC4", execOrange:"#E7B04C" }
    }
  },
  plugins: []
}

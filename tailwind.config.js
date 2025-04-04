/** @type {import('tailwindcss').Config} */
export default {
	content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
	theme: {
		extend: {
			colors: {
				primary: "#3662e3",
			},
			fontFamily: {
				sans: ["Inter", "sans-serif"],
				ubuntu: ["Ubuntu", "sans-serif"],
			},
		},
	},
	plugins: [],
};

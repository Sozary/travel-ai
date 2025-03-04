import type { Config } from "tailwindcss";

export default {
	content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
	theme: {
		extend: {
			transitionDuration: {
				DEFAULT: "300ms",
			},
		},
	},
	plugins: [],
} satisfies Config;

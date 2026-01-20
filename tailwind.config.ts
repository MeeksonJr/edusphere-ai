import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary-hue), var(--primary-saturation), var(--primary-lightness))",
          50: "hsl(var(--primary-hue), var(--primary-saturation), calc(var(--primary-lightness) + 25%))",
          100: "hsl(var(--primary-hue), var(--primary-saturation), calc(var(--primary-lightness) + 20%))",
          200: "hsl(var(--primary-hue), var(--primary-saturation), calc(var(--primary-lightness) + 15%))",
          300: "hsl(var(--primary-hue), var(--primary-saturation), calc(var(--primary-lightness) + 10%))",
          400: "hsl(var(--primary-hue), var(--primary-saturation), calc(var(--primary-lightness) + 5%))",
          500: "hsl(var(--primary-hue), var(--primary-saturation), var(--primary-lightness))",
          600: "hsl(var(--primary-hue), var(--primary-saturation), calc(var(--primary-lightness) - 5%))",
          700: "hsl(var(--primary-hue), var(--primary-saturation), calc(var(--primary-lightness) - 10%))",
          800: "hsl(var(--primary-hue), var(--primary-saturation), calc(var(--primary-lightness) - 15%))",
          900: "hsl(var(--primary-hue), var(--primary-saturation), calc(var(--primary-lightness) - 20%))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "#39ff14", // Neon green
          foreground: "hsl(var(--secondary-foreground))",
        },
        accent: {
          DEFAULT: "#ff00ff", // Neon pink
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        glass: {
          bg: "var(--glass-bg)",
          border: "var(--glass-border)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        glow: {
          "0%, 100%": {
            boxShadow: "0 0 5px var(--neon-purple), 0 0 10px var(--neon-purple)",
          },
          "50%": {
            boxShadow: "0 0 15px var(--neon-purple), 0 0 20px var(--neon-purple)",
          },
        },
        slideIn: {
          from: { transform: "translateX(-100%)" },
          to: { transform: "translateX(0)" },
        },
        slideOut: {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(-100%)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        glow: "glow 2s ease-in-out infinite",
        slideIn: "slideIn 0.3s ease-out",
        slideOut: "slideOut 0.3s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

export default config

import type { Config } from "tailwindcss";

export default {
    darkMode: ["class"],
    content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			'brand-orange': {
  				DEFAULT: 'hsl(var(--brand-orange))',
  				light: 'hsl(var(--brand-orange-light))',
  				dark: 'hsl(var(--brand-orange-dark))',
  			},
  			'surface-elevated': 'hsl(var(--surface-elevated))',
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		boxShadow: {
  			card: 'var(--shadow-card)',
  			'card-hover': 'var(--shadow-card-hover)',
  			elevated: 'var(--shadow-elevated)',
  			'card-subtle': 'var(--shadow-card-subtle)',
  			'card-glow': 'var(--shadow-card-glow)',
  			'inner-soft': 'var(--shadow-inner-soft)',
  		},
  		animation: {
  			'fade-up': 'fade-up 0.5s ease-out forwards',
  			'slide-in-right': 'slide-in-right 0.4s ease-out forwards',
  			'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
  			'count-up': 'count-up 0.4s ease-out forwards',
  		},
  		keyframes: {
  			'fade-up': {
  				from: { opacity: '0', transform: 'translateY(16px)' },
  				to: { opacity: '1', transform: 'translateY(0)' },
  			},
  			'slide-in-right': {
  				from: { opacity: '0', transform: 'translateX(24px)' },
  				to: { opacity: '1', transform: 'translateX(0)' },
  			},
  			'glow-pulse': {
  				'0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
  				'50%': { opacity: '0', transform: 'scale(1.5)' },
  			},
  			'count-up': {
  				'0%': { opacity: '0', transform: 'translateY(8px)' },
  				'50%': { opacity: '1', transform: 'translateY(-2px)' },
  				'100%': { opacity: '1', transform: 'translateY(0)' },
  			},
  		},
  	}
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

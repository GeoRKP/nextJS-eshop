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
  		fontFamily: {
  			sans: ['var(--font-roboto)', 'system-ui', 'sans-serif'],
  			heading: ['var(--font-roboto-condensed)', 'var(--font-roboto)', 'system-ui', 'sans-serif'],
  		},
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
  			'brand-accent': {
  				DEFAULT: 'hsl(var(--brand-accent))',
  				light: 'hsl(var(--brand-accent-light))',
  				dark: 'hsl(var(--brand-accent-dark))',
  			},
  			success: {
  				DEFAULT: 'hsl(var(--success))',
  				foreground: 'hsl(var(--success-foreground))',
  			},
  			warning: {
  				DEFAULT: 'hsl(var(--warning))',
  				foreground: 'hsl(var(--warning-foreground))',
  			},
  			info: {
  				DEFAULT: 'hsl(var(--info))',
  				foreground: 'hsl(var(--info-foreground))',
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
  			'fade-up': 'fade-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
  			'glow-pulse': 'glow-pulse 2.5s ease-in-out infinite',
  			'mega-reveal': 'mega-reveal 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
  			'badge-bounce': 'badge-bounce 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
  			'progress-fill': 'progress-fill 4s linear forwards',
			'marquee': 'marquee 40s linear infinite',
			'spin-slow': 'spin-slow 20s linear infinite',
			'grid-item-in': 'grid-item-in 0.4s ease-out both',
  		},
  		keyframes: {
  			'fade-up': {
  				from: { opacity: '0', transform: 'translateY(12px)' },
  				to: { opacity: '1', transform: 'translateY(0)' },
  			},
  			'glow-pulse': {
  				'0%, 100%': { opacity: '0.5', transform: 'scale(1)' },
  				'50%': { opacity: '0', transform: 'scale(1.4)' },
  			},
  			'mega-reveal': {
  				from: { opacity: '0', transform: 'translateY(-4px)', clipPath: 'inset(0 0 100% 0)' },
  				to: { opacity: '1', transform: 'translateY(0)', clipPath: 'inset(0 0 0 0)' },
  			},
  			'badge-bounce': {
  				'0%': { transform: 'scale(1)' },
  				'50%': { transform: 'scale(1.2)' },
  				'100%': { transform: 'scale(1)' },
  			},
  			'progress-fill': {
  				from: { width: '0%' },
  				to: { width: '100%' },
  			},
			'marquee': {
				'0%': { transform: 'translateX(0)' },
				'100%': { transform: 'translateX(-50%)' },
			},
			'spin-slow': {
				from: { transform: 'rotate(0deg)' },
				to: { transform: 'rotate(360deg)' },
			},
			'grid-item-in': {
				from: { opacity: '0', transform: 'translateY(20px)' },
				to: { opacity: '1', transform: 'translateY(0)' },
			},
  		},
  	}
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

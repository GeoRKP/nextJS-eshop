import type { Config } from "tailwindcss";

export default {

    content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		screens: {
  			'3xl': '1920px',
  		},
  		fontFamily: {
  			sans: ['var(--font-manrope)', 'system-ui', 'sans-serif'],
  			heading: ['var(--font-oswald)', 'var(--font-manrope)', 'system-ui', 'sans-serif'],
  			mono: ['var(--font-jetbrains-mono)', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
  		},
  		colors: {
  			background: 'oklch(var(--background) / <alpha-value>)',
  			foreground: 'oklch(var(--foreground) / <alpha-value>)',
  			card: {
  				DEFAULT: 'oklch(var(--card) / <alpha-value>)',
  				foreground: 'oklch(var(--card-foreground) / <alpha-value>)'
  			},
  			popover: {
  				DEFAULT: 'oklch(var(--popover) / <alpha-value>)',
  				foreground: 'oklch(var(--popover-foreground) / <alpha-value>)'
  			},
  			primary: {
  				DEFAULT: 'oklch(var(--primary) / <alpha-value>)',
  				foreground: 'oklch(var(--primary-foreground) / <alpha-value>)'
  			},
  			secondary: {
  				DEFAULT: 'oklch(var(--secondary) / <alpha-value>)',
  				foreground: 'oklch(var(--secondary-foreground) / <alpha-value>)'
  			},
  			muted: {
  				DEFAULT: 'oklch(var(--muted) / <alpha-value>)',
  				foreground: 'oklch(var(--muted-foreground) / <alpha-value>)'
  			},
  			accent: {
  				DEFAULT: 'oklch(var(--accent) / <alpha-value>)',
  				foreground: 'oklch(var(--accent-foreground) / <alpha-value>)'
  			},
  			destructive: {
  				DEFAULT: 'oklch(var(--destructive) / <alpha-value>)',
  				foreground: 'oklch(var(--destructive-foreground) / <alpha-value>)'
  			},
  			border: 'oklch(var(--border) / <alpha-value>)',
  			input: 'oklch(var(--input) / <alpha-value>)',
  			ring: 'oklch(var(--ring) / <alpha-value>)',
  			chart: {
  				'1': 'oklch(var(--chart-1) / <alpha-value>)',
  				'2': 'oklch(var(--chart-2) / <alpha-value>)',
  				'3': 'oklch(var(--chart-3) / <alpha-value>)',
  				'4': 'oklch(var(--chart-4) / <alpha-value>)',
  				'5': 'oklch(var(--chart-5) / <alpha-value>)'
  			},
  			'brand-accent': {
  				DEFAULT: 'oklch(var(--brand-accent) / <alpha-value>)',
  				light: 'oklch(var(--brand-accent-light) / <alpha-value>)',
  				dark: 'oklch(var(--brand-accent-dark) / <alpha-value>)',
  			},
  			success: {
  				DEFAULT: 'oklch(var(--success) / <alpha-value>)',
  				foreground: 'oklch(var(--success-foreground) / <alpha-value>)',
  			},
  			warning: {
  				DEFAULT: 'oklch(var(--warning) / <alpha-value>)',
  				foreground: 'oklch(var(--warning-foreground) / <alpha-value>)',
  			},
  			info: {
  				DEFAULT: 'oklch(var(--info) / <alpha-value>)',
  				foreground: 'oklch(var(--info-foreground) / <alpha-value>)',
  			},
  			'surface-elevated': 'oklch(var(--surface-elevated) / <alpha-value>)',
  			'border-strong': 'oklch(var(--border-strong) / <alpha-value>)',
  			'grid-line': 'oklch(var(--grid-line) / <alpha-value>)',
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'var(--radius)',
  			sm: 'var(--radius)',
  			none: '0px',
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
			'marquee': 'marquee 28s linear infinite',
			'spin-slow': 'spin-slow 20s linear infinite',
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
  		},
  	}
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

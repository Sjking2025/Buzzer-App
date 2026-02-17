/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                cyber: {
                    black: '#0a0a0a',
                    dark: '#121212',
                    gray: '#1f1f1f',
                    neonGreen: '#00ff9d',
                    neonRed: '#ff0055',
                    neonBlue: '#00ccff',
                    neonYellow: '#fcee0a'
                }
            },
            fontFamily: {
                mono: ['"JetBrains Mono"', 'monospace'],
                sans: ['"Rajdhani"', 'sans-serif']
            },
            animation: {
                'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'glow': 'glow 2s ease-in-out infinite alternate',
            },
            keyframes: {
                glow: {
                    '0%': { boxShadow: '0 0 5px #00ff9d' },
                    '100%': { boxShadow: '0 0 20px #00ff9d, 0 0 10px #00ff9d' }
                }
            }
        },
    },
    plugins: [],
}

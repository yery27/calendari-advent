import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// base './' => funciona a GitHub Pages sense saber el nom del repo
export default defineConfig({ base: './', plugins: [react(), tailwindcss()] })

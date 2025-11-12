import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Bundle analyzer - generates stats.html in dist folder
    visualizer({
      filename: 'dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    })
  ],
  server: {
    allowedHosts: true
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    // Ensure React is deduped to avoid multiple instances that can cause
    // "Invalid hook call" errors in development when using linked packages
    // or complex dependency trees.
    dedupe: ['react', 'react-dom'],
    extensions: ['.mjs', '.js', '.jsx', '.ts', '.tsx', '.json']
  },
  // Pre-bundle frequently used UI and routing libraries to reduce
  // dev-time fetch churn and avoid occasional aborted module requests.
  optimizeDeps: {
    include: [
      'clsx',
      'tailwind-merge',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@tanstack/react-query',
      'react-router-dom',
      '@faker-js/faker'
    ]
  },
  build: {
    // Enable tree shaking
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true,
      },
    },
    // Manual chunk splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom'],
          'ui-vendor': ['lucide-react', '@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          'chart-vendor': ['recharts'],
          'query-vendor': ['@tanstack/react-query'],
          'date-vendor': ['date-fns'],
          'router-vendor': ['react-router-dom'],
          
          // Feature chunks
          'dashboard': ['./src/pages/Dashboard.jsx'],
          'reports': ['./src/pages/Reports.jsx'],
          // Note: Removed custom 'analytics' chunk to avoid potential initialization order issues
          // in production build that caused "Cannot access 'v' before initialization" in minified output.
          // Let Vite handle chunking for analytics-related components automatically.
        },
      },
    },
    // Chunk size warnings
    chunkSizeWarningLimit: 1000,
    // Source maps for production debugging (optional)
    sourcemap: false,
  },
}) 

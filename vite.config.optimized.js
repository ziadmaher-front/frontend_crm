import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { visualizer } from 'rollup-plugin-visualizer';
import { splitVendorChunkPlugin } from 'vite';

// Intelligent Bundle Optimization Configuration
export default defineConfig({
  plugins: [
    react({
      // Enable React Fast Refresh
      fastRefresh: true,
      // Optimize JSX runtime
      jsxRuntime: 'automatic',
      // Enable babel plugins for optimization
      babel: {
        plugins: [
          // Remove console.log in production
          process.env.NODE_ENV === 'production' && ['babel-plugin-transform-remove-console', { exclude: ['error', 'warn'] }],
          // Optimize imports
          ['babel-plugin-import', {
            libraryName: '@tanstack/react-query',
            libraryDirectory: '',
            camel2DashComponentName: false,
          }, 'react-query'],
          ['babel-plugin-import', {
            libraryName: 'react-router-dom',
            libraryDirectory: '',
            camel2DashComponentName: false,
          }, 'react-router'],
        ].filter(Boolean),
      },
    }),
    
    // Intelligent vendor chunk splitting
    splitVendorChunkPlugin(),
    
    // Bundle analyzer for production builds
    process.env.ANALYZE && visualizer({
      filename: 'dist/bundle-analysis.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
  ],

  // Path resolution optimization
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@components': resolve(__dirname, './src/components'),
      '@pages': resolve(__dirname, './src/pages'),
      '@hooks': resolve(__dirname, './src/hooks'),
      '@services': resolve(__dirname, './src/services'),
      '@utils': resolve(__dirname, './src/utils'),
      '@stores': resolve(__dirname, './src/stores'),
      '@contexts': resolve(__dirname, './src/contexts'),
      '@assets': resolve(__dirname, './src/assets'),
    },
  },

  // Development server optimization
  server: {
    port: 3000,
    host: true,
    // Enable HMR optimization
    hmr: {
      overlay: true,
    },
    // Proxy configuration for API calls
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },

  // Build optimization
  build: {
    // Target modern browsers for better optimization
    target: 'esnext',
    
    // Optimize chunk size warnings
    chunkSizeWarningLimit: 1000,
    
    // Advanced rollup options
    rollupOptions: {
      // Intelligent code splitting strategy
      output: {
        // Manual chunk splitting for optimal loading
        manualChunks: {
          // Core React libraries
          'react-vendor': ['react', 'react-dom'],
          
          // Routing
          'router': ['react-router-dom'],
          
          // State management and data fetching
          'data-vendor': ['@tanstack/react-query', '@tanstack/react-query-devtools'],
          
          // UI libraries
          'ui-vendor': [
            '@headlessui/react',
            '@heroicons/react',
            'react-hot-toast',
            'react-day-picker',
            'react-resizable-panels',
          ],
          
          // Charts and visualization
          'chart-vendor': [
            'chart.js',
            'react-chartjs-2',
            'recharts',
          ],
          
          // Utilities
          'utils-vendor': [
            'date-fns',
            'clsx',
            'tailwind-merge',
            'zod',
          ],
          
          // AI and advanced features
          'ai-vendor': [
            // Add AI-related dependencies here when available
          ],
          
          // Development tools (only in development)
          ...(process.env.NODE_ENV === 'development' && {
            'dev-tools': ['@tanstack/react-query-devtools'],
          }),
        },
        
        // Optimize chunk naming
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
            ? chunkInfo.facadeModuleId.split('/').pop().replace(/\.[^/.]+$/, '')
            : 'chunk';
          return `js/${facadeModuleId}-[hash].js`;
        },
        
        // Optimize asset naming
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `images/[name]-[hash][extname]`;
          }
          if (/css/i.test(ext)) {
            return `css/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
      },
      
      // External dependencies (for CDN optimization if needed)
      external: [],
    },
    
    // Minification options
    minify: 'terser',
    terserOptions: {
      compress: {
        // Remove console.log in production
        drop_console: true,
        drop_debugger: true,
        // Remove unused code
        dead_code: true,
        // Optimize conditionals
        conditionals: true,
        // Optimize loops
        loops: true,
        // Remove unused variables
        unused: true,
      },
      mangle: {
        // Mangle property names for better compression
        properties: {
          regex: /^_/,
        },
      },
      format: {
        // Remove comments
        comments: false,
      },
    },
    
    // Source map configuration
    sourcemap: process.env.NODE_ENV === 'development',
    
    // CSS optimization
    cssCodeSplit: true,
    cssMinify: true,
  },

  // Dependency optimization
  optimizeDeps: {
    // Pre-bundle these dependencies
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      '@headlessui/react',
      '@heroicons/react/24/outline',
      '@heroicons/react/24/solid',
      'chart.js',
      'react-chartjs-2',
      'recharts',
      'date-fns',
      'clsx',
      'tailwind-merge',
      'zod',
      'react-hot-toast',
    ],
    
    // Exclude these from pre-bundling
    exclude: [
      // Large libraries that should be loaded on demand
    ],
    
    // ESBuild options for dependency optimization
    esbuildOptions: {
      target: 'esnext',
      supported: {
        'top-level-await': true,
      },
    },
  },

  // Preview server configuration
  preview: {
    port: 4173,
    host: true,
  },

  // Environment variables
  define: {
    // Global constants
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },

  // CSS configuration
  css: {
    // PostCSS configuration
    postcss: {
      plugins: [
        // Tailwind CSS is already configured in postcss.config.js
      ],
    },
    
    // CSS modules configuration
    modules: {
      localsConvention: 'camelCase',
    },
    
    // CSS preprocessing
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/styles/variables.scss";`,
      },
    },
  },

  // Worker configuration for Web Workers
  worker: {
    format: 'es',
    plugins: [
      // Add worker-specific plugins if needed
    ],
  },

  // Experimental features
  experimental: {
    // Enable render built-in optimization
    renderBuiltUrl(filename, { hostType }) {
      if (hostType === 'js') {
        return { js: `/${filename}` };
      }
      return { relative: true };
    },
  },
});
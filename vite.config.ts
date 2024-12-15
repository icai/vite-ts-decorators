import { defineConfig } from 'vite';
import path from 'path';

// Vite configuration for library development
export default defineConfig({
  build: {
    // target: 'node', // Target modern browsers
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'), // Entry point for the library
      formats: ['es'], // Output formats
      fileName: (format, entry) => {
        return `index.js`; // Use simple file names without path
      },
    },
    rollupOptions: {
      external: [
        'fs',
        'path',
        'util',
        'reflect-metadata',
        'vite',
        'tinyglobby',
        'typescript'

      ],
      output: {
        globals: {
          // 'cross-fetch': 'fetch',
          // 'ioredis': 'Redis',
        },
        chunkFileNames: '[name].js',
        manualChunks: (id) => {
          // Replace the `src/` part of the path with an empty string
          // Ensure it's a valid chunk name (e.g., the relative directory or file name)
          const relativePath = id
            .replace(process.cwd(), '')
            .replace('src/', '');
          // Use the module name ex: '/di/decorators/injectable.ts'  to 'di/decorators/injectable'
          const chunkName = relativePath
            .replace(/^\//, '')
            .replace('.ts', '')
            .replace('.js', '');
          return chunkName;
        },
      },
    },
    sourcemap: false, // Disable source maps
    emptyOutDir: true, // Clean output directory before building
  },
  resolve: {
  },
});

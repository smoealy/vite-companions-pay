
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Updated optimizeDeps to include required packages with specific versions
  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      '@tanstack/react-query@4.36.1',
      'wagmi@1.4.13',
      'viem',
      'ethers'
    ],
    esbuildOptions: {
      target: 'es2020',  // Updated target to support BigInt literals
    }
  },
  // Updated build options for better compatibility
  build: {
    outDir: 'dist',
    target: 'es2020',  // Changed from es2015 to es2020 to support BigInt literals
    sourcemap: true,
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true,
    },
  },
}));

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(async ({ mode }) => {
  const plugins = [react()];

  if (mode === "development") {
    const { componentTagger } = await import("lovable-tagger");
    plugins.push(componentTagger());
  }

  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins,
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    optimizeDeps: {
      include: [
        "react",
        "react-dom",
        "@tanstack/react-query@4.36.1",
        "wagmi@1.4.13",
        "viem",
        "ethers",
      ],
      esbuildOptions: {
        target: "es2020",
      },
    },
    build: {
      outDir: "dist",
      target: "es2020",
      sourcemap: true,
      commonjsOptions: {
        include: [/node_modules/],
        transformMixedEsModules: true,
      },
    },
  };
});

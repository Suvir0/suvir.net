import { defineConfig } from "vite";
import { renderFallback } from "./src/fallback/render.ts";

// The site is a static export served from GitHub Pages under /beta/. Next
// writes the main site to out/ and wipes it first, so this build has to run
// after `next build` and write into out/beta/.
export default defineConfig({
  base: "/beta/",
  build: {
    outDir: "../out/beta",
    // One scene, one bundle. Three.js is most of it and all of it is needed
    // on first paint, so splitting would only add round trips.
    chunkSizeWarningLimit: 1000,
    emptyOutDir: true,
    target: "es2022",
    assetsDir: "assets",
  },
  plugins: [
    {
      // The fallback is real content in the shipped HTML, not a placeholder.
      // Crawlers, no-WebGL browsers, screen readers and anyone with
      // prefers-reduced-motion get a readable page; main.ts hides it only once
      // it knows it can draw something better.
      name: "beta-fallback",
      transformIndexHtml: {
        order: "pre" as const,
        handler(html: string) {
          return html.replace("<!--FALLBACK-->", renderFallback());
        },
      },
    },
  ],
});

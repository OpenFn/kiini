#!/usr/bin/env node

import esbuildServe from "esbuild-serve";

esbuildServe(
  {
    logLevel: "info",
    entryPoints: ["src/app.tsx"],
    bundle: true,
    sourcemap: true,
    outfile: "public/bundle.js",
    external: ["pnpapi", "module"],
    // target: ["chrome58", "firefox57", "safari11", "edge16"],
    define: {"process.env.NODE_ENV": `"${process.env.NODE_ENV}"`}
  },
  { root: "public" }
);

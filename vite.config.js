import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import fs from "node:fs";
import { handleFunction } from "./server/functions.js";

// Con `npm run dev` / `npm run preview` le funzioni di netlify/functions/ girano in locale:
// niente Netlify, niente crediti. L'archivio del trasferimento diventa una cartella (.data).
function localFunctions() {
  const mount = (server) => {
    process.env.YGG_STORAGE ??= "file";
    server.middlewares.use((req, res, next) => handleFunction(req, res, { fresh: true }).then((handled) => handled || next()));
  };
  return { name: "local-netlify-functions", configureServer: mount, configurePreviewServer: mount };
}

// Ad ogni build il service worker riceve un numero di versione nuovo: le vecchie copie salvate si eliminano da sole.
function swVersion() {
  return {
    name: "sw-build-id",
    apply: "build",
    closeBundle() {
      const file = "dist/sw.js";
      if (fs.existsSync(file)) fs.writeFileSync(file, fs.readFileSync(file, "utf8").replace("__BUILD_ID__", Date.now().toString(36)));
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), localFunctions(), swVersion()],
});

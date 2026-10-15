import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import fs from "node:fs";
import { handleFunction, reportEnv } from "./server/functions.js";

// Con `npm run dev` / `npm run preview` le funzioni di netlify/functions/ girano in locale:
// niente Netlify, niente crediti.
function localFunctions() {
  const mount = (server) => {
    server.middlewares.use((req, res, next) => handleFunction(req, res, { fresh: true }).then((handled) => handled || next()));
  };
  return {
    name: "local-netlify-functions",
    // Le funzioni girano in questo processo: porto qui anche le variabili di .env, .env.local e .env.<mode>
    config(_, { mode }) {
      for (const [key, value] of Object.entries(loadEnv(mode, process.cwd(), ""))) if (process.env[key] === undefined) process.env[key] = value;
    },
    configureServer(server) { mount(server); reportEnv(); },
    configurePreviewServer(server) { mount(server); reportEnv(); },
  };
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

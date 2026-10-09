import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
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

export default defineConfig({
  plugins: [react(), tailwindcss(), localFunctions()],
});

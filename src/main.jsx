import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// Font inclusi nel sito (nessuna richiesta a Google)
import '@fontsource/chakra-petch/latin-500.css'
import '@fontsource/chakra-petch/latin-600.css'
import '@fontsource/chakra-petch/latin-700.css'
import '@fontsource/dm-sans/latin-400.css'
import '@fontsource/dm-sans/latin-500.css'
import '@fontsource/dm-sans/latin-700.css'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// App installabile: il service worker conserva solo i file dell'app (vedi public/sw.js)
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}))
}

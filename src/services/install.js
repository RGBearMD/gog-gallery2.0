import { useEffect, useState } from "react";

// Chrome/Android avvisa quando l'app è installabile: teniamo l'evento per mostrare il nostro pulsante.
export function useInstallPrompt() {
  const [promptEvent, setPromptEvent] = useState(null);

  useEffect(() => {
    const onPrompt = (e) => { e.preventDefault(); setPromptEvent(e); };
    const onInstalled = () => setPromptEvent(null);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  async function install() {
    if (!promptEvent) return;
    promptEvent.prompt();
    await promptEvent.userChoice;
    setPromptEvent(null);
  }

  return { canInstall: !!promptEvent, install };
}

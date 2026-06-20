import { useEffect, useRef, useState } from "react";
import { getGameScreenshots } from "../services/gogApi";

export default function GamePreview({
    game,
    count = 1 // Usiamo count come indicatore di quale screenshot prendere (es. 1° screenshot)
}) {
    const ref = useRef(null);
    const [visible, setVisible] = useState(false);
    const [image, setImage] = useState(game.previewScreenshot);

    // Reset dello stato se cambia il gioco
    useEffect(() => {
        setVisible(false);
        setImage(game.previewScreenshot);
    }, [game.id, game.previewScreenshot]);

    // 1. Intersection Observer per il Lazy Loading
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setVisible(true);
                    observer.disconnect();
                }
            },
            {
                rootMargin: "300px"
            }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => observer.disconnect();
    }, [game.id]); // Aggiunto game.id per resettare l'observer se cambia il componente

    // 2. Fetch dello screenshot solo quando visibile
    useEffect(() => {
        if (!visible) return;
        if (image) return; // Se c'è già una preview (o mock), evita la fetch

        let cancelled = false;

        async function load() {
            try {
                const data = await getGameScreenshots(game.id);
                const screenshots = data?.screenshots || [];

                if (screenshots.length === 0) return;

                // CORREZIONE: Uso di 'count' per determinare l'indice (es. count = 1 -> index 0)
                const targetIndex = Math.max(0, count - 1);
                const chosenImage = screenshots[targetIndex] || screenshots[0];

                if (!cancelled) {
                    setImage(chosenImage);
                }
            } catch (err) {
                console.error("Preview load error:", err);
            }
        }

        load();

        return () => {
            cancelled = true;
        };
    }, [visible, image, game.id, count]); // Sostituito l'errato 'index' con 'count'

    return (
        <div
            ref={ref}
            className="h-28 w-full bg-zinc-950 rounded border border-zinc-800 overflow-hidden"
        >
            {image ? (
                <img
                    src={image}
                    alt={`${game.title} preview`}
                    className="w-full h-full object-contain"
                    loading="lazy"
                />
            ) : (
                <div className="w-full h-full flex items-center justify-center">
                    <span className="text-zinc-500 text-xs animate-pulse">
                        Loading preview...
                    </span>
                </div>
            )}
        </div>
    );
}
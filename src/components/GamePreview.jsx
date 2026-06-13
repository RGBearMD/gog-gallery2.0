import { useEffect, useRef, useState } from "react";
import { getGameScreenshots } from "../services/gogApi";

export default function GamePreview({ game }) {
    const ref = useRef(null);

    const [visible, setVisible] = useState(false);
    const [image, setImage] = useState(
        game.previewScreenshot
    );

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
    }, []);

    useEffect(() => {
        if (!visible) return;
        if (image) return;

        let cancelled = false;

        async function load() {
            try {
                const data =
    await getGameScreenshots(game.id);

const screenshots =
    data?.screenshots || [];

if (screenshots.length === 0) {
    return;
}

                const pool =
                    screenshots.length > 1
                        ? screenshots.slice(1)
                        : screenshots;

                const random =
                    pool[
                        Math.floor(
                            Math.random() * pool.length
                        )
                    ];

                if (!cancelled) {
                    setImage(random);
                }
            } catch (err) {
                console.error(
                    "Preview load error:",
                    err
                );
            }
        }

        load();

        return () => {
            cancelled = true;
        };
    }, [visible, image, game.id]);

    return (
        <div
    ref={ref}
    className="h-36 w-full bg-zinc-950 rounded border border-zinc-800 overflow-hidden"
>
            {image ? (
                <img
                    src={image}
                    alt=""
                    className="w-full h-full object-contain"
                />
            ) : (
                <div className="w-full h-full flex items-center justify-center">
                    <span className="text-zinc-500 text-xs">
                        Loading preview...
                    </span>
                </div>
            )}
        </div>
    );
}
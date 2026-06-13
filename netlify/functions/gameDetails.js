export default async (req) => {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    try {
        const res = await fetch(
            `https://api.gog.com/products/${id}?expand=screenshots`
        );

        const data = await res.json();

        // Priorità alle immagini più leggere per ridurre
// traffico dati e velocizzare il caricamento.
const PRIORITY = [
    "ggvgt",
    "ggvgm",
    "ggvgl",
    "ggvgm_2x",
    "ggvgl_2x"
];

console.log(
    "GAME",
    id,
    "SCREENSHOTS",
    data.screenshots?.length || 0
);

const screenshots = (data.screenshots || [])
    .map((shot) => {
        const best = PRIORITY
            .map((format) =>
                shot.formatted_images?.find(
                    (img) => img.formatter_name === format
                )
            )
            .find(Boolean);

        return best?.image_url;
    })
    .filter(Boolean);

        return new Response(
            JSON.stringify({ screenshots }),
            {
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );

    } catch (e) {
        return new Response(
            JSON.stringify({
                error: e.message
            }),
            { status: 500 }
        );
    }
};
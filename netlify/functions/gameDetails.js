export default async (req) => {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    try {
        const res = await fetch(
            `https://api.gog.com/products/${id}?expand=screenshots`
        );

        const data = await res.json();

        const screenshots = (data.screenshots || [])
            .map((shot) => {
                const best =
                    shot.formatted_images?.find(
                        img => img.formatter_name === "ggvgl_2x"
                    ) ||
                    shot.formatted_images?.find(
                        img => img.formatter_name === "ggvgl"
                    ) ||
                    shot.formatted_images?.[0];

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
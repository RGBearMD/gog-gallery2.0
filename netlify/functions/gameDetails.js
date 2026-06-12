export default async (req) => {
    const url = new URL(req.url);
    const slug = url.searchParams.get("slug");

    try {
        const res = await fetch(
            `https://www.gog.com${slug}`
        );

        const html = await res.text();

        // estrazione veloce immagini (GOG usa og:image + gallery json)
        const matches = [...html.matchAll(/https:\/\/images\.gog-statics\.com\/[^\"]+/g)];

        const screenshots = [...new Set(matches.map(m => m[0]))].slice(0, 12);

        return new Response(
            JSON.stringify({ screenshots }),
            {
                headers: { "Content-Type": "application/json" }
            }
        );

    } catch (e) {
        return new Response(
            JSON.stringify({ error: e.message }),
            { status: 500 }
        );
    }
};
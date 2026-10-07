// GOG: restituisce screenshot come { thumb, full }.
// thumb = formato medio (griglie), full = formato grande (solo ingrandimento).
const THUMB = ["ggvgm", "ggvgt", "ggvgl"];
const FULL = ["ggvgl", "ggvgm_2x", "ggvgm"];

const pick = (shot, order) =>
    order.map((f) => shot.formatted_images?.find((i) => i.formatter_name === f)).find(Boolean)?.image_url;

const json = (status, body, cache = "no-store") =>
    new Response(JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json", "Cache-Control": cache },
    });

export default async (req) => {
    const id = new URL(req.url).searchParams.get("id");
    if (!/^\d+$/.test(id || "")) return json(400, { error: "ID GOG non valido." });

    try {
        const res = await fetch(`https://api.gog.com/products/${id}?expand=screenshots`);
        if (!res.ok) return json(res.status, { error: `GOG ha risposto ${res.status}` });
        const data = await res.json();

        const screenshots = (data.screenshots || [])
            .map((s) => ({ thumb: pick(s, THUMB), full: pick(s, FULL) }))
            .filter((s) => s.thumb)
            .map((s) => ({ thumb: s.thumb, full: s.full || s.thumb }));

        return json(200, { screenshots }, "public, max-age=86400, s-maxage=86400");
    } catch (e) {
        return json(500, { error: e.message });
    }
};

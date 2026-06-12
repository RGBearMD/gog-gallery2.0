export default async (req) => {
    try {
        const url = new URL(req.url);
        const user = url.searchParams.get("user");
        const page = url.searchParams.get("page") || 1;

        const res = await fetch(
            `https://www.gog.com/u/${user}/games/stats?sort=recent_playtime&order=desc&page=${page}`,
            {
                headers: {
                    "User-Agent": "Mozilla/5.0",
                    "Accept": "application/json"
                }
            }
        );

        if (!res.ok) {
            return new Response("GOG error", { status: 500 });
        }

        const data = await res.json();

        return new Response(JSON.stringify(data), {
            status: 200,
            headers: {
                "Content-Type": "application/json"
            }
        });

    } catch (e) {
        return new Response(
            JSON.stringify({ error: e.message }),
            { status: 500 }
        );
    }
};
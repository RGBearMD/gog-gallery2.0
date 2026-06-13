export async function getAllGames(username) {
    const first = await fetch(
        `/.netlify/functions/gog?user=${username}&page=1`
    );

    const text = await first.text();

    let firstData;

    try {
        firstData = JSON.parse(text);
    } catch {
        console.error("Risposta non JSON:", text);
        throw new Error("API non valida / function rotta.\nRisposta ricevuta:\n${text}");
    }

    const pages = firstData.pages;

    const queue = Array.from({ length: pages }, (_, i) => i + 1);
    const CONCURRENCY = 3;
    const results = [];

    async function worker() {
        while (queue.length) {
            const page = queue.shift();
            if (!page) return;

            const res = await fetch(
                `/.netlify/functions/gog?user=${username}&page=${page}`
            );

            const data = await res.json();
            results.push(data);
        }
    }

    await Promise.all(
        Array.from({ length: CONCURRENCY }, worker)
    );

    return results.flatMap((data) =>
        data._embedded.items.map((item) => ({
            id: item.game.id,
            title: item.game.title,
            cover: item.game.image,
            rawGame: item.game,
            url: "https://www.gog.com" + item.game.url,
            playtime:
                item.stats?.[Object.keys(item.stats)[0]]?.playtime ?? 0,
            lastSession:
                item.stats?.[Object.keys(item.stats)[0]]?.lastSession,
            screenshots: []
        }))
    );
}

export async function getGameScreenshots(id) {
    const res = await fetch(
        `/.netlify/functions/gameDetails?id=${id}`
    );

    return await res.json();
}
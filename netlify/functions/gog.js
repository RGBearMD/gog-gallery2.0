export async function handler(event) {
    const user = event.queryStringParameters.user;
    const page = event.queryStringParameters.page || 1;

    const res = await fetch(
        `https://www.gog.com/u/${user}/games/stats?sort=recent_playtime&order=desc&page=${page}`
    );

    const data = await res.json();

    return {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    };
}
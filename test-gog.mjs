import * as cheerio from "cheerio";

const response = await fetch(
    "https://www.gog.com/u/MatDmg82/games"
);

const html = await response.text();
const $ = cheerio.load(html);

const results = [];

$("a").each((_, el) => {
    const href = $(el).attr("href");
    const text = $(el).text().trim();

    if (href && href.includes("/game/")) {
        results.push({ href, text });
    }
});

console.log(results.slice(0, 30));
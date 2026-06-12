import GameCard from "./GameCard";

export default function GameGrid({ games }) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {games.map((g) => (
                <GameCard key={g.id} game={g} />
            ))}
        </div>
    );
}
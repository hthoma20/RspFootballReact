import { useEffect, useState } from 'react';

import { getGames } from 'api/getGames';


export function GamePicker(props) {

    const [games, setGames] = useState([]);

    useEffect(() => {
        (async () => {
            const games = await getGames();
            console.log(games);
            setGames(games);
        })();
    }, []);

    const gameComponents = games.map(game =>
        <GameItem
            key={game.gameId}
            game={game}
            onClick={() => props.setGameId(game.gameId)} />);

    return (
        <div>
            <Heading user={props.user} />
            {gameComponents}
        </div>
    );
}

function Heading(props) {
    return <div>
        Welcome {props.user}, pick a game to get started
    </div>;
}

function GameItem(props) {
    return <div onClick={props.onClick}>
        <span>{props.game.gameId}</span>
        <span>{"  "}</span>
        <span>{props.game.home}</span>
    </div>;
}
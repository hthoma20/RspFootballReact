import { useEffect, useState } from 'react';

import { getGames } from 'api/games';
import { joinGame } from 'api/actions';


export function GamePicker({user, setGameId}) {

    const [games, setGames] = useState(null);

    useEffect(() => {
        (async () => {
            const fetchedGames = await getGames();
            setGames(fetchedGames);
        })();
    }, []);

    async function attemptJoinGame(gameId) {
        const result = await joinGame(user, gameId);

        if (result.status == 200) {
            setGameId(gameId);
        }
        else {
            window.alert("Couldn't join that game.\n Try to refresh the game list, and ensure that the home team doesn't share your name.");
        }
    }

    return (
        <div>
            <Heading user={user} />
            <GamesList games={games} attemptJoinGame={attemptJoinGame} />
        </div>
    );
}

function GamesList({games, attemptJoinGame}) {
    if (games == null) {
        return <div>Loading...</div>
    }

    if (games.length == 0) {
        return <div>There are no games yet. Try to make a new one.</div>
    }
    return games.map(game =>
        <GameItem
            key={game.gameId}
            game={game}
            onClick={() => attemptJoinGame(game.gameId)} />);
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
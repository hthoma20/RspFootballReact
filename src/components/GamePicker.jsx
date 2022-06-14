import { useEffect, useState } from 'react';

import { getGames, newGame } from 'api/games';
import { joinGame } from 'api/actions';

import "styles/GamePicker.css";


export function GamePicker({user, setGameId}) {

    const [availableGames, setAvailableGames] = useState(null);
    const [userGames, setUserGames] = useState(null);

    const [isCreatingNewGame, setIsCreatingNewGame] = useState(false);

    function setGames(games) {
        const availableGames = games.filter(game => game.players.away == null && game.players.home != user);
        const userGames = games.filter(game => Object.values(game.players).includes(user));

        setAvailableGames(availableGames);
        setUserGames(userGames);
    }

    useEffect(() => {
        (async () => {
            const fetchedGames = await getGames(user);
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

    if (isCreatingNewGame) {
        return <NewGameForm user={user} setGameId={setGameId} />;
    }

    if (availableGames === null || userGames === null) {
        return <div>Loading...</div>;
    }

    if ((availableGames.length + userGames.length) == 0) {
        return <div className="gamePicker">
            There are no games yet. Try to 
            <span className="clickableText" onClick={() => setIsCreatingNewGame(true)}>
                make a new one.
            </span>
        </div>;
    }

    return (
        <div className="gamePicker">
            <Heading user={user} setIsCreatingNewGame={setIsCreatingNewGame} />
            <GameList headingText="Your games" games={userGames} onGameClick={setGameId} />
            <GameList headingText="Available games" games={availableGames} onGameClick={attemptJoinGame} />
        </div>
    );
}

function Heading({user, setIsCreatingNewGame}) {
    return <div>
        Welcome {user}, pick a game to get started, or
        <span className="clickableText" onClick={() => setIsCreatingNewGame(true)}>
            create a new game.
        </span>
    </div>;
}

// onGameClick is a function that accepts a gameId. It is called when an item in the gameList is clicked
function GameList({games, headingText, onGameClick}) {
    if (games == null || games.length == 0) {
        return <div />;
    }

    return <div className="gameListContainer">
        <div>{headingText}</div>
        <div className="gameList">
            <GameListHeader />
            {games.map(game =>
                <GameListItem
                    key={game.gameId}
                    game={game}
                    onClick={() => onGameClick(game.gameId)} />)}
        </div>
    </div>;
}

function GameListHeader() {
    return <div className="gameListHeader">
        <span className="gameId">Game</span>
        <span className="home">Home</span>
        <span className="away">Away</span>
    </div>;
}

function GameListItem({game, onClick}) {
    return <div className="gameListItem" onClick={onClick}>
        <span className="gameId">{game.gameId}</span>
        <span className="home">{game.players.home}</span>
        <span className="away">{game.players.away}</span>
    </div>;
}

function NewGameForm({user, setGameId}) {
    const [gameId, setCurrentGameId] = useState("");

    function handleChange(event) {
        setCurrentGameId(event.target.value);
    }

    async function handleSubmit(event) {
        event.preventDefault();
        const result = await newGame(gameId, user);
        if (result.status == 200) {
            console.log("Created new game");
            setGameId(gameId);
        }
        else {
            window.alert("Something went wrong");
            console.error("Error creating new game: ", result.status, result.data);
        }
    }

    return <div className="newGameForm">
        <div>Host a new game</div>
        <form onSubmit={handleSubmit}>
            <label>
                Game name:
                <input type="text" value={gameId} onChange={handleChange} />
                <input type="submit" value="Sumbit" />
            </label>
        </form>
    </div>;
}

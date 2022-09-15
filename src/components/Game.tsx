import { useEffect, useState } from "react";

import { postAction } from "api/actions";
import { getGame, pollGame } from "api/games";
import { getScoreImagePath } from "util/images";
import { GameCanvas } from "./GameCanvas";
import { ResultLog } from "./ResultLog";
import * as Robot from 'bot/Robot';

import 'styles/Game.css';
import { __DEV } from "util/devtools";
import { Game, GameId, UserId } from "model/gameModel";
import { Action } from "model/actionModel";
import { getPlayer } from "util/players";
import { ActionPane } from "./ActionPane";

const POLL_ON = true;
const ROBOT_ON = false;


/**
 * Connect the component which uses this hook to a remotely hosted
 * RSP football game. This hook will return an object with the following:
 * game: the current game, updates to this game, either via a poll or a response
 *          to an action will cause a re-render of the using component. Note that this
 *          will be null before the game has loaded for the first time
 * dispatchAction: a function which accepts an action, and sends that action to the
 *                  remote game 
 */
function useRemoteGame(gameId: GameId, user: UserId) {
    const [game, setGameDelegate] = useState<Game | null>(null);

    function setGame(game: Game) {
        __DEV.currentGame = game;
        setGameDelegate(game);
    }

    useEffect(() => {
        if (!game) {
            (async () => {
                const retrievedGame = await getGame(gameId)
                setGame(retrievedGame);
            })();
        }
        else if (POLL_ON && game.actions[getPlayer(game, user)].includes('POLL')) {
            (async () => {
                const retrievedGame = await pollGame(gameId, game.version)
                setGame(retrievedGame);
            })();
        }
    });

    async function dispatchGameAction(action: Action): Promise<void> {
        console.log("Action dispatched: ", action);

        if (!game) {
            console.error("No game to dispatch action to. Game has not been set.");
            return;
        }

        const response = await postAction(game.gameId, user, action);

        if (response.status == 400) {
            console.log(response);
            window.alert("Illegal action");
        }
        else {
            setGame(response.data);
        }
    }

    return {game, dispatchGameAction};
}

interface GameRegistry {
    size(): number;
    peek(): Game | null;
    getCurrentGame(): Game | null;
    getGame(version: number) : Game | null;
}

class GameRegistry {

    private games: Game[];
    private currentVersion: number;

    constructor(games: Game[], currentVersion: number) {
        this.games = games;
        this.currentVersion = currentVersion;
    }


    size = () => this.games.length;
    peek  = () => (this.games[0] || null);
    getCurrentGame = () => this.getGame(this.currentVersion) || null;
    getGame = (version: number) => this.games.find(game => game.version == version) || null;
}

/**
 * Keep track of every version of the game that has been seen,
 * except those games which have explicitly been requested to drop
 * 
 * @param game the most up-to date version of the game
 * @return two items:
 * 1 - A list of registered games
 * 2 - A function which informs this hook that a version is no longer needed.
 *      calling this function can signal the hook that all lower versions may
 *      be de-registered as well
 */
function useGameRegistry(game: Game | null): [GameRegistry, (dropVersion: number) => void] {

    const initialGames = game === null ? [] : [game];
    const [games, setGames] = useState(initialGames);
    const [currentVersion, setCurrentVersion] = useState(-1);


    if (game !== null && game.version > currentVersion) {
        setCurrentVersion(game.version);
        setGames([...games, game]);
    }

    function dropVersion(version: number) {
        setGames(games.filter(game => game.version > version));
    }

    return [new GameRegistry(games, currentVersion), dropVersion];
}



export function GameComponent({user, gameId}: {user: UserId, gameId: GameId}) {
    const {game, dispatchGameAction} = useRemoteGame(gameId, user);

    const [animationQueue, dequeueGameVersion] = useGameRegistry(game);

    // the game that is actively being animated
    // null if the there is no animation ongoing
    const [animatingGame, setAnimatingGame] = useState(null as Game | null);
    // the game that is displayed on the scoreboard, etc
    // null only if there has hasn't been a game yet
    const [displayedGame, setDisplayedVersion] = useState(null as Game | null);

    if (!game) {
        return <div>Loading...</div>;
    }

    console.log("Rendering game: ", game);

    // if there is a new animation that we should play
    if (animatingGame === null && animationQueue.size() > 0) {
        setAnimatingGame(animationQueue.peek()!);
    }

    function animationComplete() {
        if (animatingGame === null) {
            console.error("Animation marked complete for null Game");
            return;
        }
        dequeueGameVersion(animatingGame.version);
        setDisplayedVersion(animatingGame);
        setAnimatingGame(null);
    }

    const player = getPlayer(game, user);

    if (ROBOT_ON && user == 'robot') {
        Robot.takeAction(game, player, dispatchGameAction);
    }

    const fieldGame: Game | null = animatingGame ?? displayedGame;
    
    return (
        <div className="game" >
            <ScoreBoard game={displayedGame} />
            
            <div id="lowerPane">
                <div id="leftPane">
                    <GameCanvas game={fieldGame} player={player} animationComplete={animationComplete} />
                    <div id="actionPane" >
                        <ActionPane game={displayedGame} player={player} dispatchAction={dispatchGameAction} />
                    </div>
                </div>
                <div id="rightPane">
                    <ResultLog game={displayedGame} />
                </div>
            </div>
        </div>
    );
}

function ScoreBoard({game}: {game: Game | null}) {

    if (game === null) {
        return <div id="scoreBoard" />;
    }

    // since plays 1-20 are in quarter 1, shift everything up 19 to line it up
    const quarter = Math.floor((game.playCount + 19)/20);

    return (
        <div id="scoreBoard" >
            <div id="homeScoreContainer">
                <DoubleDigitDisplay id="homeScore" num={game.score.home} />
                <ScoreLabel id="homeLabel" label="HOME" />
            </div>
            
            <div id="homePenContainer">
                <DigitDisplay id="homePenalties" digit={game.penalties.home} />
                <ScoreLabel id="homePenaltiesLabel" label="PEN" />
            </div>
            
            <div id="quarterContainer">
                <DigitDisplay id="quarter" digit={quarter} />
                <ScoreLabel id="quarterLabel" label="QTR" />
            </div>

            <div id="timeContainer">
                <DoubleDigitDisplay id="timer" num={game.playCount} />
                <ScoreLabel id="timerLabel" label="TIME" />
            </div>

            <div id="downContainer">
                <DigitDisplay id="down" digit={game.down} />
                <ScoreLabel id="downLabel" label="DOWN" />
            </div>

            <div id="awayPenContainer" >
                <DigitDisplay id="awayPenalties" digit={game.penalties.away} />
                <ScoreLabel id="awayPenaltiesLabel" label="PEN" />
            </div>

            <div id="awayScoreContainer">
                <DoubleDigitDisplay id="awayScore" num={game.score.away} />
                <ScoreLabel id="awayLabel" label="AWAY" />
            </div>
        </div>
    );
}

function DigitDisplay({digit, id}: {digit: number, id: string}) {
        return <img className="digitDisplay"
                src={getScoreImagePath(digit)}
                alt={`${digit}`}
                id={id} />;
}

function DoubleDigitDisplay({num, id}: {num: number, id: string}) {

    const ones = num % 10;
    const tens = Math.floor(num/10);

    return (
        <div id={id} className="digitDisplay doubleDigitDisplay">
            <img src={getScoreImagePath(tens)} id={id} />
            <img src={getScoreImagePath(ones)} id={id} />
        </div>
    );
}

function ScoreLabel({label, id}: {label: string, id: string}) {
    return <div className="scoreLabel" id={id} >{label}</div>;
}





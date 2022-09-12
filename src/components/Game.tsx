import { useEffect, useState } from "react";

import { postAction } from "api/actions";
import { getGame, pollGame } from "api/games";
import { getScoreImagePath } from "util/images";
import { getDieCountChoices } from "util/actions";
import { GameCanvas } from "./GameCanvas";
import { ResultLog } from "./ResultLog";
import * as Robot from 'bot/Robot';

import 'styles/Game.css';
import { __DEV } from "util/devtools";
import { Game, GameId, Play, Player, UserId } from "model/gameModel";
import { Action } from "model/actionModel";
import React from "react";

const POLL_ON = true;
const ROBOT_ON = false;

function getPlayer(game: Game, user: UserId): Player {
    return game.players.home == user ? 'home' : 'away';
}

function getOpponent(player: Player): Player {
    return player == 'home' ? 'away' : 'home';
}

type ActionDispatch = (action: Action) => Promise<void>;

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
    const actionPaneGame: Game | null = game;//gameRegistry.getCurrentGame();
    
    return (
        <div className="game" >
            <ScoreBoard game={displayedGame} />
            
            <div id="middlePane">
                <GameCanvas game={fieldGame} player={player} animationComplete={animationComplete} />
                <ResultLog game={displayedGame} />
            </div> 
            <div id="actionPane" >
                <ActionPane game={displayedGame} player={player} dispatchAction={dispatchGameAction} />
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

function ActionPane({game, player, dispatchAction}: {game: Game | null, player: Player, dispatchAction: ActionDispatch}) {
    if (game === null) {
        return null;
    }

    const actions = game.actions[player];

    if (actions.includes('RSP')) {
        return <RspPane dispatchAction={dispatchAction} />;
    }
    if (actions.includes('KICKOFF_ELECTION')) {
        return <KickoffElectionPane dispatchAction={dispatchAction} />
    }
    if (actions.includes('KICKOFF_CHOICE')) {
        return <KickoffChoicePane dispatchAction={dispatchAction} />;
    }
    if (actions.includes('TOUCHBACK_CHOICE')) {
        return <TouchbackChoicePane dispatchAction={dispatchAction} />;
    }
    if (actions.includes('ROLL_AGAIN_CHOICE')) {
        return <RollAgainChoicePane dispatchAction={dispatchAction} />;
    }
    if (actions.includes('ROLL')) {
        return <RollPane dispatchAction={dispatchAction} game={game} />;
    }
    if (actions.includes('CALL_PLAY')) {
        return <CallPlayPane dispatchAction={dispatchAction} game={game} />;
    }
    if (actions.includes('PAT_CHOICE')) {
        return <PatPane dispatchAction={dispatchAction} game={game} />;
    }
    if (actions.includes('POLL')) {
        const opponentAction = game.actions[getOpponent(player)];
        return <div>Waiting for opponent: {opponentAction}</div>
    }
    return null;
}

function RspPane({dispatchAction}: {dispatchAction: ActionDispatch}) {

    const dispatch = getChoiceActionDispatch(dispatchAction, 'RSP');

    return (
        <div>
            <ActionButton onClick={() => dispatch('ROCK')}>ROCK</ActionButton>
            <ActionButton onClick={() => dispatch('PAPER')}>PAPER</ActionButton>
            <ActionButton onClick={() => dispatch('SCISSORS')}>SCISSORS</ActionButton>
        </div>
    );
}

function KickoffElectionPane({dispatchAction}: {dispatchAction: ActionDispatch}) {
    const dispatch = getChoiceActionDispatch(dispatchAction, 'KICKOFF_ELECTION');

    return (
        <div>
            <ActionButton onClick={() => dispatch('KICK')}>KICK</ActionButton>
            <ActionButton onClick={() => dispatch('RECIEVE')}>RECIEVE</ActionButton>
        </div>
    );
}

function KickoffChoicePane({dispatchAction}: {dispatchAction: ActionDispatch}) {
    const dispatch = getChoiceActionDispatch(dispatchAction, 'KICKOFF_CHOICE');

    return (
        <div>
            <ActionButton onClick={() => dispatch('REGULAR')}>REGULAR</ActionButton>
            <ActionButton onClick={() => dispatch('ONSIDE')}>ONSIDE</ActionButton>
        </div>
    );
}

function TouchbackChoicePane({dispatchAction}: {dispatchAction: ActionDispatch}) {
    const dispatch = getChoiceActionDispatch(dispatchAction, 'TOUCHBACK_CHOICE');

    return (
        <div>
            <ActionButton onClick={() => dispatch('TOUCHBACK')}>TOUCHBACK</ActionButton>
            <ActionButton onClick={() => dispatch('RETURN')}>ROLL</ActionButton>
        </div>
    );
}

function RollAgainChoicePane({dispatchAction}: {dispatchAction: ActionDispatch}) {
    const dispatch = getChoiceActionDispatch(dispatchAction, 'ROLL_AGAIN_CHOICE');

    return (
        <div>
            <ActionButton onClick={() => dispatch('ROLL')}>ROLL</ActionButton>
            <ActionButton onClick={() => dispatch('HOLD')}>HOLD</ActionButton>
        </div>
    );
}

function RollPane({dispatchAction, game}: {dispatchAction: ActionDispatch, game: Game}) {

    function dispatchRollAction(count: number) {
        dispatchAction({
            name: "ROLL",
            count: count
        });
    }

    let count = 1;
    switch (game.state) {
        case 'KICKOFF':

    }
    
    const rollButtons = getDieCountChoices(game).map(count =>
        <ActionButton key={count} onClick={() => dispatchRollAction(count)}>{count}</ActionButton>);

    return (
        <div>
            <span>Roll:</span>
            {rollButtons}
        </div>
    );
}

function CallPlayPane({dispatchAction, game}: {dispatchAction: ActionDispatch, game: Game}) {
    
    function dispatchPlayAction(play: Play) {
        dispatchAction({
            name: "CALL_PLAY",
            play: play
        });
    }
    
    return (
        <div>
            <ActionButton onClick={() => dispatchPlayAction('SHORT_RUN')}>Short Run</ActionButton>
            <ActionButton onClick={() => dispatchPlayAction('LONG_RUN')}>Long Run</ActionButton>
        </div>
    );
}

function PatPane({dispatchAction, game}: {dispatchAction: ActionDispatch, game: Game}) {
    const dispatch = getChoiceActionDispatch(dispatchAction, 'PAT_CHOICE');

    return (
        <div>
            <ActionButton onClick={() => dispatch('ONE_POINT')}>One Point</ActionButton>
            <ActionButton onClick={() => dispatch('TWO_POINT')}>Two Point</ActionButton>
        </div>
    )
}

function getChoiceActionDispatch(dispatchAction: ActionDispatch, choiceName: string) {
    return (choice: string) => {
        dispatchAction({
            name: choiceName,
            choice: choice
        })
    }
}

function ActionButton(props: {onClick: () => void, children: React.ReactNode}) {
    return (
        <button className="actionButton" onClick={props.onClick}>
            {props.children}
        </button>
    );
}



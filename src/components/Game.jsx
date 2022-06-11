import { useEffect, useState } from "react";

import { postAction } from "api/actions";
import { getGame, pollGame } from "api/games";
import { getScoreImagePath } from "util/images";
import { getDieCountChoices } from "util/actions";
import { GameCanvas } from "./GameCanvas";
import * as Robot from 'bot/Robot';

import 'styles/Game.css';

const POLL_ON = true;
const ROBOT_ON = false;

function getPlayer(game, user) {
    return game.players.home == user ? 'home' : 'away';
}

function getOpponent(player) {
    return player == 'home' ? 'away' : 'home';
}

export function Game({user, gameId}) {

    const [game, setGame] = useState(null);

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

    if (!game) {
        return <div>Loading...</div>;
    }

    console.log("Rendering game: ", game);

    const player = getPlayer(game, user);

    async function dispatchAction(action) {
        console.log("Action dispatched: ", action);
        const response = await postAction(game.gameId, user, action);

        if (response.status == 400) {
            console.log(response);
            window.alert("Illegal action");
        }
        else {
            setGame(response.data);
        }
    }

    if (ROBOT_ON && user == 'daylin') {
        Robot.takeAction(game, player, dispatchAction);
    }

    return (
        <div className="game" >
            <GameCanvas game={game} player={player} />
            <div id="actionPane" >
                <ActionPane game={game} player={player} dispatchAction={dispatchAction} />
            </div>
            <ScoreBoard game={game} />
        </div>
    );
}

function ScoreBoard({game}) {

    // since plays 1-20 are in quarter 1, shift everything up 19 to line it up
    const quarter = Math.floor((game.playCount + 19)/20);

    return (
        <div id="scoreBoard" >
            <ScoreLabel id="homeLabel" label="HOME" />
            <DoubleDigitDisplay id="homeScore" num={game.score.home} />
            <ScoreLabel id="homePenaltiesLabel" label="PEN" />
            <DigitDisplay id="homePenalties" digit={game.penalties.home} />

            <ScoreLabel id="awayLabel" label="AWAY" />
            <DoubleDigitDisplay id="awayScore" num={game.score.away} />
            <ScoreLabel id="awayPenaltiesLabel" label="PEN" />
            <DigitDisplay id="awayPenalties" digit={game.penalties.away} />

            <ScoreLabel id="quarterLabel" label="QTR" />
            <DigitDisplay id="quarter" digit={quarter} />

            <ScoreLabel id="timerLabel" label="TIME" />
            <DoubleDigitDisplay id="timer" num={game.playCount} />

            <ScoreLabel id="downLabel" label="DOWN" />
            <DigitDisplay id="down" digit={game.down} />
            
        </div>
    );
}

function DigitDisplay({digit, id}) {
        return <img className="digitDisplay"
                src={getScoreImagePath(digit)}
                alt={digit}
                id={id} />;
}

function DoubleDigitDisplay({num, id}) {

    const ones = num % 10;
    const tens = Math.floor(num/10);

    return (
        <div id={id} className="digitDisplay" alt={num} >
            <img src={getScoreImagePath(tens)} id={id} />
            <img src={getScoreImagePath(ones)} id={id} />
        </div>
    );
}

function ScoreLabel({label, id}) {
    return <div className="scoreLabel" id={id} >{label}</div>;
}

function ActionPane({game, player, dispatchAction}) {
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
}

function RspPane({dispatchAction}) {

    const dispatch = getChoiceActionDispatch(dispatchAction, 'RSP');

    return (
        <div>
            <ActionButton onClick={() => dispatch('ROCK')}>ROCK</ActionButton>
            <ActionButton onClick={() => dispatch('PAPER')}>PAPER</ActionButton>
            <ActionButton onClick={() => dispatch('SCISSORS')}>SCISSORS</ActionButton>
        </div>
    );
}

function KickoffElectionPane({dispatchAction}) {
    const dispatch = getChoiceActionDispatch(dispatchAction, 'KICKOFF_ELECTION');

    return (
        <div>
            <ActionButton onClick={() => dispatch('KICK')}>KICK</ActionButton>
            <ActionButton onClick={() => dispatch('RECIEVE')}>RECIEVE</ActionButton>
        </div>
    );
}

function KickoffChoicePane({dispatchAction}) {
    const dispatch = getChoiceActionDispatch(dispatchAction, 'KICKOFF_CHOICE');

    return (
        <div>
            <ActionButton onClick={() => dispatch('REGULAR')}>REGULAR</ActionButton>
            <ActionButton onClick={() => dispatch('ONSIDE')}>ONSIDE</ActionButton>
        </div>
    );
}

function TouchbackChoicePane({dispatchAction}) {
    const dispatch = getChoiceActionDispatch(dispatchAction, 'TOUCHBACK_CHOICE');

    return (
        <div>
            <ActionButton onClick={() => dispatch('TOUCHBACK')}>TOUCHBACK</ActionButton>
            <ActionButton onClick={() => dispatch('RETURN')}>ROLL</ActionButton>
        </div>
    );
}

function RollPane({dispatchAction, game}) {

    function dispatchRollAction(count) {
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

function CallPlayPane({dispatchAction, game}) {
    
    function dispatchPlayAction(play) {
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

function PatPane({dispatchAction, game}) {
    const dispatch = getChoiceActionDispatch(dispatchAction, 'PAT_CHOICE');

    return (
        <div>
            <ActionButton onClick={() => dispatch('ONE_POINT')}>One Point</ActionButton>
            <ActionButton onClick={() => dispatch('TWO_POINT')}>Two Point</ActionButton>
        </div>
    )
}

function getChoiceActionDispatch(dispatchAction, choiceName) {
    return (choice) => {
        dispatchAction({
            name: choiceName,
            choice: choice
        })
    }
}

function ActionButton(props) {
    return (
        <button className="actionButton" onClick={props.onClick}>
            {props.children}
        </button>
    );
}



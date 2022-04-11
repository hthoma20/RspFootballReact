import { useEffect, useRef, useState } from "react";

import { postAction } from "api/postAction";
import { useImage, getScoreImagePath } from "util/images";

import 'styles/Game.css';

const initGame = {
    'gameId': "fun game",
    'version': 0,
    'players': {
        'home': 'harry',
        'away': 'john',
    },
    'state': 'RSP',
    'ballpos': 35,
    'firstDown': 45,
    'down': 2,
    'score': {
        'home': 0,
        'away': 0
    },
    'penalties': {
        'home': 2,
        'away': 2
    },
    'playNum': 1,
    'currentPlay': 'COIN_TOSS',
    'rsp': {
        'home': null,
        'away': null
    },
    'roll': [],
    'actions': {
        'home': 'RSP',
        'away': 'RSP'
    }
}

export function Game({user, gameId}) {

    const [game, setGame] = useState(null);

    useEffect(() => {
        if (!game) {
            setGame(initGame);
        }
    }, []);

    if (!game) {
        return <div>Loading...</div>;
    }

    console.log("Rendering game: ", game);

    const player = game.players.home == user ? 'home' : 'away';

    async function dispatchAction(action) {
        console.log("Action dispatched: ", action);
        setGame({...game, ballpos: game.ballpos + 5});
        // const newGame = await postAction(game.gameId, user, action);
        // setGame(newGame);
    }

    // return <ScoreBoard game={game} />;

    return (
        <div className="game" >
            <Field game={game} width={700} height={300}/>
            <div id="actionPane" >
                <ActionPane game={game} player={player} dispatchAction={dispatchAction} />
            </div>
            <ScoreBoard game={game} />
        </div>
    );
}

function Field({game}) {
    
    const canvasRef = useRef(null);
    const [fieldImage, fieldLoaded] = useImage('field.png');
    const [ballImage, ballLoaded] = useImage('football.png');

    useEffect(() => {

        if (!(fieldLoaded && ballLoaded)) {
            return;
        }

        const canvas = canvasRef.current;
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;

        const ctx = canvas.getContext('2d');
        
        // draw field
        ctx.drawImage(fieldImage, 0, 0, canvas.width, canvas.height);

        // draw ball
        const ballPixelPos = yardLineToPixels(game.ballpos, canvas.width);
        const ballWidth = yardsToPixels(5, canvas.width);
        const ballHeight = .67*ballWidth;
        ctx.drawImage(ballImage,
            ballPixelPos - ballWidth/2,
            canvas.height/2 - ballHeight/2,
            ballWidth, ballHeight);

        // draw first down
        const firstDownPixelPos = yardLineToPixels(game.firstDown, canvas.width);
        ctx.beginPath();
        ctx.moveTo(firstDownPixelPos, 0);
        ctx.lineTo(firstDownPixelPos, canvas.height);
        ctx.strokeStyle = '#efe410';
        ctx.lineWidth = 5;
        ctx.stroke();

        // display current play
        ctx.font = "30px Arial";
        ctx.fillStyle = '#000';
        ctx.textAlign = 'center';
        ctx.fillText(game.currentPlay, canvas.width/2, 0.3*canvas.height);

    }, [game, fieldLoaded, ballLoaded]);

    return (
        <canvas id="field" ref={canvasRef} />
    );
}

// return the number of pixels from the left of the canvas
// which corresponds with the given yardLine
function yardLineToPixels(yardLine, canvasWidth) {
    const pixelsPerYard = canvasWidth/120;
    return pixelsPerYard * (10+yardLine);
}

// return the number of pixels that represents the number of yards
function yardsToPixels(yards, canvasWidth) {
    return yards * (canvasWidth/120);
}

function ScoreBoard({game, width, height}) {
    return (
        <div id="scoreBoard" >
            <ScoreLabel id="homeLabel" label="HOME" />
            <DoubleDigitDisplay id="homeScore" />
            <ScoreLabel id="homePenaltiesLabel" label="PEN" />
            <DigitDisplay id="homePenalties" />

            <ScoreLabel id="awayLabel" label="AWAY" />
            <DoubleDigitDisplay id="awayScore" />
            <ScoreLabel id="awayPenaltiesLabel" label="PEN" />
            <DigitDisplay id="awayPenalties" />

            <ScoreLabel id="quarterLabel" label="QTR" />
            <DigitDisplay id="quarter" />

            <ScoreLabel id="timerLabel" label="TIME" />
            <DoubleDigitDisplay id="timer" />

            <ScoreLabel id="downLabel" label="DOWN" />
            <DigitDisplay id="down" />
            
        </div>
    );
}

function DigitDisplay({digit, id}) {
    return <img className="digitDisplay" src="score/0.png" alt={0} id={id} />;
}

function DoubleDigitDisplay({num, id}) {
    return (
        <div id={id} className="digitDisplay" >
            <img src={getScoreImagePath(4)} alt={0} id={id} />
            <img src={getScoreImagePath(3)} alt={0} id={id} />
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
}

function RspPane({dispatchAction}) {

    function dispatchRspAction(choice) {
        dispatchAction({
            name: 'RSP',
            choice: choice
        });
    }

    return (
        <div>
            <ActionButton onClick={() => dispatchRspAction('rock')}>ROCK</ActionButton>
            <ActionButton onClick={() => dispatchRspAction('paper')}>PAPER</ActionButton>
            <ActionButton onClick={() => dispatchRspAction('scissors')}>SCISSORS</ActionButton>
        </div>
    );
}


function ActionButton(props) {
    return (
        <button className="actionButton" onClick={props.onClick}>
            {props.children}
        </button>
    );
}



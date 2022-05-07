import { useEffect, useRef, useState } from "react";

import { postAction } from "api/actions";
import { getGame, pollGame } from "api/games";
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
    'playCount': 1,
    'play': 'COIN_TOSS',
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
        else if (game.actions[getPlayer(game, user)].includes('POLL')) {
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
        console.log(game.gameId);
        const response = await postAction(game.gameId, user, action);

        if (response.status == 400) {
            console.log(response);
            window.alert("Illegal action");
        }
        else {
            setGame(response.data);
        }
    }

    return (
        <div className="game" >
            <Field game={game} player={player} width={700} height={300}/>
            <div id="actionPane" >
                <ActionPane game={game} player={player} dispatchAction={dispatchAction} />
            </div>
            <ScoreBoard game={game} />
        </div>
    );
}

function Field({game, player}) {
    
    const canvasRef = useRef(null);
    const [fieldImage, fieldLoaded] = useImage('field.png');
    const [ballImage, ballLoaded] = useImage('football.png');
    const [diceImage, diceLoaded] = useImage('dice.png');

    useEffect(() => {

        if (!(fieldLoaded && ballLoaded && diceLoaded)) {
            return;
        }

        const canvas = canvasRef.current;
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;

        const ctx = canvas.getContext('2d');
        
        // draw field
        ctx.drawImage(fieldImage, 0, 0, canvas.width, canvas.height);

        // draw ball
        const ballpos = game.possession == player ? game.ballpos : 100 - game.ballpos;
        const ballPixelPos = yardLineToPixels(ballpos, canvas.width);
        const ballWidth = yardsToPixels(5, canvas.width);
        const ballHeight = .67*ballWidth;
        ctx.drawImage(ballImage,
            ballPixelPos - ballWidth/2,
            canvas.height/2 - ballHeight/2,
            ballWidth, ballHeight);

        // draw first down
        const firstDownPos = game.possession == player ? game.firstDown : 100 - game.firstDown;
        const firstDownPixelPos = yardLineToPixels(firstDownPos, canvas.width);
        ctx.beginPath();
        ctx.moveTo(firstDownPixelPos, 0);
        ctx.lineTo(firstDownPixelPos, canvas.height);
        ctx.strokeStyle = '#efe410';
        ctx.lineWidth = 5;
        ctx.stroke();

        // draw dice
        if (game.result?.name == 'ROLL') {
            const dieX = 20;
            const dieY = 20;
            const width = ballWidth + 10;
            for (let i = 0; i < game.result.roll.length; i++) {
                const x = dieX + i*width;
                drawDie(ctx, diceImage, game.result.roll[i], x, dieY, ballWidth);
            }
        }

        // display current play
        ctx.font = "30px Arial";
        ctx.fillStyle = '#000';
        ctx.textAlign = 'center';
        ctx.fillText(game.play, canvas.width/2, 0.3*canvas.height);

    }, [game, fieldLoaded, ballLoaded, diceLoaded]);

    return (
        <canvas id="field" ref={canvasRef} />
    );
}

function drawDie(ctx, image, value, x, y, dimension) {
    // the source image is a grid with dimension 640*427 pixels, with each die image
    // arranged as below
    // 1 2 3
    // 4 5 6
    const clipWidth = 213;
    const clipHeight = 213;

    const clipX = ((value-1) % 3) * clipWidth;
    const clipY =  value < 4 ? 0 : clipHeight;

    ctx.drawImage(image,
        clipX,
        clipY,
        clipWidth,
        clipHeight,
        x,
        y,
        dimension,
        dimension);
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

function ScoreBoard({game}) {

    // since plays 1-20 are in quarter 1, shift everything up 19 to line it up
    const quarter = Math.floor((game.playNum + 19)/20);

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
            <ActionButton onClick={() => dispatch('ROLL')}>ROLL</ActionButton>
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

function getDieCountChoices(game) {
    switch (game.state) {
        case 'KICKOFF':
            return [3];
        case 'ONSIDE_KICK':
            return [2];
        case 'KICK_RETURN':
            return [1];
    }
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
            <ActionButton onClick={() => dispatchPlayAction('SHORT_RUN')}>SHORT RUN</ActionButton>
        </div>
    );
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



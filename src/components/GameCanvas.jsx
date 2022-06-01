import { useEffect, useRef, useState } from "react";

import { useImage, useImages } from "util/images";

import 'styles/Game.css';

/**
 * The GameCanvas is responsible for displaying the current state of the game
 * to the user. This includes an image of the ball, the dice, etc.
 * The GameCanvas also orchestrates animations.
 * 
 * On the first render an inital animationState is created.
 * This state is saved across renders, but it is not tied to React state so changes
 * do not cause re-renders.
 * 
 * Everytime a render with an updated game occurs, a new animation is created via getAnimation.
 * The animation is a generator which mutates the animationState and `yield`s when the frame should be displayed.
 * paintCanvas reads the animation state to update the display. 
 */
export function GameCanvas({game, player}) {
    const canvasRef = useRef(null);

    const animationStateRef = useRef(null);
    const animationRef = useRef(null);
    const animationFrameRequestRef = useRef(null);

    const [images, imagesLoaded] = useImages({
        field: 'field.png',
        ball: 'football.png',
        rock: 'rock.png',
        paper: 'paper.png',
        scissors: 'scissors.png',
        fistLeft: 'fist_left.png',
        fistRight: 'fist_right.png',
    });

    useEffect(() => {
        if (!imagesLoaded) {
            return;
        }

        const canvas = canvasRef.current;
        fix_dpi(canvas);
        
        if (animationStateRef.current === null) {
            animationStateRef.current = getInitialAnimationState();
        }

        // if this is the first render with a new version of the game,
        // cancel the animation for the outdated version
        if (animationRef.current === null || animationStateRef.current.version != game.version) {
            animationStateRef.current.version = game.version;
            animationRef.current = getAnimation(animationStateRef.current, game, player, canvas.width, canvas.height);
            window.cancelAnimationFrame(animationFrameRequestRef.current);
        }

        function animationExecutor() {
            const animationDone = animationRef.current.next().done;
            if (animationDone) {
                console.log(`Animation complete. Version ${animationStateRef.current.version}`);
                return;
            }
            paintCanvas(canvas, images, animationStateRef.current, player);
            animationFrameRequestRef.current = window.requestAnimationFrame(animationExecutor);
        }

        animationExecutor();

    }, [game, imagesLoaded]);

    return (
        <canvas id="field" ref={canvasRef} />
    );
}

// scale the canvas appropriately for the pixel ratio
// see https://medium.com/wdstack/fixing-html5-2d-canvas-blur-8ebe27db07da
function fix_dpi(canvas) {
    const dpi = window.devicePixelRatio;
    const style = getComputedStyle(canvas);
    const style_width = Number(style.width.match(/(.*)px/)[1]);
    const style_height = Number(style.height.match(/(.*)px/)[1]);
    
    canvas.width = style_width * dpi;
    canvas.height = style_height * dpi;
}

function paintCanvas(canvas, images, animationState, player) {
    // console.log(animationState);
    const ctx = canvas.getContext('2d');

    // draw field
    ctx.drawImage(images.field, 0, 0, canvas.width, canvas.height);

    // draw ball
    const ballWidth = yardsToPixels(5, canvas.width);
    const ballHeight = .67*ballWidth;

    ctx.drawImage(images.ball,
        animationState.ballpos - ballWidth/2,
        canvas.height/2 - ballHeight/2,
        ballWidth, ballHeight);

    
    // draw RSP
    for (let rsp of animationState.rsp) {
        const image = images[rsp.image];
        const size = ballWidth*2;
        ctx.drawImage(image, rsp.x - size/2, rsp.y - size/2, size, size);
    }
}

function getInitialAnimationState() {
    return {
        version: -1,
        rsp: []
    };
}

/**
 * Given an initial animationState, and a game
 * return a generator which mutates the animationState, and yields
 * when it is ready for a frame to be painted.
 * Note that nothing is yielded, the new frame is communicated by mutations to
 * the given animationState
 */
function* getAnimation(animationState, game, player, canvasWidth, canvasHeight) {

    for (let frame of getRspAnimation(animationState, game, player, canvasWidth, canvasHeight)) {
        yield;
    }

    for (let frame of getBallAnimation(animationState, game, player, canvasWidth)) {
        yield;
    }
}

function* getRspAnimation(animationState, game, player, canvasWidth, canvasHeight) {
    // draw RSP
    const rspResult = game.result.find(result => result.name == 'RSP');

    if (!rspResult) {
        animationState.rsp = [];
        return;
    }

    function initRspObject(rspPlayer) {
        const isLeft = player == rspPlayer;
        const fieldPos = isLeft ? 40 : 60;
        const image = isLeft ? 'fistLeft' : 'fistRight';

        return {
            image,
            x: yardLineToPixels(fieldPos, canvasWidth),
            y: canvasHeight/2
        };
    }

    animationState.rsp = ['home', 'away'].map(initRspObject);
    yield;

    const bounceFrames = 20;
    const pixelsPerFrame = (canvasHeight/3)/bounceFrames;
    for (let bounce = 0; bounce < 3; bounce++) {
        for (let frame = 0; frame < bounceFrames; frame++) {
            const delta = frame < bounceFrames/2 ? pixelsPerFrame : -pixelsPerFrame;
            for (let rsp of animationState.rsp) {
                rsp.y += delta;
            }
            yield;
        }
    }

    // indexes are defined by the initial mapping
    const homeIndex = 0, awayIndex = 1;
    animationState.rsp[homeIndex].image = rspResult.home.toLowerCase();
    animationState.rsp[awayIndex].image = rspResult.away.toLowerCase();
    yield;
}

function* getBallAnimation(animationState, game, player, canvasWidth) {
    const ballpos = game.possession == player ? game.ballpos : 100 - game.ballpos;
    const pixelBallpos = yardLineToPixels(ballpos, canvasWidth);

    if (!animationState.ballpos) {
        animationState.ballpos = pixelBallpos;
        yield;
    }
    else {
        const distanceInPixels = pixelBallpos - animationState.ballpos;
        const ballAnimationFrames = getBallAnimationFrames(distanceInPixels);
        const pixelsPerFrame = distanceInPixels / ballAnimationFrames;
        
        for (let x = 0; x < ballAnimationFrames; x++) {
            animationState.ballpos += pixelsPerFrame;
            yield;
        }
        animationState.ballpos = pixelBallpos;
        yield;
    }
}

function getBallAnimationFrames(distanceInPixels) {
    if (distanceInPixels < 50) {
        return 20;
    }
    if (distanceInPixels < 200) {
        return 40;
    }
    if (distanceInPixels < 350) {
        return 60;
    }
    return 80;
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


function Field({game, player, setIsAnimating}) {
    
    const canvasRef = useRef(null);
    const [fieldImage, fieldLoaded] = useImage('field.png');
    const [ballImage, ballLoaded] = useImage('football.png');
    const [diceImage, diceLoaded] = useImage('dice.png');
    const [rockImage, rockLoaded] = useImage('rock.png');
    const [scissorsImage, scissorsLoaded] = useImage('scissors.png');
    const [paperImage, paperLoaded] = useImage('paper.png');

    useEffect(() => {

        if (!(fieldLoaded && ballLoaded && diceLoaded)) {
            return;
        }

        const canvas = canvasRef.current;

        const ctx = canvas.getContext('2d');

        // draw first down
        if (game.firstDown) {
            const firstDownPos = game.possession == player ? game.firstDown : 100 - game.firstDown;
            const firstDownPixelPos = yardLineToPixels(firstDownPos, canvas.width);
            ctx.beginPath();
            ctx.moveTo(firstDownPixelPos, 0);
            ctx.lineTo(firstDownPixelPos, canvas.height);
            ctx.strokeStyle = '#efe410';
            ctx.lineWidth = 5;
            ctx.stroke();
        }

        // draw dice
        const rollResult = game.result.find(result => result.name == 'ROLL');
        if (rollResult) {
            const dieX = 20;
            const dieY = 20;
            const width = ballWidth + 10;
            for (let i = 0; i < rollResult.roll.length; i++) {
                const x = dieX + i*width;
                drawDie(ctx, diceImage, rollResult.roll[i], x, dieY, ballWidth);
            }
        }


        // display current play
        ctx.font = "30px Arial";
        ctx.fillStyle = '#000';
        ctx.textAlign = 'center';
        ctx.fillText(game.play, canvas.width/2, 0.3*canvas.height);

    }, [game, fieldLoaded, ballLoaded, diceLoaded, rockLoaded, scissorsLoaded, paperLoaded]);

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



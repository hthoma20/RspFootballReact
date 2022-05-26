import { useEffect, useRef, useState } from "react";

import { useImage, useImages } from "util/images";

import 'styles/Game.css';

export function GameCanvas({game, player}) {
    const canvasRef = useRef(null);

    const animationStateRef = useRef(null);
    const animationRef = useRef(null);
    const animationFrameRequestRef = useRef(null);

    const [images, imagesLoaded] = useImages({
        field: 'field.png',
        ball: 'football.png'
    });

    useEffect(() => {
        if (!imagesLoaded) {
            return;
        }

        const canvas = canvasRef.current;
        fix_dpi(canvas);
        
        if (animationStateRef.current === null) {
            animationStateRef.current = getInitialAnimationState(canvas.width, canvas.height);
        }

        if (animationRef.current === null || animationStateRef.current.version != game.version) {
            animationRef.current = getAnimation(animationStateRef.current, game, player);
            window.cancelAnimationFrame(animationFrameRequestRef.current);
        }

        function animationExecutor() {
            const animationDone = animationRef.current.next().done;
            if (animationDone) {
                console.log("Animation complete");
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
    ctx.drawImage(images.ball,
        animationState.ballpos - animationState.ballWidth/2,
        canvas.height/2 - animationState.ballHeight/2,
        animationState.ballWidth, animationState.ballHeight);
}

/**
 * Given an initial animationState, and a game
 * return a generator which mutates the animationState, and yields
 * when it is ready for a frame to be painted.
 * Note that nothing is yielded, the new frame is communicated by mutations to
 * the given animationState
 */
function* getAnimation(animationState, game, player) {
    const ballpos = game.possession == player ? game.ballpos : 100 - game.ballpos;
    const pixelBallpos = yardLineToPixels(ballpos, animationState.canvasWidth);

    if (!animationState.ballpos) {
        animationState.ballpos = pixelBallpos;
        yield;
    }
    else {
        const distanceInPixels = pixelBallpos - animationState.ballpos;
        console.log(distanceInPixels);
        const ballAnimationFrames = getAnimationFrames(distanceInPixels);
        const pixelsPerFrame = distanceInPixels / ballAnimationFrames;
        
        for (let x = 0; x < ballAnimationFrames; x++) {
            animationState.ballpos += pixelsPerFrame;
            yield;
        }
        animationState.ballpos = pixelBallpos;
        yield;
    }
}

function getAnimationFrames(distanceInPixels) {
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

function getInitialAnimationState(width, height) {

    const ballWidth = yardsToPixels(5, width);
    const ballHeight = .67*ballWidth;

    return {
        canvasWidth: width,
        canvasHeight: height,
        ballWidth: ballWidth,
        ballHeight: ballHeight,
        version: -1
    };
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

        // scale the canvas appropriately for the pixel ratio
        // see https://medium.com/wdstack/fixing-html5-2d-canvas-blur-8ebe27db07da
        (function fix_dpi() {
            const dpi = window.devicePixelRatio;
            const style = getComputedStyle(canvas);
            const style_width = Number(style.width.match(/(.*)px/)[1]);
            const style_height = Number(style.height.match(/(.*)px/)[1]);
            
            canvas.width = style_width * dpi;
            canvas.height = style_height * dpi;
        })();

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

        // draw RSP
        const rspResult = game.result.find(result => result.name == 'RSP');
        if (rspResult) {
            drawRsp(ctx,
                    {rock: rockImage, scissors: scissorsImage, paper: paperImage},
                    rspResult,
                    yardLineToPixels(-5, canvas.width),
                    yardLineToPixels(100, canvas.width),
                    canvas.height/2,
                    ballWidth*2);
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

function drawRsp(ctx, images, result, homeX, awayX, y, width) {
    function getImage(choice) {
        switch (choice) {
            case 'ROCK': return images.rock;
            case 'SCISSORS': return images.scissors;
            case 'PAPER': return images.paper;
        }
    }

    ctx.drawImage(getImage(result.home), homeX, y, width, width);
    ctx.drawImage(getImage(result.away), awayX, y, width, width);
}



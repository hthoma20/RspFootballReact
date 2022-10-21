import { useEffect, useRef, useState } from "react";

import { useImages } from "util/images";

import 'styles/Game.css';
import { Game, Player, Result } from "model/rspModel";

type RspImage = 'fistLeft' | 'fistRight' | 'rock' | 'paper' | 'scissors';
type Die = {face: number, x: number, y: number, dx: number, dy: number};
type AnimationState = {
    version: number;
    rsp: {x: number, y: number, image: RspImage}[];
    roll: Die[];
    text: {[key in string]: {x?: number, y?: number, size?: number, text: string}};
    firstDown: number | null;
    ballpos: number | null;
};
type Animation = Generator<undefined, void, unknown>;

type ImageNames = 'field' | 'ball' | 'rock' | 'paper' | 'scissors' | 'fistLeft' | 'fistRight' | 'dice';
type Images = {[key in ImageNames]: HTMLImageElement}

/**
 * The GameCanvas is responsible for displaying the current state of the game
 * to the user. This includes an image of the ball, the dice, etc.
 * The GameCanvas also orchestrates animations.
 * 
 * On the first render an inital animationState is created.
 * This state is saved across renders, but it is not tied to React state so changes
 * does not cause re-renders.
 * 
 * Everytime a render with an updated game occurs, a new animation is created via getAnimation.
 * The animation is a generator which mutates the animationState and `yield`s when the frame should be displayed.
 * paintCanvas reads the animation state to update the display. 
 */
export function GameCanvas({game, player, animationComplete}:
    {game: Game | null, player: Player, animationComplete: () => void}) {
    
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const animationStateRef = useRef(getInitialAnimationState());
    const animationRef = useRef<Animation>(function*(){}());
    const animationFrameRequestRef = useRef<number | null>(null);  

    const [images, imagesLoaded] = useImages({
        field: 'field.png',
        ball: 'football.png',
        rock: 'rock.png',
        paper: 'paper.png',
        scissors: 'scissors.png',
        fistLeft: 'fist_left.png',
        fistRight: 'fist_right.png',
        dice: 'dice.png'
    });

    useEffect(() => {
        if (!imagesLoaded || game === null) {
            return;
        }

        // This is the case of a poll returning a known version
        // in this case, we are already in progress with the relevant animation
        // or it has completed
        if (animationStateRef.current.version === game.version) {
            return;
        }

        const canvas = canvasRef.current;
        if (canvas == null) {
            return;
        }

        fix_dpi(canvas);

        console.log(`Starting animation. Version ${game.version}`);

        animationStateRef.current.version = game.version;
        animationRef.current = getAnimation(animationStateRef.current, game, player, canvas.width, canvas.height);
        if (animationFrameRequestRef.current !== null) {
            window.cancelAnimationFrame(animationFrameRequestRef.current!);
        }

        function animationExecutor() {
            const animationDone = animationRef.current.next().done;
            if (animationDone) {
                console.log(`Animation complete. Version ${animationStateRef.current.version}`);
                animationComplete();
                return;
            }
            paintCanvas(canvas!, images, animationStateRef.current, player);
            animationFrameRequestRef.current = window.requestAnimationFrame(animationExecutor);
        }

        animationExecutor();

    });

    return (
        <canvas id="gameCanvas" ref={canvasRef} />
    );
}

// scale the canvas appropriately for the pixel ratio
// see https://medium.com/wdstack/fixing-html5-2d-canvas-blur-8ebe27db07da
function fix_dpi(canvas: HTMLCanvasElement) {
    const dpi = window.devicePixelRatio;
    const style = getComputedStyle(canvas);
    const style_width = Number(style.width.match(/(.*)px/)![1]);
    const style_height = Number(style.height.match(/(.*)px/)![1]);
    
    canvas.width = style_width * dpi;
    canvas.height = style_height * dpi;
}

function paintCanvas(canvas: HTMLCanvasElement, images: Images, animationState: AnimationState, player: Player) {
    // console.log("animationState:", animationState);
    const ctx = canvas.getContext('2d');

    if (ctx == null) {
        return;
    }

    // draw field
    ctx.drawImage(images.field, 0, 0, canvas.width, canvas.height);


    // draw first down
    if (animationState.firstDown) {
        ctx.beginPath();
        ctx.moveTo(animationState.firstDown, 0);
        ctx.lineTo(animationState.firstDown, canvas.height);
        ctx.strokeStyle = '#efe410';
        ctx.lineWidth = 5;
        ctx.stroke();
    }

    // draw text
    for (let textModel of Object.values(animationState.text)) {
        const text = {
            size: canvas.height/3,
            x: canvas.width/2,
            y: canvas.height/2,
            ...textModel
        };

        ctx.font = `${text.size}px Arial`;
        ctx.fillStyle = '#000';
        ctx.textAlign = 'center';
        ctx.fillText(text.text, text.x, text.y);
    }

    // draw ball
    const ballWidth = yardsToPixels(5, canvas.width);
    const ballHeight = .67*ballWidth;

    if (animationState.ballpos !== null) {
        ctx.drawImage(images.ball,
            animationState.ballpos - ballWidth/2,
            canvas.height/2 - ballHeight/2,
            ballWidth, ballHeight);
    }
    
    // draw RSP
    for (let rsp of animationState.rsp) {
        const image = images[rsp.image];
        const size = ballWidth*2;
        ctx.drawImage(image, rsp.x - size/2, rsp.y - size/2, size, size);
    }

    // draw roll
    for (let die of animationState.roll) {
        const sideLength = yardsToPixels(5, canvas.width);
        drawDie(ctx, images.dice, sideLength, die);    
    }
}

function drawDie(ctx: CanvasRenderingContext2D, image: CanvasImageSource, sideLength: number, die: Die) {
    // the source image is a grid with dimension 640*427 pixels, with each die image
    // arranged as below
    // 1 2 3
    // 4 5 6
    const clipWidth = 213;
    const clipHeight = 213;

    const clipX = ((die.face-1) % 3) * clipWidth;
    const clipY =  die.face < 4 ? 0 : clipHeight;

    ctx.drawImage(image,
        clipX,
        clipY,
        clipWidth,
        clipHeight,
        die.x,
        die.y,
        sideLength,
        sideLength);
}

function getInitialAnimationState(): AnimationState {
    return {
        version: -1,
        rsp: [],
        roll: [],
        text: {},
        ballpos: null,
        firstDown: null
    };
}

/**
 * Given an initial animationState, and a game
 * return a generator which mutates the animationState, and yields
 * when it is ready for a frame to be painted.
 * Note that nothing is yielded, the new frame is communicated by mutations to
 * the given animationState
 */
function* getAnimation(animationState: AnimationState, game: Game, player: Player,
    canvasWidth: number, canvasHeight: number): Animation {

    for (let frame of getRspAnimation(animationState, game, player, canvasWidth, canvasHeight)) {
        yield;
    }

    for (let frame of getDiceAnimation(animationState, game, player, canvasWidth, canvasHeight)) {
        yield;
    }

    for (let frame of getBallAnimation(animationState, game, player, canvasWidth)) {
        yield;
    }

    for (let frame of getFirstDownAnimation(animationState, game, player, canvasWidth)) {
        yield;
    }

    getGameOverFrame(animationState, game, player, canvasWidth, canvasHeight);
    yield;
}

function getGameOverFrame(animationState: AnimationState, game: Game, player: Player,
    canvasWidth: number, canvasHeight: number) {
    if (game.state == 'GAME_OVER') {
        animationState.text.gameOver = {
            x: canvasWidth/2,
            y: canvasHeight/2,
            size: canvasHeight/3,
            text: "Game Over"
        };
    }
    else {
        delete animationState.text.gameOver;
    }
}


function* getRspAnimation(animationState: AnimationState, game: Game, player: Player,
    canvasWidth: number, canvasHeight: number): Animation {
    // draw RSP
    const rspResult = getResult(game, 'RSP');

    if (!rspResult) {
        animationState.rsp = [];
        return;
    }

    function initRspObject(rspPlayer: Player) {
        const isLeft = player == rspPlayer;
        const fieldPos = isLeft ? 40 : 60;
        const image: 'fistLeft' | 'fistRight' = isLeft ? 'fistLeft' : 'fistRight';

        return {
            image: image,
            x: yardLineToPixels(fieldPos, canvasWidth),
            y: canvasHeight/2
        };
    }

    const homeIndex = 0, awayIndex = 1;
    animationState.rsp = (['home', 'away'] as Player[]).map(initRspObject);
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

    animationState.rsp[homeIndex]!.image = rspResult.home.toLowerCase() as RspImage;
    animationState.rsp[awayIndex]!.image = rspResult.away.toLowerCase() as RspImage;
    yield;
}

function* getDiceAnimation(animationState: AnimationState, game: Game, player: Player,
    canvasWidth: number, canvasHeight: number): Animation {

    const result = getResult(game, 'ROLL');

    if (!result) {
        animationState.roll = [];
        yield;
        return;
    }

    const initX = 0, initY = 0, initDx = canvasWidth/100, initDy = 0;
    const offset = yardsToPixels(6, canvasWidth);

    animationState.roll = result.roll.map((die, index) => {
        return {
            face: getRandomDieFace(),
            x: initX + offset*index,
            y: initY,
            dx: initDx,
            dy: initDy
        };
    });

    const floorY = (3/4) * canvasHeight, acceleration = 0.4, damping = 0.5, threshold = 0.5;
    const animations = animationState.roll.map(die => getDieAnimation(die, floorY, acceleration, damping, threshold));
    for (let frame of getParallelAnimation(animations)) {
        yield;
    }

    result.roll.forEach((die, index) => animationState.roll[index]!.face = die);
    yield;
}

// note that threshold must be less than acceleration
function* getDieAnimation(die: Die, floorY: number, acceleration: number, damping: number, threshold: number): Animation {
    // if the threshold is greater than the acceleration, it is possible to accelerate "over the threshold" and
    // bounce forever
    threshold = Math.min(acceleration, threshold);

    while (true) {
        // if its a bounce
        if (die.y > floorY && die.dy > 0) {
            die.dy = -(die.dy * damping);
            die.dx = die.dx * damping;

            die.face = getRandomDieFace();

            if (Math.abs(die.dy) < threshold) {
                yield;
                return;
            }
        }

        die.x += die.dx;
        die.y += die.dy;

        die.dy += acceleration;
        yield;
    }
}

function getRandomDieFace() {
    return Math.floor(Math.random()*6) + 1;
}


function* getBallAnimation(animationState: AnimationState, game: Game, player: Player,
    canvasWidth: number): Animation {
    const pixelBallpos = yardLineToPixels(game.ballpos, canvasWidth, game, player);

    if (!animationState.ballpos) {
        animationState.ballpos = pixelBallpos;
        yield;
        return;
    }
    
    const isSafety = !!getResult(game, 'SAFETY');
    if (isSafety) {
        const safetyBallPos = yardLineToPixels(-5, canvasWidth, game, player);
        for (let ballpos of getTween(animationState.ballpos, safetyBallPos)) {
            animationState.ballpos = ballpos;
            yield;
        }
        const pause = 100;
        animationState.text.safety = {text: "Safety!"};
        for (let frame = 0; frame < pause; frame++) {
            yield;
        }
        delete animationState.text.safety;
        yield;
    }

    for (let ballpos of getTween(animationState.ballpos, pixelBallpos)) {
        animationState.ballpos = ballpos;
        yield;
    }
}

function* getFirstDownAnimation(animationState: AnimationState, game: Game, player: Player,
    canvasWidth: number): Animation {
    if (!game.firstDown) {
        animationState.firstDown = null;
        yield;
        return;
    }

    
    const destination = yardLineToPixels(game.firstDown, canvasWidth, game, player);

    if (!animationState.firstDown) {
        animationState.firstDown = destination;
        yield;
        return;
    }

    for (let firstDown of getTween(animationState.firstDown, destination)) {
        animationState.firstDown = firstDown;
        yield;
    }
}

function* getTween(start: number, finish: number) {
    const distanceInPixels = finish - start;
    const tweenFrames = getTweenFrames(distanceInPixels);
    const pixelsPerFrame = distanceInPixels / tweenFrames;

    let curr = start;
    
    for (let x = 0; x < tweenFrames; x++) {
        curr += pixelsPerFrame;
        yield curr;
    }
    yield finish;
}

function getTweenFrames(distanceInPixels: number) {
    distanceInPixels = Math.abs(distanceInPixels);
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



// given a list of animations, advance each a frame before yielding
function* getParallelAnimation(animations: Animation[]): Animation {
    let hasIncompleteAnimation = true;

    while (hasIncompleteAnimation) {
        hasIncompleteAnimation = false;
        for (let animation of animations) {
            const done = animation.next().done;
            if (!done) {
                hasIncompleteAnimation = true;
            }
        }
        yield;
    }
}


// return a result of the given name
// null if not present
function getResult<ResultT extends Result['name']>(game: Game, resultName: ResultT) {
    type ResultType = Extract<Result, {name: ResultT}>; // this picks the type that matches the given result name
    const matchingResult = game.result.find(result => result.name === resultName) as ResultType | undefined;
    return matchingResult ? matchingResult : null;
}

// return the number of pixels from the left of the canvas
// which corresponds with the given yardLine
// if the optional game and player arguments are included, take into account the given
// players point of veiw in the context of the game
function yardLineToPixels(yardLine: number, canvasWidth: number, game?: Game, player?: Player) {

    if (game && player) {
        yardLine = game.possession == player ? yardLine : 100-yardLine;
    }

    const pixelsPerYard = canvasWidth/120;
    return pixelsPerYard * (10+yardLine);
}

// return the number of pixels that represents the number of yards
function yardsToPixels(yards: number, canvasWidth: number) {
    return yards * (canvasWidth/120);
}

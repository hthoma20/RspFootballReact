import { Game, Player } from "model/rspModel";

export function ScoreBanner({game}: {game: Game | null}) {

    if (game === null) {
        return <div id="scoreBanner" />;
    }

    return (
        <div id="scoreBanner">
            <ScoreContainer game={game} player="away" />
            <ScoreContainer game={game} player="home" />
            <TimeContainer game={game} />
            <DownContainer game={game} />
        </div>
    );
}

function ScoreContainer({game, player}: {game: Game, player: Player}) {
    const divId = `${player}ScoreContainer`;
    let className = 'scoreContainer';
    if (game.possession === player) {
        className += ' possession';
    }
    
    const playerName = game.players[player];
    const playerScore = game.score[player];
    const penalties = game.penalties[player];

    function PenaltyMarkers() {
        return (<div className="penalties">
            {Array.from({length: penalties}, (_, i) => <div key={i} className="penaltyMarker" />)}
        </div>);
    }

    return (
        <div id={divId} className={className}>
            <div className="playerName">{playerName}</div>
            <div className="playerScore">{playerScore}</div>
            <PenaltyMarkers />
        </div>
    );
}

function getOrdinalSuffix(ord: number) {
    const lastDigit = ord % 10;
    switch (lastDigit) {
        case 1: return 'st';
        case 2: return 'nd';
        case 3: return 'rd';
        default: return 'th';
    }
}

function TimeContainer({game}: {game: Game}) {
    // since plays 1-20 are in quarter 1, shift everything up 19 to line it up
    const quarter = Math.floor((game.playCount + 19)/20);
    const playsRemaining = 21 - game.playCount % 20;

    return (
        <div id="timeContainer">
            <div id="quarterContainer">
                <div>{quarter}</div>
                <div className="ordinalSuffix">{getOrdinalSuffix(quarter)}</div>
            </div>
            <div id="clock">
                {playsRemaining}
            </div>
        </div>
    );
}

function DownContainer({game}: {game: Game}) {

    if (game.firstDown === null) {
        return <div id="downContainer" />;
    }

    const downSuffix = getOrdinalSuffix(game.down);
    const distanceToFirst = game.firstDown - game.ballpos;

    if (distanceToFirst <= 0) {
        return (
            <div id="downContainer">
                <div>1</div>
                <div className="ordinalSuffix">st</div>
                <div>down!</div>
            </div>
        );
    }

    return (
        <div id="downContainer">
            <div>{game.down}</div>
            <div className="ordinalSuffix">{downSuffix}</div>
            <div id="downSpacer">&</div>
            <div>{distanceToFirst}</div>
        </div>
    );
}
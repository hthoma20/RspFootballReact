import { useEffect } from "react";
import { useRef, useState } from "react";

import { Game, Player, PlayerMap, UserId } from "model/gameModel";
import { ComputedResult, ComputedRollResult, ComputedRspResult, computeResults } from "mappers/result";


/**
 * A log of results from previous states.
 * 
 * This component is stateful - it keeps track of all results throughout its
 * lifetime. Each render, the results of the given game are added to the running log,
 * and de-duplicated (it is safe to re-render this component)
 */
export function ResultLog({game, player}: {game: Game | null, player: Player}) {
    // the most recently rendered game version
    const [version, setVersion] = useState(-1);
    const [resultLog, setResultLog] = useState<ComputedResult[]>([]);

    const elementRef = useRef<HTMLDivElement>(null);
    const [shouldScroll, setShouldScroll] = useState(false);

    useEffect(() => {
        if (shouldScroll && elementRef.current != null) {
            elementRef.current.scrollTop = elementRef.current.scrollHeight;
            setShouldScroll(false);
        }
    });
    
    if (game !== null && game.version > version && game.result.length > 0) {
        const computedResults = computeResults(game)
        setResultLog([...resultLog, ...computedResults]);
        setVersion(game.version);
        setShouldScroll(true);
    }

    const players = game ? game.players : {'home': '', 'away': ''};

    // Note that the index is used as a key. This is safe since results are never removed, and
    // new results are always added to the back of the list, so the indices are stable
    // in fact, the results list is a best-known order of results throughout the entire game
    const renderedResults = resultLog.map((result, index) =>
        <ResultComponent player ={player} players={players} result={result} key={index} />);

    return (
        <div id="resultLog" ref={elementRef}>
            {renderedResults}
        </div>
    );

}


type ResultProps = {
    player: Player,
    players: PlayerMap<UserId>,
    result: ComputedResult
};

function ResultComponent({player, players, result}: ResultProps) {
    switch(result.name) {
        case 'ROLL':
            return <RollResultComponent player={player} players={players} result={result} />;
        case 'RSP':
            return <RspResultComponent player={player} result={result} />;
    }
    console.error(`Unrecognized result ${result}`);
    return null;
}

function RollResultComponent({player, players, result}: ResultProps & {result: ComputedRollResult}) {
    if (result.roll.length == 0) {
        return null;
    }

    const roll = result.roll.join('-');
    const article = result.roll.length == 1 ? "a" : "";

    const roller = result.player == player ? 'You' : players[result.player];

    return <div>{roller} rolled {article} {roll}</div>;
}

function RspResultComponent({player, result}: {player: Player, result: ComputedRspResult}) {

    let log: string;
    if (result.winner === null) {
        log = 'RSP tied'
    }
    else if (result.winner === player) {
        log = 'You won the RSP';
    }
    else {
        log = 'You lost the RSP';
    }

    return <div>{log}</div>;
}
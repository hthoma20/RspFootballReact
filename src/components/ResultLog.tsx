import { useEffect } from "react";
import { useRef, useState } from "react";

import { Game, UserId } from "model/gameModel";
import { RenderStateMachine, useRenderStateMachine } from "util/renderStateMachine";
import { getRspWinner } from 'util/rsp';
import { Result, RollResult, RspResult } from "model/resultModel";



/**
 * A log of results from previous states.
 * 
 * This component is stateful - it keeps track of all results throughout its
 * lifetime. Each render, the results of the given game are added to the running log,
 * and de-duplicated (it is safe to re-render this component)
 */
export function ResultLog({game, renderState}: {game: Game, renderState: RenderStateMachine}) {
    // the most recently rendered game version
    const [version, setVersion] = useState(-1);
    const [resultLog, setResultLog] = useState<Result[]>([]);

    const elementRef = useRef<HTMLDivElement>(null);
    const [shouldScroll, setShouldScroll] = useState(false);

    game = useRenderStateMachine(game, renderState, 'UPDATING_RESULT_LOG', 'RESULT_LOG_UPDATED');

    useEffect(() => {
        if (shouldScroll && elementRef.current != null) {
            elementRef.current.scrollTop = elementRef.current.scrollHeight;
            setShouldScroll(false);
        }
    });
    
    if (game.version > version && game.result.length > 0) {
        setResultLog([...resultLog, ...game.result]);
        setVersion(game.version);
        setShouldScroll(true);
    }

    // Note that the index is used as a key. This is safe since results are never removed, and
    // new results are always added to the back of the list, so the indices are stable
    // in fact, the results list is a best-known order of results throughout the entire game
    const renderedResults = resultLog.map((result, index) =>
        <ResultComponent user={"Player"} result={result} key={index} />);

    return <div id="resultLog" ref={elementRef}>
        {renderedResults}
    </div>;

}

type ResultProps = {user: UserId, result: Result};

function ResultComponent({user, result}: ResultProps) {
    switch(result.name) {
        case 'ROLL':
            return <RollResultComponent user={user} result={result} />;
        case 'RSP':
            return <RspResultComponent user={user} result={result} />;
    }
    console.error(`Unrecognized result ${result}`);
    return null;
}

function RollResultComponent({user, result}: ResultProps & {result: RollResult}) {
    if (result.roll.length == 0) {
        return null;
    }

    const roll = result.roll.join('-');
    const article = result.roll.length == 1 ? "a" : "";

    return <div>{user} rolled {article} {roll}</div>;
}

function RspResultComponent({user, result}: ResultProps & {result: RspResult}) {
    const winner = getRspWinner(result);
    const log = winner ? `${winner} won the RSP.` : `RSP tied.`;

    return <div>{log}</div>;
}
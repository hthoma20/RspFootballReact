import { useEffect } from "react";
import { useRef, useState } from "react";

import { getRspWinner } from 'util/rsp';

/**
 * A log of results from previous states.
 * 
 * This component is stateful - it keeps track of all results throughout its
 * lifetime. Each render, the results of the given game are added to the running log,
 * and de-duplicated (it is safe to re-render this component)
 */
export function ResultLog({game}) {
    // the most recently rendered game version
    const [version, setVersion] = useState(-1);
    const [resultLog, setResultLog] = useState([]);

    const resultLogRef = useRef(null);
    const [shouldScroll, setShouldScroll] = useState(false);

    useEffect(() => {
        if (shouldScroll) {
            resultLogRef.current.scrollTop = resultLogRef.current.scrollHeight;
            setShouldScroll(false);
        }
    });
    
    if (game.version > version && game.result.length > 0) {
        setResultLog([...resultLog, ...game.result]);
        setVersion(game.version);
        setShouldScroll(true);
    }

    const renderedResults = resultLog.map(result => <Result user={"Player"} result={result} />);

    return <div id="resultLog" ref={resultLogRef}>
        {renderedResults}
    </div>;

}

function Result({user, actor, result}) {
    switch(result.name) {
        case 'ROLL':
            return <RollResult user={user} result={result} />;
        case 'RSP':
            return <RspResult user={user} result={result} />;
    }
}

function RollResult({user, result}) {
    if (result.roll.length == 0) {
        return;
    }

    const roll = result.roll.join('-');
    const article = result.roll.length == 1 ? "a" : "";

    return <div>{user} rolled {article} {roll}</div>;
}

function RspResult({user, result}) {
    const winner = getRspWinner(result);
    const log = winner ? `${winner} won the RSP.` : `RSP tied.`;

    return <div>{log}</div>;
}
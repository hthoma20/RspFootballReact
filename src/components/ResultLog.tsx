import { useEffect } from "react";
import { useRef, useState } from "react";

import { BlockedKickResult, CoffinCornerResult, FakeKickResult, GainResult, Game, IncompletePassResult, LossResult, OutOfBoundsKickResult, OutOfBoundsPassResult, Player, PlayerMap, TouchbackResult, TurnoverResult } from "model/rspModel";
import { ComputedCallPlayResult, ComputedFumbleResult, ComputedKickoffElectionResult, ComputedOnsideKickResult, ComputedResult, ComputedRollResult, ComputedRspResult, ComputedScoreResult, computeResults } from "mappers/result";
import { getLocalizedString } from "util/localization";


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
    
    if (game !== null && game.version > version) {
        const computedResults = computeResults(game);
        setResultLog([...resultLog, ...computedResults]);
        setVersion(game.version);
        setShouldScroll(true);
    }

    const players = {
        home: game && game.players.home ? game.players.home : '',
        away: game && game.players.away ? game.players.away : ''
    };

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
    players: PlayerMap<string>,
    result: ComputedResult
};

function ResultComponent({player, players, result}: ResultProps): JSX.Element {
    switch(result.name) {
        case 'ROLL':
            return <RollResultComponent player={player} players={players} result={result} />;
        case 'RSP':
            return <RspResultComponent player={player} result={result} />;
        case 'CALL_PLAY':
            return <CallPlayResultComponent player={player} players={players} result={result} />;
        case 'FUMBLE':
            return <FumbleResultComponent player={player} players={players} result={result} />;
        case 'GAIN':
            return <GainResultComponent player={player} players={players} result={result} />;
        case 'LOSS':
            return <LossResultComponent player={player} players={players} result={result} />;
        case 'SCORE':
            return <ScoreResultComponent player={player} players={players} result={result} />;
        case 'TURNOVER':
            return <TurnoverResultComponent player={player} players={players} result={result} />;
        case 'OOB_PASS':
            return <OutOfBoundsPassResultComponent player={player} players={players} result={result} />;
        case 'OOB_KICK':
            return <OutOfBoundsKickResultComponent player={player} players={players} result={result} />;
        case 'INCOMPLETE':
            return <IncompletePassResultComponent player={player} players={players} result={result} />;
        case 'TOUCHBACK':
            return <TouchbackResultComponent player={player} players={players} result={result} />;
        case 'ONSIDE':
            return <OnsideKickResultComponent player={player} players={players} result={result} />;
        case 'KICK_ELECTION':
            return <KickElectionResultComponent player={player} players={players} result={result} />;
        case 'COFFIN_CORNER':
                return <CoffinCornerResultComponent player={player} players={players} result={result} />;
        case 'FAKE_KICK':
            return <FakeKickResultComponent player={player} players={players} result={result} />;
        case 'BLOCKED_KICK':
            return <BlockedKickResultComponent player={player} players={players} result={result} />;
    }
}

function RollResultComponent({player, players, result}: ResultProps & {result: ComputedRollResult}) {
    if (result.roll.length == 0) {
        return null;
    }

    const roll = result.roll.join('-');
    const article = result.roll.length == 1 ? "a" : "";

    const roller = getUserString(player, result.player, players);

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

function CallPlayResultComponent({player, players, result}: ResultProps & {result: ComputedCallPlayResult}) {

    const caller = getUserString(player, result.player, players);

    const prettyPlay = upperCaseWords(result.play.replaceAll('_', ' '));

    return <div>{caller} called {prettyPlay}</div>;
}

function FumbleResultComponent({player, players, result}: ResultProps & {result: ComputedFumbleResult}) {
    const fumbler = getUserString(player, result.player, players);
    return <div>{fumbler} fumbled!</div>;
}

function GainResultComponent({player, players, result}: ResultProps & {result: GainResult}) {
    return <div>{result.yards} yard gain</div>;
}

function LossResultComponent({player, players, result}: ResultProps & {result: LossResult}) {
    return <div>{result.yards} yard loss</div>;
}

function ScoreResultComponent({player, players, result}: ResultProps & {result: ComputedScoreResult}) {
    const localizationKey: any = `SCORE_${result.type}`
    return <div>{getLocalizedString(localizationKey)}</div>;
}

function TurnoverResultComponent({player, players, result}: ResultProps & {result: TurnoverResult}) {
    const localizationKey: any = `TURNOVER_RESULT_${result.type}`;
    return <div>{getLocalizedString(localizationKey)}</div>;
}

function OutOfBoundsPassResultComponent({player, players, result}: ResultProps & {result: OutOfBoundsPassResult}) {
    return <div>{getLocalizedString('OUT_OF_BOUNDS_PASS')}</div>
}

function OutOfBoundsKickResultComponent({player, players, result}: ResultProps & {result: OutOfBoundsKickResult}) {
    return <div>{getLocalizedString('OUT_OF_BOUNDS_KICK')}</div>
}

function IncompletePassResultComponent({player, players, result}: ResultProps & {result: IncompletePassResult}) {
    return <div>{getLocalizedString('INCOMPLETE_PASS')}</div>
}

function TouchbackResultComponent({player, players, result}: ResultProps & {result: TouchbackResult}) {
    return <div>{getLocalizedString('TOUCHBACK')}</div>
}

function OnsideKickResultComponent({player, players, result}: ResultProps & {result: ComputedOnsideKickResult}) {
    return <div>{getLocalizedString('ONSIDE_KICK')}</div>
}

function KickElectionResultComponent({player, players, result}: ResultProps & {result: ComputedKickoffElectionResult}) {
    const user = getUserString(player, result.player, players);
    const choice = result.choice.toLowerCase();
    const string = `${user} elected to ${choice}`;
    return <div>{string}</div>
}

function CoffinCornerResultComponent({player, players, result}: ResultProps & {result: CoffinCornerResult}) {
    return <div>{getLocalizedString('COFFIN_CORNER')}</div>
}

function FakeKickResultComponent({player, players, result}: ResultProps & {result: FakeKickResult}) {
    return <div>{getLocalizedString('FAKE_KICK')}</div>
}

function BlockedKickResultComponent({player, players, result}: ResultProps & {result: BlockedKickResult}) {
    return <div>{getLocalizedString('BLOCKED_KICK')}</div>
}

function upperCaseWords(str: string) {
    return str.split(' ').map(word =>
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
}

function getUserString(player: Player, actingPlayer: Player, players: PlayerMap<string>) {
    return actingPlayer === player ? 'You' : players[actingPlayer];
}
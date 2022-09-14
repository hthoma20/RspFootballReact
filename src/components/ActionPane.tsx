import React from "react";

import { getDieCountChoices } from "util/actions";
import { Action } from "model/actionModel";
import { Game, GameId, Play, Player, UserId } from "model/gameModel";
import { getOpponent } from "util/players";

type ActionDispatch = (action: Action) => Promise<void>;

export function ActionPane({game, player, dispatchAction}: {game: Game | null, player: Player, dispatchAction: ActionDispatch}) {
    if (game === null) {
        return null;
    }

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
    if (actions.includes('ROLL_AGAIN_CHOICE')) {
        return <RollAgainChoicePane dispatchAction={dispatchAction} />;
    }
    if (actions.includes('ROLL')) {
        return <RollPane dispatchAction={dispatchAction} game={game} />;
    }
    if (actions.includes('CALL_PLAY')) {
        return <CallPlayPane dispatchAction={dispatchAction} game={game} />;
    }
    if (actions.includes('PAT_CHOICE')) {
        return <PatPane dispatchAction={dispatchAction} game={game} />;
    }
    if (actions.includes('POLL')) {
        const opponentAction = game.actions[getOpponent(player)];
        return <div>Waiting for opponent: {opponentAction}</div>
    }
    return null;
}

function RspPane({dispatchAction}: {dispatchAction: ActionDispatch}) {

    const dispatch = getChoiceActionDispatch(dispatchAction, 'RSP');

    return (
        <div>
            <ActionButton onClick={() => dispatch('ROCK')}>ROCK</ActionButton>
            <ActionButton onClick={() => dispatch('PAPER')}>PAPER</ActionButton>
            <ActionButton onClick={() => dispatch('SCISSORS')}>SCISSORS</ActionButton>
        </div>
    );
}

function KickoffElectionPane({dispatchAction}: {dispatchAction: ActionDispatch}) {
    const dispatch = getChoiceActionDispatch(dispatchAction, 'KICKOFF_ELECTION');

    return (
        <div>
            <ActionButton onClick={() => dispatch('KICK')}>KICK</ActionButton>
            <ActionButton onClick={() => dispatch('RECIEVE')}>RECIEVE</ActionButton>
        </div>
    );
}

function KickoffChoicePane({dispatchAction}: {dispatchAction: ActionDispatch}) {
    const dispatch = getChoiceActionDispatch(dispatchAction, 'KICKOFF_CHOICE');

    return (
        <div>
            <ActionButton onClick={() => dispatch('REGULAR')}>REGULAR</ActionButton>
            <ActionButton onClick={() => dispatch('ONSIDE')}>ONSIDE</ActionButton>
        </div>
    );
}

function TouchbackChoicePane({dispatchAction}: {dispatchAction: ActionDispatch}) {
    const dispatch = getChoiceActionDispatch(dispatchAction, 'TOUCHBACK_CHOICE');

    return (
        <div>
            <ActionButton onClick={() => dispatch('TOUCHBACK')}>TOUCHBACK</ActionButton>
            <ActionButton onClick={() => dispatch('RETURN')}>ROLL</ActionButton>
        </div>
    );
}

function RollAgainChoicePane({dispatchAction}: {dispatchAction: ActionDispatch}) {
    const dispatch = getChoiceActionDispatch(dispatchAction, 'ROLL_AGAIN_CHOICE');

    return (
        <div>
            <ActionButton onClick={() => dispatch('ROLL')}>ROLL</ActionButton>
            <ActionButton onClick={() => dispatch('HOLD')}>HOLD</ActionButton>
        </div>
    );
}

function RollPane({dispatchAction, game}: {dispatchAction: ActionDispatch, game: Game}) {

    function dispatchRollAction(count: number) {
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

function CallPlayPane({dispatchAction, game}: {dispatchAction: ActionDispatch, game: Game}) {
    
    function dispatchPlayAction(play: Play) {
        dispatchAction({
            name: "CALL_PLAY",
            play: play
        });
    }
    
    return (
        <div>
            <ActionButton onClick={() => dispatchPlayAction('SHORT_RUN')}>Short Run</ActionButton>
            <ActionButton onClick={() => dispatchPlayAction('LONG_RUN')}>Long Run</ActionButton>
        </div>
    );
}

function PatPane({dispatchAction, game}: {dispatchAction: ActionDispatch, game: Game}) {
    const dispatch = getChoiceActionDispatch(dispatchAction, 'PAT_CHOICE');

    return (
        <div>
            <ActionButton onClick={() => dispatch('ONE_POINT')}>One Point</ActionButton>
            <ActionButton onClick={() => dispatch('TWO_POINT')}>Two Point</ActionButton>
        </div>
    )
}

function getChoiceActionDispatch(dispatchAction: ActionDispatch, choiceName: string) {
    return (choice: string) => {
        dispatchAction({
            name: choiceName,
            choice: choice
        })
    }
}

function ActionButton(props: {onClick: () => void, children: React.ReactNode}) {
    return (
        <button className="actionButton" onClick={props.onClick}>
            {props.children}
        </button>
    );
}
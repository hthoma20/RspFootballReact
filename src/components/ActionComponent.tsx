import React, { useState } from "react";

import 'styles/Game.css';
import { getDieCountChoices } from "util/actions";
import { Action } from "model/actionModel";
import { Game, GameId, Play, Player, UserId } from "model/gameModel";
import { getOpponent } from "util/players";

type ActionDispatch = (action: Action) => Promise<void>;

type ActionPaneProps = {
    dispatchAction: ActionDispatch;
    game: Game;
};

type ActionComponentProps = {
    game: Game | null;
    player: Player;
    dispatchAction: ActionDispatch;
    // If true, hide the action pane, even if the given game has actions for this player
    forceHidden: boolean;
};

export function ActionComponent({game, player, dispatchAction, forceHidden}: ActionComponentProps) {

    if (game === null) {
        return null;
    }

    // visible if there is any non-POLL action
    const isVisible = forceHidden ? false : game.actions[player].some(action => action !== 'POLL');

    return <div id="actionComponent" className={isVisible ? "visible" : "hidden"}>
        <div id="actionPane">
            <ActionPane game={game} player={player} dispatchAction={dispatchAction} />
        </div>
    </div>;
}

function ActionPane({game, player, dispatchAction}: ActionPaneProps & {player: Player}) {
    if (game === null) {
        return null;
    }

    const actions = game.actions[player];

    if (actions.includes('RSP')) {
        return <RspPane dispatchAction={dispatchAction} game={game} />;
    }
    if (actions.includes('KICKOFF_ELECTION')) {
        return <KickoffElectionPane dispatchAction={dispatchAction} game={game} />
    }
    if (actions.includes('KICKOFF_CHOICE')) {
        return <KickoffChoicePane dispatchAction={dispatchAction} game={game} />;
    }
    if (actions.includes('TOUCHBACK_CHOICE')) {
        return <TouchbackChoicePane dispatchAction={dispatchAction} game={game} />;
    }
    if (actions.includes('ROLL_AGAIN_CHOICE')) {
        return <RollAgainChoicePane dispatchAction={dispatchAction} game={game} />;
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


function RspPane({dispatchAction, game}: ActionPaneProps) {
    const dispatch = getChoiceActionDispatch(dispatchAction, 'RSP');

    return <ActionButtonGroup
        onClick={dispatch}
        gameVersion={game.version}
        buttons={[
            {key: 'ROCK', children: 'Rock'},
            {key: 'PAPER', children: 'Paper'},
            {key: 'SCISSORS', children: 'Scissors'}
        ]}
    />;
}

function KickoffElectionPane({dispatchAction, game}: ActionPaneProps) {
    const dispatch = getChoiceActionDispatch(dispatchAction, 'KICKOFF_ELECTION');

    return <ActionButtonGroup
        onClick={dispatch}
        gameVersion={game.version}
        buttons={[
            {key: 'KICK', children: 'Kick'},
            {key: 'RECIEVE', children: 'Recieve'}
        ]}
    />;
}

function KickoffChoicePane({dispatchAction, game}: ActionPaneProps) {
    const dispatch = getChoiceActionDispatch(dispatchAction, 'KICKOFF_CHOICE');

    return <ActionButtonGroup
        onClick={dispatch}
        gameVersion={game.version}
        buttons={[
            {key: 'REGULAR', children: 'Regular'},
            {key: 'ONSIDE', children: 'Onside'}
        ]}
    />;
}

function TouchbackChoicePane({dispatchAction, game}: ActionPaneProps) {
    const dispatch = getChoiceActionDispatch(dispatchAction, 'TOUCHBACK_CHOICE');

    return <ActionButtonGroup
        onClick={dispatch}
        gameVersion={game.version}
        buttons={[
            {key: 'TOUCHBACK', children: 'Touchback'},
            {key: 'RETURN', children: 'Roll!'}
        ]}
    />;
}

function RollAgainChoicePane({dispatchAction, game}: ActionPaneProps) {
    const dispatch = getChoiceActionDispatch(dispatchAction, 'ROLL_AGAIN_CHOICE');

    return <ActionButtonGroup
        onClick={dispatch}
        gameVersion={game.version}
        buttons={[
            {key: 'ROLL', children: 'Roll!'},
            {key: 'HOLD', children: 'Hold'}
        ]}
    />;
}

function RollPane({dispatchAction, game}: ActionPaneProps) {

    function dispatchRollAction(count: string) {
        dispatchAction({
            name: 'ROLL',
            count: count
        });
    }
    
    const rollButtons = getDieCountChoices(game).map(count => {return {
        key: ''+count, children: `${count}`
    }});

    return (
        <div>
            <span>Roll:</span>
            <ActionButtonGroup
                gameVersion={game.version}
                onClick={dispatchRollAction}
                buttons={rollButtons} />
        </div>
    );
}

function CallPlayPane({dispatchAction, game}: ActionPaneProps) {

    function onClick(play: Play) {
        dispatchAction({
            name: 'CALL_PLAY',
            play: play
        });
    }

    return <ActionButtonGroup
        onClick={onClick}
        gameVersion={game.version}
        buttons={[
            {key: 'SHORT_RUN', children: 'Short Run'},
            {key: 'LONG_RUN', children: 'Long Run'}
        ]}
    />;
}

function PatPane({dispatchAction, game}: ActionPaneProps) {
    const dispatch = getChoiceActionDispatch(dispatchAction, 'PAT_CHOICE');

    return <ActionButtonGroup
        onClick={dispatch}
        gameVersion={game.version}
        buttons={[
            {key: 'ONE_POINT', children: 'One Point'},
            {key: 'TWO_POINT', children: 'Two Point'}
        ]}
    />;
}

function getChoiceActionDispatch(dispatchAction: ActionDispatch, choiceName: string) {
    return (choice: string) => {
        dispatchAction({
            name: choiceName,
            choice: choice
        })
    }
}

type ActionButtonProps<K extends string> = {
    // A unique key for this button.
    key: K;
    // The Components to place in the button
    children: React.ReactNode;
};

/**
 * Display a group of buttons. These buttons can only be pressed once per game version.
 * If a new game version is given, the buttons re-validate.
 */
function ActionButtonGroup<K extends string>({buttons, onClick, gameVersion}:
    {buttons: ActionButtonProps<K>[], onClick: (key: K) => void, gameVersion: number}) {

    // TODO: in the case where RspChoice -> RspChoice, the buttons never re-enable
    
    // the key of the button which was pressed
    const [pressedButton, setPressedButton] = useState<K | null>(null);
    // the game version when the button was pressed
    const [pressedVersion, setPressedVersion] = useState<number | null>(null);

    if (pressedVersion !== null && pressedVersion !== gameVersion) {
        setPressedButton(null);
        setPressedVersion(null);
    }

    function getButtonState(key: K): ActionButtonState {
        if (pressedButton === null) {
            return 'ENABLED';
        }
        if (pressedButton === key) {
            return 'PRESSED';
        }
        return 'DISABLED';
    }

    function onClickFacade(key: K) {
        if (getButtonState(key) === 'ENABLED') {
            onClick(key);
            setPressedButton(key);
            setPressedVersion(gameVersion);
        }
    }

    const buttonComponents = buttons.map(buttonProps =>
        <ActionButton key={buttonProps.key}
            onClick={() => onClickFacade(buttonProps.key)}
            state={getButtonState(buttonProps.key)}>
            
            {buttonProps.children}
        
        </ActionButton>);
    
    return <div className='actionButtonGroup'>
        {buttonComponents}
    </div>;
}

type ActionButtonState = 'ENABLED' | 'DISABLED' | 'PRESSED';

function ActionButton(props: {state: ActionButtonState, onClick: () => void, children: React.ReactNode}) {
    
    const className = `actionButton ${props.state}`;
    
    return (
        <button className={className} onClick={props.onClick} disabled={props.state !== 'ENABLED'}>
            {props.children}
        </button>
    );
}
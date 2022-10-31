import 'styles/Game.css';
import { getDieCountChoices } from "util/actions";
import { ActionDispatch } from "model/actionModel";
import { Action, Game, Play, Player } from "model/rspModel";
import { ActionButtonGroup } from "lib/ActionButton";
import { useState } from 'react';
import { getLocalizedString } from 'util/localization';

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
    const irrelevantActions = ['POLL', 'RSP', 'PENALTY'];
    const isVisible = forceHidden ? false : game.actions[player].some(action => !irrelevantActions.includes(action));

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
    if (actions.includes('SACK_CHOICE')) {
        return <SackChoicePane dispatchAction={dispatchAction} game={game} />
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

    return null;
}

function KickoffElectionPane({dispatchAction, game}: ActionPaneProps) {
    const dispatch = getChoiceActionDispatch(dispatchAction, 'KICKOFF_ELECTION');

    return <ActionButtonGroup
        onClick={dispatch}
        gameVersion={game.version}
        buttons={[
            {actionKey: 'KICK', className: 'actionButton', children: 'Kick'},
            {actionKey: 'RECIEVE', className: 'actionButton', children: 'Recieve'}
        ]}
    />;
}

function KickoffChoicePane({dispatchAction, game}: ActionPaneProps) {
    const dispatch = getChoiceActionDispatch(dispatchAction, 'KICKOFF_CHOICE');

    return <ActionButtonGroup
        onClick={dispatch}
        gameVersion={game.version}
        buttons={[
            {actionKey: 'REGULAR', className: 'actionButton', children: 'Regular'},
            {actionKey: 'ONSIDE', className: 'actionButton', children: 'Onside'}
        ]}
    />;
}

function TouchbackChoicePane({dispatchAction, game}: ActionPaneProps) {
    const dispatch = getChoiceActionDispatch(dispatchAction, 'TOUCHBACK_CHOICE');

    return <ActionButtonGroup
        onClick={dispatch}
        gameVersion={game.version}
        buttons={[
            {actionKey: 'TOUCHBACK', className: 'actionButton', children: 'Touchback'},
            {actionKey: 'RETURN', className: 'actionButton', children: 'Roll!'}
        ]}
    />;
}

function RollAgainChoicePane({dispatchAction, game}: ActionPaneProps) {
    const dispatch = getChoiceActionDispatch(dispatchAction, 'ROLL_AGAIN_CHOICE');

    return <ActionButtonGroup
        onClick={dispatch}
        gameVersion={game.version}
        buttons={[
            {actionKey: 'ROLL', className: 'actionButton', children: 'Roll!'},
            {actionKey: 'HOLD', className: 'actionButton', children: 'Hold'}
        ]}
    />;
}

function SackChoicePane({dispatchAction, game}: ActionPaneProps) {
    const dispatch = getChoiceActionDispatch(dispatchAction, 'SACK_CHOICE');

    return <ActionButtonGroup
        onClick={dispatch}
        gameVersion={game.version}
        buttons={[
            {actionKey: 'SACK', className: 'actionButton', children: 'Sack'},
            {actionKey: 'PICK', className: 'actionButton', children: 'Attempt interception'}
        ]}
    />;
}

function RollPane({dispatchAction, game}: ActionPaneProps) {

    function dispatchRollAction(count: string) {
        dispatchAction({
            name: 'ROLL',
            count: +count
        });
    }
    
    const rollButtons = getDieCountChoices(game).map(count => {return {
        actionKey: ''+count,
        className: 'actionButton',
        children: `${count}`
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

    const [describedPlay, setDescribedPlay] = useState<Play | null>(null);

    function onClick(play: Play) {
        dispatchAction({
            name: 'CALL_PLAY',
            play: play
        });
    }

    function onHover(play: Play) {
        setDescribedPlay(play);
    }

    return <>
        <div className="actionPaneButtons">
            <ActionButtonGroup
                onClick={onClick}
                onHover={onHover}
                gameVersion={game.version}
                buttons={[
                    {actionKey: 'SHORT_RUN', className: 'actionButton',  children: 'Short Run'},
                    {actionKey: 'LONG_RUN', className: 'actionButton', children: 'Long Run'},
                    {actionKey: 'SHORT_PASS', className: 'actionButton', children: 'Short Pass'},
                    {actionKey: 'LONG_PASS', className: 'actionButton', children: 'Long Pass'}
                ]}
            />
        </div>
        <PlayDescription play={describedPlay} />
    </>;
}

function PlayDescription({play}: {play: Play | null}) {
    if (play === null) {
        return null;
    }

    const prettyPlay = play.split('_').join(' ');

    return <div className="playDescription">
        <div className="playDescriptionPlay">{prettyPlay}</div>
        <div className="playDescriptionTable">
            <div className="playDescriptionColumn win">
                <div className="playDescriptionHeader">Win</div>
                <div className="playDescriptionContent">{getLocalizedString(play+"_WIN" as any)}</div>
            </div>
            <div className="playDescriptionColumn tie">
                <div className="playDescriptionHeader">Tie</div>
                <div className="playDescriptionContent">{getLocalizedString(play+"_TIE" as any)}</div>
            </div>
            <div className="playDescriptionColumn loss">
                <div className="playDescriptionHeader">Lose</div>
                <div className="playDescriptionContent">{getLocalizedString(play+"_LOSS" as any)}</div>
            </div>
        </div>
    </div>;
}

function PatPane({dispatchAction, game}: ActionPaneProps) {
    const dispatch = getChoiceActionDispatch(dispatchAction, 'PAT_CHOICE');

    return <ActionButtonGroup
        onClick={dispatch}
        gameVersion={game.version}
        buttons={[
            {actionKey: 'ONE_POINT', className: 'actionButton', children: 'One Point'},
            {actionKey: 'TWO_POINT', className: 'actionButton', children: 'Two Point'}
        ]}
    />;
}

type ChoiceAction = Extract<Action, {'choice': string}>;
function getChoiceActionDispatch<ChoiceName extends ChoiceAction['name']>
    (dispatchAction: ActionDispatch, choiceName: ChoiceName) {
    
    type ChosenAction = Extract<ChoiceAction, {'name': ChoiceName}>;
    
    return (choice: ChosenAction['choice']) => {
        dispatchAction({
            name: choiceName,
            choice: choice as any
        })
    }
}

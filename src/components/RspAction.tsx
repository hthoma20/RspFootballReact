import { ActionDispatch } from "model/actionModel";
import { ActionButtonGroup } from "lib/ActionButton";
import { Game, Player, RspChoice } from "model/rspModel";


export function RspActionComponent({game, player, dispatchAction}:
    {game: Game | null, player: Player, dispatchAction: ActionDispatch}) {
    
    if (game === null) {
        return null;
    }

    if (!game.actions[player].includes('RSP')) {
        return null;
    }

    function onClick(actionKey: RspChoice) {
        dispatchAction({
            name: 'RSP',
            choice: actionKey
        });
    }

    return (
        <div id="rspActionComponent">
            <ActionButtonGroup 
                gameVersion={game.version}
                onClick={onClick}
                buttons={[
                    {actionKey: 'ROCK', className: 'rspAction rock'},
                    {actionKey: 'SCISSORS', className: 'rspAction scissors'},
                    {actionKey: 'PAPER', className: 'rspAction paper'}
                ]} />
        </div>
    );
}

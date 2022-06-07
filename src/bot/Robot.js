
import { getDieCountChoices } from "util/actions";


export function takeAction(game, player, dispatchAction) {
    
    const actions = game.actions[player];

    if (actions.includes('POLL')) {
        return;
    }

    const action = getActionToTake(game, player);
    
    if (action) {
        setTimeout(() => {
            dispatchAction(action);
        }, 1000);
    }
}

function getActionToTake(game, player) {

    const allowedActionName = game.actions[player][0];

    switch (allowedActionName) {
        case 'TOUCHBACK_CHOICE':
            return {name: 'TOUCHBACK_CHOICE', choice: 'TOUCHBACK'};
        case 'RSP':
            return {name: 'RSP', choice: 'ROCK'};
        case 'ROLL':
            return {name: 'ROLL', count: getDieCountChoices(game)[0]};
        case 'CALL_PLAY':
            return {name: 'CALL_PLAY', play: 'SHORT_RUN'};
    }

    return null;
}


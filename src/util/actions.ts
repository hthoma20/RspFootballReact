import { Game } from "model/rspModel";

export function getDieCountChoices(game: Game) {
    switch (game.state) {
        case 'KICKOFF':
            return [3];
        case 'ONSIDE_KICK':
        case 'EXTRA_POINT':
            return [2];
        case 'KICK_RETURN':
        case 'SACK_ROLL':
        case 'KICK_RETURN_6':
        case 'LONG_RUN_ROLL':
        case 'PICK_ROLL':
        case 'PICK_RETURN':
        case 'PICK_RETURN_6':
            return [1];                
    }

    return [];
}

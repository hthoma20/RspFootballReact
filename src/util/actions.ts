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
        case 'LONG_PASS_ROLL':
        case 'BOMB_ROLL':
        case 'PICK_ROLL':
        case 'PICK_RETURN':
        case 'PICK_RETURN_6':
            return [1];    
        case 'DISTANCE_ROLL':
            switch (game.play) {
                case 'LONG_PASS':
                    return [1];
                case 'BOMB':
                    return [3];
            }
            return [];
    }

    return [];
}

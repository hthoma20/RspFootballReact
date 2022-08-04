import { Game } from "model/gameModel";

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
            return [1];
    }

    return [];
}

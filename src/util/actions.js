
export function getDieCountChoices(game) {
    switch (game.state) {
        case 'KICKOFF':
            return [3];
        case 'ONSIDE_KICK':
            return [2];
        case 'KICK_RETURN':
        case 'SACK_ROLL':
            return [1];
    }
}

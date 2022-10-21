import { RspChoice } from "model/rspModel";

const RSP_BEATS = {
    ROCK: 'SCISSORS',
    SCISSORS: 'PAPER',
    PAPER: 'ROCK'
};

/**
 * return 'home', 'away', or null
 * based on the winner (null for a tie)
 */
export function getRspWinner(rsp: {home: RspChoice, away: RspChoice}) {
    if (rsp.home == rsp.away) {
        return null;
    }

    if (RSP_BEATS[rsp.home] == rsp.away) {
        return 'home';
    }

    return 'away';
}
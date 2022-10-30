import { GainResult, Game, isPlay, LossResult, OutOfBoundsPassResult, Play, Player, RollResult, SafetyResult, TouchbackResult, TurnoverResult } from "model/rspModel";
import { getRspWinner } from "util/rsp";

export type ComputedRollResult = RollResult & {
    player: Player;
}

export type ComputedRspResult = {
    name: 'RSP';
    winner: Player | null;
}

export type ComputedGainResult = GainResult & {
    player: Player;
}

export type ComputedCallPlayResult = {
    name: 'CALL_PLAY';
    player: Player;
    play: Play;
}

export type ComputedFumbleResult = {
    name: 'FUMBLE';
    player: Player;
}

export type ComputedResult =
    ComputedRollResult
    | ComputedRspResult
    | SafetyResult
    | GainResult
    | LossResult
    | TurnoverResult
    | OutOfBoundsPassResult
    | TouchbackResult
    | ComputedCallPlayResult
    | ComputedFumbleResult;

export function computeResults(game: Game): ComputedResult[] {
    return [...mapStoredResults(game), ...computeAdditionalResults(game)];
}

function mapStoredResults(game: Game): ComputedResult[] {
    return game.result.map(result => {
        switch (result.name) {
            case 'ROLL':
                return {
                    name: 'ROLL',
                    player: result.player,
                    roll: result.roll
                }
            case 'RSP':
                return {
                    name: 'RSP',
                    winner: getRspWinner(result)
                }
            case 'SAFETY':
            case 'GAIN':
            case 'LOSS':
            case 'TURNOVER':
            case 'OOB_PASS':
            case 'TOUCHBACK':
                return result;
        }
    });
}

function computeAdditionalResults(game: Game): ComputedResult[] {
    const results: (ComputedResult | null)[] = [
        computePlayCallResult(game), computeFumbleResult(game)];
    return results.filter(result => result !== null) as ComputedResult[];
}

function computePlayCallResult(game: Game): ComputedCallPlayResult | null {
    // the name of the state following a PLAY_CALL is alway named the same as the play itself
    const wasPlayCalled = isPlay(game.state);

    // the first time we enter this state, the rsp will always be empty
    const isInitialRspState = game.rsp.home === null && game.rsp.away === null;

    if (wasPlayCalled && isInitialRspState &&
        game.play !== null &&
        game.possession !== null) {
        
        return {
            name: 'CALL_PLAY',
            player: game.possession,
            play: game.play
        };
    }

    return null;
}

function computeFumbleResult(game: Game): ComputedFumbleResult | null {
    if (game.state === 'FUMBLE' && game.possession) {
        return {
            name: 'FUMBLE',
            player: game.possession
        };
    }
    return null;
}
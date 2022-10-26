import { GainResult, Game, LossResult, Play, Player, Result, RollResult, SafetyResult } from "model/rspModel";
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
    | ComputedCallPlayResult
    | ComputedFumbleResult
    | SafetyResult
    | GainResult
    | LossResult;

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
                return result;
            case 'GAIN':
                return result;
            case 'LOSS':
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
    const playCallStates = ['SHORT_RUN', 'LONG_RUN'];

    if (playCallStates.includes(game.state) &&
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
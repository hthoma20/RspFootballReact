import { BlockedKickResult, CoffinCornerResult, FakeKickResult, GainResult, Game, IncompletePassResult, isPlay, KickoffElectionResult, LossResult, OutOfBoundsKickResult, OutOfBoundsPassResult, Play, Player, RollResult, ScoreType, TouchbackResult, TurnoverResult } from "model/rspModel";
import { getOpponent } from "util/players";
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

export type ComputedKickoffElectionResult = KickoffElectionResult & {
    player: Player;
}

export type ComputedOnsideKickResult = {
    name: 'ONSIDE';
    player: Player;
}

export type ComputedScoreResult = {
    name: 'SCORE';
    type: ScoreType;
    player: Player;
}

type MappedResult =
    ComputedRollResult
    | ComputedRspResult
    | ComputedScoreResult
    | ComputedKickoffElectionResult
    | GainResult
    | LossResult
    | TurnoverResult
    | OutOfBoundsPassResult
    | OutOfBoundsKickResult
    | TouchbackResult
    | IncompletePassResult
    | CoffinCornerResult
    | FakeKickResult
    | BlockedKickResult;

type AdditionalResult = 
    ComputedCallPlayResult
    | ComputedFumbleResult
    | ComputedOnsideKickResult;

export type ComputedResult = MappedResult | AdditionalResult;

export function computeResults(game: Game): ComputedResult[] {
    return [...mapStoredResults(game), ...computeAdditionalResults(game)];
}

function mapStoredResults(game: Game): MappedResult[] {
    const possession = game.possession!;
    const defense = getOpponent(possession);

    return game.result.map(result => {
        switch (result.name) {
            case 'ROLL':
                return {
                    name: 'ROLL',
                    player: result.player,
                    roll: result.roll
                };
            case 'RSP':
                return {
                    name: 'RSP',
                    winner: getRspWinner(result)
                };
            case 'SCORE':
                const scoringPlayer = result.type === 'SAFETY' ? defense : possession;
                return {
                    name: 'SCORE',
                    type: result.type,
                    player: scoringPlayer
                };
            case 'KICK_ELECTION':
                const choosingPlayer = result.choice == 'KICK' ? possession : defense;
                return {
                    name: 'KICK_ELECTION',
                    choice: result.choice,
                    player: choosingPlayer
                };
            case 'GAIN':
            case 'LOSS':
            case 'TURNOVER':
            case 'OOB_PASS':
            case 'OOB_KICK':
            case 'TOUCHBACK':
            case 'INCOMPLETE':
            case 'COFFIN_CORNER':
            case 'FAKE_KICK':
            case 'BLOCKED_KICK':
                return result;
        }
    });
}

function computeAdditionalResults(game: Game): AdditionalResult[] {
    const results: (AdditionalResult | null)[] = [
        computePlayCallResult(game), computeFumbleResult(game), computeOnsideKickResult(game)];
    return results.filter(result => result !== null) as AdditionalResult[];
}

// Assing that the state is an RSP state, return whether any RSP has yet been submitted
function isInitialRspState(game: Game) {
    return game.rsp.home === null && game.rsp.away === null;
}

function computePlayCallResult(game: Game): ComputedCallPlayResult | null {
    // the name of the state following a PLAY_CALL is alway named the same as the play itself
    const wasPlayCalled = isPlay(game.state);

    if (wasPlayCalled && isInitialRspState(game) &&
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
    if (game.state === 'FUMBLE' && isInitialRspState(game) && game.possession) {
        return {
            name: 'FUMBLE',
            player: game.possession
        };
    }
    return null;
}

function computeOnsideKickResult(game: Game): ComputedOnsideKickResult | null {
    if (game.state == 'ONSIDE_KICK') {
        return {
            name: 'ONSIDE',
            player: game.possession!
        };
    }
    return null;
}

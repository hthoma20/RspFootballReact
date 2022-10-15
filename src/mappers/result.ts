import { Game, Play, Player } from "model/gameModel";
import { Result } from "model/resultModel";
import { getRspWinner } from "util/rsp";



export type ComputedRollResult = {
    name: 'ROLL'
    player: Player;
    roll: number[];
};

export type ComputedRspResult = {
    name: 'RSP';
    winner: Player | null;
}

export type ComputedCallPlayResult = {
    name: 'CALL_PLAY';
    player: Player;
    play: Play;
}

export type ComputedResult = ComputedRollResult | ComputedRspResult | ComputedCallPlayResult;
export type ComputedResultName = ComputedResult['name'];

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
        }
        return {name: 'RSP', winner: 'home'};
    });
}

function computeAdditionalResults(game: Game): ComputedResult[] {
    const results: (ComputedResult | null)[] = [computePlayCallResult(game)];
    return results.filter(result => result !== null) as ComputedResult[];
}

function computePlayCallResult(game: Game): ComputedCallPlayResult | null {
    const playCallStates = ['SHORT_RUN', 'LONG_RUN'];
    console.log(game);

    if (playCallStates.includes(game.state) &&
        game.play !== null &&
        game.possession !== null) {
        
        return {
            name: 'CALL_PLAY',
            player: game.possession,
            play: game.play
        };
    }

    console.log("returning null", game);
    return null;
}
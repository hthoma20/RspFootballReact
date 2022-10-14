import { Game, Player } from "model/gameModel";
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

export type ComputedResult = ComputedRollResult | ComputedRspResult;
export type ComputedResultName = ComputedResult['name'];

export function computeResults(game: Game): ComputedResult[] {
    
    return mapStoredResults(game);
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

import { RspChoice } from "./choiceModel"
import { Player } from "./gameModel";

export type RspResult = {
    name: 'RSP';
    home: RspChoice;
    away: RspChoice;
};

export type RollResult = {
    name: 'ROLL';
    player: Player;
    roll: number[];
};

export type SafetyResult = {
    name: 'SAFETY';
};

export type Result = RspResult | RollResult | SafetyResult;
export type ResultName = Result['name'];


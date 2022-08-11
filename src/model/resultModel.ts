import { RspChoice } from "./choiceModel"

export type RspResult = {
    name: 'RSP';
    home: RspChoice;
    away: RspChoice;
};

export type RollResult = {
    name: 'ROLL';
    roll: number[];
};

export type SafetyResult = {
    name: 'SAFETY'
};

export type Result = RspResult | RollResult | SafetyResult;
export type ResultName = Result['name'];

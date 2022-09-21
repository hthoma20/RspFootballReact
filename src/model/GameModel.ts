import { ActionName } from "./actionModel";
import { RspChoice } from "./choiceModel";
import { Result } from "./resultModel";

export type GameId = string;
export type UserId = string;
export type State = string;
export type Play = string;

export type Player = 'home' | 'away';

type PlayerMap<T> = {[key in Player]: T};


export type Game = {
    gameId: GameId
    version: number
    players: PlayerMap<UserId>;

    state: State;
    play: Play | null;
    possession: Player | null;
    ballpos: number;
    firstDown: number | null;
    
    playCount: number;
    down: number;

    firstKick: Player | null;

    rsp: PlayerMap<RspChoice | null>;
    roll: number[];
    score: PlayerMap<number>;
    penalties: PlayerMap<number>;

    actions: PlayerMap<ActionName[]>;
    result: Result[];
}

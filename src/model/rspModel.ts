export type PlayerMap<T> = {'home': T, 'away': T}

const _PlayerValues = ['home', 'away'] as const;
export type Player = typeof _PlayerValues[number];
export function isPlayer(value: string): value is Player {
    return _PlayerValues.includes(value as any);
}

const _StateValues = ['COIN_TOSS', 'KICKOFF_ELECTION', 'KICKOFF_CHOICE', 'KICKOFF', 'ONSIDE_KICK', 'TOUCHBACK_CHOICE', 'KICK_RETURN', 'KICK_RETURN_1', 'KICK_RETURN_6', 'FUMBLE', 'PAT_CHOICE', 'EXTRA_POINT', 'EXTRA_POINT_2', 'PLAY_CALL', 'SHORT_RUN', 'SHORT_RUN_CONT', 'LONG_RUN', 'LONG_RUN_ROLL', 'SHORT_PASS', 'SHORT_PASS_CONT', 'LONG_PASS', 'LONG_PASS_ROLL', 'BOMB', 'BOMB_ROLL', 'BOMB_CHOICE', 'SACK_CHOICE', 'SACK_ROLL', 'PICK_ROLL', 'DISTANCE_ROLL', 'PICK_TOUCHBACK_CHOICE', 'PICK_RETURN', 'PICK_RETURN_6', 'GAME_OVER'] as const;
export type State = typeof _StateValues[number];
export function isState(value: string): value is State {
    return _StateValues.includes(value as any);
}

const _PlayValues = ['SHORT_RUN', 'LONG_RUN', 'SHORT_PASS', 'LONG_PASS', 'BOMB'] as const;
export type Play = typeof _PlayValues[number];
export function isPlay(value: string): value is Play {
    return _PlayValues.includes(value as any);
}

const _RspChoiceValues = ['ROCK', 'PAPER', 'SCISSORS'] as const;
export type RspChoice = typeof _RspChoiceValues[number];
export function isRspChoice(value: string): value is RspChoice {
    return _RspChoiceValues.includes(value as any);
}

const _KickoffElectionChoiceValues = ['KICK', 'RECIEVE'] as const;
export type KickoffElectionChoice = typeof _KickoffElectionChoiceValues[number];
export function isKickoffElectionChoice(value: string): value is KickoffElectionChoice {
    return _KickoffElectionChoiceValues.includes(value as any);
}

const _KickoffChoiceValues = ['REGULAR', 'ONSIDE'] as const;
export type KickoffChoice = typeof _KickoffChoiceValues[number];
export function isKickoffChoice(value: string): value is KickoffChoice {
    return _KickoffChoiceValues.includes(value as any);
}

const _TouchbackChoiceValues = ['TOUCHBACK', 'RETURN'] as const;
export type TouchbackChoice = typeof _TouchbackChoiceValues[number];
export function isTouchbackChoice(value: string): value is TouchbackChoice {
    return _TouchbackChoiceValues.includes(value as any);
}

const _RollAgainChoiceValues = ['ROLL', 'HOLD'] as const;
export type RollAgainChoice = typeof _RollAgainChoiceValues[number];
export function isRollAgainChoice(value: string): value is RollAgainChoice {
    return _RollAgainChoiceValues.includes(value as any);
}

const _PatChoiceValues = ['ONE_POINT', 'TWO_POINT'] as const;
export type PatChoice = typeof _PatChoiceValues[number];
export function isPatChoice(value: string): value is PatChoice {
    return _PatChoiceValues.includes(value as any);
}

const _SackChoiceValues = ['SACK', 'PICK'] as const;
export type SackChoice = typeof _SackChoiceValues[number];
export function isSackChoice(value: string): value is SackChoice {
    return _SackChoiceValues.includes(value as any);
}

export type RspAction = {
    name: 'RSP';
    choice: RspChoice;
};

export type RollAction = {
    name: 'ROLL';
    count: number;
};

export type KickoffElectionAction = {
    name: 'KICKOFF_ELECTION';
    choice: KickoffElectionChoice;
};

export type KickoffChoiceAction = {
    name: 'KICKOFF_CHOICE';
    choice: KickoffChoice;
};

export type CallPlayAction = {
    name: 'CALL_PLAY';
    play: Play;
};

export type TouchbackChoiceAction = {
    name: 'TOUCHBACK_CHOICE';
    choice: TouchbackChoice;
};

export type RollAgainChoiceAction = {
    name: 'ROLL_AGAIN_CHOICE';
    choice: RollAgainChoice;
};

export type PatChoiceAction = {
    name: 'PAT_CHOICE';
    choice: PatChoice;
};

export type SackChoiceAction = {
    name: 'SACK_CHOICE';
    choice: SackChoice;
};

export type Action = RspAction | RollAction | KickoffElectionAction | KickoffChoiceAction | CallPlayAction | TouchbackChoiceAction | RollAgainChoiceAction | PatChoiceAction | SackChoiceAction;

const _TurnoverTypeValues = ['DOWNS', 'PICK', 'FUMBLE'] as const;
export type TurnoverType = typeof _TurnoverTypeValues[number];
export function isTurnoverType(value: string): value is TurnoverType {
    return _TurnoverTypeValues.includes(value as any);
}

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

export type GainResult = {
    name: 'GAIN';
    play: Play;
    player: Player;
    yards: number;
};

export type LossResult = {
    name: 'LOSS';
    play: Play;
    player: Player;
    yards: number;
};

export type TurnoverResult = {
    name: 'TURNOVER';
    type: TurnoverType;
};

export type OutOfBoundsPassResult = {
    name: 'OOB_PASS';
};

export type TouchbackResult = {
    name: 'TOUCHBACK';
};

export type Result = RspResult | RollResult | SafetyResult | GainResult | LossResult | TurnoverResult | OutOfBoundsPassResult | TouchbackResult;

export type Game = {
    gameId: string;
    version: number;
    players: PlayerMap<string | null>;
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
    actions: PlayerMap<string[]>;
    result: Result[];
};

export type ActionRequest = {
    gameId: string;
    user: string;
    action: Action;
};

export type ListGamesQuery = {
    available?: boolean;
    user: string | null;
};


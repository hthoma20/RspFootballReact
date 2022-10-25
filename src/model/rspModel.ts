export type PlayerMap<T> = {'home': T, 'away': T}

export type Player = 'home' | 'away';

export type State = 'COIN_TOSS' | 'KICKOFF_ELECTION' | 'KICKOFF_CHOICE' | 'KICKOFF' | 'ONSIDE_KICK' | 'TOUCHBACK_CHOICE' | 'KICK_RETURN' | 'KICK_RETURN_1' | 'KICK_RETURN_6' | 'FUMBLE' | 'PAT_CHOICE' | 'EXTRA_POINT' | 'EXTRA_POINT_2' | 'PLAY_CALL' | 'SHORT_RUN' | 'SHORT_RUN_CONT' | 'LONG_RUN' | 'LONG_RUN_ROLL' | 'SHORT_PASS' | 'SHORT_PASS_CONT' | 'SACK_CHOICE' | 'SACK_ROLL' | 'GAME_OVER';

export type Play = 'SHORT_RUN' | 'LONG_RUN' | 'SHORT_PASS';

export type RspChoice = 'ROCK' | 'PAPER' | 'SCISSORS';

export type KickoffElectionChoice = 'KICK' | 'RECIEVE';

export type KickoffChoice = 'REGULAR' | 'ONSIDE';

export type TouchbackChoice = 'TOUCHBACK' | 'RETURN';

export type RollAgainChoice = 'ROLL' | 'HOLD';

export type PatChoice = 'ONE_POINT' | 'TWO_POINT';

export type SackChoice = 'SACK' | 'PICK';

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

export type Result = RspResult | RollResult | SafetyResult | GainResult;

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


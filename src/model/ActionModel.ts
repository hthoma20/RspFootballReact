export type ActionName = string;

export type Action = any;

export type ActionDispatch = (action: Action) => Promise<void>;

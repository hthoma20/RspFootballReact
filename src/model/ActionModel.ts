import { Action } from "./rspModel";

export type ActionDispatch = (action: Action) => Promise<void>;

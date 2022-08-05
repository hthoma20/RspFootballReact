import { Game } from "model/gameModel";
import { RenderState } from "./renderStateMachine";


export const __DEV = {
    currentGame: null as (Game | null),
    renderState: null as (RenderState | null)
};

(window as any).__DEV = __DEV;

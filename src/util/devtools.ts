import { Game } from "model/gameModel";

export const __DEV = {
    currentGame: null as (Game | null),
};

(window as any).__DEV = __DEV;

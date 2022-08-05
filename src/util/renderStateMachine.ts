import { Game } from "model/gameModel";
import { useEffect, useRef } from "react";
import { StateMachine, TransitionTable } from "util/stateMachine";

export type RenderState = 'WAITING' | 'ANIMATING' | 'UPDATING_RESULT_LOG' | 'UPDATING_SCORE_BOARD' | 'UPDATING_ACTION_PANE';
export type RenderAction = 'BEGIN_ANIMATION' | 'FIELD_UPDATED' | 'RESULT_LOG_UPDATED' | 'SCORE_BOARD_UPDATED' | 'ACTION_PANE_UPDATED';

export type RenderStateMachine = StateMachine<RenderState, RenderAction>;

export const RENDER_STATE_MACHINE: TransitionTable<RenderState, RenderAction> = {
    'WAITING': {
        'BEGIN_ANIMATION': 'ANIMATING'
    },
    'ANIMATING': {
        'FIELD_UPDATED': 'UPDATING_RESULT_LOG'
    },
    'UPDATING_RESULT_LOG': {
        'RESULT_LOG_UPDATED': 'UPDATING_SCORE_BOARD'
    },
    'UPDATING_SCORE_BOARD': {
        'SCORE_BOARD_UPDATED': 'UPDATING_ACTION_PANE'
    },
    'UPDATING_ACTION_PANE': {
        'ACTION_PANE_UPDATED': 'WAITING'
    }
};

export const RENDER_START_STATE: RenderState = 'WAITING';

/**
 * When a new Game comes in (i.e a poll completes), most components will re-render with this
 * new game. However, some components shouldn't update to reflect this change right away, for
 * example, the scoreboard shouldn't update until the animation is complete. In particular,
 * the render process is broken into states. Components only update their UI when in a particular
 * renderState. This hook accepts the most recent version of the game, and only returns it back
 * if the render is in the correct given state.
 * 
 * @param game the most recent version of the game
 * @param renderStateMachine the current state of the render
 * @param componentRenderState the state on which the calling component wants the updated version of the game
 * @param componentRenderAction the action to dispatch to the machine once the most recent game is returned
 * 
 * @return the given game, or the previous game based on whether the render is in the correct state
 */
export function useRenderStateMachine(game: Game, renderStateMachine: RenderStateMachine,
    componentRenderState: RenderState, componentRenderAction: RenderAction) {
    
    const cachedGame = useRef(game);

    useEffect(() => {
        // this is done inside the effect because we should only dispatch the render update after
        // the component has updated
        if (renderStateMachine.currentState == componentRenderState) {
            renderStateMachine.dispatchAction(componentRenderAction);
        }
    });

    // this is done outside of the effect because we want the ref to update immediately
    if (renderStateMachine.currentState == componentRenderState) {
        cachedGame.current = game;
    }

    return cachedGame.current;

}


import { StateMachine, TransitionTable } from "util/stateMachine";

type RenderState = 'WAITING' | 'UPDATING_FIELD' | 'UPDATING_RESULT_LOG' | 'UPDATING_SCORE_BOARD' | 'UPDATING_ACTION_PANE';
type RenderAction = 'STATE_RECIEVED' | 'FIELD_UPDATED' | 'RESULT_LOG_UPDATED' | 'SCORE_BOARD_UPDATED' | 'ACTION_PANE_UPDATED';

export type RenderStateMachine = StateMachine<RenderState, RenderAction>;

export const RENDER_STATE_MACHINE: TransitionTable<RenderState, RenderAction> = {
    'WAITING': {
        'STATE_RECIEVED': 'UPDATING_FIELD'
    },
    'UPDATING_FIELD': {
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

import { useState } from "react";

/**
 * A StateMachine is a plain old object which maps a the currentState to an action, which maps to the newState
 * This mapping represents the state machine's transition table.
 * 
 * Note that since these maps are Partial, not every possible (state, action) combination needs to be present.
 * 
 * @param S the union of valid states
 * @param A the union of valid actions
 */
export type TransitionTable<S extends string, A extends string> = {[key in S]: Partial<{ [key in A]: S}>};

export interface StateMachine<S extends string, A extends string> {
    currentState: S;
    dispatchAction: (action: A) => void;
};

/**
 * Hook into a state machine. Updates to the currentState cause the caller to re-render.
 * @param machine the transition table. Note if an action is dispatched for which there is no given transition,
 *                  the action is ignored, and an error is logged
 * @param startState the initial currentState of the machine
 * 
 * Returns a tuple [currentState, dispatchAction]
 * where currentState is the current state of the machine,
 * dispatchAction is a function that accepts an action, looks up the next state in the transition table, and
 *      re-renders the Component which uses this hook
 */
export function useStateMachine<S extends string, A extends string>
    (machine: TransitionTable<S, A>, startState: S): StateMachine<S, A> {

    const [currentState, setCurrentState] = useState(startState);

    function dispatchAction(action: A) {
        if (action in machine[currentState]) {
            setCurrentState(machine[currentState][action] as S);
        }
        else {
            console.error(`Recieved unexpected action [${action}] in state [${currentState}]`);
        }
    }

    return {currentState, dispatchAction};
}

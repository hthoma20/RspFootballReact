import React from "react";
import { useState } from "react";

type ActionButtonDefinition<K extends string> = {
    // A unique key for this button.
    actionKey: K;
    // The Components to place in the button
    children?: React.ReactNode;
    // The className to add to the button
    className?: string;
};

type ActionButtonGroupProps<K extends string> = {
    buttons: ActionButtonDefinition<K>[];
    onClick: (actionKey: K) => void;
    // A function to be called when an ENABLED button is hovered over
    onHover?: (actionKey: K) => void;
    gameVersion: number;
};

/**
 * Display a group of buttons. These buttons can only be pressed once per game version.
 * If a new game version is given, the buttons re-validate.
 */
export function ActionButtonGroup<K extends string>({buttons, gameVersion, onClick, onHover}: ActionButtonGroupProps<K>) {
    
    // the key of the button which was pressed
    const [pressedButton, setPressedButton] = useState<K | null>(null);
    // the game version when the button was pressed
    const [pressedVersion, setPressedVersion] = useState<number | null>(null);

    if (pressedVersion !== null && pressedVersion !== gameVersion) {
        setPressedButton(null);
        setPressedVersion(null);
    }

    function getButtonState(key: K): ActionButtonState {
        if (pressedButton === null) {
            return 'ENABLED';
        }
        if (pressedButton === key) {
            return 'PRESSED';
        }
        return 'DISABLED';
    }

    function onClickFacade(actionKey: K) {
        if (getButtonState(actionKey) === 'ENABLED') {
            onClick(actionKey);
            setPressedButton(actionKey);
            setPressedVersion(gameVersion);
        }
    }

    function onHoverFacade(actionKey: K) {
        if (onHover && getButtonState(actionKey) === 'ENABLED') {
            onHover(actionKey);
        }
    }

    const buttonComponents = buttons.map(buttonProps =>
        <ActionButton
            key={buttonProps.actionKey}
            className={buttonProps.className}
            onClick={() => onClickFacade(buttonProps.actionKey)}
            onHover={() => onHoverFacade(buttonProps.actionKey)}
            state={getButtonState(buttonProps.actionKey)}>
            
            {buttonProps.children}
        
        </ActionButton>);

    return <>{buttonComponents}</>;
}

type ActionButtonState = 'ENABLED' | 'DISABLED' | 'PRESSED';

type ActionButtonProps = {
    className?: string;
    state: ActionButtonState;
    onClick: () => void;
    onHover: () => void;
    children: React.ReactNode
}

function ActionButton(props: ActionButtonProps) {
    
    const className = props.className ? `${props.className} ${props.state}` : props.state;

    return (
        <button
            className={className}
            onClick={props.onClick}
            onMouseEnter={props.onHover}
            disabled={props.state !== 'ENABLED'}>

            {props.children}
        </button>
    );
}
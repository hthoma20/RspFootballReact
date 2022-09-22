import React from "react";
import { useState } from "react";

type ActionButtonProps<K extends string> = {
    // A unique key for this button.
    actionKey: K;
    // The Components to place in the button
    children?: React.ReactNode;
    // The className to add to the button
    className?: string;
};

/**
 * Display a group of buttons. These buttons can only be pressed once per game version.
 * If a new game version is given, the buttons re-validate.
 */
export function ActionButtonGroup<K extends string>({buttons, onClick, gameVersion}:
    {buttons: ActionButtonProps<K>[], onClick: (key: K) => void, gameVersion: number}) {
    
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

    function onClickFacade(key: K) {
        if (getButtonState(key) === 'ENABLED') {
            onClick(key);
            setPressedButton(key);
            setPressedVersion(gameVersion);
        }
    }

    const buttonComponents = buttons.map(buttonProps =>
        <ActionButton
            key={buttonProps.actionKey}
            className={buttonProps.className}
            onClick={() => onClickFacade(buttonProps.actionKey)}
            state={getButtonState(buttonProps.actionKey)}>
            
            {buttonProps.children}
        
        </ActionButton>);

    return <>{buttonComponents}</>;
}

type ActionButtonState = 'ENABLED' | 'DISABLED' | 'PRESSED';

function ActionButton(props:
    {className?: string, state: ActionButtonState, onClick: () => void, children: React.ReactNode}) {
    
    const className = props.className ? `${props.className} ${props.state}` : props.state;

    return (
        <button className={className} onClick={props.onClick} disabled={props.state !== 'ENABLED'}>
            {props.children}
        </button>
    );
}
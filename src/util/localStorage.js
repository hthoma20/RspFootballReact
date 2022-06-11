import { useEffect, useState } from "react";

/**
 * Store a string value in localeStorage, and hook updates to this
 * value to the lifecycle of the React component that uses it.
 * 
 * Return an object {value, setValue, removeKey} where
 * value is the current value stored in localStorage, or null if the key is not present
 * setValue updates the localStorage value associated with storageKey, and re-renders the component
 * removeKey deletes the key from local storage, and re-renders the component
 */
export function useLocalStorage(storageKey) {

    const [state, setState] = useState(null);

    useEffect(() => {
        const savedState = window.localStorage.getItem(storageKey);
        if (savedState) {
            setState(savedState);
        }
    });


    function setValue(newValue) {
        window.localStorage.setItem(storageKey, newValue);
        setState(newValue);
    }

    function removeKey() {
        window.localStorage.removeItem(storageKey);
        setState(null);
    }

    return [state, setValue, removeKey];
}
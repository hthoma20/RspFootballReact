import { useRef, useState } from "react";

const DEBUG_ON = true;

export function DebugComponent(props: any) {

    const [isTransparent, setIsTransparent] = useState(false);

    const renders = useRef(0);
    renders.current += 1;

    const style: any = {
        position: 'absolute',
        border: '1px solid red',
        background: isTransparent ? '' : 'black', 
        color: 'white'
    };

    const buttonStyle: any = {
        position: 'absolute',
        right: 0,
        width: 20,
        height: 20,
        background: isTransparent ? 'black' : 'white', 
    };

    if (!DEBUG_ON) {
        return null;
    }

    return <div style={style} >
        <button style={buttonStyle} onClick={() => setIsTransparent(!isTransparent)}></button>
        <pre>renders: {renders.current}</pre>
        <pre>props: {JSON.stringify(props, null, 3)}</pre>
        
    </div>;
}
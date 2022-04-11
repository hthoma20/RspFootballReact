import { useEffect, useRef, useState } from "react";

function getImage(path) {
    const image = new Image();
    
    image.src = path;
    return image;
}

/**
 * return a tuple, [image, imageLoaded]
 * when the image loads, the component will re-render
 */
export function useImage(imagePath) {

    const image = getImage(imagePath);
    const [imageLoaded, setImageLoaded] = useState(false);
    
    useEffect(() => {
        image.onload = () => {
            setImageLoaded(true);
        };
    }, []);

    return [image, imageLoaded];
}

export function getScoreImagePath(digit) {
    return `score/${digit}.png`;
}
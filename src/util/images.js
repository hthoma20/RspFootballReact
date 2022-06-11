import { useEffect, useState } from "react";

function getImage(path) {
    const image = new Image();
    
    image.src = path;
    return image;
}

// return a promise that resolves when the image loads
function imageOnloadPromise(image) {
    return new Promise(resolve => {
        image.onload = () => {
            console.log("Image loaded: ", image);
            resolve();
        };
    });
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

// return a tuple, [images, imagesLoaded]
// when all images are loaded, the component will re-render
// imagePaths should be given as a plain object, {key: imagePath}
// the returned images will be an object, {key: image}
export function useImages(imagePaths) {
    const images = Object.fromEntries(
        Object.entries(imagePaths)
            .map(([key, imagePath]) => [key, getImage(imagePath)]));

    const [imagesLoaded, setImagesLoaded] = useState(false);

    useEffect(() => {
        Promise.all(Object.values(images).map(imageOnloadPromise)).then(() => {
            setImagesLoaded(true);
        });
    }, []);

    return [images, imagesLoaded];
}

export function getScoreImagePath(digit) {
    return `score/${digit}.png`;
}
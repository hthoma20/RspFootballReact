import { useEffect, useState } from "react";

function getImage(path: string) {
    const image = new Image();
    image.src = `images/${path}`;
    return image;
}

// return a promise that resolves when the image loads
function imageOnloadPromise(image: HTMLImageElement) {
    return new Promise<void>((resolve, reject) => {
        image.onload = () => {
            console.log("Image loaded: ", image);
            resolve();
        };
        image.onerror = () => {
            console.error("Image not found at " + image.src);
            reject();
        }
    });
}

/**
 * return a tuple, [image, imageLoaded]
 * when the image loads, the component will re-render
 */
export function useImage(imagePath: string) {

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
export function useImages<T extends string>(imagePaths: {[key in T]: string}):
    [{[key in T]: HTMLImageElement}, boolean] {
        
    const images = Object.fromEntries(
        Object.entries(imagePaths)
            .map(([key, imagePath]) => [key, getImage(imagePath as string)])) as {[key in T]: HTMLImageElement};

    const [imagesLoaded, setImagesLoaded] = useState(false);

    useEffect(() => {
        const values: HTMLImageElement[] = Object.values(images);
        const loadPromises = values.map(imageOnloadPromise);
        Promise.all(loadPromises).then(() => {
            setImagesLoaded(true);
        });
    }, []);

    return [images, imagesLoaded];
}

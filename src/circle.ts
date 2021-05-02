/**
 * Determines the colour of a pixel (x, y) to create
 * a circle and saves it into the data array.
 * The data array holds the linearised pixel data of the target canvas
 * row major. Each pixel is of RGBA format.
 * @param data The linearised pixel array
 * @param x The x coordinate of the pixel
 * @param y The y coordinate of the pixel
 * @param width The width of the canvas
 * @param height The height of the canvas
 * @param radius The radius of the circle
 */
export function circle(data: Uint8ClampedArray, x: number, y: number, width: number, height: number, radius: number) {

    let XDistance: number = x - height / 2;
    let Ydistance: number = y - width / 2;

    let colorIndex: number = (x + y * width) * 4;

    if(Math.sqrt(XDistance*XDistance + Ydistance*Ydistance) < radius){
        data[colorIndex + 0] = 0;
        data[colorIndex + 1] = 0;
        data[colorIndex + 2] = 0;
        data[colorIndex + 3] = 255;
    }
}

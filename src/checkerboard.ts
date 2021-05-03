/**
 * Determines the colour of a pixel (x, y) to create
 * a checkerboard pattern and saves it into the data array.
 * The data array holds the linearised pixel data of the target canvas
 * row major. Each pixel is of RGBA format.
 * @param data The linearised pixel array
 * @param x The x coordinate of the pixel
 * @param y The y coordinate of the pixel
 * @param width The width of the canvas
 * @param height The height of the canvas
 */
export function checkerboard(data: Uint8ClampedArray, x: number, y: number, width: number, height: number) {
    let patternDimensionHeight: number = height / 8;
    let patternDimensionWidth: number = width / 8;

    let colorIndex: number = (x + y * width) * 4;

    if((y%(patternDimensionHeight*2)) < patternDimensionHeight){
        if ((x%(patternDimensionWidth*2)) < patternDimensionWidth){
            data[colorIndex] = 0;
            data[colorIndex + 1] = 0;
            data[colorIndex + 2] = 0;
            data[colorIndex + 3] = 255;
        } else{
            data[colorIndex] = 255;
            data[colorIndex + 1] = 255;
            data[colorIndex + 2] = 255;
            data[colorIndex + 3] = 255;
        }
    } else {
        if ((x%(patternDimensionWidth*2)) > patternDimensionWidth){
            data[colorIndex] = 0;
            data[colorIndex + 1] = 0;
            data[colorIndex + 2] = 0;
            data[colorIndex + 3] = 255;
        } else{
            data[colorIndex] = 255;
            data[colorIndex + 1] = 255;
            data[colorIndex + 2] = 255;
            data[colorIndex + 3] = 255;
        }
    }
}
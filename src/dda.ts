/**
 * Draws a line from pointA to pointB on the canvas
 * with the DDA algorithm.
 * @param  {Array.<number>} data   - The linearised pixel array
 * @param  {Array.<number>} pointA - The start point of the line
 * @param  {Array.<number>} pointB - The end point of the line
 * @param  {number} width          - The width of the canvas
 * @param  {number} height         - The height of the canvas
 */
export function dda(
    data: Uint8ClampedArray,
    pointA: [number, number],
    pointB: [number, number],
    width: number, height: number
) {

    let pointAx: number
    let pointAy: number
    let pointBx: number
    let pointBy: number

    pointAx = Math.round(pointB[0])
    pointAy = Math.round(ConvertY(pointB[1], height))
    pointBx = Math.round(pointA[0])
    pointBy = Math.round(ConvertY(pointA[1], height))

    let relation: number = (pointAy - pointBy)/(pointAx - pointBx)

    pixelSet(pointAx, ConvertY(pointAy,height), width, data)
    pixelSet(pointBx, ConvertY(pointBy,height), width, data)

    if(Math.abs(relation) < 1){
        let m: number = (pointBy - pointAy)/(pointBx - pointAx)

        if((pointAx - pointBx) < 0){
            let t: number = pointAy - Math.round(m*pointAx)
            for(let x: number = pointAx + 1; x < pointBx; x++){
                pixelSet( x, ConvertY(Math.round(m * x) + t, height), width, data)
            }
        } else {
            let t: number = pointBy - Math.round(m*pointBx)
            for(let x: number = pointBx + 1; x < pointAx; x++){
                pixelSet( x, ConvertY(Math.round(m * x) + t, height), width, data)
            }
        }
    } else {
        let m: number = (pointBx - pointAx)/(pointBy - pointAy)

        if((pointAy - pointBy) < 0){
            let t: number = pointAx - Math.round(m*pointAy)
            for(let y: number = pointAy + 1; y < pointBy; y++){
                pixelSet(Math.round(m * y) + t, ConvertY( y, height), width, data)
            }
        } else {
            let t: number = pointBx - Math.round(m*pointBy)
            for(let y: number = pointBy + 1; y < pointAy; y++){
                pixelSet(Math.round(m * y) + t, ConvertY( y, height), width, data)
            }
        }
    }
}

function pixelSet(x: number, y: number, width: number, data: Uint8ClampedArray){
    let colorIndex: number = (x + y * width) * 4;

    data[colorIndex + 0] = 0;
    data[colorIndex + 1] = 0;
    data[colorIndex + 2] = 0;
    data[colorIndex + 3] = 255;
}

function ConvertY(y: number, height: number): number{
    return height - y
}
/**
 * Draws a line from pointA to pointB on the canvas
 * with the Bresenham algorithm.
 * @param  {Uint8ClampedArray} data   - The linearised pixel array
 * @param  {[number, number]} pointA - The start point of the line
 * @param  {[number, number]} pointB - The end point of the line
 * @param  {number} width          - The width of the canvas
 * @param  {number} height         - The height of the canvas
 */
export function bresenham(data: Uint8ClampedArray, pointA: [number, number], pointB: [number, number], width: number, height: number) {
    let pointAx: number
    let pointAy: number
    let pointBx: number
    let pointBy: number

    pointAx = Math.round(pointB[0])
    pointAy = Math.round(ConvertY(pointB[1], height))
    pointBx = Math.round(pointA[0])
    pointBy = Math.round(ConvertY(pointA[1], height))

    let dX: number = Math.abs(pointBx-pointAx)
    let sX: number = pointAx<pointBx ? 1 : -1
    let dY: number = -Math.abs(pointBy-pointAy)
    let sY: number = pointAy<pointBy ? 1 : -1
    let error: number = dX + dY
    let e2: number

    while(true){
        pixelSet(pointAx,ConvertY(pointAy,height), width, data)
        if(pointAx == pointBx && pointAy == pointBy) break
        e2 = 2*error
        if( e2 > dY ){
            error += dY
            pointAx += sX
        }
        if(e2 < dX){
            error += dX
            pointAy += sY
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

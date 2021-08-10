import Vector from "./vector";

/**
 * A class representing a cube
 */
export default class Cube {
    /**
     * Creates a new Cube with a length
     // * @param center The center & radius of the Sphere?
     * @param length The length and height of the Cube
     * @param color The colour of the Cube
     */
    constructor(
        public center: Vector,
        public radius: number,
        public color: Vector
    ) {}
}
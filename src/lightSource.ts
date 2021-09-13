import Vector from './vector';
import Shader from './shader';
import Matrix from "./matrix";
import {createIndexedColours, createIndexedVectors} from "./indexer";

/**
 * A class creating buffers for an axis aligned box to render it with WebGL
 */
export default class LightSource {
    /**
     * The buffer containing the box's vertices
     */
    vertexBuffer: WebGLBuffer;
    /**
     * The indices describing which vertices form a triangle
     */
    indexBuffer: WebGLBuffer;

    normalBuffer: WebGLBuffer;

    colorBuffer: WebGLBuffer;
    /**
     * The amount of indices
     */
    elements: number;

    /**
     * Creates all WebGL buffers for the box
     *     6 ------- 7
     *    / |       / |
     *   3 ------- 2  |
     *   |  |      |  |
     *   |  5 -----|- 4
     *   | /       | /
     *   0 ------- 1
     *  looking in negative z axis direction
     * @param gl The canvas' context
     * @param minPoint The minimal x,y,z of the box
     * @param maxPoint The maximal x,y,z of the box
     */
    constructor(
        private gl: WebGL2RenderingContext,
        private position: Vector,
        private color: Vector) {
    }

    /**
     * Renders the box
     * @param shader The shader used to render
     */
    render(shader: Shader) {

    }
}
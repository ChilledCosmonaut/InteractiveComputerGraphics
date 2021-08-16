import Vector from './vector';
import Shader from './shader';
import Matrix from "./matrix";

/**
 * A class creating buffers for an axis aligned box to render it with WebGL
 */
export default class RasterPyramid {
    /**
     * The buffer containing the box's vertices
     */
    vertexBuffer: WebGLBuffer;
    /**
     * The indices describing which vertices form a triangle
     */
    indexBuffer: WebGLBuffer;
    colorBuffer: WebGLBuffer;
    /**
     * The amount of indices
     */
    elements: number;

    /**
     * Creates all WebGL buffers for the box
     *     6 ------- 7
     *    / |  s=4  / |
     *   3 ------- 2  |
     *   |  |      |  |
     *   |  3 -----|- 2
     *   | /       | /
     *   0 ------- 1
     *  looking in negative z axis direction
     * @param gl The canvas' context
     * @param minPoint The minimal x,y,z of the box
     * @param maxPoint The maximal x,y,z of the box
     */
    constructor(
        private gl: WebGL2RenderingContext,
        minPoint: Vector,
        maxPoint: Vector,
        height: number) {
        this.gl = gl;
        const mi = minPoint;
        const ma = maxPoint;

        const peak = this.peakFromHeight(mi, ma, height);
        let vertices = [
            mi.x, mi.y, mi.z,
            ma.x, mi.y, mi.z,
            ma.x, ma.y, ma.z,
            mi.x, ma.y, ma.z,
            peak.x,peak.y,peak.z
        ];
        let indices = [
            // front
            0, 1, 4,
            // back
            2, 3, 4,
            // right
            1, 2, 4,
            // left
            0, 3, 4,
            // bottom
            0, 1, 2, 2, 3, 0
        ];
        let colors = [ //TODO?
            0, 0, 1, 1,
            0, 1, 0, 1,
            1, 0, 0, 1,
            1, 1, 1, 1,
            0, 0, 1, 1
        ];

        const vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
        this.vertexBuffer = vertexBuffer;
        const indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
        this.indexBuffer = indexBuffer;
        this.elements = indices.length;

        // TODO create and fill a buffer for colours *
        const colorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
        this.colorBuffer = colorBuffer;
    }

    /**
     * Renders the box
     * @param shader The shader used to render
     */
    render(shader: Shader) {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
        const positionLocation = shader.getAttributeLocation("a_position");
        this.gl.enableVertexAttribArray(positionLocation);
        this.gl.vertexAttribPointer(positionLocation, 3, this.gl.FLOAT, false, 0, 0);

        // TODO bind colour buffer *
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colorBuffer);
        const colorLocation = shader.getAttributeLocation("a_color");
        this.gl.enableVertexAttribArray(colorLocation);
        this.gl.vertexAttribPointer(colorLocation, 4, this.gl.FLOAT, false , 0, 0);

        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        this.gl.drawElements(this.gl.TRIANGLES, this.elements, this.gl.UNSIGNED_SHORT, 0);

        this.gl.disableVertexAttribArray(positionLocation);
        // TODO disable color vertex attrib array *
        this.gl.disableVertexAttribArray(colorLocation);
    }

    peakFromHeight(min: Vector, max: Vector, height: number): Vector {
        let x = (max.x - min.x) / 2 + min.x;
        let y = height + min.y;
        let z = (max.z - min.z) / 2 + min.z;
        const peak = new Vector(x,y,z,1);
        return peak;
    }
}
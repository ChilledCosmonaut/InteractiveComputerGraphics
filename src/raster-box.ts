import Vector from './vector';
import Shader from './shader';
import Matrix from "./matrix";
import {createIndexedColours, createIndexedVectors} from "./indexer";

/**
 * A class creating buffers for an axis aligned box to render it with WebGL
 */
export default class RasterBox {
    /**
     * The buffer containing the box's vertices
     */
    vertexBuffer: WebGLBuffer;
    /**
     * The indices describing which vertices form a triangle
     */
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
        minPoint: Vector,
        maxPoint: Vector) {
        this.gl = gl;
        const mi = minPoint;
        const ma = maxPoint;
        let vertexStorage = [
            mi.x, mi.y, ma.z,
            ma.x, mi.y, ma.z,
            ma.x, ma.y, ma.z,
            mi.x, ma.y, ma.z,
            ma.x, mi.y, mi.z,
            mi.x, mi.y, mi.z,
            mi.x, ma.y, mi.z,
            ma.x, ma.y, mi.z
        ];
        let indices = [
            // front
            0, 1, 2, 2, 3, 0,
            // back
            4, 5, 6, 6, 7, 4,
            // right
            1, 4, 7, 7, 2, 1,
            // top
            3, 2, 7, 7, 6, 3,
            // left
            5, 0, 3, 3, 6, 5,
            // bottom
            5, 4, 1, 1, 0, 5
        ];

        let colorStorage = [
            0, 0, 1, 1,
            0.3, 0.2, 0, 1,
            1, 0, 0, 1,
            1, 0.5, 1, 1,
            1, 0, 1, 1,
            0, 0.5, 0, 1
        ];
        let colorIndices = [
            // front
            0, 0, 0, 0, 0, 0,
            // back
            1, 1, 1, 1, 1, 1,
            // right
            2, 2, 2, 2, 2, 2,
            // top
            3, 3, 3, 3, 3, 3,
            // left
            4, 4, 4, 4, 4, 4,
            // bottom
            5, 5, 5, 5, 5, 5
        ];

        let normalStorage = [
            0, 0, 1,
            0, 0, -1,
            1, 0, 0,
            0, 1, 0,
            -1, 0, 0,
            0, -1, 0
        ];
        let normalIndices = [
            // front
            0, 0, 0, 0, 0, 0,
            // back
            1, 1, 1, 1, 1, 1,
            // right
            2, 2, 2, 2, 2, 2,
            // top
            3, 3, 3, 3, 3, 3,
            // left
            4, 4, 4, 4, 4, 4,
            // bottom
            5, 5, 5, 5, 5, 5
        ];

        let vertices = createIndexedVectors(vertexStorage, indices);
        let colours = createIndexedColours(colorStorage, colorIndices);
        let normals = createIndexedVectors(normalStorage, normalIndices);

        const vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
        this.vertexBuffer = vertexBuffer;
        /*const indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
        this.indexBuffer = indexBuffer;*/
        this.elements = vertices.length / 3;

        // TODO create and fill a buffer for colours *
        const colorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colours), gl.STATIC_DRAW);
        this.colorBuffer = colorBuffer;

        //Normal buffering
        const normalBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, normalBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(normals), this.gl.STATIC_DRAW);
        this.normalBuffer = normalBuffer;
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

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.normalBuffer);
        const normalLocation = shader.getAttributeLocation("a_normal");
        this.gl.enableVertexAttribArray(normalLocation);
        this.gl.vertexAttribPointer(normalLocation, 3, this.gl.FLOAT, false , 0, 0);

        //this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        //this.gl.drawElements(this.gl.TRIANGLES, this.elements, this.gl.UNSIGNED_SHORT, 0);
        this.gl.drawArrays(this.gl.TRIANGLES, 0, this.elements);

        this.gl.disableVertexAttribArray(positionLocation);
        // TODO disable color vertex attrib array *
        this.gl.disableVertexAttribArray(colorLocation);
        this.gl.disableVertexAttribArray(normalLocation);
    }

    CalculateNormalsForTriangle(index1: number, index2: number, index3: number, vertices: Array<number>): Vector {
        let vertex1: Vector = new Vector(vertices[index1],vertices[index1 + 1],vertices[index1 + 2], 0);
        let vertex2: Vector = new Vector(vertices[index2],vertices[index2 + 1],vertices[index2 + 2], 0);
        let vertex3: Vector = new Vector(vertices[index3],vertices[index3 + 1],vertices[index3 + 2], 0);
        let u : Vector = vertex2.sub(vertex1);
        let v: Vector = vertex3.sub(vertex1);
        return u.cross(v);
    }
}
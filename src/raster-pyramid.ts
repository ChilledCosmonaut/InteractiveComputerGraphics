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
    normalBuffer: WebGLBuffer;
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
            4, 1, 0,
            // back
            4, 3, 2,
            // right
            4, 2, 1,
            // left
            4, 0, 3,
            // bottom
            0, 1, 2, 0, 2, 3
        ];
        let colors = [ //TODO?
            0, 0, 0.5, 1,
            0, 1, 0.1, 1,
            0, 0, 0.25, 1,
            1, 0, 1, 1,
            0, 0, 1, 1
        ];

        let normals = [];

        for (let i = 0; i < vertices.length; i = i + 3){
            let normal: Vector = this.CalculateNormalsForTriangle(indices[i], indices[i+1], indices[i+2], vertices).normalize();
            console.log(normal)
            normals.push(normal.x);
            normals.push(normal.y);
            normals.push(normal.z);
        }

        const vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
        this.vertexBuffer = vertexBuffer;
        const indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
        this.indexBuffer = indexBuffer;
        /*const normalBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, normalBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(normals), this.gl.STATIC_DRAW);
        this.normalBuffer = normalBuffer;*/
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

        /*this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.normalBuffer);
        const normalLocation = shader.getAttributeLocation("a_normal");
        this.gl.enableVertexAttribArray(normalLocation);
        this.gl.vertexAttribPointer(normalLocation, 3, this.gl.FLOAT, false , 0, 0);*/

        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        this.gl.drawElements(this.gl.TRIANGLES, this.elements, this.gl.UNSIGNED_SHORT, 0);

        this.gl.disableVertexAttribArray(positionLocation);
        // TODO disable color vertex attrib array *
        this.gl.disableVertexAttribArray(colorLocation);
        //this.gl.disableVertexAttribArray(normalLocation);
    }

    peakFromHeight(min: Vector, max: Vector, height: number): Vector {
        let peak = min.add(max).mul(0.5);
        peak.y += height;
        return peak;
    }

    CalculateNormalsForTriangle(index1: number, index2: number, index3: number, vertices: Array<number>): Vector {
        let vertex1: Vector = new Vector(vertices[index1*3],vertices[index1*3 + 1],vertices[index1*3 + 2], 0);
        let vertex2: Vector = new Vector(vertices[index2*3],vertices[index2*3 + 1],vertices[index2*3 + 2], 0);
        let vertex3: Vector = new Vector(vertices[index3*3],vertices[index3*3 + 1],vertices[index3*3 + 2], 0);
        let u : Vector = vertex2.sub(vertex1);
        let v: Vector = vertex3.sub(vertex1);
        return u.cross(v);
    }
}
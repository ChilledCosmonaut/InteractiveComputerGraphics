import Vector from './vector';
import Shader from './shader';
import Matrix from "./matrix";

/**
 * A class creating buffers for an axis aligned box to render it with WebGL
 */
export default class RasterObjObject {
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
        private objString: string) {
        this.gl = gl;
        let vertices: Array<number> = Array();
        let normals: Array<number> = Array();
        let indices: Array<number> = Array();

        const lines: Array<string> = objString.split('\n');

        for (let lineNo = 0; lineNo < lines.length; ++lineNo) {
            const line = lines[lineNo].trim();
            if (line === '' || line.startsWith('#')) {
                continue;
            }
            const parts = line.split(/\s+/);
            if(parts[0] == 'v'){
                for (let j: number = 1; j < parts.length; j++){
                    vertices.push(parseFloat(parts[j]));
                }
            }else if(parts[0] == 'vn'){
                for (let j: number = 1; j < parts.length; j++){
                    normals.push(parseFloat(parts[j]));
                }
            }else if(parts[0] == 'f'){
                for (let j: number = 1; j < parts.length - 2; ++j){
                    let index = parseFloat(parts[1].split('/')[0])
                    if (index < 0) {
                        let currentMaxVertex = Math.floor(vertices.length / 3);
                        index = currentMaxVertex + index;
                    }
                    indices.push(index - 1);
                    index = parseFloat(parts[j + 1].split('/')[0])
                    if (index < 0) {
                        let currentMaxVertex = Math.floor(vertices.length / 3);
                        index = currentMaxVertex + index;
                    }
                    indices.push(index - 1);
                    index = parseFloat(parts[j + 2].split('/')[0])
                    if (index < 0) {
                        let currentMaxVertex = Math.floor(vertices.length / 3);
                        index = currentMaxVertex + index;
                    }
                    indices.push(index - 1);
                }
            }
        }

        let colors = Array(Math.floor(vertices.length/3) * 4);

        for (let i: number = 0; i < colors.length; i = i + 4){
            colors[i] = Math.random();
            colors[i+1] = Math.random();
            colors[i+2] = Math.random();
            colors[i+3] = 1;
        }

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

        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        this.gl.drawElements(this.gl.TRIANGLES, this.elements, this.gl.UNSIGNED_SHORT, 0);

        this.gl.disableVertexAttribArray(positionLocation);
        // TODO disable color vertex attrib array *
        this.gl.disableVertexAttribArray(colorLocation);
    }
}
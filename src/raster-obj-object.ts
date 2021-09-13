import Vector from './vector';
import Shader from './shader';
import Matrix from "./matrix";
import {createIndexedColours, createIndexedVectors} from "./indexer";

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
        private objString: string,
        private scale: number) {
        this.gl = gl;
        let vertexStorage: Array<number> = Array();
        let indices: Array<number> = Array();
        let normalStorage: Array<number> = Array();
        let normalIndices: Array<number> = Array();

        const lines: Array<string> = objString.split('\n');

        for (let lineNo = 0; lineNo < lines.length; ++lineNo) {
            const line = lines[lineNo].trim();
            if (line === '' || line.startsWith('#')) {
                continue;
            }
            const parts = line.split(/\s+/);
            if(parts[0] == 'v'){
                for (let j: number = 1; j < parts.length; j++){
                    vertexStorage.push(parseFloat(parts[j]) * scale);
                }
            }else if(parts[0] == 'vn'){
                for (let j: number = 1; j < parts.length; j++){
                    normalStorage.push(parseFloat(parts[j]));
                }
            }else if(parts[0] == 'f'){
                for (let j: number = 1; j < parts.length - 2; ++j){

                    //vertex index
                    let index = parseFloat(parts[1].split('/')[0])
                    if (index < 0) {
                        console.log("Index negative")
                        let currentMaxVertex = Math.floor(vertexStorage.length / 3);
                        index = currentMaxVertex + index;
                    }
                    indices.push(index - 1);
                    for(let vectorIndex = 1; vectorIndex < 3; vectorIndex++){
                        index = parseFloat(parts[j + vectorIndex].split('/')[0])
                        if (index < 0) {
                            console.log("Index negative")
                            let currentMaxVertex = Math.floor(vertexStorage.length / 3);
                            index = currentMaxVertex + index;
                        }
                        indices.push(index - 1);
                    }

                    //normal index
                    let normalIndex = parseFloat(parts[1].split('/')[2])
                    if (normalIndex < 0) {
                        console.log("Normal negative")
                        let currentMaxNormal = Math.floor(normalStorage.length / 3);
                        normalIndex = currentMaxNormal + normalIndex;
                    }
                    normalIndices.push(normalIndex - 1);
                    for(let normalCounter = 1; normalCounter < 3; normalCounter++){
                        normalIndex = parseFloat(parts[j + normalCounter].split('/')[2])
                        if (normalIndex < 0) {
                            console.log("Normal negative")
                            let currentMaxNormal = Math.floor(normalStorage.length / 3);
                            normalIndex = currentMaxNormal + normalIndex;
                        }
                        normalIndices.push(normalIndex - 1);
                    }
                }
            }
        }

        let colors = Array();

        for (let i: number = 0; i < indices.length; i += 3){
            let r = Math.random();
            let g = Math.random();
            let b = Math.random();
            for (let j = 0; j < 3; j++) {
                colors.push(r);
                colors.push(g);
                colors.push(b);
                colors.push(1);
            }
        }

        let vertices = createIndexedVectors(vertexStorage, indices);
        console.log(vertices.length / 3);
        console.log(indices.length)
        //let colours = createIndexedColours(colorStorage, colorIndices);
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

        //this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        //this.gl.drawElements(this.gl.TRIANGLES, this.elements, this.gl.UNSIGNED_SHORT, 0);
        this.gl.drawArrays(this.gl.TRIANGLES, 0, this.elements);

        this.gl.disableVertexAttribArray(positionLocation);
        // TODO disable color vertex attrib array *
        //this.gl.disableVertexAttribArray(colorLocation);
        this.gl.disableVertexAttribArray(normalLocation);
    }
}
import 'bootstrap';
import 'bootstrap/scss/bootstrap.scss';
import Vector from './vector';
import {
    GroupNode,
    SphereNode,
    TextureBoxNode,
    AABoxNode, PyramidNode
} from './nodes';
import {
    RasterVisitor,
    RasterSetupVisitor
} from './rastervisitor';
import Shader from './shader';
import phongVertexShader from './phong-vertex-perspective-shader.glsl';
import phongFragmentShader from './phong-fragment-shader.glsl';
import textureVertexShader from './texture-vertex-perspective-shader.glsl';
import textureFragmentShader from './texture-fragment-shader.glsl';
import { Rotation, Translation } from './transformation';
import {RotationNode} from "./animation-node-rotation";
import {DriverNode} from "./animation-node-driver";
import {JumperNode} from "./animation-node-jumper";
//import Matrix from "./matrix";

let size = 1;
let nodePosition = 0;
let SAVE = new Array(size).fill(new Array(4).fill(new Array(4)));
//let SAVE:Matrix [];
export default SAVE;

window.addEventListener('load', () => {
    const canvas = document.getElementById("rasteriser") as HTMLCanvasElement;
    const gl = canvas.getContext("webgl2");

    // construct scene graph
    //        SG
    //         |
    //    +----------+-----+-----------------------
    //  T(gn0)     T(gn1)   T(gn3) = desktopNode
    //    |           |        |
    // desktopBox  R(gn2)   Pyramid
    //                |
    //             Sphere

    const sg = new GroupNode(new Translation(new Vector(0, 0, -4, 0)));

    const groupNode0 = new GroupNode(new Translation(new Vector(.2, .2, -1, 0)))
    sg.add(groupNode0);
    const desktopBox = new TextureBoxNode('wood_texture.jpg', 'wood_normal.jpg');
    groupNode0.add(desktopBox);

    const groupNode1 = new GroupNode(new Translation(new Vector(0, 2, -5, 0)));
    sg.add(groupNode1);
    const groupNode2 = new GroupNode(new Rotation(new Vector(0, 0, 1, 0), 0));
    groupNode1.add(groupNode2);
    const sphere = new SphereNode(new Vector(1,1,0,0));
    groupNode2.add(sphere);

    const groupNode3 = new GroupNode(new Translation(new Vector(2,0, -3, 0)));
    sg.add(groupNode3);
    const groupNode4 = new GroupNode(new Rotation(new Vector(0,0,1,0), Math.PI/4))
    groupNode3.add(groupNode4);
    const pyramid = new PyramidNode(new Vector(1,1,1,0));
    groupNode4.add(pyramid);

    // setup for rendering
    const setupVisitor = new RasterSetupVisitor(gl);
    setupVisitor.setup(sg);

    let camera = {
        eye: new Vector(0, 3, 4, 1),
        center: new Vector(0, 0, 0, 1),
        up: new Vector(0, 1, 0, 0),
        fovy: 60,
        aspect: canvas.width / canvas.height,
        near: 0.1,
        far: 100
    };

    const phongShader = new Shader(gl,
        phongVertexShader,
        phongFragmentShader
    );
    const textureShader = new Shader(gl,
        textureVertexShader,
        textureFragmentShader
    );
    const visitor = new RasterVisitor(gl, phongShader, textureShader, setupVisitor.objects);

    let animationRotationNode = new RotationNode(groupNode0, new Vector(0, 1, 0, 0));
    let animationDriverNode = new DriverNode(groupNode0);
    let animationJumperNode = new JumperNode(groupNode0);

    function simulate(deltaT: number) {
        animationDriverNode.simulate(deltaT);
        animationRotationNode.simulate(deltaT)
        animationJumperNode.simulate(deltaT);
    }

    let lastTimestamp = performance.now();

    function animate(timestamp: number) {
        simulate(timestamp - lastTimestamp);
        visitor.render(sg, camera, []);
        lastTimestamp = timestamp;
        window.requestAnimationFrame(animate);
    }
    Promise.all(
        [phongShader.load(), textureShader.load()]
    ).then(x =>
        window.requestAnimationFrame(animate)
    );

    window.addEventListener('keydown', function (event) {
        assignKeyToAction(event, true);
    });

    window.addEventListener('keyup', function (event) {
        assignKeyToAction(event, false);
    });

    function assignKeyToAction(event: KeyboardEvent, ispressed: boolean) {
        switch (event.key) {
            case "q":
                animationRotationNode.leftRotation = ispressed;
                break;
            case "e":
                animationRotationNode.rightRotation = ispressed;
                break;
            case ' ':
                animationJumperNode.isJumping = true;
                break;
            case "w":
                animationDriverNode.forward = ispressed;
                break;
            case "a":
                animationDriverNode.left = ispressed
                break;
            case "s":
                animationDriverNode.backward = ispressed;
                break;
            case "d":
                animationDriverNode.right = ispressed;
                break;
        }}

    let jsonContent: any;
    jsonContent = JSON.stringify(SAVE);

    document.getElementById("saveButton").onclick = function () {
        save("saveFile.json", jsonContent)
    }

    function save(filename:any, text:any) {
        let element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
        element.setAttribute('download', filename);

        element.style.display = 'none';
        document.body.appendChild(element);

        element.click();

        document.body.removeChild(element);
    }

    let loadButton = document.getElementById("loadButton") as HTMLInputElement;
    loadButton.addEventListener( "change", function () {
        let file = this.files[0];
        let fileReader = new FileReader();
        let savedFile: string;
        fileReader.readAsText(file);
        fileReader.onload = function () {
            savedFile = fileReader.result.toString();
        };
        fileReader.onerror = function () {
            alert(fileReader.error);
        };
         SAVE = JSON.parse(savedFile);

    });
})



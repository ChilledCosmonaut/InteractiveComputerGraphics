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
import {
    DriverNode, JumperNode,
    RotationNode
} from './animation-nodes';
import phongVertexShader from './phong-vertex-perspective-shader.glsl';
import phongFragmentShader from './phong-fragment-shader.glsl';
import textureVertexShader from './texture-vertex-perspective-shader.glsl';
import textureFragmentShader from './texture-fragment-shader.glsl';
import { Rotation, Translation } from './transformation';
import MatrixHelper from "./matrix-helper";
import Matrix from "./matrix";

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
    const gn0 = new GroupNode(new Translation(new Vector(.2, .2, -1, 0)))
    const desktopBox = new AABoxNode(new Vector(1,1,0,0));
    sg.add(gn0);
    gn0.add(desktopBox);
    const groupNode1 = new GroupNode(new Translation(new Vector(0, 2, -5, 0)));
    sg.add(groupNode1);
    const groupNode2 = new GroupNode(new Rotation(new Vector(0, 0, 1, 0), 0));
    groupNode1.add(groupNode2);
    const sphere = new SphereNode(new Vector(1,1,0,0));
    groupNode2.add(sphere);
    const groupNode3 = new GroupNode(new Translation(new Vector(0,-3, -5, 0)));
    sg.add(groupNode3);
    const pyramid = new PyramidNode(new Vector(0,1,1,0));
    groupNode3.add(pyramid);

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

    let animationRotationNode = new RotationNode(gn0, new Vector(0, 1, 0, 0));
    let animationDriverNode = new DriverNode(gn0);
    let animationJumperNode = new JumperNode(gn0);

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
            case "q": //left roation
                animationRotationNode.leftRotation = ispressed;
                break;
            case "e": //right roation
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
        }
    }
});
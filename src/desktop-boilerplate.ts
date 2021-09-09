import 'bootstrap';
import './file-interactor';
import 'bootstrap/scss/bootstrap.scss';
import Vector from './vector';
import {
    GroupNode,
    SphereNode,
    TextureBoxNode,
    AABoxNode, PyramidNode, ObjNode
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
import Sphere from "./sphere";

window.addEventListener('load', async () => {
    const canvas = document.getElementById("rasteriser") as HTMLCanvasElement;
    const gl = canvas.getContext("webgl2");

    const response = await fetch('../SpaceShip.obj');
    const text = await response.text();

    // construct scene graph TODO :)
    //        SG
    //         |
    //    +----------+-----+-----------------------
    //  T(gn0)     T(gn1)   T(gn3) = desktopNode
    //    |           |        |
    // desktopBox  R(gn2)   Pyramid
    //                |
    //             Sphere

    const sg = new GroupNode(new Translation(new Vector(0, 0, 0, 0)));

    //Desktop base
    const desktopNode = new GroupNode(new Translation(new Vector(0, 0, -10, 0)))
    sg.add(desktopNode);
    const desktopBox = new TextureBoxNode('wood_texture.jpg', 'wood_normal.jpg', 4);
    desktopNode.add(desktopBox);

    //Obj Nodes
    const objTranslation = new GroupNode(new Translation(new Vector(0, 0, 5, 0)));
    desktopNode.add(objTranslation);
    const obj = new ObjNode(text, 0.5);
    objTranslation.add(obj);

    //Sphere Node
    const sphere1Translation = new GroupNode(new Translation(new Vector(0, 4, 0, 0)));
    desktopNode.add(sphere1Translation);
    const sphere1 = new SphereNode(new Vector(1,0,1,0));
    sphere1Translation.add(sphere1);
    const sphereOrbit = new GroupNode(new Rotation(new Vector(0,0,0,0),0));
    sphere1Translation.add(sphereOrbit);
    const sphere2Translation = new GroupNode(new Translation(new Vector(3, 0, 0, 0)));
    sphereOrbit.add(sphere2Translation);
    const sphere2 = new SphereNode(new Vector(0,0,1,0));
    sphere2Translation.add(sphere2);

    //Pyramid Node
    const pyramidTranslation = new GroupNode(new Translation(new Vector(3,0, 0, 0)));
    desktopNode.add(pyramidTranslation);
    const pyramid = new PyramidNode(new Vector(1,0,1,0));
    pyramidTranslation.add(pyramid);

    //Coloured Box Node
    const boxTranslation = new GroupNode(new Translation(new Vector(-3,0,0,0)));
    desktopNode.add(boxTranslation);
    const colourBox = new AABoxNode(new Vector(1,1,1,1));
    boxTranslation.add(colourBox);



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

    let animationRotationNode = new RotationNode(desktopNode, new Vector(0, 1, 0, 0));
    let ObjRotation = new RotationNode(objTranslation, new Vector(0,1,0,0))
    let animationDriverNode = new DriverNode(desktopNode);
    let animationJumperNode = new JumperNode(desktopNode);

    function simulate(deltaT: number) {
        animationDriverNode.simulate(deltaT);
        animationRotationNode.simulate(deltaT);
        ObjRotation.simulate(deltaT);
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
        }
    }
});
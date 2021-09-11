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
import {Rotation, Scaling, Translation} from './transformation';
import {RotationNode} from "./animation-node-rotation";
import {DriverNode} from "./animation-node-driver";
import {JumperNode} from "./animation-node-jumper";
import {Camera, CameraFreeFlight} from "./camera";
import {createEnvironment} from "./createEnvironment";
import MatrixHelper from "./matrix-helper";

window.addEventListener('load', async () => {
    const canvas = document.getElementById("rasteriser") as HTMLCanvasElement;
    const gl = canvas.getContext("webgl2");

    const response = await fetch('../SpaceShip.obj');
    const text = await response.text();

    // construct scene graph
    //       T(SG)
    let ambientFactor: number = 0;
    let diffuseFactor: number = 0;
    let specularFactor: number = 0;

    // construct scene graph TODO :)
    //        SG
    //         |
    //         +-------------------------------------------+ ... eine Szene zum Testen: siehe createEnvironment.ts
    //    T(desktopNode)                                              T(gn4)(wo eine Kugel dran hängt...)
    //          |
    //   +----------+----------------+---------------------+----------------+
    //   |          |                |                     |                |
    //TextureBox  T(objTransl)      T(sphere1Transl)    T(pyramidTransl)  T(boxTransl)
    //              |                |       |                |                |
    //            ObjNode         Sphere  R(sphereOrbit)     Pyramid          AABox
    //                                       |
    //                                   T(sphere2Translation)
    //                                       |
    //                                    Sphere

    const sg = new GroupNode(new Translation(new Vector(0, 0, 0, 0)));

    //Desktop base
    const desktopNode = new GroupNode(new Translation(new Vector(0, 0, 0, 0)))
    sg.add(desktopNode);

    const dB = new TextureBoxNode('wood_texture.jpg', 'wood_normal.jpg', 4);
    desktopNode.add(dB);

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

    const gn4 = new GroupNode(new Translation(new Vector(5, -2, 0, 0)));
    sg.add(gn4);
    gn4.add(new SphereNode(new Vector(1, 0, 1, 0)));

    createEnvironment(sg);

    // setup for rendering
    const setupVisitor = new RasterSetupVisitor(gl);
    setupVisitor.setup(sg);

    let camera = {
        eye: new Vector(0, 0, 1, 1),
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
    let SphereOrbit = new RotationNode(sphereOrbit, new Vector(0,1,0,0))
    SphereOrbit.rightRotation = true;
    let animationDriverNode = new DriverNode(desktopNode);
    let animationJumperNode = new JumperNode(desktopNode);

    let cameraFreeFlight = new CameraFreeFlight(camera, desktopNode);

    function simulate(deltaT: number) {
        animationDriverNode.simulate(deltaT);
        animationRotationNode.simulate(deltaT);
        SphereOrbit.simulate(deltaT);
        animationJumperNode.simulate(deltaT);
        cameraFreeFlight.simulate(deltaT)

        /*console.log(vectorToString("cam", camera.eye));
        console.log(vectorToString("gn0", MatrixHelper.getPositionOfMatrix(gn0.transform.getMatrix())));
        function vectorToString(text: string, v: Vector) {
            console.log(text + ": " + v.x + ", " + v.y + ", " + v.z + ", " + v.w)
        }*/
    }

    let lastTimestamp = performance.now();

    function animate(timestamp: number) {
        simulate(timestamp - lastTimestamp);
        visitor.render(sg, camera, [], ambientFactor, diffuseFactor, specularFactor);
        lastTimestamp = timestamp;
        window.requestAnimationFrame(animate);
    }

    let ambientSlider = document.getElementById("ambientSlider") as HTMLInputElement;
    ambientFactor = parseFloat(ambientSlider.value);
    let diffuseSlider = document.getElementById("diffuseSlider") as HTMLInputElement;
    diffuseFactor = parseFloat(diffuseSlider.value);
    let specularSlider = document.getElementById("specularSlider") as HTMLInputElement;
    specularFactor = parseFloat(specularSlider.value);

    ambientSlider.oninput = function() {
        ambientFactor = parseFloat(ambientSlider.value);
    };

    diffuseSlider.oninput = function() {
        diffuseFactor = parseFloat(diffuseSlider.value);
    };

    specularSlider.oninput = function() {
        specularFactor = parseFloat(specularSlider.value);
    };

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
            //todo: Temp testing for camera.
            case "t":
                cameraFreeFlight.pressed = ispressed;
                break;

            case "j":
                animationDriverNode.up = ispressed;
                break;
            case "m":
                animationDriverNode.down = ispressed;
                break;
        //gieren
            case "q":
                animationRotationNode.leftRotation = ispressed;
                animationRotationNode.axisToRotateAround = new Vector(0, 1, 0, 1)
                break;
            case "e":
                animationRotationNode.rightRotation = ispressed;
                animationRotationNode.axisToRotateAround = new Vector(0, 1, 0, 1)
                break;
        //nicken
            case "r":
                animationRotationNode.upRotation = ispressed;
                animationRotationNode.axisToRotateAround = new Vector(1, 0, 0, 0)
                break;
            case "f":
                animationRotationNode.downRotation = ispressed;
                animationRotationNode.axisToRotateAround = new Vector(1, 0, 0, 1)
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
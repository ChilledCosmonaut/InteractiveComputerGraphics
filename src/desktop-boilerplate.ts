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
import {Rotation, Scaling, Translation} from './transformation';
import {RotationNode} from "./animation-node-rotation";
import {DriverNode} from "./animation-node-driver";
import {JumperNode} from "./animation-node-jumper";
import {Camera, CameraFreeFlight} from "./camera";
import {createEnvironment} from "./createEnvironment";
import MatrixHelper from "./matrix-helper";

window.addEventListener('load', () => {
    const canvas = document.getElementById("rasteriser") as HTMLCanvasElement;
    const gl = canvas.getContext("webgl2");

    // construct scene graph
    //        SG
    //         |
    //    +-------------------+-----+-----------------------
    //  T(gn0)               T(gn1)   T(gn3) = desktopNode   T(gnWorldCenter)
    //    |                     |        |                        |
    // desktopBox            R(gn2)   Pyramid                  Sphere
    //                         |
    //                        Sphere

    const sg = new GroupNode(new Translation(new Vector(0, 0, 0, 0)));

    const gn0 = new GroupNode(new Translation(new Vector(0, 0, 0, 0)))
    sg.add(gn0);
    const desktopBox = new TextureBoxNode('wood_texture.jpg', 'wood_normal.jpg');
    gn0.add(desktopBox);

    const groupNode1 = new GroupNode(new Translation(new Vector(0, 2, -5, 0)));
    sg.add(groupNode1);
    const groupNode2 = new GroupNode(new Rotation(new Vector(0, 0, 1, 0), 0));
    groupNode1.add(groupNode2);
    const sphere = new SphereNode(new Vector(1,1,0,0));
    groupNode2.add(sphere);

    const groupNode3 = new GroupNode(new Translation(new Vector(2,0, -3, 0)));
    sg.add(groupNode3);
    const pyramid = new PyramidNode(new Vector(0,1,1,0));
    groupNode3.add(pyramid);

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

    let animationRotationNode = new RotationNode(gn0, new Vector(0, 1, 0, 0));
    let animationDriverNode = new DriverNode(gn0);
    let animationJumperNode = new JumperNode(gn0);
    //neu:
    let cameraFreeFlight = new CameraFreeFlight(camera, gn0);

    function simulate(deltaT: number) {
        animationDriverNode.simulate(deltaT);
        animationRotationNode.simulate(deltaT)
        animationJumperNode.simulate(deltaT);
        cameraFreeFlight.simulate(deltaT)
        //console.log(vectorToString("cam", camera.eye));
        //console.log(vectorToString("gn0", MatrixHelper.getPositionOfMatrix(gn0.transform.getMatrix())));

        function vectorToString(text: string, v: Vector) {
            console.log(text + ": " + v.x + ", " + v.y + ", " + v.z + ", " + v.w)
        }

        //Testen der Kamera:
        //camera.eye = new Vector(0, 0, 0, 1);
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
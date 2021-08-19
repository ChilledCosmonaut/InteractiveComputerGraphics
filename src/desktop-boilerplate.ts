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
    DriverNode,
    RotationNode
} from './animation-nodes';
import phongVertexShader from './phong-vertex-perspective-shader.glsl';
import phongFragmentShader from './phong-fragment-shader.glsl';
import textureVertexShader from './texture-vertex-perspective-shader.glsl';
import textureFragmentShader from './texture-fragment-shader.glsl';
import { Rotation, Translation } from './transformation';

window.addEventListener('load', () => {
    const canvas = document.getElementById("rasteriser") as HTMLCanvasElement;
    const gl = canvas.getContext("webgl2");

    // construct scene graph
    //        SG
    //         |
    //    +----------+-----+--------+
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
    //let animationForwardTranslationNode = new TranslationNode(new Vector(0, 0, -1, 0));//todo
    let animationForwardTranslationNode = new DriverNode(gn0);
    //let animationRightTranslationNode = new DriverNode(gn0, angle + 90); //todo: angle in Grad?!


    function simulate(deltaT: number) {
        animationRotationNode.simulate(deltaT)
        animationForwardTranslationNode.simulate(deltaT);
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
        switch (event.key) {
            case "q":
                //todo: "auf der Stelle drehen lassen (etwa mit "Q" und "E"?!)" nach links und rechts drehen?
                //todo: soll um die y-Achse gedreht werden oder in diese Richtung?
                animationRotationNode.toggleActive()
                break;
            case "t": //todo: spacebar anstatt t für test...
                jump(new Vector(0, 1, 0,0), groupNode3)
                break;
            case "w": //vorwärts
                animationForwardTranslationNode.toggleActive();
                break;
            case "a": //links
                break;
            case "s": //rückwärts
                break;
            case "d": //rechts
                break;
        }
    });


    //todo: auf der y-Achse hoch und runter hüpfen
    function jump(axis: Vector, groupNode: GroupNode){
        //new GroupNode(new Translation())
        console.log("jump")
    }
});
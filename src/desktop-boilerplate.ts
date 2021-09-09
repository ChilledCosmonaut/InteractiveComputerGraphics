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
import Sphere from "./sphere";
import RayVisitor from "./rayvisitor";

//const UseRasterizer = true
//const UseRaytracer = false
const UseRasterizer = false;
const UseRaytracer = true;

window.addEventListener('load', () => {
    const canvasRaytracer = document.getElementById("raytracer") as HTMLCanvasElement;
    const canvasRaster = document.getElementById("rasteriser") as HTMLCanvasElement;
    const contextWebGl = canvasRaster.getContext("webgl2");
    const context2D = canvasRaytracer.getContext("2d");

    let useRenderer = UseRaytracer

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
    sg.add(gn0);
    const desktopBox = new TextureBoxNode('wood_texture.jpg', 'wood_normal.jpg');
    gn0.add(desktopBox);

    const groupNode1 = new GroupNode(new Translation(new Vector(0, 2, -5, 0)));
    sg.add(groupNode1);
    const groupNode2 = new GroupNode(new Rotation(new Vector(0, 0, 1, 0), 0));
    groupNode1.add(groupNode2);
    const sphere = new SphereNode(new Vector(1,1,0,0));
    groupNode2.add(sphere);

    const groupNode4 = new GroupNode(new Translation(new Vector(0, 2, 0, 0)));
    gn0.add(groupNode4);
    const sphere2 = new SphereNode(new Vector(1,0,1,0));
    groupNode4.add(sphere2);

    const groupNode3 = new GroupNode(new Translation(new Vector(2,0, -3, 0)));
    gn0.add(groupNode3);
    const pyramid = new PyramidNode(new Vector(1,0,1,0));
    groupNode3.add(pyramid);

    // setup for rendering
    const setupVisitor = new RasterSetupVisitor(contextWebGl);
    setupVisitor.setup(sg);


    let camera = {
    //eye: new Vector(0, 3, 4, 1),
        eye: new Vector(0, 0, 0, 1),
        center: new Vector(0, 0, -1,1),
        up: new Vector(0, 1, 0, 0),
        fovy: 60,
        aspect: canvasRaster.width / canvasRaster.height,
        near: 0.1,
        far: 100
    };

    const phongShader = new Shader(contextWebGl,
        phongVertexShader,
        phongFragmentShader
    );
    const textureShader = new Shader(contextWebGl,
        textureVertexShader,
        textureFragmentShader
    );
    const visitor_raster = new RasterVisitor(contextWebGl, phongShader, textureShader, setupVisitor.objects);
    const visitor_raytracer = new RayVisitor(context2D, 500, 500); //todo

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
        if (useRenderer === UseRaytracer){
            const camRt = { origin: new Vector(0, 2, 0, 1), width: 200, height:200, alpha: Math.PI / 3 }
            visitor_raytracer.render(sg, camRt, [])
        } else {
            visitor_raster.render(sg, camera, [])
        }
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
            case "r": //zwischen zwei Renderern wechseln
                if(!ispressed) {
                    break
                }
                useRenderer = !useRenderer;
                if(useRenderer === UseRasterizer) {
                    canvasRaytracer.style.opacity = '0'
                    canvasRaster.style.opacity = '1'
                } else {
                    canvasRaster.style.opacity = '0'
                    canvasRaytracer.style.opacity = '1'
                }
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
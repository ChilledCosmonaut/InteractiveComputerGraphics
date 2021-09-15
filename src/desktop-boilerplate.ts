import 'bootstrap';
import 'bootstrap/scss/bootstrap.scss';
import Vector from './vector';
import {
    GroupNode,
    SphereNode,
    TextureBoxNode,
    AABoxNode, PyramidNode, ObjNode, LightNode, CameraNode
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
import {Camera, CameraFreeFlight} from "./camera";
import {createEnvironment} from "./createEnvironment";
import RayVisitor from "./rayvisitor";
import Sphere from "./sphere";
import {CombinedDriverNode} from "./relative_driver";
import Matrix from "./matrix";

const UseRasterizer = false;
const UseRaytracer = true;


window.addEventListener('load', async () => {
    const canvasRaytracer = document.getElementById("raytracer") as HTMLCanvasElement;
    const canvasRaster = document.getElementById("rasteriser") as HTMLCanvasElement;
    const contextWebGl = canvasRaster.getContext("webgl2");
    const context2D = canvasRaytracer.getContext("2d");

    let useRenderer = UseRasterizer

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

    //Camera Node
    const cameraNode = new GroupNode(new Translation(new Vector(0,0,0,0)));
    sg.add(cameraNode);
    const cameraRotation = new GroupNode(new Translation(new Vector(0,0,0,0)));
    cameraNode.add(cameraRotation);
    const cameraTilt = new GroupNode(new Translation(new Vector(0,0,0,0)));
    cameraRotation.add(cameraTilt);

    const cameraAsNode = new CameraNode(
        new Vector(0, 0, 0, 1),
        new Vector(0, 0, -1,1),
        new Vector(0, 1, 0, 0),
        60,
        canvasRaster.width / canvasRaster.height,
        0.1,
        100);
    cameraTilt.add(cameraAsNode);

    //Light Nodes
    const lightNode = new GroupNode(new Translation(new Vector(0,0,0,0)));
    sg.add(lightNode);
    const lightRotation = new GroupNode(new Rotation(new Vector(0,0,0,0),0));
    lightNode.add(lightRotation);
    const lightTranslationTop = new GroupNode(new Translation(new Vector(0,7,0,0)));
    lightNode.add(lightTranslationTop);
    const topLight = new LightNode(new Vector(0,0,0,0));
    lightTranslationTop.add(topLight);
    const lightTranslation1 = new GroupNode(new Translation(new Vector(7,0,0,1)));
    lightRotation.add(lightTranslation1);
    const light1 = new LightNode(new Vector(0,0,0,0));
    lightTranslation1.add(light1);
    const lightTranslation2 = new GroupNode(new Translation(new Vector(-7,0,0,1)));
    lightRotation.add(lightTranslation2);
    const light2 = new LightNode(new Vector(0,0,0,0));
    lightTranslation2.add(light2);

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

    // setup for rendering
    const setupVisitor = new RasterSetupVisitor(contextWebGl);
    setupVisitor.setup(sg);


    let camera = {
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

    let animationRotationNode = new RotationNode(desktopNode, new Vector(0, 1, 0, 0));
    let SphereOrbit = new RotationNode(sphereOrbit, new Vector(0,1,0,0))
    SphereOrbit.rightRotation = true;
    let lightOrbit = new RotationNode(lightRotation, new Vector(0,1,0,0));
    lightOrbit.rightRotation = true;
    let cameraYRotation = new RotationNode(cameraRotation, new Vector(0,1,0,0));
    let cameraTiltRotation = new RotationNode(cameraTilt, new Vector(1,0,0,0));
    let cameraDriverNode = new CombinedDriverNode(cameraNode, cameraRotation, cameraTilt);
    let animationDriverNode = new DriverNode(desktopNode);
    let animationJumperNode = new JumperNode(desktopNode);

    //let cameraFreeFlight = new CameraFreeFlight(camera, desktopNode);

    function simulate(deltaT: number) {
        //animationDriverNode.simulate(deltaT);
        //animationRotationNode.simulate(deltaT);
        SphereOrbit.simulate(deltaT);
        cameraYRotation.simulate(deltaT);
        cameraTiltRotation.simulate(deltaT);
        cameraDriverNode.simulate(deltaT);
        lightOrbit.simulate(deltaT);
        animationJumperNode.simulate(deltaT);
        //cameraFreeFlight.simulate(deltaT)
    }

    let lastTimestamp = performance.now();

    function animate(timestamp: number) {
        simulate(timestamp - lastTimestamp);
        if (useRenderer === UseRaytracer){
            //todo!!!!!!!
            const camRt = { origin: new Vector(0, 0, 0, 1), width: 500, height:500, alpha: Math.PI / 3 }
            visitor_raytracer.render(sg, camRt, [new Vector(2, 1, 2, 1)], ambientFactor, diffuseFactor, specularFactor);
        } else {
            visitor_raster.render(sg, camera,  [new Vector(1,1,1,1)], ambientFactor, diffuseFactor, specularFactor);
        }
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
            //todo: Temp testing for camera.
            case "t":
                //cameraFreeFlight.pressed = ispressed;
                break;

            case "j":
                animationDriverNode.up = ispressed;
                cameraDriverNode.up = ispressed;
                break;
            case "m":
                animationDriverNode.down = ispressed;
                cameraDriverNode.down = ispressed;
                break;
        //gieren
            case "q":
                animationRotationNode.leftRotation = ispressed;
                cameraYRotation.leftRotation = ispressed;
                animationRotationNode.axisToRotateAround = new Vector(0, 1, 0, 1)
                break;
            case "e":
                animationRotationNode.rightRotation = ispressed;
                cameraYRotation.rightRotation = ispressed;
                animationRotationNode.axisToRotateAround = new Vector(0, 1, 0, 1)
                break;
        //nicken
            case "z":
                animationRotationNode.upRotation = ispressed;
                cameraTiltRotation.downRotation = ispressed;
                animationRotationNode.axisToRotateAround = new Vector(1, 0, 0, 0)
                break;
            case "h":
                animationRotationNode.downRotation = ispressed;
                cameraTiltRotation.upRotation = ispressed;
                animationRotationNode.axisToRotateAround = new Vector(1, 0, 0, 1)
                break;

            case ' ':

                animationJumperNode.isJumping = true;
                break;
            case "w":
                //animationDriverNode.forward = ispressed;
                cameraDriverNode.forward = ispressed;
                break;
            case "a":
                //animationDriverNode.left = ispressed;
                cameraDriverNode.left = ispressed;
                break;
            case "s":
                //animationDriverNode.backward = ispressed;
                cameraDriverNode.backward = ispressed;
                break;
            case "d":
                //animationDriverNode.right = ispressed;
                cameraDriverNode.right = ispressed;
                break;
        }}

    let jsonContent: any;

    document.getElementById("saveButton").onclick = function () {
        save("saveFile.json")
    }

    function save(filename:any) {
        jsonContent = JSON.stringify(sg,null, "\t" );
        let element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(jsonContent));
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
        let save;
        fileReader.readAsText(file);
        fileReader.onload = function () {
            savedFile = fileReader.result.toString();
            save = JSON.parse(savedFile);
            traverse(sg, save);
            console.log("savedFile:",savedFile);
            console.log("rootNode:",sg);
            console.log("save:",save);
        };
        fileReader.onerror = function () {
            alert(fileReader.error);
        };
    });

    function process(key:any, value:any) {
        console.log(key + " : " + value);
    }

    function traverse(sgNode:GroupNode, savedNode:any) {
        let transformation: Matrix = new Matrix(savedNode.transform.matrix.data);
        transformation.copyArray(savedNode.transform.matrix.data);
        let inverseTransformation: Matrix = new Matrix(savedNode.transform.inverse.data);
        inverseTransformation.copyArray(savedNode.transform.inverse.data);
        sgNode.transform.setMatrix(transformation);
        sgNode.transform.setInverseMatrix(inverseTransformation);
        for(let childCounter = 0; childCounter < sgNode.child.length; childCounter++) {
            let currentChild:GroupNode;
            if(sgNode.child[childCounter] instanceof GroupNode) {
                currentChild = sgNode.child[childCounter] as GroupNode;
                traverse(currentChild, savedNode.child[childCounter]);
            }
        }
        /*for (let i in sgNode) {
            func.apply(this, [i,o[i]]);
            if(o[i] !== null && typeof(o[i]) == "object") {
                traverse(o[i], func);
            }
        }*/
    }

})



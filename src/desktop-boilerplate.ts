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

    // construct scene graph TODO :)
    //        SG
    //         |
    //    +----------+-----+--------+
    //  desktopBox     T(gn1)   T(dn1) = desktopNode
    //              |
    //       R(gn3)
    //             |
    //              Box
    ///The array in which all the values are preserved, so they can be saved at any point in time.
    let SAVE = Array.from(Array(16), () => new Array(4));

    SAVE [0] = [0, 0, -4, 0];
    const sg = new GroupNode(new Translation(new Vector(SAVE [0] [0], SAVE [0] [1], SAVE [0] [2], SAVE [0] [3])));
    SAVE [1] = [1, 1, 0, 0];
    const desktopBox = new AABoxNode(new Vector(SAVE [1] [0],SAVE [1] [1],SAVE [1] [2],SAVE [1] [3]));
    sg.add(desktopBox);
    SAVE [2] = [0, 2, -5, 0];
    const groupNode1 = new GroupNode(new Translation(new Vector(SAVE [2] [0], SAVE [2] [1], SAVE [2] [2], SAVE [2] [3])));
    sg.add(groupNode1);
    SAVE [3] = [0, 0, 1, 0];
    const groupNode2 = new GroupNode(new Rotation(new Vector(SAVE [3] [0], SAVE [3] [1], SAVE [3] [2], SAVE [3] [3]), 0));
    groupNode1.add(groupNode2);
    SAVE [4] = [1, 1, 0, 0];
    const sphere = new SphereNode(new Vector(SAVE [4] [0],SAVE [4] [1],SAVE [4] [2],SAVE [4] [3]));
    groupNode2.add(sphere);
    SAVE [14] = [6, 4, 2, 0];
    const sphere2 = new SphereNode(new Vector(SAVE [4] [0],SAVE [4] [1],SAVE [4] [2],SAVE [4] [3]));
    groupNode2.add(sphere2);

    SAVE [5] = [0, -2, -5, 0];
    const groupNode3 = new GroupNode(new Translation(new Vector(SAVE [5] [0],SAVE [5] [1], SAVE [5] [2], SAVE [5] [3])));
    sg.add(groupNode3);
    SAVE [6] = [0, 1, 1, 0];
    const pyramid = new PyramidNode(new Vector(SAVE [6] [0],SAVE [6] [1],SAVE [6] [2],SAVE [6] [3]));
    groupNode3.add(pyramid);


    /*const gn1 = new GroupNode(new Translation(new Vector(-0.75, -0.75, -3, 0)));
    sg.add(gn1);
    const sphere = new SphereNode(new Vector(.8, .4, .1, 1))
    gn1.add(sphere);
    const gn2 = new GroupNode(new Translation(new Vector(.2, .2, -1, 0)));
    sg.add(gn2);
    const gn3 = new GroupNode(new Translation(new Vector(0, 0, 0, 0))); //TODO: Warum mit Translation statt Rotation?!
    gn2.add(gn3);
    //const cube = new TextureBoxNode('hci-logo.png');
    //gn3.add(cube)
    const dn1 = new GroupNode(new Translation(new Vector(.2,.2,-0.9,0)));
    sg.add(dn1);
    const baseBox = new AABoxNode(new Vector(1,1,1,0));
    dn1.add(baseBox); */

    // setup for rendering
    const setupVisitor = new RasterSetupVisitor(gl);
    setupVisitor.setup(sg);

    SAVE [7] = [0, 0, 1, 1];
    SAVE [8] = [0, 0, 0, 1];
    SAVE [9] = [0, 1, 0, 0];
    SAVE [10] = [60, 0, 0, 0];
    SAVE [11] = [0.1, 0, 0, 0];
    SAVE [12] = [100, 0, 0, 0];
    let camera = {
        eye: new Vector(SAVE [7] [0], SAVE [7] [1], SAVE [7] [2], SAVE [7] [3]),
        center: new Vector(SAVE [8] [0], SAVE [8] [1], SAVE [8] [2], SAVE [8] [3]),
        up: new Vector(SAVE [9] [0], SAVE [9] [1], SAVE [9] [2], SAVE [9] [3]),
        fovy: SAVE [10] [0],
        aspect: canvas.width / canvas.height,
        near: SAVE [11] [0],
        far: SAVE [12] [0]
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

    /*let animationNodes = [
        //new RotationNode(sg, new Vector(0, 0, 1, 0)),
        //new RotationNode(gn3, new Vector(0, 1, 0, 0))

    ];*/

    function simulate(deltaT: number) {
        /*for (let animationNode of animationNodes) {
            animationNode.simulate(deltaT);
        }*/
    }

    SAVE [13] = [performance.now(), 0, 0, 0];
    let lastTimestamp = SAVE [13] [0];

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

    /*window.addEventListener('keydown', function (event) {
        switch (event.key) {
            case "ArrowUp":
                animationNodes[0].toggleActive();
                break;
        }
    });*/

    let jsonContent: any;
    jsonContent = JSON.stringify(SAVE);

    function writeFromJson() {
        JSON.parse(jsonContent);
    }
    document.getElementById("saveButton").onclick = function(){save("saveFile", jsonContent)}

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
        let savedFile:string;
        fileReader.readAsText(file);
        fileReader.onload = function() {
             savedFile = fileReader.result.toString();
        };
        fileReader.onerror = function() {
            alert(fileReader.error);
        };
        SAVE = JSON.parse(savedFile)
    })

});
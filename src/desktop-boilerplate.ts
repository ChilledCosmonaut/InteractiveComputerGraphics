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

    const sg = new GroupNode(new Translation(new Vector(-2, 0, -4, 0)));
    /*const desktopBox = new AABoxNode(new Vector(1,1,0,0));
    sg.add(desktopBox);
    const groupNode1 = new GroupNode(new Translation(new Vector(0, 2, -5, 0)));
    sg.add(groupNode1);
    const groupNode2 = new GroupNode(new Rotation(new Vector(0, 0, 1, 0), 0));
    groupNode1.add(groupNode2);
    const sphere = new SphereNode(new Vector(1,1,0,0));
    groupNode2.add(sphere);*/

    const groupNode3 = new GroupNode(new Rotation(new Vector(0,0,1, 0), -Math.PI));//new Translation(new Vector(0,0, 0, 0)));
    sg.add(groupNode3);
    const pyramid = new PyramidNode(new Vector(1,1,1,0));
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

    let animationNodes = [
        new RotationNode(groupNode3, new Vector(0, 0, 1, 0))

    ];

    function simulate(deltaT: number) {
        for (let animationNode of animationNodes) {
            animationNode.simulate(deltaT);
        }
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
            case "ArrowUp":
                animationNodes[0].toggleActive();
                break;
        }
    });
});
import 'bootstrap';
import 'bootstrap/scss/bootstrap.scss';
import Vector from './vector';
import {
    GroupNode, LightNode,
    SphereNode
} from './nodes';
import RayVisitor from './rayvisitor';
import { Rotation, Scaling, Translation } from './transformation';

window.addEventListener('load', () => {
    const canvas = document.getElementById("raytracer") as HTMLCanvasElement;
    const ctx = canvas.getContext("2d");

    const sg = new GroupNode(new Translation(new Vector(0, 0, -5, 0)));
    const lightGroupNode = new GroupNode(new Translation(new Vector(5,3,6,0)));
    sg.add(lightGroupNode);
    const light = new LightNode(new Vector(1,1,1,1));
    lightGroupNode.add(light);
    const lightGroupNode1 = new GroupNode(new Translation(new Vector(-5,-3,6,0)));
    sg.add(lightGroupNode1);
    const light2 = new LightNode(new Vector(1,1,1,1));
    lightGroupNode1.add(light2);
    const gnRotation = new Rotation(new Vector(1, 0, 0, 0), 0)
    const gn = new GroupNode(gnRotation);
    sg.add(gn);
    const gn1 = new GroupNode(new Translation(new Vector(1.2, .5, 0, 0)));
    gn.add(gn1);
    gn1.add(new SphereNode(new Vector(.4, 0, 0, 1)));
    const gn2 = new GroupNode(new Translation(new Vector(-0.8, 1, 1, 0)));
    gn.add(gn2);
    const gn3 = new GroupNode(new Scaling(new Vector(0.4, 0.4, 0.4, 0)));
    gn2.add(gn3);
    gn3.add(new SphereNode(new Vector(0, 0, .3, 1)));
    const lightPositions = [
        new Vector(1, 1, 1, 1)
    ];
    const camera = {
        origin: new Vector(0, 0, 0, 1),
        width: canvas.width,
        height: canvas.height,
        alpha: Math.PI / 3
    }

    const visitor = new RayVisitor(ctx, canvas.width, canvas.height);

    let animationHandle: number;

    let lastTimestamp = 0;
    let animationTime = 0;
    let animationHasStarted = true;
    function animate(timestamp: number) {
        let deltaT = timestamp - lastTimestamp;
        if (animationHasStarted) {
            deltaT = 0;
            animationHasStarted = false;
        }
        animationTime += deltaT;
        lastTimestamp = timestamp;
        gnRotation.angle = animationTime / 2000;

        visitor.render(sg, camera, lightPositions, 0.3,0.7,0.8);
        // animationHandle = window.requestAnimationFrame(animate);
    }

    function startAnimation() {
        if (animationHandle) {
            window.cancelAnimationFrame(animationHandle);
        }
        animationHasStarted = true;
        function animation(t: number) {
            animate(t);
            animationHandle = window.requestAnimationFrame(animation);
        }
        animationHandle = window.requestAnimationFrame(animation);
    }
    animate(0);

    document.getElementById("startAnimationBtn").addEventListener(
        "click", startAnimation);
    document.getElementById("stopAnimationBtn").addEventListener(
        "click", () => cancelAnimationFrame(animationHandle));
});
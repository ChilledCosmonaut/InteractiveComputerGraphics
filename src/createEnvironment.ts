import {GroupNode, SphereNode} from "./nodes";
import {Scaling, Translation} from "./transformation";
import Vector from "./vector";

const blue = new Vector(0, 0, 1, 0);
const grey = new Vector(0.5, 0.5, 0.5, 0);
const red = new Vector(1, 0, 0, 0);

export function createEnvironment(sg: GroupNode) {

    //const gnWorldCenter = new GroupNode(new Scaling(new Vector(0.2, 0.2, 0.2, 1)));
    //sg.add(gnWorldCenter);
    //gnWorldCenter.add(new SphereNode(new Vector(0, 1, 0, 0)));

    createGrid(sg)
}

function createGrid(group: GroupNode) {
    const scaleNode = new GroupNode(new Scaling(new Vector(0.05, 0.05, 0.05, 0)))
    group.add(scaleNode);
    const n = 10;
    for (let x = -n; x <= n; x++) {
        for (let z = -n; z <= n; z++) {
            let color = grey;
            const g = new GroupNode(new Translation(new Vector(x * 20, 0, z * 20, 1)));
            if(x === 0) {
                color = blue;
            } if (z === 0) {
                color = red;
            }
            scaleNode.add(g);
            g.add(new SphereNode(color));
        }
    }
}
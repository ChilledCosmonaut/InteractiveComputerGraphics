import {AABoxNode, GroupNode, SphereNode} from "./nodes";
import {Scaling, Translation} from "./transformation";
import Vector from "./vector";

const blue = new Vector(0, 0, 1, 0);
const grey = new Vector(0.5, 0.5, 0.5, 0);
const red = new Vector(1, 0, 0, 0);

export function createEnvironment(sg: GroupNode) {

    const gnWorldCenter = new GroupNode(new Scaling(new Vector(0.1, 0.1, 0.1, 1)));
    sg.add(gnWorldCenter);
    gnWorldCenter.add(new SphereNode(new Vector(0, 1, 0, 0)));
    create3dGrid(sg)
}


function create3dGrid(group: GroupNode) {
    const n = 2;
    for (let y = -n; y <= n; y++) {
        createGrid(group, y*10);
    }

}

//todo: einfacher implementieren, anstatt erst die Verschiebung groß zu skalieren und dann alles (inkl. Kugeln) kleiner zu machen...
//todo: Mehrere Knoten aneineander hängen...
function createGrid(group: GroupNode, y_Position: number) {
    const scaleNode = new GroupNode(new Scaling(new Vector(0.05, 0.05, 0.05, 0)))
    group.add(scaleNode);
    const n = 5;
    for (let x = -n; x <= n; x++) {
        for (let z = -n; z <= n; z++) {
            let color = grey;
            const g = new GroupNode(new Translation(new Vector(x * 20, y_Position, z * 20, 1)));
            if(x === 0) {
                color = blue;
            } if (z === 0) {
                color = red;
            }
            scaleNode.add(g);
            //g.add(new SphereNode(color));
            g.add(new AABoxNode(color))
        }
    }
}
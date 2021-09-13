import Vector from "./vector";
import Matrix from "./matrix";
import {Rotation} from "./transformation";
import MatrixHelper from "./matrix-helper";
import {GroupNode} from "./nodes";

export interface Camera {
    eye: Vector,
    center: Vector,
    up: Vector,
    fovy: number,
    aspect: number,
    near: number,
    far: number
}

export class CameraFreeFlight {
    public pressed = false;

    constructor(public camera: Camera, public groupNode: GroupNode) {
    }

    cameraToLookAtMatrix(){
        return Matrix.lookat(this.camera.eye, this.camera.center, this.camera.up);
    }

    y = 0;

    simulate(deltaT: number) { // TODO: rename
        if (this.pressed) {
            const m = this.groupNode.transform.getMatrix()
            const eye = this.camera.eye = MatrixHelper.getPositionOfMatrix(m)
            const localDir = new Vector(0, 0, -1, 0);
            const globalDir = m.mulVec(localDir);
            this.camera.center = eye.add(globalDir)

            //console.log("Kameraposition: " + this.camera.eye)
            //Testen des Kamera Up Vectors: ist der Up-Vector in Welt oder lokalen Koords?:
            /*
            this.camera.eye = new Vector(0, this.y, 0, 1)
            this.y+=0.01
            if (this.y > 3){this.y = 0}
//todo: Rotation & up-Vector
 */
        }
    }
}
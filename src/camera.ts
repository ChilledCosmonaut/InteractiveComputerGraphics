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
    //private count: number;
    private count = 0;
    public pressed = false;

    constructor(public camera: Camera, public groupNode: GroupNode) {
        //let count = 0;
    }

    cameraToLookAtMatrix(){
        return Matrix.lookat(this.camera.eye, this.camera.center, this.camera.up);
    }

    y = 0;

    simulate(deltaT: number) {
        if (this.pressed) {
            const m = this.groupNode.transform.getMatrix()
            const eye = this.camera.eye = MatrixHelper.getPositionOfMatrix(m)
            const localCenter = new Vector(0, 0, -1, 0);
            const globalCenter = m.mulVec(localCenter);
            this.camera.center = eye.add(globalCenter)

            //Testen des Kamera Up Vectors: ist der Up-Vector in Welt oder lokalen Koords?: todo
            /*
            this.camera.eye = new Vector(0, this.y, 0, 1)
            this.y+=0.01
            if (this.y > 3){this.y = 0}

            const globalRechts = m.mulVec(new Vector(1, 0, 0, 0))
            const globalUpBezugAufKamera = globalRechts.cross(globalCenter);
            globalUpBezugAufKamera.normalize();

            this.camera.up = new Vector(0, 0.7, 0.7, 0);


 */
        }
        //this.camera.eye = new Vector(this.count, this.camera.eye.y,  this.camera.eye.z, this.camera.eye.w);
        //this.camera.center = new Vector(this.count, this.camera.center.y,  this.camera.center.z, this.camera.center.w);
    }
}
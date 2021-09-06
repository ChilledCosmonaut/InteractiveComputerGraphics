import {GroupNode} from "./nodes";
import Vector from "./vector";
import {Rotation, SQT} from "./transformation";
import {AnimationNode} from "./animation-nodes"
import Quaternion from "./quaternion";
import MatrixHelper from "./matrix-helper";

/**
 * Class representing a Rotation Animation
 * @extends AnimationNode
 */
export class RotationNode extends AnimationNode {

    leftRotation = false;
    rightRotation = false;

    /**
     * Creates a new RotationNode
     * @param groupNode The group node to attach to
     * @param axis The axis to rotate around
     */
    constructor(groupNode: GroupNode, private axis: Vector) {
        super(groupNode);
    }

    /**
     * Advances the animation by deltaT
     * @param deltaT The time difference, the animation is advanced by
     */
    //TODO für moi: kommentieren! :)
    //changes the matrix of the attached group node to reflect a rotation
    simulate(deltaT: number) {
        if(this.active && (this.leftRotation || this.rightRotation)) {

            let matrix = this.groupNode.transform.getMatrix();
            let inverseMatrix = this.groupNode.transform.getInverseMatrix(); //TODO: nochmal anschauen!

            let rotationPerSec: number = 0.52359877;
            const sign = (this.leftRotation ? 1 : 0) + (this.rightRotation ? -1 : 0)
            const dAngle = sign * rotationPerSec * (deltaT/1000);
            matrix = matrix.mul(new Rotation(this.axis, dAngle).getMatrix())

            MatrixHelper.copyRotationMatrix(matrix, this.groupNode.transform.getMatrix());
            //todo: InverseMatrix: nötig, weil die normale Matrix überschrieben wird und keine neue Transformation stattfindet(wobei automatisch die Inverse berechnet wird.)
            MatrixHelper.copyRotationMatrix(inverseMatrix, this.groupNode.transform.getInverseMatrix());
        }
    }
}


/**
 * Class representing a Rotation Animation
 * @extends AnimationNode
 */
export class SlerpNode extends AnimationNode {
    /**
     * The time
     */
    t: number;

    /**
     * The rotations to interpolate between
     */
    rotations: [Quaternion, Quaternion];

    /**
     * Creates a new RotationNode
     * @param groupNode The group node to attach to
     * @param axis The axis to rotate around
     */
    constructor(groupNode: GroupNode, rotation1: Quaternion, rotation2: Quaternion) {
        super(groupNode);
        this.rotations = [rotation1, rotation2];
        this.t = 0;
    }

    /**
     * Advances the animation by deltaT
     * @param deltaT The time difference, the animation is advanced by
     */
    simulate(deltaT: number) {
        if (this.active) {
            this.t += 0.001 * deltaT;
            const rot = this.rotations[0].slerp(this.rotations[1], (Math.sin(this.t) + 1) / 2);
            (this.groupNode.transform as SQT).rotation = rot;
        }
    }
}

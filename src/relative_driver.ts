import Vector from "./vector";
import {GroupNode} from "./nodes";
import MatrixHelper from "./matrix-helper";
import {Translation} from "./transformation";
import {AnimationNode} from "./animation-nodes";

/**
 * Class representing a Driver Animation
 * @extends AnimationNode
 */
export class CombinedDriverNode extends AnimationNode {

    static forwardLocal = new Vector(0, 0, 1, 0);
    static sidewardLocal = new Vector(1, 0, 0, 0);
    static upwardLocal = new Vector(0, 1, 0, 0);

    forward = false;
    backward = false;
    left = false;
    right = false;
    up = false;
    down = false;

    relativeRotation: GroupNode;

    /**
     * Creates a new DriverNode
     * @param groupNode The group node to attach to
     * @param axis The axis to move along
     */
    constructor(groupNode: GroupNode, relativeRotation: GroupNode) {
        super(groupNode);
        this.relativeRotation = relativeRotation;
    }

    /**
     * Advances the animation by deltaT
     * @param deltaT The time difference, the animation is advanced by
     */
    //todo refactoring
    simulate(deltaT: number) {
        if(this.active){
            const matrix = this.groupNode.transform.getMatrix();
            const inverseMatrix = this.groupNode.transform.getInverseMatrix();
            let transformMatrix = this.relativeRotation.transform.getMatrix();

            let unitsPerSec: number = 1; // Geschwindigkeit: v = unitsPerSec
            const s = unitsPerSec * (deltaT/1000);
            let position: Vector = MatrixHelper.getPositionOfMatrix(matrix);
            const forward = CombinedDriverNode.forwardLocal.mul(this.forward ? -1 : 0);
            const forwardGlobal = transformMatrix.mulVec(matrix.mulVec(forward));
            const back = CombinedDriverNode.forwardLocal.mul(this.backward ? 1 : 0);
            const backwardGlobal = transformMatrix.mulVec(matrix.mulVec(back));
            const left = CombinedDriverNode.sidewardLocal.mul(this.left ? -1 : 0);
            const leftGlobal = transformMatrix.mulVec(matrix.mulVec(left));
            const right = CombinedDriverNode.sidewardLocal.mul(this.right ? 1 : 0);
            const rightGlobal = transformMatrix.mulVec(matrix.mulVec(right));
            const up = CombinedDriverNode.upwardLocal.mul(this.up ? 1 : 0);
            const upGlobal = transformMatrix.mulVec(matrix.mulVec(up));
            const down = CombinedDriverNode.upwardLocal.mul(this.down ? -1 : 0);
            const downGlobal = transformMatrix.mulVec(matrix.mulVec(down));

            position = position.add(forwardGlobal.mul(s));
            position = position.add(backwardGlobal.mul(s));
            position = position.add(leftGlobal.mul(s));
            position = position.add(rightGlobal.mul(s));
            position = position.add(upGlobal.mul(s));
            position = position.add(downGlobal.mul(s));

            //new Translation erstellt automatisch die translierte Matrix und deren Inverse, die Rotation der gn-Matrix
            //geht hierbei aber verloren.
            this.groupNode.transform = new Translation(position);

            MatrixHelper.copyRotationMatrix(matrix, this.groupNode.transform.getMatrix())
            MatrixHelper.copyRotationMatrix(inverseMatrix, this.groupNode.transform.getInverseMatrix());
        }
    }
}
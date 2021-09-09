import {GroupNode} from "./nodes";
import MatrixHelper from "./matrix-helper";
import {Translation} from "./transformation";
import {AnimationNode} from "./animation-nodes";

/**
 * Class representing a Jump Animation
 * @extends AnimationNode
 */
export class JumperNode extends AnimationNode {
    isJumping = false;
    y0: number = null;
    counter = 0;

    /**
     * increase bestimmt wie schnell der Jumper springt
     * todo: Bennenung -> ähnlich wie Geschwindigkeit: v = unitsPerSec
     */
    increase = Math.PI / 100;
    height = 2

    /**
     * Creates a new JumperNode
     * @param groupNode The group node to attach to
     * @param axis The axis to rotate around
     */
    constructor(groupNode: GroupNode) {
        super(groupNode);
    }

    /**
     * Advances the animation by deltaT
     * @param deltaT The time difference, the animation is advanced by
     */
    simulate(deltaT: number) {
        const matrix = this.groupNode.transform.getMatrix();
        const inverseMatrix = this.groupNode.transform.getInverseMatrix();
        let position = MatrixHelper.getPositionOfMatrix(matrix);
        if(this.y0 === null) {
            this.y0 = position.y
        };
        if(this.isJumping){
            this.counter += this.increase
            if (this.counter > Math.PI) {
                this.isJumping = false;
                this.counter = 0; // Der Jumper wird wieder auf den Ausgangszustand zurück gesetzt.
            }
            position.y = this.y0 + Math.sin(this.counter) * this.height;
            this.groupNode.transform = new Translation(position);

            MatrixHelper.copyRotationMatrix(matrix, this.groupNode.transform.getMatrix());
            MatrixHelper.copyRotationMatrix(inverseMatrix, this.groupNode.transform.getInverseMatrix());

            /*for (let i = 0; i < 3; i++) { //tauscht die Vorzeichen der Translation aus
                //todo: muss die Rotation auch in die inverse TranslationsMatrix kopiert und inversiert werden?
                this.groupNode.transform.getInverseMatrix().setVal(i, 3, -1 * matrix.getVal(i, 3))
            }*/
        }
    }
}

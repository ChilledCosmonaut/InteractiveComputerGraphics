import Vector from './vector';
import { GroupNode } from './nodes';
import {Rotation, SQT, Translation} from './transformation';
import Quaternion from './quaternion';
import MatrixHelper from "./matrix-helper";
import Matrix from "./matrix";

/**
 * Class representing an Animation
 */
class AnimationNode {
  /**
   * Describes if the animation is running
   */
  active: boolean;

  /**
   * Creates a new AnimationNode
   * @param groupNode The GroupNode to attach to
   */
  constructor(public groupNode: GroupNode) {
    this.active = true;
  }

  /**
   * Toggles the active state of the animation node
   */
  toggleActive() {
    this.active = !this.active;
  }
}


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

        copyRotationMatrix(matrix, this.groupNode.transform.getMatrix());
      //todo: InverseMatrix: nötig, weil die normale Matrix überschrieben wird und keine neue Transformation stattfindet(wobei automatisch die Inverse berechnet wird.)
        copyRotationMatrix(inverseMatrix, this.groupNode.transform.getInverseMatrix());
    }
  }
}


function copyRotationMatrix(oldMatrix: Matrix, newMatrix: Matrix) {
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3 ; j++) {
      newMatrix.setVal(i, j, oldMatrix.getVal(i, j));
    }
  }
}


/**
 * Class representing a Driver Animation
 * @extends AnimationNode
 */
export class DriverNode extends AnimationNode {

  //TODO:Bennenung von forwardLocal irreführend?!
  static forwardLocal = new Vector(0, 0, 1, 0);
  static sidewardLocal = new Vector(1, 0, 0, 0);

  forward = false;
  backward = false;
  left = false;
  right = false;

  /**
   * Creates a new DriverNode
   * @param groupNode The group node to attach to
   * @param axis The axis to move along
   */
  constructor(groupNode: GroupNode) {
    super(groupNode);
  }

  /**
   * Advances the animation by deltaT
   * @param deltaT The time difference, the animation is advanced by
   */
  //todo refactoring
  simulate(deltaT: number) {
    if(this.active){
      const matrix = this.groupNode.transform.getMatrix();

      let unitsPerSec: number = 1; // Geschwindigkeit: v = unitsPerSec
      const s = unitsPerSec * (deltaT/1000);
      let position: Vector = new MatrixHelper().getPositionOfMatrix(matrix);
      const forward = DriverNode.forwardLocal.mul(this.forward ? -1 : 0);
      const forwardGlobal = matrix.mulVec(forward);
      const back = DriverNode.forwardLocal.mul(this.backward ? 1 : 0);
      const backwardGlobal = matrix.mulVec(back);
      const left = DriverNode.sidewardLocal.mul(this.left ? -1 : 0);
      const leftGlobal = matrix.mulVec(left);
      const right = DriverNode.sidewardLocal.mul(this.right ? 1 : 0);
      const rightGlobal = matrix.mulVec(right);

      position = position.add(forwardGlobal.mul(s));
      position = position.add(backwardGlobal.mul(s));
      position = position.add(leftGlobal.mul(s));
      position = position.add(rightGlobal.mul(s));

      this.groupNode.transform = new Translation(position);

      copyRotationMatrix(matrix, this.groupNode.transform.getMatrix());

      //todo: inverse Matrix???!!!
      /*
      let matrixProdukt_1 = new Translation(position).getMatrix();
      let matrixProdukt_2 = new Translation(position).getMatrix();
      this.groupNode.transform = matrixProdukt_1.mul(matrixProdukt_2)
       */
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
    let position = new MatrixHelper().getPositionOfMatrix(matrix);
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
    }
  }
}

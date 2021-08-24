import Vector from './vector';
import { GroupNode } from './nodes';
import {Rotation, SQT, Translation} from './transformation';
import Quaternion from './quaternion';
import MatrixHelper from "./matrix-helper";

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
  /**
   * The absolute angle of the rotation
   */
  angle: number;
  /**
   * The vector to rotate around
   */
  axis: Vector;

  /**
   * Creates a new RotationNode
   * @param groupNode The group node to attach to
   * @param axis The axis to rotate around
   */
  constructor(groupNode: GroupNode, axis: Vector) {
    super(groupNode);
    this.angle = 0;
    this.axis = axis;
  }

  /**
   * Advances the animation by deltaT
   * @param deltaT The time difference, the animation is advanced by
   */
  simulate(deltaT: number) {
    // change the matrix of the attached
    // group node to reflect a rotation
    // TODO*
    if(this.active){
      //30° = 0.52359877 in Bogenmaß
      let rotationPerSec: number = 0.52359877;
      this.angle += rotationPerSec * (deltaT/1000);
      this.angle %= 360;
      //console.log(this.angle);
      //TODO für Linda: kommentieren! :)
      this.groupNode.transform = new Rotation(this.axis, this.angle);
    }
  }
}

/**
 * Class representing a Driver Animation
 * @extends AnimationNode
 */
export class DriverNode extends AnimationNode {

  static forwardLocal = new Vector(0, 0, 1, 0);
  static sidewardLocal = new Vector(1, 0, 0, 0);

  forward = 0;
  sideward = 0;

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
  simulate(deltaT: number) {
    if(this.active){
      const matrix = this.groupNode.transform.getMatrix();

      let unitsPerSec: number = 0.3; // Geschwindigkeit: v = unitsPerSec
      const s = unitsPerSec * (deltaT/1000);
      let position: Vector = new MatrixHelper().getPositionOfMatrix(matrix);
      const forw = DriverNode.forwardLocal.mul(this.forward);
      const forwardGlobal = matrix.mulVec(forw);
      //forwardGlobal.mul(this.forward)

      const sidew = DriverNode.sidewardLocal.mul(this.sideward);
      const sidewardGlobal = matrix.mulVec(sidew);

      position = position.add(forwardGlobal.mul(s));
      position = position.add(sidewardGlobal.mul(s));
      this.groupNode.transform = new Translation(position); //todo: leserlicher machen?
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
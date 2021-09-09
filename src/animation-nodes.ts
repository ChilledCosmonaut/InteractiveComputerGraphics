import Vector from './vector';
import { GroupNode } from './nodes';
import {Rotation, SQT, Translation} from './transformation';
import Quaternion from './quaternion';
import MatrixHelper from "./matrix-helper";
import Matrix from "./matrix";

/**
 * Class representing an Animation
 */
export class AnimationNode { //ACHTUNG: Das export Statement war nicht so vorgegeben, wird aber zum Aufteilen der Klassen in einzelne Files benötigt.
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




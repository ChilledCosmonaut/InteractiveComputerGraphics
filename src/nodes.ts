import Visitor from './visitor';
import Vector from './vector';
import { Transformation } from './transformation';

/**
 * Class representing a Node in a Scenegraph
 */
export class Node {
  /**
   * Accepts a visitor according to the visitor pattern
   * @param visitor - The visitor
   */
  accept(visitor: Visitor) { }
}

/**
 * Class representing a GroupNode in the Scenegraph.
 * A GroupNode holds a transformation and is able
 * to have child nodes attached to it.
 * @extends Node
 */
export class GroupNode extends Node {
  // TODO declare instance variables
  child:Array<Node>

  /**
   * Constructor
   * @param mat A matrix describing the node's transformation
   */
  constructor(public transform: Transformation) {
    super();
    this.child = new Array<Node>();
  }

  /**
   * Accepts a visitor according to the visitor pattern
   * @param visitor The visitor
   */
  accept(visitor: Visitor) {
    visitor.visitGroupNode(this);
  }

  /**
   * Adds a child node
   * @param childNode The child node to add
   */
  add(childNode: Node) {
    this.child.push(childNode)
  }
}

/**
 * Class representing a Sphere in the Scenegraph
 * @extends Node
 */
export class SphereNode extends Node {

  /**
   * Creates a new Sphere.
   * The sphere is defined around the origin 
   * with radius 1.
   * @param color The colour of the Sphere
   */
  constructor(
    public color: Vector
  ) {
    super();
  }

  /**
   * Accepts a visitor according to the visitor pattern
   * @param visitor The visitor
   */
  accept(visitor: Visitor) {
    visitor.visitSphereNode(this);
  }
}

/**
 * Class representing an Axis Aligned Box in the Scenegraph
 * @extends Node
 */
export class AABoxNode extends Node {

  /**
   * Creates an axis aligned box.
   * The box's center is located at the origin
   * with all edges of length 1
   * @param color The colour of the cube
   */
  constructor(public color: Vector) {
    super();
  }

  /**
   * Accepts a visitor according to the visitor pattern
   * @param  {Visitor} visitor - The visitor
   */
  accept(visitor: Visitor) {
    visitor.visitAABoxNode(this);
  }
}

/**
 * Class representing a Textured Axis Aligned Box in the Scenegraph
 * @extends Node
 */
export class TextureBoxNode extends Node {
  /**
   * Creates an axis aligned box textured box
   * The box's center is located at the origin
   * with all edges of length 1
   * @param texture The image filename for the texture
   * @param normal The image filename for the normalMap
   */
  constructor(public texture: string, public normal: string, public scale: number) {
    super();
  }

  /**
   * Accepts a visitor according to the visitor pattern
   * @param visitor The visitor
   */
  accept(visitor: Visitor) {
    visitor.visitTextureBoxNode(this);
  }
}

/**
 * Class representing a Pyramid in the Scenegraph
 * @extends Node
 */
export class PyramidNode extends Node {

  /**
   * Creates a new Pyramide.
   * The Pyramide is defined around the origin
   * with size 1. //todo
   * @param color The colour of the pyramid
   */
  constructor(
      public color: Vector
  ) {
    super();
  }

  /**
   * Accepts a visitor according to the visitor pattern
   * @param visitor The visitor
   */
  accept(visitor: Visitor) {
    visitor.visitPyramidNode(this);
  }
}


/**
 * Class representing a Pyramid in the Scenegraph
 * @extends Node
 */
export class ObjNode extends Node {

  /**
   * Creates a new Object from an OBJ file.
   * The Object is defined around the origin.
   * @param objPath The colour of the pyramid
   */
  constructor(
      public objString: string, public scale: number
  ) {
    super();
  }

  /**
   * Accepts a visitor according to the visitor pattern
   * @param visitor The visitor
   */
  accept(visitor: Visitor) {
    visitor.visitObjNode(this);
  }

}

/**
 * Class representing a Pyramid in the Scenegraph
 * @extends Node
 */
export class LightNode extends Node {

  /**
   * Creates a new Object from an OBJ file.
   * The Object is defined around the origin.
   * @param objPath The colour of the pyramid
   */
  constructor(
      public Colour: Vector
  ) {
    super();
  }

  /**
   * Accepts a visitor according to the visitor pattern
   * @param visitor The visitor
   */
  accept(visitor: Visitor) {
    visitor.visitLightNode(this);
  }

}

/**
 * Class representing a Pyramid in the Scenegraph
 * @extends Node
 */
export class CameraNode extends Node {

  /**
   * Creates a new Object from an OBJ file.
   * The Object is defined around the origin.
   * @param objPath The colour of the pyramid
   */
  constructor(
      public eye: Vector,
      public center: Vector,
      public up: Vector,
      public fovy: number,
      public aspect: number,
      public near: number,
      public far: number
  ) {
    super();
  }

  /**
   * Accepts a visitor according to the visitor pattern
   * @param visitor The visitor
   */
  accept(visitor: Visitor) {
    visitor.visitCameraNode(this);
  }

}


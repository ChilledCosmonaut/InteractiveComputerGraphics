import Matrix from './matrix';
import Vector from './vector';
import Sphere from './sphere';
import Intersection from './intersection';
import Ray from './ray';
import Visitor from './visitor';
import phong from './phong';
import {
  Node, GroupNode, SphereNode,
  AABoxNode, TextureBoxNode, PyramidNode, ObjNode, LightNode
} from './nodes';
import AABox from './aabox';
import {Transformation} from "./transformation";

const UNIT_SPHERE = new Sphere(new Vector(0, 0, 0, 1), 1, new Vector(0, 0, 0, 1));
const UNIT_AABOX = new AABox(new Vector(-0.5, -0.5, -0.5, 1), new Vector(0.5, 0.5, 0.5, 1), new Vector(0, 0, 0, 1));

/**
 * Class representing a Visitor that uses
 * Raytracing to render a Scenegraph
 */
export default class RayVisitor implements Visitor {
  /**
   * The image data of the context to
   * set individual pixels
   */
  imageData: ImageData;


  // TODO declare instance variables here
  intersection: Intersection | null;
  intersectionColor: Vector;
  ray: Ray;
  transformation: Array<Matrix>;
  inverseTransformation: Array<Matrix>;
  lightPositions: Array<Vector>;
  lightSourceCounter: number;

  /**
   * Creates a new RayVisitor
   * @param context The 2D context to render to
   * @param width The width of the canvas
   * @param height The height of the canvas
   */
  constructor(
    private context: CanvasRenderingContext2D,
    width: number,
    height: number
  ) {
    this.imageData = context.getImageData(0, 0, width, height);
  }

  /**
   * Renders the Scenegraph
   * @param rootNode The root node of the Scenegraph
   * @param camera The camera used
   * @param lightPositions The light light positions
   */
  render(
    rootNode: Node,
    camera: { origin: Vector, width: number, height: number, alpha: number },
    lightPositions: Array<Vector>
  ) {
    // clear
    let data = this.imageData.data;
    data.fill(0);
    this.lightPositions = new Array<Vector>(8);

    // raytrace
    const width = this.imageData.width;
    const height = this.imageData.height;
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        this.lightSourceCounter = 0;
        this.ray = Ray.makeRay(x, y, camera);
        this.inverseTransformation = new Array<Matrix>();
        this.inverseTransformation.push(Matrix.identity());
        this.transformation = new Array<Matrix>();
        this.transformation.push(Matrix.identity());

        this.intersection = null;
        rootNode.accept(this);
        //console.log(this.lightPositions.size)
        if (this.intersection) {
          if (!this.intersectionColor) {
            data[4 * (width * y + x) + 0] = 0;
            data[4 * (width * y + x) + 1] = 0;
            data[4 * (width * y + x) + 2] = 0;
            data[4 * (width * y + x) + 3] = 255;
          } else {
            let color;
            color = phong(this.intersectionColor, this.intersection, this.lightPositions, 10, camera.origin);

            /*
            //Test, der den Abstand zw. Schnittpunkt und Kamera als Farbe anzeigt.
            const colorFromDistance = (t: number) => {
              if(isNaN(t)) {return new Vector(255,0,255,255)}
              if(typeof t !== 'number') {return new Vector(0,255,255,255)}
              t*=0.02
              if(t<0) {return new Vector(255,0,0,255)}
              if(t>255) {return new Vector(255, 255, 0, 255)}
              return new Vector(t, t, t, 255)
            }
            color = colorFromDistance(this.intersection.t);*/

            data[4 * (width * y + x) + 0] = color.r * 255;
            data[4 * (width * y + x) + 1] = color.g * 255;
            data[4 * (width * y + x) + 2] = color.b * 255;
            data[4 * (width * y + x) + 3] = 255;
          }
        }
      }
    }
    this.context.putImageData(this.imageData, 0, 0);
  }

  /**
   * Visits a group node
   * @param node The node to visit
   */
  visitGroupNode(node: GroupNode) {
    // TODO traverse the graph and build the model matrix
    let lastIndex: number = this.transformation.length - 1;
    this.transformation.push(this.transformation[lastIndex].mul(node.transform.getMatrix()));
    this.inverseTransformation.push(node.transform.getInverseMatrix().mul(this.inverseTransformation[lastIndex]));
    for (let childCounter: number = 0; childCounter < node.child.length; childCounter++){
      node.child[childCounter].accept(this);
    }
    this.transformation.pop();
    this.inverseTransformation.pop();
  }

  /**
   * Visits a sphere node
   * @param node - The node to visit
   */
  visitSphereNode(node: SphereNode) {
    let toWorld = this.transformation[this.transformation.length - 1];
    let fromWorld = this.inverseTransformation[this.inverseTransformation.length - 1];
    // TODO assign the model matrix and its inverse

    const ray = new Ray(fromWorld.mulVec(this.ray.origin), fromWorld.mulVec(this.ray.direction).normalize());
    let intersection = UNIT_SPHERE.intersect(ray);

    if (intersection) {
      const intersectionPointWorld = toWorld.mulVec(intersection.point);
      const intersectionNormalWorld = toWorld.mulVec(intersection.normal).normalize();
      intersection = new Intersection(
        (intersectionPointWorld.z - ray.origin.z) / ray.direction.z,
        intersectionPointWorld,
        intersectionNormalWorld
      );
      if (this.intersection === null || intersection.closerThan(this.intersection)) {
        this.intersection = intersection;
        this.intersectionColor = node.color;
      }
    }
  }

  /**
   * Visits an axis aligned box node
   * @param node The node to visit
   */
  visitAABoxNode(node: AABoxNode) {}/*
    let toWorld = this.transformation[this.transformation.length - 1];
    let fromWorld = this.inverseTransformation[this.inverseTransformation.length - 1];
    // TODO assign the model matrix and its inverse

    const ray = new Ray(fromWorld.mulVec(this.ray.origin), fromWorld.mulVec(this.ray.direction).normalize());
    let intersection = UNIT_AABOX.intersect(ray);

    if (intersection) {
      const intersectionPointWorld = toWorld.mulVec(intersection.point);
      const intersectionNormalWorld = toWorld.mulVec(intersection.normal).normalize();
      intersection = new Intersection(
        (intersectionPointWorld.z - ray.origin.z) / ray.direction.z,
        intersectionPointWorld,
        intersectionNormalWorld
      );
      if (this.intersection === null || intersection.closerThan(this.intersection)) {
        this.intersection = intersection;
        this.intersectionColor = node.color;
      }
    }
  }
  */

  /**
   * Visits a textured box node
   * @param node The node to visit
   */
  visitTextureBoxNode(node: TextureBoxNode) { }


  /**
   * Visits a textured box node
   * @param node The node to visit
   */
  visitPyramidNode(node: PyramidNode) { }


  /**
   * Visits a textured box node
   * @param node The node to visit
   */
  visitObjNode(node: ObjNode) { }

  visitLightNode(node: LightNode): void {
    let position = new Vector(0,0,0,1);
    let toWorld = this.transformation[this.transformation.length - 1];
    position = toWorld.mulVec(position);
    this.lightPositions[this.lightSourceCounter] = (position);
    this.lightSourceCounter++;
  }
}
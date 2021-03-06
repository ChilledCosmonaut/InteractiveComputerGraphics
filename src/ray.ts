import Vector from './vector';
import Matrix from "./matrix";

/**
 * Class representing a ray
 */
export default class Ray {
  /**
   * Creates a new ray with origin and direction
   * @param origin The origin of the Ray
   * @param direction The direction of the Ray
   */

  constructor(public origin: Vector, public direction: Vector) {}

  /**
   * Creates a ray from the camera through the image plane.
   * @param x The pixel's x-position in the canvas
   * @param y The pixel's y-position in the canvas
   * @param camera The Camera
   * @return The resulting Ray
   */
  static makeRay(x: number, y: number,
    //camera: { eye: Vector, center: Vector, up: Vector, width: number, height: number, alpha: number }
    camera: { origin: Vector, width: number, height: number, alpha: number }, cameraTransform: Matrix ): Ray {
    //let origin = cameraTransform.mulVec(camera.origin);//Todo Watch out for errors
    let direction: Vector = new Vector( //todo nochmal nachvollziehen!!!!!!!!!!!!!!!!!!!!
        x - (camera.width-1)/2,
        (camera.height-1)/2 - y,
        -((camera.width/2)/Math.tan(camera.alpha/2)),
        0)
    return new Ray(camera.origin, direction.normalize())
  }
}
import Vector from './vector';
import Intersection from './intersection';
import Ray from './ray';

/**
 * A class representing a sphere
 */
export default class Sphere {
  /**
   * Creates a new Sphere with center and radius
   * @param center The center of the Sphere
   * @param radius The radius of the Sphere
   * @param color The colour of the Sphere
   */
  constructor(
    public center: Vector,
    public radius: number,
    public color: Vector
  ) { }

  /**
   * Calculates the intersection of the sphere with the given ray
   * @param ray The ray to intersect with
   * @return The intersection if there is one, null if there is none
   */
  intersect(ray: Ray): Intersection | null {
    let x0new: Vector = ray.origin.sub(this.center);
    let c: number = (Math.pow((x0new.dot(ray.direction)), 2) - x0new.dot(x0new) + Math.pow(this.radius, 2))

    if (c < 0){
      return null;
    } else{
     return new Intersection(0,null,null)
    }

    let prefix: number = ray.direction.dot(new Vector(-x0new.x, -x0new.y, -x0new.z, 0))
    let t1: number = prefix + Math.sqrt(c);
    let t2: number = prefix - Math.sqrt(c);

    let th: number = t1 < t2 ? t1: t2;

    let intersectionPoint: Vector = ray.origin.add(ray.direction.mul(th))

    let normal: Vector = intersectionPoint.sub(this.center)
    normal = normal.normalize()

    return new Intersection(th, intersectionPoint, normal)
  }
}
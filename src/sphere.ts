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
    //x0new = x0new.normalize();
    //todo: umbenennen
    let c = (Math.pow((x0new.dot(ray.direction)), 2) - x0new.dot(x0new) + Math.pow(this.radius, 2))

    if (c < 0){
      return null;
    }

    let prefix = - ray.direction.dot(x0new)
    let t1 = prefix + Math.sqrt(c);//Todo: Fehler irwo hier
    //Fehler war, dass t einen Wert kleiner als 0 bekommt: hier also in "th" < 0 reingeschrieben wird...
    let t2 = prefix - Math.sqrt(c);

    let th = t1 < t2 ? t1: t2;

    let intersectionPoint = ray.origin.add(ray.direction.mul(th))

    let normal = intersectionPoint.sub(this.center)
    normal = normal.normalize()

    return new Intersection(th, intersectionPoint, normal)
  }

  /*intersect(ray: Ray): Intersection | null {
    let x0new = ray.origin.sub(this.center);

    const p = x0new.dot(ray.direction)
    const q = x0new.dot(x0new) - (this.radius * this.radius);

    let discriminatne = (p * p) - q;
    if(discriminatne < 0) {
      return null;
    }

    const dRoot = Math.sqrt(discriminatne);
    const dist1 = -p - dRoot;
    const dist2 = -p + dRoot;


    const th = Math.min(dist1, dist2)

    let intersectionPoint = ray.origin.add(ray.direction.mul(th))

    let normal = intersectionPoint.sub(this.center)
    normal = normal.normalize()

    return new Intersection(th, intersectionPoint, normal)
  }*/
}
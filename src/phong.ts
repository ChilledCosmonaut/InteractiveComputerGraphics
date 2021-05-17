import Vector from './vector';
import Intersection from './intersection';

/**
 * Calculate the colour of an object at the intersection point according to the Phong Lighting model.
 * @param color The colour of the intersected object
 * @param intersection The intersection information
 * @param lightPositions The light positions
 * @param shininess The shininess parameter of the Phong model
 * @param cameraPosition The position of the camera
 * @return The resulting colour
 */
export default function phong(
  color: Vector, intersection: Intersection,
  lightPositions: Array<Vector>, shininess: number,
  cameraPosition: Vector
): Vector {
  const lightColor = new Vector(0.8, 0.8, 0.8, 0);
  const kA = 0.8;
  const kD = 0.5;
  const kS = 0.5;
  
  color = ambientLight(kA, color).add(diffuseLight(kD, lightPositions, intersection, color).add(
    specularLight(kS, shininess, lightPositions, intersection, color, cameraPosition)
  ))

  return color;
}

function ambientLight(kA: number, lA: Vector): Vector{
  return lA.mul(kA)
}

function diffuseLight(kD: number, lightPositions: Array<Vector>, intersection: Intersection, lJ: Vector): Vector{
  let diffuse: Vector = new Vector(0,0,0,0);

  lightPositions.forEach(element => {
    let lightDirection: Vector = element.sub(intersection.point).normalize()
    diffuse.add(lJ.mul(Math.max(0, intersection.normal.dot(lightDirection))))
  });
  return diffuse.mul(kD)
}

function specularLight(kS: number, kE: number, lightPositions: Array<Vector>, intersection: Intersection, lJ: Vector, cameraPosition: Vector): Vector{
  let diffuse: Vector = new Vector(0,0,0,0);

  lightPositions.forEach(element => {
    let lightDirection: Vector = element.sub(intersection.point).normalize()
    let viewDirection: Vector = cameraPosition.sub(intersection.point).normalize()
    let rJ: Vector = intersection.normal.mul(2 * intersection.normal.dot(lightDirection)).sub(lightDirection)
    diffuse.add(lJ.mul(Math.pow(Math.max(0, rJ.dot(viewDirection)), kE)))
  });
  return diffuse.mul(kS)
}
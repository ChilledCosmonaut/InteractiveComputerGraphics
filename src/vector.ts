/**
 * Class representing a vector in 4D space
 */
export default class Vector {
  /**
   * The variable to hold the vector data
   */
  data: [number, number, number, number];

  /**
   * Create a vector
   * @param x The x component
   * @param y The y component
   * @param z The z component
   * @param w The w component
   */
  constructor(x: number, y: number, z: number, w: number) {
    // TODO
  }

  /**
   * Returns the x component of the vector
   * @return The x component of the vector
   */
  get x(): number {
    // TODO
  }

  /**
   * Sets the x component of the vector to val
   * @param val - The new value
   */
  set x(val: number) {
    // TODO
  }

  /**
   * Returns the first component of the vector
   * @return The first component of the vector
   */
  get r(): number {
    // TODO
  }

  /**
   * Sets the first component of the vector to val
   * @param val The new value
   */
  set r(val: number) {
    // TODO
  }

  /**
   * Returns the y component of the vector
   * @return The y component of the vector
   */
  get y(): number {
    // TODO
  }

  /**
   * Sets the y component of the vector to val
   * @param val The new value
   */
  set y(val: number) {
    // TODO
  }

  /**
   * Returns the second component of the vector
   * @return The second component of the vector
   */
  get g(): number {
    // TODO
  }

  /**
   * Sets the second component of the vector to val
   * @param val The new value
   */
  set g(val: number) {
    // TODO
  }

  /**
   * Returns the z component of the vector
   * @return The z component of the vector
   */
  get z(): number {
    // TODO
  }

  /**
   * Sets the z component of the vector to val
   * @param val The new value
   */
  set z(val: number) {
    // TODO
  }

  /**
   * Returns the third component of the vector
   * @return The third component of the vector
   */
  get b(): number {
    // TODO
  }

  /**
   * Sets the third component of the vector to val
   * @param val The new value
   */
  set b(val: number) {
    // TODO
  }

  /**
   * Returns the w component of the vector
   * @return The w component of the vector
   */
  get w(): number {
    // TODO
  }

  /**
   * Sets the w component of the vector to val
   * @param val The new value
   */
  set w(val: number) {
    // TODO
  }

  /**
   * Returns the fourth component of the vector
   * @return The fourth component of the vector
   */
  get a(): number {
    // TODO
  }

  /**
   * Sets the fourth component of the vector to val
   * @param val The new value
   */
  set a(val: number) {
    // TODO
  }

  /**
   * Creates a new vector with the vector added
   * @param other The vector to add
   * @return The new vector;
   */
  add(other: Vector): Vector {
    // TODO
  }

  /**
   * Creates a new vector with the vector subtracted
   * @param other The vector to subtract
   * @return The new vector
   */
  sub(other: Vector): Vector {
    // TODO
  }

  /**
   * Creates a new vector with the scalar multiplied
   * @param other The scalar to multiply
   * @return The new vector
   */
  mul(other: number): Vector {
    // TODO
  }

  /**
   * Creates a new vector with the scalar divided
   * @param other The scalar to divide
   * @return The new vector
   */
  div(other: number): Vector {
    // TODO
  }

  /**
   * Dot product
   * @param other The vector to calculate the dot product with
   * @return The result of the dot product
   */
  dot(other: Vector): number {
    // TODO
  }

  /**
   * Cross product
   * Calculates the cross product using the first three components
   * @param other The vector to calculate the cross product with
   * @return The result of the cross product as new Vector
   */
  cross(other: Vector): Vector {
    // TODO
  }

  /**
   * Returns an array representation of the vector
   * @return An array representation.
   */
  valueOf(): [number, number, number, number] {
    // TODO
  }

  /**
   * Normalizes this vector in place
   * @returns this vector for easier function chaining
   */
  normalize(): Vector {
    // TODO
  }

  /**
   * Compares the vector to another
   * @param other The vector to compare to.
   * @return True if the vectors carry equal numbers. The fourth element may be both equivalent to undefined to still return true.
   */
  equals(other: Vector): boolean {
    // TODO
  }

  /**
   * Calculates the length of the vector
   * @return The length of the vector
   */
  get length(): number {
    // TODO
  }
}
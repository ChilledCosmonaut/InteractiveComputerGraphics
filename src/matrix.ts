import Vector from './vector';

/**
 * Class representing a 4x4 Matrix
 */
export default class Matrix {

  /**
   * Data representing the matrix values
   */
  data: Float32Array;

  /**
   * Constructor of the matrix. Expects an array in row-major layout. Saves the data as column major internally.
   * @param mat Matrix values row major
   */
  constructor(mat: Array<number>) {
    this.data = new Float32Array(16);
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        this.data[row * 4+ col] = mat[col * 4 + row];
      }
    }
  }

  copyArray(array:Array<number>) {
    for(let i = 0; this.data.length > i; i++) {
      this.data[i] = array[i];
    }
  }

  /**
   * Returns the value of the matrix at position row, col
   * @param row The value's row
   * @param col The value's column
   * @return The requested value
   */
  getVal(row: number, col: number): number {
    return this.data[col * 4 + row];
  }

  /**
   * Sets the value of the matrix at position row, col
   * @param row The value's row
   * @param val The value to set to
   * @param col The value's column
   */
  setVal(row: number, col: number, val: number) {
    this.data[col * 4 + row] = val;
  }

  /**
   * Returns a matrix that represents a translation
   * @param translation The translation vector that shall be expressed by the matrix
   * @return The resulting translation matrix
   */
  static translation(translation: Vector): Matrix {
    let translator: Matrix = this.identity();
    translator.setVal(0, 3, translation.x);
    translator.setVal(1, 3, translation.y);
    translator.setVal(2, 3, translation.z);
    return translator;
  }

  /**
   * Returns a matrix that represents a rotation. The rotation axis is either the x, y or z axis (either x, y, z is 1).
   * @param axis The axis to rotate around
   * @param angle The angle to rotate
   * @return The resulting rotation matrix
   */
  static rotation(axis: Vector, angle: number): Matrix {
    let rotator: Matrix = this.identity();

    if(axis.x != 0){
      rotator.setVal(1, 1, Math.cos(angle));
      rotator.setVal(1, 2, -Math.sin(angle));
      rotator.setVal(2, 1, Math.sin(angle));
      rotator.setVal(2, 2, Math.cos(angle));
    }else if(axis.y != 0){
      rotator.setVal(0, 0, Math.cos(angle));
      rotator.setVal(0, 2, Math.sin(angle));
      rotator.setVal(2, 0, -Math.sin(angle));
      rotator.setVal(2, 2, Math.cos(angle));
    }else if(axis.z != 0){
      rotator.setVal(0, 0, Math.cos(angle));
      rotator.setVal(0, 1, -Math.sin(angle));
      rotator.setVal(1, 0, Math.sin(angle));
      rotator.setVal(1, 1, Math.cos(angle));
    }
    return rotator;
  }

  /**
   * Returns a matrix that represents a scaling
   * @param scale The amount to scale in each direction
   * @return The resulting scaling matrix
   */
  static scaling(scale: Vector): Matrix {
    let scalor: Matrix = this.identity();
    scalor.setVal(0, 0, scale.x);
    scalor.setVal(1, 1, scale.y);
    scalor.setVal(2, 2, scale.z);
    return new Matrix([
        scale.x, 0, 0, 0,
        0, scale.y, 0, 0,
        0, 0, scale.z, 0,
        0, 0, 0, 1
    ]);
  }

  /**
   * Constructs a lookat matrix
   * @param eye The position of the viewer
   * @param center The position to look at
   * @param up The up direction
   * @return The resulting lookat matrix
   */
  static lookat(eye: Vector, center: Vector, up: Vector): Matrix {
    let f = center.sub(eye).normalize();
    let s = f.cross(up).normalize()
    let u = s.cross(f).normalize()

    let lookatFactor1 = new Matrix([s.x, s.y, s.z, 0,
                                    u.x, u.y, u.z, 0,
                                    -f.x, -f.y, -f.z,0,
                                    0, 0, 0, 1])
    let lookatFactor2 = new Matrix([1, 0, 0, -eye.x,
                                    0, 1, 0, -eye.y,
                                    0, 0, 1, -eye.z,
                                    0, 0, 0, 1])
    let lookatMatrix = lookatFactor2.mul(lookatFactor1)
    return lookatMatrix
  }

  /**
   * Constructs a new matrix that represents a projection normalisation transformation
   * @param left Camera-space left value of lower near point
   * @param right Camera-space right value of upper right far point
   * @param bottom Camera-space bottom value of lower lower near point
   * @param top Camera-space top value of upper right far point
   * @param near Camera-space near value of lower lower near point
   * @param far Camera-space far value of upper right far point
   * @return The rotation matrix
   */
  static frustum(left: number, right: number, bottom: number, top: number, near: number, far: number): Matrix {
    let a = (right + left) / (right - left)
    let b = (top + bottom) / (top - bottom)
    let c = - ((far + near) / (far - near))
    let d = - ((2 * far * near) / (far - near))
    const i = 2 * near / (right - left)
    const j = 2 * near / (top - bottom)
    return new Matrix([i, 0, a, 0,
                           0, j, b, 0,
                           0, 0, c, d,
                           0, 0, -1, 0]);
  }

  /**
   * Constructs a new matrix that represents a projection normalisation transformation.
   * @param fovy Field of view in y-direction
   * @param aspect Aspect ratio between width and height
   * @param near Camera-space distance to near plane
   * @param far Camera-space distance to far plane
   * @return The resulting matrix
   */
  static perspective(fovy: number, aspect: number, near: number, far: number): Matrix {
    let top : number = near * Math.tan((Math.PI / 180) * (fovy / 2));
    let bottom = -top;
    let right : number = top * aspect;
    let left : number = -right;
    return Matrix.frustum(left, right, bottom, top, near, far);
    //return Matrix.identity();
  }

  /**
   * Returns the identity matrix
   * @return A new identity matrix
   */
  static identity(): Matrix {
    return new Matrix([
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    ]);
  }

  /**
   * Matrix multiplication
   * @param other The matrix to multiplicate with
   * @return The result of the multiplication this*other
   */
  mul(other: Matrix): Matrix {
    /*let matrixValues: Array<number> = new Array<number>(16);

    for (let i: number = 0; i < matrixValues.length; i++){
      let currentValue: number = 0;
      let currentRow: number = Math.floor(i/4);
      let currentColumn: number = i%4;

      for (let j: number = 0; j < 4; j++){
        currentValue += this.getVal(currentRow, j) * other.getVal(j, currentColumn);
      }
      matrixValues[i] = currentValue;
    }
    return new Matrix(matrixValues);*/
    let array :Array<number> = [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0]
    let a = 0
    let w = 0
    for(let i = 0; i < 16; i++) {
      if(i%4 === 0 && i > 0){
        a++
        w = 0
      }
      array[i] = this.getVal(a, 0) * other.getVal(0, w) + this.getVal(a, 1) * other.getVal(1,w) + this.getVal(a, 2) * other.getVal(2, w) + this.getVal(a, 3) * other.getVal(3, w)
      w++
    }
    return new Matrix(array)
  }

  /**
   * Matrix-vector multiplication
   * @param other The vector to multiplicate with
   * @return The result of the multiplication this*other
   */
  mulVec(other: Vector): Vector {
    let vectorValues: Array<number> = new Array<number>(4)
    for (let currentRow: number = 0; currentRow < 4; currentRow++) {
      let currentValue: number = 0;
      for (let j: number = 0; j < 4; j++){
        currentValue += this.getVal(currentRow, j) * other.data[j]
      }
      vectorValues[currentRow] = currentValue;
    }
    return new Vector(vectorValues[0], vectorValues[1], vectorValues[2], vectorValues[3]);
  }

  /**
   * Returns the transpose of this matrix
   * @return A new matrix that is the transposed of this
   */
  transpose(): Matrix {
    let matrixData: Array<number> = new Array<number>(16);
    for (let i: number = 0; i < matrixData.length; i++){
      matrixData[i] = this.getVal(i%4,Math.floor(i/4))
    }
    return new Matrix(matrixData);
  }

  /**
   * Debug print to console
   */
  print() {
    for (let row = 0; row < 4; row++) {
      console.log("> " + this.getVal(row, 0) +
        "\t" + this.getVal(row, 1) +
        "\t" + this.getVal(row, 2) +
        "\t" + this.getVal(row, 3)
      );
    }
  }
}
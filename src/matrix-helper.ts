import Vector from "./vector";
import Matrix from "./matrix";

/**
 * Class containing helper Methods, in relation to Matrix Class.
 */
export default class MatrixHelper {

    constructor() {
    }

    //our usage: get the position of the Matrix, describing the GroupNode
    static getPositionOfMatrix(matrix: Matrix): Vector {
        let position = new Vector(
            matrix.getVal(0, 3),
            matrix.getVal(1, 3),
            matrix.getVal(2, 3), 1)
        return position;
    }

    //TODO: nochmal Nachvollziehen!!!!!!!!!!!!!!!!!!!!!!!!
    getDirectionOfMatrix(matrix: Matrix): Vector {
        let blickRichtung: Vector = new Vector(0, 0, -1, 0); //Blickrichtung in lokalen Koordinaten
        return matrix.mulVec(blickRichtung)//Blickrichtung in Weltkoordinaten

    }

    static copyRotationMatrix(oldMatrix: Matrix, newMatrix: Matrix) {
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                newMatrix.setVal(i, j, oldMatrix.getVal(i, j));
            }
        }
    }

    static copyMatrix(oldMatrix: Matrix, newMatrix: Matrix) {
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                newMatrix.setVal(i, j, oldMatrix.getVal(i, j));
            }
        }
    }
}
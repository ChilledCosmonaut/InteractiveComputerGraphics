import Matrix from "./matrix";
import Vector from "./vector";

export default class Quaternion {

    data: Vector;

    constructor(x: number, y: number, z: number, w: number) {
        this.data = new Vector(x, y, z, w);
    }

    static fromAxisAngle(axis: Vector, angle: number) {
        let q = new Quaternion(1, 0, 0, 0);
        // TODO*
        q.data.x = axis.x * Math.sin(angle)
        q.data.y = axis.y * Math.sin(angle)
        q.data.z = axis.z * Math.sin(angle)
        q.data.w = Math.cos(angle)
        return q;
    }

    get conjugate(): Quaternion {
        let q = new Quaternion(1, 0, 0, 0);
        // TODO*
        q.data.x = -this.data.x;
        q.data.y = -this.data.y;
        q.data.z = -this.data.z;
        q.data.w = this.data.w;
        return q;
    }

    get inverse(): Quaternion {
        let q = this.conjugate;
        // TODO*
        let qx = this.data.x;
        let qy = this.data.y;
        let qz = this.data.z;
        let qw = this.data.w;
        //nochmal anschauen...
        let norm: number = 4;
        //let norm = Math.pow(qx*qx + qy*qy + qz*qz + qw*qw,0.5);
        //q.data = q.data.mul(1/Math.pow(q.data.length,2));
        //return q;
        q.data = q.data.mul(1/(norm*norm))
        return q;
    }

    //Wikipedia: slerp(q0, q1, t) = q0(q0⁻¹ * q1)^t
    slerp(other: Quaternion, t: number): Quaternion {
        let slerpq = other;
        // TODO
        let Phi: number = Math.acos(this.data.dot(other.data));
        let slerpResult: Vector;
        slerpResult = this.data
            .mul(Math.sin(Phi*(1-t))/Math.sin(Phi))
            .add(other.data.mul(Math.sin(Phi*t)/Math.sin(Phi)));
        slerpq.data = slerpResult;
        //slerpq = (slerpq.quaternionMul(this.inverse)).scalarExponentMul(t).quaternionMul(this);
        //console.log(slerpq.data)

        return slerpq;
    }

    toMatrix(): Matrix {
        let mat = Matrix.identity();

        let sqw: number = Math.pow(this.data.w,2);
        let sqx: number = Math.pow(this.data.x,2);
        let sqy: number = Math.pow(this.data.y,2);
        let sqz: number = Math.pow(this.data.z,2);

        let qx: number = this.data.x;
        let qy: number = this.data.y;
        let qz: number = this.data.z;
        let qw: number = this.data.w;

        let inverse: number = 1 / (sqx + sqy + sqz + sqw);

        mat.setVal(0,0,1-2*( sqx - sqy - sqz + sqw) * inverse);
        mat.setVal(1,1,1-2*(-sqx + sqy - sqz + sqw) * inverse);
        mat.setVal(2,2,1-2*(-sqx - sqy + sqz + sqw) * inverse);
        // TODO*
        /*let tmp1 = this.data.x*this.data.y;
        let tmp2 = this.data.z*this.data.w;
        mat.setVal(1,0,2.0 * (tmp1 + tmp2) * inverse);
        mat.setVal(0,1,2.0 * (tmp1 - tmp2) * inverse);
        tmp1 = this.data.x*this.data.z;
        tmp2 = this.data.y*this.data.w;
        mat.setVal(2,0,2.0 * (tmp1 - tmp2) * inverse);
        mat.setVal(0,2,2.0 * (tmp1 + tmp2) * inverse);
        tmp1 = this.data.y*this.data.z;
        tmp2 = this.data.x*this.data.w;
        mat.setVal(2,1,2.0 * (tmp1 + tmp2) * inverse);
        mat.setVal(1,2,2.0 * (tmp1 - tmp2) * inverse);*/
        mat = new Matrix([
            1-2*(qy*qy + qz*qz),2*(qx*qy - qw*qz),2*(qx*qz + qw*qy),0,
            2*(qx*qy + qw*qz),1-2*(qx*qx + qz*qz),2*(qy*qz - qw*qx),0,
            2*(qx*qz - qw*qy),2*(qy*qz + qw*qx),1-2*(qx*qx + qy*qy),0,
            0, 0, 0, 1
        ]);
        return mat;
    }

    //Scalar Multiplication is commutative i.e.: s*q = q*s
    /*scalarMul(n: number): Quaternion{
        let qx = this.data.x
        let qy = this.data.y
        let qz = this.data.z
        let qw = this.data.w
        let quat = new Quaternion(n*qx, n*qy, n*qz, n*qw);
        return quat;
    }

    scalarExponentMul(n: number): Quaternion{
        let qx = this.data.x^n
        let qy = this.data.y^n
        let qz = this.data.z^n
        let qw = this.data.w^n
        let quat = new Quaternion(qx, qy, qz, qw);
        return quat;
    }

    quaternionMul(other: Quaternion): Quaternion {
        let q: Quaternion = new Quaternion(1, 0, 0, 0);

        let ownValues: Vector = this.data;
        let otherValues: Vector = other.data

        q.data.x = ownValues.y*otherValues.z - ownValues.z-otherValues.y + otherValues.w*ownValues.x +  ownValues.w*otherValues.x;
        q.data.y = ownValues.z*otherValues.x - ownValues.x-otherValues.z + otherValues.w*ownValues.y +  ownValues.w*otherValues.y;
        q.data.z = ownValues.x*otherValues.y - ownValues.y-otherValues.x + otherValues.w*ownValues.z +  ownValues.w*otherValues.z;
        q.data.w = ownValues.w*otherValues.w - ownValues.x-otherValues.x - otherValues.y*ownValues.y -  ownValues.z*otherValues.z;

        return q;
    }*/
}
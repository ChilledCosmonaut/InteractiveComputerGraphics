import {GroupNode, SphereNode, AABoxNode, TextureBoxNode, PyramidNode, ObjNode,LightNode} from './nodes';

export default interface Visitor {
    visitGroupNode(node: GroupNode): void;
    visitSphereNode(node: SphereNode): void;
    visitAABoxNode(node: AABoxNode): void;
    visitTextureBoxNode(node: TextureBoxNode): void;
    visitPyramidNode(node: PyramidNode): void;
    visitObjNode(node: ObjNode): void;
    visitLightNode(node: LightNode): void;
}
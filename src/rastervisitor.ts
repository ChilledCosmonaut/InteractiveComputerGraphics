import RasterSphere from './raster-sphere';
import RasterBox from './raster-box';
import RasterTextureBox from './raster-texture-box';
import RasterPyramid from "./raster-pyramid";
import RasterObjObject from "./raster-obj-object";
import Vector from './vector';
import Matrix from './matrix';
import Visitor from './visitor';
import {
  Node, GroupNode,
  SphereNode, AABoxNode,
  TextureBoxNode, PyramidNode, ObjNode
} from './nodes';
import Shader from './shader';
import {Camera} from "./camera";

/*
* interface Camera {
  eye: Vector,
  center: Vector,
  up: Vector,
  fovy: number,
  aspect: number,
  near: number,
  far: number
}
* */

interface Renderable {
  render(shader: Shader): void;
}

/**
 * Class representing a Visitor that uses Rasterisation 
 * to render a Scenegraph
 */
export class RasterVisitor implements Visitor {
  // TODO declare instance variables her
  transformation: Array<Matrix>;
  inverseTransformation: Array<Matrix>;

  ambientFactor: number;
  diffuseFactor: number;
  specularFactor: number;
  /**
   * Creates a new RasterVisitor
   * @param gl The 3D context to render to
   * @param shader The default shader to use
   * @param textureshader The texture shader to use
   * @param renderables
   */
  constructor(
    private gl: WebGL2RenderingContext,
    private shader: Shader,
    private textureshader: Shader,
    private renderables: WeakMap<Node, Renderable>
  ) {
    // TODO setup
    this.inverseTransformation = new Array<Matrix>();
    this.inverseTransformation.push(Matrix.identity());
    this.transformation = new Array<Matrix>();
    this.transformation.push(Matrix.identity());
  }

  /**
   * Renders the Scenegraph
   * @param rootNode The root node of the Scenegraph
   * @param camera The camera used
   * @param lightPositions The light light positions
   */
  render(
    rootNode: Node,
    camera: Camera | null,
    lightPositions: Array<Vector>,
    ambientFactor: number,
    diffuseFactor: number,
    specularFactor: number
  ) {
    this.ambientFactor = ambientFactor;
    this.diffuseFactor = diffuseFactor;
    this.specularFactor = specularFactor;
    // clear
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

    if (camera) {
      this.setupCamera(camera);
    }

    // traverse and render
    rootNode.accept(this);
  }

  /**
   * The view matrix to transform vertices from
   * the world coordinate system to the 
   * view coordinate system
   */
  private lookat: Matrix;

  /**
   * The perspective matrix to transform vertices from
   * the view coordinate system to the 
   * normalized device coordinate system
   */
  private perspective: Matrix;

  /**
   * Helper function to setup camera matrices
   * @param camera The camera used
   */
  setupCamera(camera: Camera) {
    this.lookat = Matrix.lookat(
      camera.eye,
      camera.center,
      camera.up);

    this.perspective = Matrix.perspective(
      camera.fovy,
      camera.aspect,
      camera.near,
      camera.far
    );
  }

  /**
   * Visits a group node
   * @param node The node to visit
   */
  visitGroupNode(node: GroupNode) {
    // TODO
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
   * @param node The node to visit
   */
  visitSphereNode(node: SphereNode) {
    const shader = this.shader;
    shader.use();
    let toWorld = this.transformation[this.transformation.length - 1];
    let fromWorld = this.inverseTransformation[this.inverseTransformation.length - 1];
    // TODO Calculate the model matrix for the sphere*
    shader.getUniformMatrix("M").set(toWorld);
    shader.getUniformFloat("ambientFactor").set(this.ambientFactor);
    shader.getUniformFloat("diffuseFactor").set(this.diffuseFactor);
    shader.getUniformFloat("specularFactor").set(this.specularFactor);

    const V = shader.getUniformMatrix("V");
    if (V && this.lookat) {
      V.set(this.lookat);
    }
    const P = shader.getUniformMatrix("P");
    if (P && this.perspective) {
      P.set(this.perspective);
    }
    // TODO set the normal matrix*
    let normalMatrix: Matrix = fromWorld.transpose();
    normalMatrix.setVal(3, 0, 0);
    normalMatrix.setVal(3, 1, 0);
    normalMatrix.setVal(3, 2, 0);
    shader.getUniformMatrix("N").set(normalMatrix);
    this.renderables.get(node).render(shader);
  }

  /**
   * Visits an axis aligned box node
   * @param  {AABoxNode} node - The node to visit
   */
  visitAABoxNode(node: AABoxNode) {
    this.shader.use();
    let shader = this.shader;
    let toWorld = this.transformation[this.transformation.length - 1];
    // TODO Calculate the model matrix for the box
    shader.getUniformMatrix("M").set(toWorld);
    shader.getUniformFloat("ambientFactor").set(this.ambientFactor);
    shader.getUniformFloat("diffuseFactor").set(this.diffuseFactor);
    shader.getUniformFloat("specularFactor").set(this.specularFactor);
    let V = shader.getUniformMatrix("V");
    if (V && this.lookat) {
      V.set(this.lookat);
    }
    let P = shader.getUniformMatrix("P");
    if (P && this.perspective) {
      P.set(this.perspective);
    }

    this.renderables.get(node).render(shader);
  }

  //TODO: Inhalt anpassen; aktuell: kopie von AAboxNode
  /**
   * Visits an PyramidNode
   * @param  {PyramidNode} node - The node to visit
   */
  visitPyramidNode(node: PyramidNode) {
    this.shader.use();
    let shader = this.shader;
    let toWorld = this.transformation[this.transformation.length - 1];
    // TODO Calculate the model matrix for the box
    shader.getUniformMatrix("M").set(toWorld);
    shader.getUniformFloat("ambientFactor").set(this.ambientFactor);
    shader.getUniformFloat("diffuseFactor").set(this.diffuseFactor);
    shader.getUniformFloat("specularFactor").set(this.specularFactor);
    let V = shader.getUniformMatrix("V");
    if (V && this.lookat) {
      V.set(this.lookat);
    }
    let P = shader.getUniformMatrix("P");
    if (P && this.perspective) {
      P.set(this.perspective);
    }

    this.renderables.get(node).render(shader);
  }

  /**
   * Visits a textured box node
   * @param  {TextureBoxNode} node - The node to visit
   */
  visitTextureBoxNode(node: TextureBoxNode) {
    this.textureshader.use();
    let shader = this.textureshader;

    let toWorld = this.transformation[this.transformation.length - 1];
    // TODO calculate the model matrix for the box
    shader.getUniformMatrix("M").set(toWorld);
    shader.getUniformFloat("ambientFactor").set(this.ambientFactor);
    shader.getUniformFloat("diffuseFactor").set(this.diffuseFactor);
    shader.getUniformFloat("specularFactor").set(this.specularFactor);
    let P = shader.getUniformMatrix("P");
    if (P && this.perspective) {
      P.set(this.perspective);
    }
    shader.getUniformMatrix("V").set(this.lookat);

    this.renderables.get(node).render(shader);
  }

  /**
   * Visits a textured box node
   * @param  {TextureBoxNode} node - The node to visit
   */
  visitObjNode(node: ObjNode) {
    this.shader.use();
    let shader = this.shader;

    let toWorld = this.transformation[this.transformation.length - 1];
    // TODO calculate the model matrix for the box
    shader.getUniformMatrix("M").set(toWorld);
    shader.getUniformFloat("ambientFactor").set(this.ambientFactor);
    shader.getUniformFloat("diffuseFactor").set(this.diffuseFactor);
    shader.getUniformFloat("specularFactor").set(this.specularFactor);
    let P = shader.getUniformMatrix("P");
    if (P && this.perspective) {
      P.set(this.perspective);
    }
    shader.getUniformMatrix("V").set(this.lookat);

    this.renderables.get(node).render(shader);
  }
}


/** 
 * Class representing a Visitor that sets up buffers 
 * for use by the RasterVisitor 
 * */
export class RasterSetupVisitor {
  /**
   * The created render objects
   */
  public objects: WeakMap<Node, Renderable>

  /**
   * Creates a new RasterSetupVisitor
   * @param context The 3D context in which to create buffers //todo?
   */
  constructor(private gl: WebGL2RenderingContext) {
    this.objects = new WeakMap();
  }

  /**
   * Sets up all needed buffers
   * @param rootNode The root node of the Scenegraph
   */
  setup(rootNode: Node) {
    // Clear to white, fully opaque
    this.gl.clearColor(1.0, 1.0, 1.0, 1.0);
    // Clear everything
    this.gl.clearDepth(1.0);
    // Enable depth testing
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.depthFunc(this.gl.LEQUAL);

    this.gl.enable(this.gl.CULL_FACE);
    this.gl.cullFace(this.gl.BACK);

    rootNode.accept(this);
  }

  /**
   * Visits a group node
   * @param node The node to visit
   */
  visitGroupNode(node: GroupNode) {
    for (let child of node.child) {
      child.accept(this);
    }
  }

  /**
   * Visits a sphere node
   * @param node - The node to visit
   */
  visitSphereNode(node: SphereNode) {
    this.objects.set(
      node,
      new RasterSphere(this.gl, new Vector(0, 0, 0, 1), 1, node.color)
    );
  }

  /**
   * Visits an axis aligned box node
   * @param  {AABoxNode} node - The node to visit
   */
  visitAABoxNode(node: AABoxNode) {
    this.objects.set(
      node,
      new RasterBox(
        this.gl,
        new Vector(-0.5, -0.5, -0.5, 1),
        new Vector(0.5, 0.5, 0.5, 1)
      )
    );
  }

  /**
   * Visits a textured box node. Loads the texture
   * and creates a uv coordinate buffer
   * @param  {TextureBoxNode} node - The node to visit
   */
  visitTextureBoxNode(node: TextureBoxNode) {
    this.objects.set(
      node,
      new RasterTextureBox(
        this.gl,
        new Vector(-0.5, -0.5, -0.5, 1),
        new Vector(0.5, 0.5, 0.5, 1),
        node.texture,
        node.normal,
        node.scale
      )
    );
  }

  visitPyramidNode(node: PyramidNode) {
    this.objects.set(
        node,
        new RasterPyramid(
            this.gl,
            new Vector(-0.5, -0.5, -0.5, 1),
            new Vector(0.5, -0.5, 0.5, 1),
            1
        )
    );
  }

  visitObjNode(node: ObjNode) {
    this.objects.set(
        node,
        new RasterObjObject(
            this.gl,
            node.objString,
            node.scale
        )
    );
  }
}
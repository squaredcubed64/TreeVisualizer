import DisplayNode from "./DisplayNode.js";
import DataNode from "./DataNode.js";
import Tree from "./Tree.js";

const ROOT_TARGET_X = 400;
const ROOT_TARGET_Y = 50;
const TARGET_X_GAP = 100;
const TARGET_Y_GAP = 100;
const RADIUS = 10;
const FILL_COLOR = 'red';
const STROKE_COLOR = 'black';

// For debugging
function toString(node: DataNode, depth: number = 0) {
  let out = "\t".repeat(depth) + node.displayNode.value.toString() + "\n";
  out += toString(node.left, depth + 1) ?? '';
  out += toString(node.right, depth + 1) ?? '';
  return out;
}

export default class BinarySearchTree implements Tree {
  root: DataNode | null;

  constructor() {
    this.root = null;
  }

  insert(value: number) {
    if (this.root == null) {
      this.root = new DataNode(new DisplayNode(ROOT_TARGET_X, ROOT_TARGET_Y, RADIUS, FILL_COLOR, STROKE_COLOR, value));
    }
    else {
      this.insertIntoSubtree(value, this.root);
    }
    this.setTargetPositions();
    if (value === 4) 
    
    {
      debugger;
    }
  }

  insertIntoSubtree(value: number, node: DataNode) {
    if (value < node.displayNode.value) {
      if (node.left == null) {
        node.left = new DataNode(new DisplayNode(node.displayNode.targetX - TARGET_X_GAP, node.displayNode.targetY + TARGET_Y_GAP, RADIUS, FILL_COLOR, STROKE_COLOR, value));
      }
      else {
        this.insertIntoSubtree(value, node.left);
      }
    }
    else {
      if (node.right == null) {
        node.right = new DataNode(new DisplayNode(node.displayNode.targetX + TARGET_X_GAP, node.displayNode.targetY + TARGET_Y_GAP, RADIUS, FILL_COLOR, STROKE_COLOR, value));
      }
      else {
        this.insertIntoSubtree(value, node.right);
      }
    }
  }

  remove(value: number) {
    
  }

  find(value: number): DisplayNode | null {
    return null;
  }

  animate(canvas: HTMLCanvasElement, context: CanvasRenderingContext2D) {
    context.clearRect(0, 0, canvas.width, canvas.height);
    if (this.root != null) {
      this.root.inorderTraversal().forEach((node) => node.displayNode.drawAndUpdate(context));
    }
    requestAnimationFrame(() => this.animate(canvas, context));
  }

  targetXs(): Map<DataNode, number> {
    const nodeToTargetX = new Map<DataNode, number>();

    // Nodes are equally spaced horizontally based on their inorder traversal
    const inorderTraversal = this.root.inorderTraversal();
    const rootIndex = inorderTraversal.indexOf(this.root);
    for (let i = 0; i < inorderTraversal.length; i++) {
      const node = inorderTraversal[i];
      nodeToTargetX.set(node, ROOT_TARGET_X + (i - rootIndex) * TARGET_X_GAP);
    }
    return nodeToTargetX;
  }

  targetYs(): Map<DataNode, number> {
    const nodeToTargetY = new Map<DataNode, number>();

    // Each layer of nodes has its own target y
    const queue = [this.root];
    let depth = 0;
    while (queue.length > 0) {
      const numNodesInLayer = queue.length;
      for (let _ = 0; _ < numNodesInLayer; _++) {
        const node = queue.shift();
        nodeToTargetY.set(node, ROOT_TARGET_Y + depth * TARGET_Y_GAP);
        if (node.left != null) {
          queue.push(node.left);
        }
        if (node.right != null) {
          queue.push(node.right);
        }
      }
      depth++;
    }
    return nodeToTargetY;
  }

  setTargetPositions() {
    const nodeToTargetX = this.targetXs();
    const nodeToTargetY = this.targetYs();
    for (const node of this.root.inorderTraversal()) {
      if (!nodeToTargetX.has(node)) {
        throw new Error("Node missing from targetXs");
      }
      if (!nodeToTargetY.has(node)) {
        throw new Error("Node missing from targetYs");
      }
      node.displayNode.moveTo(nodeToTargetX.get(node), nodeToTargetY.get(node));
    }
  }

  toString() {
    return this.root.toString();
  }
}
import DisplayNode from './DisplayNode.js'
import DataNode from './DataNode.js'
import type Tree from './Tree.js'

const ROOT_TARGET_X = 400
const ROOT_TARGET_Y = 50
const TARGET_X_GAP = 100
const TARGET_Y_GAP = 100
const RADIUS = 10
const FILL_COLOR = 'red'
const STROKE_COLOR = 'black'

// For debugging
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function toString (node: DataNode | null, depth: number = 0): string {
  if (node == null) {
    return ''
  }
  let out = '\t'.repeat(depth) + node.displayNode.value.toString() + '\n'
  out += toString(node.left, depth + 1)
  out += toString(node.right, depth + 1)
  return out
}

export default class BinarySearchTree implements Tree {
  root: DataNode | null

  constructor () {
    this.root = null
  }

  insert (value: number): void {
    if (this.root == null) {
      this.root = new DataNode(new DisplayNode(ROOT_TARGET_X, ROOT_TARGET_Y, RADIUS, FILL_COLOR, STROKE_COLOR, value))
    } else {
      this.insertIntoSubtree(value, this.root)
    }
    this.setTargetPositions()
  }

  insertIntoSubtree (value: number, node: DataNode): void {
    if (value < node.displayNode.value) {
      if (node.left == null) {
        node.left = new DataNode(new DisplayNode(node.displayNode.targetX - TARGET_X_GAP, node.displayNode.targetY + TARGET_Y_GAP, RADIUS, FILL_COLOR, STROKE_COLOR, value))
      } else {
        this.insertIntoSubtree(value, node.left)
      }
    } else {
      if (node.right == null) {
        node.right = new DataNode(new DisplayNode(node.displayNode.targetX + TARGET_X_GAP, node.displayNode.targetY + TARGET_Y_GAP, RADIUS, FILL_COLOR, STROKE_COLOR, value))
      } else {
        this.insertIntoSubtree(value, node.right)
      }
    }
  }

  remove (value: number): void {

  }

  find (value: number): DisplayNode | null {
    return null
  }

  animate (canvas: HTMLCanvasElement, context: CanvasRenderingContext2D): void {
    context.clearRect(0, 0, canvas.width, canvas.height)
    if (this.root != null) {
      this.root.inorderTraversal().forEach((node) => { node.displayNode.drawAndUpdate(context) })
    }
    requestAnimationFrame(() => { this.animate(canvas, context) })
  }

  // Nodes are equally spaced horizontally based on their inorder traversal
  targetXs (): Map<DataNode, number> {
    const nodeToTargetX = new Map<DataNode, number>()
    if (this.root == null) {
      throw new Error('Root is null')
    }

    const inorderTraversal = this.root.inorderTraversal()
    const rootIndex = inorderTraversal.indexOf(this.root)
    for (let i = 0; i < inorderTraversal.length; i++) {
      const node = inorderTraversal[i]
      nodeToTargetX.set(node, ROOT_TARGET_X + (i - rootIndex) * TARGET_X_GAP)
    }
    return nodeToTargetX
  }

  // Each layer of nodes has its own target y
  targetYs (): Map<DataNode, number> {
    const nodeToTargetY = new Map<DataNode, number>()
    if (this.root == null) {
      throw new Error('Root is null')
    }

    const queue = [this.root]
    let depth = 0
    while (queue.length > 0) {
      const numNodesInLayer = queue.length
      for (let _ = 0; _ < numNodesInLayer; _++) {
        const node = queue.shift()
        if (node == null) {
          throw new Error('Node is null')
        }

        nodeToTargetY.set(node, ROOT_TARGET_Y + depth * TARGET_Y_GAP)
        if (node.left != null) {
          queue.push(node.left)
        }
        if (node.right != null) {
          queue.push(node.right)
        }
      }
      depth++
    }
    return nodeToTargetY
  }

  setTargetPositions (): void {
    const nodeToTargetX = this.targetXs()
    const nodeToTargetY = this.targetYs()
    if (this.root == null) {
      throw new Error('Root is null')
    }
    for (const node of this.root.inorderTraversal()) {
      const targetX = nodeToTargetX.get(node)
      if (targetX == null) {
        throw new Error('TargetX is null')
      }
      const targetY = nodeToTargetY.get(node)
      if (targetY == null) {
        throw new Error('TargetY is null')
      }
      node.displayNode.moveTo(targetX, targetY)
    }
  }
}

import DataNode from "./DataNode";
import type BSTInsertionInformation from "../controller/operationInformation/BSTInsertionInformation";
import type BSTDeletionInformationLEQ1Child from "../controller/operationInformation/deletionInformation/BSTDeletionInformationLEQ1Child";
import type BSTDeletionInformation2Children from "../controller/operationInformation/deletionInformation/BSTDeletionInformation2Children";
import assert from "../../Assert";
import type BSTFindSecondaryDescription from "../controller/secondaryDescription/BSTFindSecondaryDescription";
import type BSTSuccessorSecondaryDescription from "../controller/secondaryDescription/BSTSuccessorSecondaryDescription";
import type BSTInsertionSecondaryDescription from "../controller/secondaryDescription/BSTInsertionSecondaryDescription";
import TreeModel from "./TreeModel";
import type BSTFindInformation from "../controller/operationInformation/BSTFindInformation";
import type BSTDeletionInformationVariant from "../controller/operationInformation/deletionInformation/BSTDeletionInformationVariant";
import type TreePathInstruction from "../controller/pathInstruction/TreePathInstruction";

/**
 * A Binary Search Tree data structure that calculates information the view needs for animations.
 */
export default class BSTModel extends TreeModel {
  /**
   * Finds the inorder successor of a node, the successor's parent, and the path to the successor.
   * @param node The node to find the successor of.
   * @returns The successor node, the parent of the successor node, and the path to the successor node (starts with node.right and ends with the successor node).
   */
  protected static findSuccessorAndParentAndPath(node: DataNode): {
    successor: DataNode;
    successorParent: DataNode;
    pathToSuccessor: Array<
      TreePathInstruction<DataNode, BSTSuccessorSecondaryDescription>
    >;
  } {
    assert(
      node.left !== null && node.right !== null,
      "Node does not have 2 children",
    );
    let successor = node.right;
    let successorParent = node;
    const pathToSuccessor: Array<
      TreePathInstruction<DataNode, BSTSuccessorSecondaryDescription>
    > = [];

    // Find the node with the minimum value (AKA successor) in the right subtree
    while (successor.left !== null) {
      pathToSuccessor.push({
        node: successor,
        secondaryDescription: { type: "successor", direction: "left" },
      });
      successorParent = successor;
      successor = successor.left;
    }
    pathToSuccessor.push({
      node: successor,
      secondaryDescription: { type: "successor", direction: "stop" },
    });
    return { successor, successorParent, pathToSuccessor };
  }

  /**
   * Inserts a new node into the model
   * @param value The value to insert
   * @returns The information needed to animate the insertion and the inserted node
   */
  public insert(value: number): BSTInsertionInformation<DataNode> {
    // If the tree is empty, simply set the root to the new node
    if (this.root == null) {
      this.root = new DataNode(value);
      return {
        shape: this.getShape(),
        pathFromRootToTarget: [],
        value: this.root.value,
        insertedNode: this.root,
      };
    }

    // Find the path to where the new node will be inserted
    const path: Array<
      TreePathInstruction<DataNode, BSTInsertionSecondaryDescription>
    > = [];
    let currNode: DataNode | null = this.root;
    while (currNode != null) {
      if (value < currNode.value) {
        path.push({
          node: currNode,
          secondaryDescription: {
            type: "insert",
            direction: "left",
            targetValue: value,
            nodeValue: currNode.value,
          },
        });
        currNode = currNode.left;
      } else {
        path.push({
          node: currNode,
          secondaryDescription: {
            type: "insert",
            direction: "right",
            targetValue: value,
            nodeValue: currNode.value,
          },
        });
        currNode = currNode.right;
      }
    }

    // Insert the new node
    const parentNode = path[path.length - 1].node;
    const insertedNode = new DataNode(value);
    if (value < parentNode.value) {
      parentNode.left = insertedNode;
    } else {
      parentNode.right = insertedNode;
    }

    return {
      shape: this.getShape(),
      pathFromRootToTarget: path,
      value: insertedNode.value,
      insertedNode,
    };
  }

  /**
   * Deletes a node from the model
   * @param value The value to delete
   * @returns The information needed to animate the deletion
   */
  public delete(value: number): BSTDeletionInformationVariant<DataNode> {
    if (this.root == null) {
      return { type: "VictimNotFound", pathFromRootToTarget: [] };
    }

    // Find the path the tree takes to find the node to delete
    const path: Array<
      TreePathInstruction<DataNode, BSTFindSecondaryDescription>
    > = [];
    let currNode: DataNode | null = this.root;
    let currParent: DataNode | null = null;
    while (currNode != null && currNode.value !== value) {
      currParent = currNode;
      if (value < currNode.value) {
        path.push({
          node: currNode,
          secondaryDescription: {
            type: "find",
            direction: "left",
            targetValue: value,
            nodeValue: currNode.value,
          },
        });
        currNode = currNode.left;
      } else {
        path.push({
          node: currNode,
          secondaryDescription: {
            type: "find",
            direction: "right",
            targetValue: value,
            nodeValue: currNode.value,
          },
        });
        currNode = currNode.right;
      }
    }

    // Push the victim node into the path if it is found
    if (currNode == null) {
      return { type: "VictimNotFound", pathFromRootToTarget: path };
    } else {
      path.push({
        node: currNode,
        secondaryDescription: {
          type: "find",
          direction: "stop",
          targetValue: value,
          nodeValue: currNode.value,
        },
      });
    }

    // Node with no child or one child
    if (currNode.left === null || currNode.right === null) {
      const childNode = currNode.left ?? currNode.right;
      // Deleting root node
      if (currParent === null) {
        this.root = childNode;
      } else {
        // Replacing the node to delete with its child in the parent node
        if (currParent.left === currNode) {
          currParent.left = childNode;
        } else {
          currParent.right = childNode;
        }
      }
      const deletionInformation: BSTDeletionInformationLEQ1Child<DataNode> = {
        type: "LEQ1Child",
        shape: this.getShape(),
        pathFromRootToTarget: path,
        victimNode: currNode,
      };
      return deletionInformation;
      // Node with two children
    } else {
      const { successor, successorParent, pathToSuccessor } =
        BSTModel.findSuccessorAndParentAndPath(currNode);
      // Replace the value of the node to delete with the found successor
      currNode.value = successor.value;

      // Delete the successor node
      if (successorParent.left === successor) {
        successorParent.left = successor.right;
      } else {
        successorParent.right = successor.right;
      }

      const deletionInformation: BSTDeletionInformation2Children<DataNode> = {
        type: "2Children",
        shape: this.getShape(),
        pathFromRootToTarget: path,
        victimNode: currNode,
        pathFromTargetsRightChildToSuccessor: pathToSuccessor,
        successorNode: successor,
      };
      return deletionInformation;
    }
  }

  /**
   * Finds a node in the model
   * @param value The value to find
   * @returns The information needed to animate the find
   */
  public find(value: number): BSTFindInformation<DataNode> {
    // Find the path the tree takes to find the node to delete
    const path: Array<
      TreePathInstruction<DataNode, BSTFindSecondaryDescription>
    > = [];
    let currNode: DataNode | null = this.root;
    while (currNode != null && currNode.value !== value) {
      if (value < currNode.value) {
        path.push({
          node: currNode,
          secondaryDescription: {
            type: "find",
            direction: "left",
            targetValue: value,
            nodeValue: currNode.value,
          },
        });
        currNode = currNode.left;
      } else {
        path.push({
          node: currNode,
          secondaryDescription: {
            type: "find",
            direction: "right",
            targetValue: value,
            nodeValue: currNode.value,
          },
        });
        currNode = currNode.right;
      }
    }

    // If found
    if (currNode != null) {
      path.push({
        node: currNode,
        secondaryDescription: {
          type: "find",
          direction: "stop",
          targetValue: value,
          nodeValue: currNode.value,
        },
      });
    }

    return { pathFromRootToTarget: path, nodeFound: currNode };
  }
}

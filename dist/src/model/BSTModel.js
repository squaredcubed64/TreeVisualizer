var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import DataNode from "./DataNode";
import assert from "../../Assert";
import TreeModel from "./TreeModel";
/**
 * A Binary Search Tree data structure that calculates information the view needs for animations.
 */
var BSTModel = /** @class */ (function (_super) {
    __extends(BSTModel, _super);
    function BSTModel() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * Finds the inorder successor of a node, the successor's parent, and the path to the successor.
     * @param node The node to find the successor of.
     * @returns The successor node, the parent of the successor node, and the path to the successor node (starts with node.right and ends with the successor node).
     */
    BSTModel.findSuccessorAndParentAndPath = function (node) {
        assert(node.left !== null && node.right !== null, "Node does not have 2 children");
        var successor = node.right;
        var successorParent = node;
        var pathToSuccessor = [];
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
        return { successor: successor, successorParent: successorParent, pathToSuccessor: pathToSuccessor };
    };
    /**
     * Inserts a new node into the model
     * @param value The value to insert
     * @returns The information needed to animate the insertion and the inserted node
     */
    BSTModel.prototype.insert = function (value) {
        // If the tree is empty, insert without any animation
        if (this.root == null) {
            this.root = new DataNode(value);
            return {
                insertionInformation: {
                    shape: this.getShape(),
                    pathFromRootToTarget: [],
                    value: this.root.value,
                },
                insertedNode: this.root,
            };
        }
        // Find the path to where the new node will be inserted
        var path = [];
        var currNode = this.root;
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
            }
            else {
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
        var parentNode = path[path.length - 1].node;
        var insertedNode = new DataNode(value);
        if (value < parentNode.value) {
            parentNode.left = insertedNode;
        }
        else {
            parentNode.right = insertedNode;
        }
        return {
            insertionInformation: {
                shape: this.getShape(),
                pathFromRootToTarget: path,
                value: insertedNode.value,
            },
            insertedNode: insertedNode,
        };
    };
    /**
     * Deletes a node from the model
     * @param value The value to delete
     * @returns The information needed to animate the deletion
     */
    BSTModel.prototype.delete = function (value) {
        var _a;
        if (this.root == null) {
            return { type: "VictimNotFound", pathFromRootToTarget: [] };
        }
        // Find the path the tree takes to find the node to delete
        var path = [];
        var currNode = this.root;
        var currParent = null;
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
            }
            else {
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
        }
        else {
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
            var childNode = (_a = currNode.left) !== null && _a !== void 0 ? _a : currNode.right;
            // Deleting root node
            if (currParent === null) {
                this.root = childNode;
            }
            else {
                // Replacing the node to delete with its child in the parent node
                if (currParent.left === currNode) {
                    currParent.left = childNode;
                }
                else {
                    currParent.right = childNode;
                }
            }
            var deletionInformation = {
                type: "LEQ1Child",
                shape: this.getShape(),
                pathFromRootToTarget: path,
                victimNode: currNode,
            };
            return deletionInformation;
            // Node with two children
        }
        else {
            var _b = BSTModel.findSuccessorAndParentAndPath(currNode), successor = _b.successor, successorParent = _b.successorParent, pathToSuccessor = _b.pathToSuccessor;
            // Replace the value of the node to delete with the found successor
            currNode.value = successor.value;
            // Delete the successor node
            if (successorParent.left === successor) {
                successorParent.left = successor.right;
            }
            else {
                successorParent.right = successor.right;
            }
            var deletionInformation = {
                type: "2Children",
                shape: this.getShape(),
                pathFromRootToTarget: path,
                victimNode: currNode,
                pathFromTargetsRightChildToSuccessor: pathToSuccessor,
                successorNode: successor,
            };
            return deletionInformation;
        }
    };
    /**
     * Finds a node in the model
     * @param value The value to find
     * @returns The information needed to animate the find
     */
    BSTModel.prototype.find = function (value) {
        // Find the path the tree takes to find the node to delete
        var path = [];
        var currNode = this.root;
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
            }
            else {
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
    };
    return BSTModel;
}(TreeModel));
export default BSTModel;
//# sourceMappingURL=BSTModel.js.map
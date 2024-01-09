import {
  ROOT_TARGET_X,
  ROOT_TARGET_Y,
  TARGET_X_GAP,
  TARGET_Y_GAP,
  MOVE_DURATION_FRAMES,
  SHRINK_DURATION_FRAMES,
  FRAMES_AFTER_SHRINK,
  FRAMES_AFTER_HIGHLIGHTING_VICTIM_WITH_TWO_CHILDREN,
  DEFAULT_HIGHLIGHT_COLOR,
  FIND_SUCCESSOR_HIGHLIGHT_COLOR,
  FRAMES_BEFORE_REPLACE_WITH_SUCCESSOR,
  FRAMES_BEFORE_UNHIGHLIGHT_VICTIM,
  HIGHLIGHT_DURATION_AFTER_SUCCESSFUL_FIND_FRAMES,
  HIGHLIGHT_COLOR_AFTER_SUCCESSFUL_FIND,
  FRAMES_AFTER_FIND,
  INSERTION_DESCRIPTIONS,
  DELETION_DESCRIPTIONS,
  FIND_DESCRIPTIONS,
  FILL_COLOR,
  STROKE_COLOR,
  FRAMES_AFTER_UNSUCCESSFUL_DELETE
} from './Constants'
import DisplayNode from './DisplayNode'
import type DelayedFunctionCallFunctionResult from './DelayedFunctionCallFunctionResult'
import TreeView from './TreeView'
import type InsertionInformation from '../controller/InsertionInformation'
import { assert } from '../Utils'
import type TreeShape from '../controller/TreeShape'
import type DeletionInformationLEQ1Child from '../controller/DeletionInformationLEQ1Child'
import type DeletionInformation2Children from '../controller/DeletionInformation2Children'
import type DeletionInformationVictimNotFound from '../controller/DeletionInformationVictimNotFound'
import type FindInformation from '../controller/FindInformation'

export default class BSTView extends TreeView {
  // Animation: highlight path, grow inserted node, then move nodes to new target positions
  public insert (viewInsertionInformation: InsertionInformation<DisplayNode>): void {
    const { shape: shapeWithPlaceholder, path, value } = viewInsertionInformation
    const placeholderNode = shapeWithPlaceholder.inorderTraversal.find(node => node.fillColor === 'placeholder')
    assert(placeholderNode != null, 'Placeholder node not found')

    // If the tree is empty, set the root without animating
    if (this.shape.inorderTraversal.length === 0) {
      this.preparePlaceholderColorsAndValue(placeholderNode, value)
      placeholderNode.x = ROOT_TARGET_X
      placeholderNode.y = ROOT_TARGET_Y
      this.animateShapeChange(shapeWithPlaceholder)
      return
    }

    // Animate finding where to insert
    this.pushNodeHighlightingOntoFunctionQueue(path, DEFAULT_HIGHLIGHT_COLOR, INSERTION_DESCRIPTIONS.FIND_WHERE_TO_INSERT)

    // Animate inserting
    this.functionQueue.push({ framesToWait: 0, function: () => this.setupInsertionAnimation(value, shapeWithPlaceholder, placeholderNode, path[path.length - 1].node) })
  }

  // Prepares the placeholder node and tells nodes to start moving to new target positions
  private setupInsertionAnimation (valueToInsert: number, shapeWithPlaceholder: TreeShape<DisplayNode>, placeholderNode: DisplayNode, parent: DisplayNode): DelayedFunctionCallFunctionResult {
    this.preparePlaceholderColorsAndValue(placeholderNode, valueToInsert)
    if (placeholderNode.value < parent.value) {
      placeholderNode.x = parent.x - TARGET_X_GAP
    } else {
      placeholderNode.x = parent.x + TARGET_X_GAP
    }
    placeholderNode.y = parent.y + TARGET_Y_GAP

    this.animateShapeChange(shapeWithPlaceholder)
    return { framesAfterCall: MOVE_DURATION_FRAMES, description: INSERTION_DESCRIPTIONS.INSERT_NEW_NODE }
  }

  private preparePlaceholderColorsAndValue (placeholderNode: DisplayNode, value: number): void {
    placeholderNode.fillColor = FILL_COLOR
    placeholderNode.strokeColor = STROKE_COLOR
    placeholderNode.value = value
  }

  public delete (viewDeletionInformation: DeletionInformationLEQ1Child<DisplayNode> | DeletionInformation2Children<DisplayNode> | DeletionInformationVictimNotFound<DisplayNode>): void {
    switch (viewDeletionInformation.type) {
      // Animation: highlight path, shrink victim node, then move nodes to new target positions
      case 'LEQ1Child': {
        const { shape, path, victimNode } = viewDeletionInformation
        this.pushNodeHighlightingOntoFunctionQueue(path, DEFAULT_HIGHLIGHT_COLOR, DELETION_DESCRIPTIONS.FIND_NODE_TO_DELETE)
        this.functionQueue.push({ framesToWait: 0, function: () => { victimNode.startShrinkingIntoNothing(); return { framesAfterCall: SHRINK_DURATION_FRAMES + FRAMES_AFTER_SHRINK, description: DELETION_DESCRIPTIONS.DELETE_NODE } } })
        this.functionQueue.push({ framesToWait: 0, function: () => { this.animateShapeChange(shape); return { framesAfterCall: MOVE_DURATION_FRAMES, description: DELETION_DESCRIPTIONS.DELETE_NODE } } })
        break
      }
      // Animation: highlight path to victim, keep victim highlighted, highlight path to successor, highlight successor, set the victim's value to the successor's value, unhighlight victim and successor, shrink successor, then move nodes to new target positions
      case '2Children': {
        const { shape, path, victimNode, pathToSuccessor, successorNode } = viewDeletionInformation
        this.pushNodeHighlightingOntoFunctionQueue(path, DEFAULT_HIGHLIGHT_COLOR, DELETION_DESCRIPTIONS.FIND_NODE_TO_DELETE)
        this.functionQueue.push({ framesToWait: 0, function: () => { victimNode.highlight(FIND_SUCCESSOR_HIGHLIGHT_COLOR, Infinity); return { framesAfterCall: 0, description: DELETION_DESCRIPTIONS.FIND_SUCCESSOR } } })
        this.pushNodeHighlightingOntoFunctionQueue(pathToSuccessor, FIND_SUCCESSOR_HIGHLIGHT_COLOR, DELETION_DESCRIPTIONS.FIND_SUCCESSOR)
        this.functionQueue.push({ framesToWait: 0, function: () => { successorNode.highlight(FIND_SUCCESSOR_HIGHLIGHT_COLOR, Infinity); return { framesAfterCall: 0, description: DELETION_DESCRIPTIONS.REPLACE_NODE_WITH_SUCCESSOR } } })
        this.functionQueue.push({ framesToWait: FRAMES_BEFORE_REPLACE_WITH_SUCCESSOR, function: () => { victimNode.value = successorNode.value; return { framesAfterCall: 0, description: DELETION_DESCRIPTIONS.REPLACE_NODE_WITH_SUCCESSOR } } })
        this.functionQueue.push({ framesToWait: FRAMES_BEFORE_UNHIGHLIGHT_VICTIM, function: () => { victimNode.unhighlight(); successorNode.unhighlight(); return { framesAfterCall: 0, description: DELETION_DESCRIPTIONS.REPLACE_NODE_WITH_SUCCESSOR } } })
        this.functionQueue.push({ framesToWait: FRAMES_AFTER_HIGHLIGHTING_VICTIM_WITH_TWO_CHILDREN, function: () => { successorNode.startShrinkingIntoNothing(); return { framesAfterCall: SHRINK_DURATION_FRAMES + FRAMES_AFTER_SHRINK, description: DELETION_DESCRIPTIONS.DELETE_SUCCESSOR } } })
        this.functionQueue.push({ framesToWait: 0, function: () => { this.animateShapeChange(shape); return { framesAfterCall: MOVE_DURATION_FRAMES, description: DELETION_DESCRIPTIONS.DELETE_SUCCESSOR } } })
        break
      }
      // Animation: highlight path, then do nothing
      case 'VictimNotFound': {
        const { path } = viewDeletionInformation
        if (path.length !== 0) {
          this.pushNodeHighlightingOntoFunctionQueue(path, DEFAULT_HIGHLIGHT_COLOR, DELETION_DESCRIPTIONS.FIND_NODE_TO_DELETE)
        }
        this.functionQueue.push({ framesToWait: FRAMES_AFTER_UNSUCCESSFUL_DELETE, function: () => { return { framesAfterCall: 0, description: DELETION_DESCRIPTIONS.DID_NOT_FIND_NODE } } })
        break
      }
    }
  }

  private animateShapeChange (newShape: TreeShape<DisplayNode>): void {
    this.shape = newShape
    this.setTargetPositions()
  }

  // Animation: highlight path, then highlight node if found
  find (viewFindInformation: FindInformation<DisplayNode>): void {
    const { path, nodeFound } = viewFindInformation
    if (path.length !== 0) {
      this.pushNodeHighlightingOntoFunctionQueue(path, DEFAULT_HIGHLIGHT_COLOR, FIND_DESCRIPTIONS.FIND_NODE)
    }
    if (nodeFound != null) {
      this.functionQueue.push({ framesToWait: 0, function: () => { nodeFound.highlight(HIGHLIGHT_COLOR_AFTER_SUCCESSFUL_FIND, HIGHLIGHT_DURATION_AFTER_SUCCESSFUL_FIND_FRAMES); return { framesAfterCall: HIGHLIGHT_DURATION_AFTER_SUCCESSFUL_FIND_FRAMES + FRAMES_AFTER_FIND, description: FIND_DESCRIPTIONS.FOUND_NODE } } })
    } else {
      this.functionQueue.push({ framesToWait: 0, function: () => { return { framesAfterCall: FRAMES_AFTER_FIND, description: FIND_DESCRIPTIONS.DID_NOT_FIND_NODE } } })
    }
  }

  public makePlaceholderNode (): DisplayNode {
    return new DisplayNode(NaN, NaN, 'placeholder', 'placeholder', NaN)
  }
}

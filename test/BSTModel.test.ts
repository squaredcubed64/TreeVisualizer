import BSTModel from '../src/model/BSTModel'
import DataNode from '../src/model/DataNode'
import ArrowDirection from '../src/controller/ArrowDirection'
import { describe, it, expect, beforeEach } from 'vitest'
import { assert } from '../src/Utils'
import type TreeShape from '../src/controller/TreeShape'
import type BSTPathInstruction from '../src/controller/pathInstruction/BSTPathInstruction'
import type BSTSecondaryDescription from '../src/controller/secondaryDescription/BSTSecondaryDescription'

describe('BSTModel', () => {
  let bstModel: BSTModel

  beforeEach(() => {
    bstModel = new BSTModel()
  })

  function insertValuesAndReturnResultantAndExpectedShape (arrowDirection: ArrowDirection = ArrowDirection.PARENT_TO_CHILD): [TreeShape<DataNode>, TreeShape<DataNode>] {
    bstModel.arrowDirection = arrowDirection
    const parentValue = 5
    const leftChildValue = 3
    const rightChildValue = 7
    bstModel.insert(parentValue)
    bstModel.insert(leftChildValue)
    const resultantShape = bstModel.insert(rightChildValue).insertionInformation.shape

    const parentNode = new DataNode(parentValue)
    const leftChildNode = new DataNode(leftChildValue)
    const rightChildNode = new DataNode(rightChildValue)
    parentNode.left = leftChildNode
    parentNode.right = rightChildNode

    const expectedArrows = new Set<[DataNode, DataNode]>()
    switch (arrowDirection) {
      case ArrowDirection.PARENT_TO_CHILD:
        expectedArrows.add([parentNode, leftChildNode])
        expectedArrows.add([parentNode, rightChildNode])
        break
      case ArrowDirection.PREORDER:
        expectedArrows.add([parentNode, leftChildNode])
        expectedArrows.add([leftChildNode, rightChildNode])
        break
      case ArrowDirection.INORDER:
        expectedArrows.add([leftChildNode, parentNode])
        expectedArrows.add([parentNode, rightChildNode])
        break
      case ArrowDirection.POSTORDER:
        expectedArrows.add([leftChildNode, rightChildNode])
        expectedArrows.add([rightChildNode, parentNode])
        break
    }

    const expectedShape = {
      inorderTraversal: [leftChildNode, parentNode, rightChildNode],
      layers: [[parentNode], [leftChildNode, rightChildNode]],
      arrows: expectedArrows
    }

    return [resultantShape, expectedShape]
  }

  it('should return the correct inorder traversal after insertion', () => {
    const [resultantShape, expectedShape] = insertValuesAndReturnResultantAndExpectedShape()
    expect(resultantShape.inorderTraversal).toEqual(expectedShape.inorderTraversal)
  })

  it('should return the correct layers after insertion', () => {
    const [resultantShape, expectedShape] = insertValuesAndReturnResultantAndExpectedShape()
    expect(resultantShape.layers).toEqual(expectedShape.layers)
  })

  it('should return the correct arrows after insertion for the PARENT_TO_CHILD ArrowDirection', () => {
    const [resultantShape, expectedShape] = insertValuesAndReturnResultantAndExpectedShape(ArrowDirection.PARENT_TO_CHILD)
    expect(resultantShape.arrows).toEqual(expectedShape.arrows)
  })

  it('should return the correct arrows after insertion for the PREORDER ArrowDirection', () => {
    const [resultantShape, expectedShape] = insertValuesAndReturnResultantAndExpectedShape(ArrowDirection.PREORDER)
    expect(resultantShape.arrows).toEqual(expectedShape.arrows)
  })

  it('should return the correct arrows after insertion for the INORDER ArrowDirection', () => {
    const [resultantShape, expectedShape] = insertValuesAndReturnResultantAndExpectedShape(ArrowDirection.INORDER)
    expect(resultantShape.arrows).toEqual(expectedShape.arrows)
  })

  it('should return the correct arrows after insertion for the POSTORDER ArrowDirection', () => {
    const [resultantShape, expectedShape] = insertValuesAndReturnResultantAndExpectedShape(ArrowDirection.POSTORDER)
    expect(resultantShape.arrows).toEqual(expectedShape.arrows)
  })

  function inorderTraversalAndLayersHaveSameValues (shape1: TreeShape<DataNode>, shape2: TreeShape<DataNode>): boolean {
    const inorderTraversal1 = shape1.inorderTraversal
    const inorderTraversal2 = shape2.inorderTraversal
    if (inorderTraversal1.length !== inorderTraversal2.length) {
      return false
    }
    for (let i = 0; i < inorderTraversal1.length; i++) {
      if (inorderTraversal1[i].value !== inorderTraversal2[i].value) {
        return false
      }
    }

    const layers1 = shape1.layers
    const layers2 = shape2.layers
    if (layers1.length !== layers2.length) {
      return false
    }
    for (let i = 0; i < layers1.length; i++) {
      const layer1 = layers1[i]
      const layer2 = layers2[i]
      if (layer1.length !== layer2.length) {
        return false
      }
      for (let j = 0; j < layer1.length; j++) {
        if (layer1[j].value !== layer2[j].value) {
          return false
        }
      }
    }

    return true
  }

  it('should return the correct shape after deleting a node with no children', () => {
    bstModel.insert(5)
    bstModel.insert(3)

    const modelDeletionInformation = bstModel.delete(3)
    assert(modelDeletionInformation.type === 'LEQ1Child', 'Expected deletion information to be of type LEQ1Child')
    const { shape } = modelDeletionInformation

    const expectedShape = {
      inorderTraversal: [new DataNode(5)],
      layers: [[new DataNode(5)]],
      arrows: new Set<[DataNode, DataNode]>()
    }

    expect(inorderTraversalAndLayersHaveSameValues(shape, expectedShape)).toBe(true)
  })

  it('should return the correct shape after deleting a node with 1 child', () => {
    bstModel.insert(5)
    bstModel.insert(3)
    bstModel.insert(2)

    const modelDeletionInformation = bstModel.delete(3)
    assert(modelDeletionInformation.type === 'LEQ1Child', 'Expected deletion information to be of type LEQ1Child')
    const { shape } = modelDeletionInformation

    const expectedShape = {
      inorderTraversal: [new DataNode(2), new DataNode(5)],
      layers: [[new DataNode(5)], [new DataNode(2)]],
      arrows: new Set([[new DataNode(5), new DataNode(2)]]) as Set<[DataNode, DataNode]>
    }

    expect(inorderTraversalAndLayersHaveSameValues(shape, expectedShape)).toBe(true)
  })

  it('should return the correct shape after deleting a node with 2 children', () => {
    bstModel.insert(5)
    bstModel.insert(3)
    bstModel.insert(2)
    bstModel.insert(4)

    const modelDeletionInformation = bstModel.delete(3)
    assert(modelDeletionInformation.type === '2Children', 'Expected deletion information to be of type 2Children')
    const { shape } = modelDeletionInformation

    const expectedShape = {
      inorderTraversal: [new DataNode(2), new DataNode(4), new DataNode(5)],
      layers: [[new DataNode(5)], [new DataNode(4)], [new DataNode(2)]],
      arrows: new Set([[new DataNode(5), new DataNode(2)], [new DataNode(2), new DataNode(4)]]) as Set<[DataNode, DataNode]>
    }

    expect(inorderTraversalAndLayersHaveSameValues(shape, expectedShape)).toBe(true)
  })

  it('should return the correct shape after deleting a root node with no children', () => {
    bstModel.insert(5)

    const modelDeletionInformation = bstModel.delete(5)
    assert(modelDeletionInformation.type === 'LEQ1Child', 'Expected deletion information to be of type LEQ1Child')
    const { shape } = modelDeletionInformation

    const expectedShape = {
      inorderTraversal: [],
      layers: [],
      arrows: new Set<[DataNode, DataNode]>()
    }

    expect(inorderTraversalAndLayersHaveSameValues(shape, expectedShape)).toBe(true)
  })

  it('should return the correct shape after deleting a root node with 1 child', () => {
    bstModel.insert(5)
    bstModel.insert(7)

    const modelDeletionInformation = bstModel.delete(5)
    assert(modelDeletionInformation.type === 'LEQ1Child', 'Expected deletion information to be of type LEQ1Child')
    const { shape } = modelDeletionInformation

    const expectedShape = {
      inorderTraversal: [new DataNode(7)],
      layers: [[new DataNode(7)]],
      arrows: new Set<[DataNode, DataNode]>()
    }

    expect(inorderTraversalAndLayersHaveSameValues(shape, expectedShape)).toBe(true)
  })

  it('should return the correct shape after deleting a root node with 2 children', () => {
    bstModel.insert(5)
    bstModel.insert(3)
    bstModel.insert(7)

    const modelDeletionInformation = bstModel.delete(5)
    assert(modelDeletionInformation.type === '2Children', 'Expected deletion information to be of type 2Children')
    const { shape } = modelDeletionInformation

    const expectedShape = {
      inorderTraversal: [new DataNode(3), new DataNode(7)],
      layers: [[new DataNode(7)], [new DataNode(3)]],
      arrows: new Set([[new DataNode(7), new DataNode(3)]]) as Set<[DataNode, DataNode]>
    }

    expect(inorderTraversalAndLayersHaveSameValues(shape, expectedShape)).toBe(true)
  })

  it('should return the correct shape after failing to find the victim node', () => {
    bstModel.insert(5)
    bstModel.insert(3)

    const modelDeletionInformation = bstModel.delete(7)
    expect(modelDeletionInformation.type).toBe('VictimNotFound')
  })

  it('should return the correct shape after failing to find the victim node in an empty tree', () => {
    const modelDeletionInformation = bstModel.delete(7)
    expect(modelDeletionInformation.type).toBe('VictimNotFound')
  })

  function pathsHaveSameValues (path1: Array<BSTPathInstruction<DataNode, BSTSecondaryDescription>>, path2: DataNode[]): boolean {
    if (path1.length !== path2.length) {
      return false
    }
    for (let i = 0; i < path1.length; i++) {
      const pathInstruction1 = path1[i]
      const pathNode2 = path2[i]
      if (pathInstruction1.node.value !== pathNode2.value) {
        return false
      }
    }
    return true
  }

  it('should find a node correctly', () => {
    const value = 5
    bstModel.insert(value)

    const expectedPath = [new DataNode(value)]
    const expectedNodeFound = new DataNode(value)

    const findInfo = bstModel.find(value)

    expect(pathsHaveSameValues(findInfo.pathFromRootToTarget, expectedPath)).toBe(true)
    expect(findInfo.nodeFound).toEqual(expectedNodeFound)
  })
})

import type DataNode from './DataNode'

// All the information needed to draw the tree
export default interface DataTreeShape {
  inorderTraversal: DataNode[]
  layers: DataNode[][]
  arrows: Set<[DataNode, DataNode]>
}

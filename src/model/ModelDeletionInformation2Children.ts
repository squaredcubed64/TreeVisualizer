import type DataNode from './DataNode'
import type DataTreeShape from './DataTreeShape'

// The info the model sends to the controller when a node with 2 children is deleted
export default interface ModelDeletionInformation2Children {
  type: '2Children'
  shape: DataTreeShape
  path: DataNode[]
  victimNode: DataNode
  pathToSuccessor: DataNode[]
  successorNode: DataNode
}

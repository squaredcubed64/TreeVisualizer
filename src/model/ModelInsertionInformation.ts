import type DataNode from './DataNode'
import type DataTreeShape from './DataTreeShape'

// The info the model sends to the controller when a node is inserted
export default interface ModelInsertionInformation {
  shape: DataTreeShape
  path: DataNode[]
  insertedNode: DataNode
}

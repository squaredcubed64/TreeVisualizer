import type DataNode from './DataNode'
import type DataTreeShape from './DataTreeShape'

// The info the model sends to the controller when a node with 1 child or less is deleted
export default interface ModelDeletionInformationLEQ1Child {
  type: 'LEQ1Child'
  shape: DataTreeShape
  path: DataNode[]
  victimNode: DataNode
}

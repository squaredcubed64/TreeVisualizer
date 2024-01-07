import type DisplayNode from './DisplayNode'
import type DisplayTreeShape from './DisplayTreeShape'

// The info the view gets from the controller when a node with 2 children is deleted
export default interface ViewDeletionInformation2Children {
  type: '2Children'
  shape: DisplayTreeShape
  path: DisplayNode[]
  victimNode: DisplayNode
  pathToSuccessor: DisplayNode[]
  successorNode: DisplayNode
}

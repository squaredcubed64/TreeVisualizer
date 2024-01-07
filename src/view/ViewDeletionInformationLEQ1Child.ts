import type DisplayNode from './DisplayNode'
import type DisplayTreeShape from './DisplayTreeShape'

// The info the view gets from the controller when a node with 1 child or less is deleted
export default interface ViewDeletionInformationLEQ1Child {
  type: 'LEQ1Child'
  shape: DisplayTreeShape
  path: DisplayNode[]
  victimNode: DisplayNode
}

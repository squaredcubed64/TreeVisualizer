import type DisplayNode from './DisplayNode'
import type DisplayTreeShape from './DisplayTreeShape'

// The info the view gets from the controller when a node is inserted
export default interface ViewInsertionInformation {
  shapeWithPlaceholder: DisplayTreeShape
  path: DisplayNode[]
  valueToInsert: number
  placeholderNode: DisplayNode
}

import type DisplayNode from './DisplayNode'

// The info the view gets from the controller when the victim node is not found
export default interface ViewDeletionInformationVictimNotFound {
  type: 'VictimNotFound'
  // Don't need to send the shape because the shape doesn't change
  path: DisplayNode[]
}

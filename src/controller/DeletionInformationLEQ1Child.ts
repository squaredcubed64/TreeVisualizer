import type DeletionInformation from './DeletionInformation'
import type TreeShape from './TreeShape'

// The info the view gets from the controller when a node with 1 child or less is deleted
export default interface DeletionInformationLEQ1Child<T> extends DeletionInformation<T> {
  type: 'LEQ1Child'
  shape: TreeShape<T>
  victimNode: T
}

import type AVLInsertionInformation from '../controller/operationInformation/AVLInsertionInformation'
import BSTView from './BSTView'
import type DisplayNode from './DisplayNode'

export default class AVLTreeView extends BSTView {
  public insert (viewInsertionInformation: AVLInsertionInformation<DisplayNode>): void {
    const { bstInsertionInformation, rotationPath } = viewInsertionInformation
    super.insert(bstInsertionInformation)

  }
}

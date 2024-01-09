import type DataNode from '../../../model/DataNode'
import type DisplayNode from '../../../view/DisplayNode'
import type DeletionInformation2Children from './DeletionInformation2Children'
import type DeletionInformationLEQ1Child from './DeletionInformationLEQ1Child'
import type DeletionInformationVictimNotFound from './DeletionInformationVictimNotFound'

type DeletionInformation<T extends DataNode | DisplayNode> = DeletionInformationLEQ1Child<T> | DeletionInformation2Children<T> | DeletionInformationVictimNotFound<T>
export default DeletionInformation

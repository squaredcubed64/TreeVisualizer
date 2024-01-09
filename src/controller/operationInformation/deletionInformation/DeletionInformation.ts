import type DeletionInformation2Children from './DeletionInformation2Children'
import type DeletionInformationLEQ1Child from './DeletionInformationLEQ1Child'
import type DeletionInformationVictimNotFound from './DeletionInformationVictimNotFound'

type DeletionInformation<T> = DeletionInformationLEQ1Child<T> | DeletionInformation2Children<T> | DeletionInformationVictimNotFound<T>
export default DeletionInformation

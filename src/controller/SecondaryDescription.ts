import type FindSecondaryDescription from './FindSecondaryDescription'
import type InsertionSecondaryDescription from './InsertionSecondaryDescription'
import type SuccessorSecondaryDescription from './SuccessorSecondaryDescription'

type SecondaryDescription = InsertionSecondaryDescription | FindSecondaryDescription | SuccessorSecondaryDescription
export default SecondaryDescription

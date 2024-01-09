import type DataNode from '../model/DataNode'
import type DisplayNode from '../view/DisplayNode'
import type SecondaryDescription from './secondaryDescription/SecondaryDescription'

export default interface PathInstruction<T extends DataNode | DisplayNode, S extends SecondaryDescription> {
  node: T
  /**
   * The info needed to explain why the path goes left, right, or stops.
   */
  secondaryDescription: S
}

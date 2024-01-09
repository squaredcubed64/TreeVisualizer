import type SecondaryDescription from './secondaryDescription/SecondaryDescription'

export default interface PathInstruction<T, S extends SecondaryDescription> {
  node: T
  /**
   * The info needed to explain why the path goes left, right, or stops.
   */
  secondaryDescription: S
}

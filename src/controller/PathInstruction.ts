import type SecondaryDescription from './SecondaryDescription'

export default interface PathInstruction<T, S extends SecondaryDescription> {
  node: T
  /**
   * The info needed to explain why the path goes left or right.
   */
  // TODO add an enum for the reasoning if necessary (e.g. 'simple', 'successor')
  secondaryDescription: S
}

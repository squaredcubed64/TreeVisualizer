/**
 * Information the view needs to describe the animation
 */
export default interface DelayedFunctionCallFunctionResult {
  /** The time between being called and leaving the queue.
   *
   * Most functions will return the time it will take to complete the animation or that plus a buffer.
   */
  framesAfterCall: number;
  /**
   * The main description displayed while the corresponding function is at the front of the functionQueue.
   */
  description: string;
  /**
   * The secondary description displayed while the corresponding function is at the front of the functionQueue.
   *
   * Gives specific details about why the tree acts the way it does.
   */
  secondaryDescription?: string;
}

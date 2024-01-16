/**
 * A function that is called when it is at the front of the functionQueue,
 * hasn't been called yet, and framesToWait frames have passed.
 *
 * Used to implement animations asynchronously.
 *
 * The total time between function calls equals the framesAfterCall returned by one function plus the framesToWait of the next function.
 */
export default interface DelayedFunction {
  /**
   * The time between reaching the front of the queue and being called
   */
  framesToWait: number;
  /**
   * The function to call
   */
  func: () => void;
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

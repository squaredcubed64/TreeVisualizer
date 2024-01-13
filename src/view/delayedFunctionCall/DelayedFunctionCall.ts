import type DelayedFunctionCallFunction from "./DelayedFunctionCallFunction";

/**
 * A function that is called when it is at the front of the functionQueue,
 * hasn't been called yet, and framesToWait frames have passed.
 *
 * Used to implement animations asynchronously.
 *
 * The total time between function calls equals the framesAfterCall returned by one function plus the framesToWait of the next function.
 */
export default interface DelayedFunctionCall {
  /**
   * The time between reaching the front of the queue and being called
   */
  framesToWait: number;
  /**
   * The function to call
   */
  function: DelayedFunctionCallFunction;
}

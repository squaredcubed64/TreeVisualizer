import type DelayedFunctionCallFunction from "./DelayedFunctionCallFunction";

// Used to implement animations
export default interface DelayedFunctionCall {
  // The time between reaching the front of the queue and being called
  // The total time between function calls equals the framesAfterCall returned by one function plus the framesToWait of the next function
  framesToWait: number;
  function: DelayedFunctionCallFunction;
}

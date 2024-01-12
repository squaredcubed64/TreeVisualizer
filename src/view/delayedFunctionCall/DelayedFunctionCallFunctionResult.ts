export default interface DelayedFunctionCallFunctionResult {
  // The time between being called and leaving the queue
  // Most functions will return the time it will take to complete the animation or that plus a buffer
  framesAfterCall: number;
  // What should be displayed while the animation occurs
  description: string;
  secondaryDescription?: string;
}

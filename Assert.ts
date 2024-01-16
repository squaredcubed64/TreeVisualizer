export default function assert(
  condition: any,
  message: string,
): asserts condition {
  if (!(condition as boolean)) {
    throw new Error(message);
  }
}

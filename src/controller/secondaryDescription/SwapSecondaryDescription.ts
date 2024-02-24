import type TreeSecondaryDescription from "./TreeSecondaryDescription";

// todo finish this
export default interface SwapSecondaryDescription
  extends TreeSecondaryDescription {
  type: "insert";
  result: "swap" | "heap property satisfied";
  nodeValue: number;
  parentValue: number;
}

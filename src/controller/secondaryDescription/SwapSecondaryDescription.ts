import type TreeSecondaryDescription from "./TreeSecondaryDescription";

// todo finish this
export default interface SwapSecondaryDescription
  extends TreeSecondaryDescription {
  type: "insert" | "delete";
  result: "swap" | "none";
  initialNodeValue: number;
  initialParentValue: number;
}

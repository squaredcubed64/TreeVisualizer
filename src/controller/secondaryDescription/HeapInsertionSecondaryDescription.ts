import type TreeSecondaryDescription from "./TreeSecondaryDescription";

// todo finish this
export default interface HeapInsertionSecondaryDescription
  extends TreeSecondaryDescription {
  type: "insert";
  nodeValue: number;
  parentValue: number;
}

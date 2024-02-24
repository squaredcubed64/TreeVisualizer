import type DisplayNode from "../../view/DisplayNode";
import type DataNode from "../../model/DataNode";

export default interface TreeInsertionInformation<
  T extends DataNode | DisplayNode,
> {
  insertedNode: T;
  insertedNodesParent: T | null;
  insertedValue: number;
  directionFromParentToNode: "left" | "right" | "root";
}

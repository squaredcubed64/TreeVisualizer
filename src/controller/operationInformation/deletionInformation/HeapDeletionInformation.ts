import type DataNode from "../../../model/DataNode";
import type DisplayNode from "../../../view/DisplayNode";

export default interface HeapDeletionInformation<
  T extends DataNode | DisplayNode,
> {
  lorem: T;
}

import type DataNode from "../../../model/DataNode";
import type DisplayNode from "../../../view/DisplayNode";
import type BSTDeletionInformation2Children from "./BSTDeletionInformation2Children";
import type BSTDeletionInformationLEQ1Child from "./BSTDeletionInformationLEQ1Child";
import type BSTDeletionInformationVictimNotFound from "./BSTDeletionInformationVictimNotFound";

type BSTDeletionInformation<T extends DataNode | DisplayNode> =
  | BSTDeletionInformationLEQ1Child<T>
  | BSTDeletionInformation2Children<T>
  | BSTDeletionInformationVictimNotFound<T>;
export default BSTDeletionInformation;

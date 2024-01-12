import type BSTFindSecondaryDescription from "./BSTFindSecondaryDescription";
import type BSTInsertionSecondaryDescription from "./BSTInsertionSecondaryDescription";
import type BSTSuccessorSecondaryDescription from "./BSTSuccessorSecondaryDescription";

type BSTSecondaryDescription =
  | BSTInsertionSecondaryDescription
  | BSTFindSecondaryDescription
  | BSTSuccessorSecondaryDescription;
export default BSTSecondaryDescription;

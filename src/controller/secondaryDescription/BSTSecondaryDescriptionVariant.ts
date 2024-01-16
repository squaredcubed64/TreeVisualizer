import type BSTFindSecondaryDescription from "./BSTFindSecondaryDescription";
import type BSTInsertionSecondaryDescription from "./BSTInsertionSecondaryDescription";
import type BSTSuccessorSecondaryDescription from "./BSTSuccessorSecondaryDescription";

type BSTSecondaryDescriptionVariant =
  | BSTInsertionSecondaryDescription
  | BSTFindSecondaryDescription
  | BSTSuccessorSecondaryDescription;
export default BSTSecondaryDescriptionVariant;

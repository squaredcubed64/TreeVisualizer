import { assert } from "../Utils";

let disableableElements: HTMLElement[];

function initializeDisableableElements(): void {
  const insertDiv = document.getElementById("insert");
  const deleteDiv = document.getElementById("delete");
  const findDiv = document.getElementById("find");
  const clearButton = document.getElementById("clearButton");
  const arrowButton = document.getElementById("arrowButton");
  assert(
    insertDiv !== null &&
      deleteDiv !== null &&
      findDiv !== null &&
      clearButton !== null &&
      arrowButton !== null,
    "insertDiv, deleteDiv, findDiv, clearButton, or arrowButton not found",
  );
  disableableElements = [
    insertDiv,
    deleteDiv,
    findDiv,
    clearButton,
    arrowButton,
  ];
}

/**
 * Disable the insert, delete, find, clear, and arrow buttons.
 */
export function disableOperationClearAndArrowButtons(): void {
  if (disableableElements === undefined) {
    initializeDisableableElements();
  }
  disableableElements.forEach((element) => {
    element.classList.add("disabled");
  });
}

/**
 * Enable the insert, delete, find, clear, and arrow buttons.
 */
export function enableOperationClearAndArrowButtons(): void {
  if (disableableElements === undefined) {
    initializeDisableableElements();
  }
  disableableElements.forEach((element) => {
    element.classList.remove("disabled");
  });
}

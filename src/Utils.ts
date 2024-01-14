export function assert(condition: any, message: string): asserts condition {
  if (!(condition as boolean)) {
    throw new Error(message);
  }
}

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
  "insert, delete, find, clearButton, or arrowButton not found",
);
const disableableElements = [
  insertDiv,
  deleteDiv,
  findDiv,
  clearButton,
  arrowButton,
];

/**
 * Disable the insert, delete, find, clear, and arrow buttons.
 */
export function disableOperationClearAndArrowButtons(): void {
  disableableElements.forEach((element) => {
    element.classList.add("disabled");
  });
}

/**
 * Enable the insert, delete, find, clear, and arrow buttons.
 */
export function enableOperationClearAndArrowButtons(): void {
  disableableElements.forEach((element) => {
    element.classList.remove("disabled");
  });
}

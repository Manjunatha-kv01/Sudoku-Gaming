# Sudoku-Gaming
Challenge your brain 🧠 with this classic 🔢 number grid puzzle! ✅

Explanation:

HTML: Sets up the basic structure with a container, the grid (sudoku-grid), a status message area, and control buttons.

CSS:

Uses CSS Grid (display: grid) to create the 9x9 layout.

Styles the cells (.cell) with borders, font size, centering, etc.

Uses :nth-child and :nth-of-type selectors to create the thicker borders for the 3x3 subgrids. This part can be tricky, but the provided selectors should work for a grid of 81 direct children divs.

Defines styles for different cell states: .prefilled, .editable, .selected (currently focused/clicked), .highlighted (row/col/box), and .error.

JavaScript:

DOMContentLoaded: Ensures the script runs after the HTML is loaded.

createGrid(): Dynamically generates the 81 div elements for the cells, assigns data attributes (data-row, data-col, data-box) for easy identification, and attaches event listeners.

puzzles Array: Holds a few sample Sudoku puzzle strings (0 means empty).

loadPuzzle(): Takes a puzzle string, populates the grid cells, sets initial values in the board and initialBoard arrays, applies .prefilled or .editable classes, and makes cells contentEditable accordingly.

board Array: A 2D JavaScript array mirroring the grid's state. This is crucial for validation logic.

initialBoard Array: Stores the puzzle's starting state so the "Reset" button works correctly.

handleCellClick(): Manages selecting a cell, clearing previous selections/highlights, adding the .selected class, and calling highlightRelated.

selectCell(): The core logic for marking a cell as selected and highlighting related cells.

clearHighlightsAndSelection(): Helper to remove selection/highlight styles.

highlightRelated(): Adds the .highlighted class to cells in the same row, column, and 3x3 box as the selected cell.

handleKeyDown(): Prevents invalid characters (non-digits 1-9) from being entered and handles overwriting existing digits. Crucial for contenteditable.

handleCellInput(): Triggered when the content of an editable cell changes. It sanitizes the input (ensures only one digit 1-9), updates the board array, and calls validateBoard.

isValid() / isMoveValidGlobally() / validateBoard(): Functions to check if placing a number in a cell violates Sudoku rules (row, column, box uniqueness). validateBoard iterates through the entire board, marks all conflicting cells with the .error class.

markConflicts(): Helper function used by validateBoard to add the .error class to all cells involved in a conflict.

isBoardFull(): Checks if all cells have a number.

checkWinCondition(): Checks if the board is full AND valid (no errors). If so, displays a success message.

Button Listeners: Implement functionality for "Check Solution", "Reset", and "New Game".

Initial Setup: Calls createGrid() and loadPuzzle() to start the game when the page loads.

**To Use:**

* Save the HTML code as index.html.

* Save the CSS code as style.css in the same folder.

* Save the JavaScript code as script.js in the same folder.

* Open index.html in your web browser.

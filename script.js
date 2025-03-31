document.addEventListener('DOMContentLoaded', () => {
    const gridElement = document.getElementById('sudoku-grid');
    const statusMessage = document.getElementById('status-message');
    const checkButton = document.getElementById('check-button');
    const resetButton = document.getElementById('reset-button');
    const newGameButton = document.getElementById('new-game-button');
    const N = 9; // Grid size

    let board = []; // 2D array for the Sudoku board state
    let initialBoard = []; // Store the initial puzzle state
    let selectedCell = null;

    // --- Puzzle Definitions ---
    // 0 represents an empty cell
    const puzzles = [
        // Easy
        "530070000600195000098000060800060003400803001700020006060000280000419005000080079",
        // Medium
        "009748000700602000020109000007000050080000100004000800005010300001800074000207500",
        // Hard
        "800000000003600000070090200050007000000045700000100030001000068008500010090000400"
    ];
    let currentPuzzleIndex = 0;

    function createGrid() {
        gridElement.innerHTML = ''; // Clear existing grid
        board = []; // Reset internal board state
        initialBoard = []; // Reset initial board state

        for (let r = 0; r < N; r++) {
            board[r] = [];
            initialBoard[r] = [];
            for (let c = 0; c < N; c++) {
                const cell = document.createElement('div');
                cell.classList.add('cell');
                cell.dataset.row = r;
                cell.dataset.col = c;

                // Calculate box index (0-8)
                const boxRow = Math.floor(r / 3);
                const boxCol = Math.floor(c / 3);
                cell.dataset.box = boxRow * 3 + boxCol;

                gridElement.appendChild(cell);

                // Add event listeners
                cell.addEventListener('click', handleCellClick);
                cell.addEventListener('input', handleCellInput);
                // Prevent non-numeric input better than 'input' event alone
                cell.addEventListener('keydown', handleKeyDown);
            }
        }
    }

    function loadPuzzle(puzzleString) {
        if (puzzleString.length !== N * N) {
            console.error("Invalid puzzle string length");
            return;
        }

        let k = 0;
        for (let r = 0; r < N; r++) {
            for (let c = 0; c < N; c++) {
                const cell = getCellElement(r, c);
                const value = parseInt(puzzleString[k], 10);
                initialBoard[r][c] = value; // Store initial value
                board[r][c] = value;       // Store current value

                cell.textContent = value === 0 ? '' : value;
                cell.classList.remove('prefilled', 'editable', 'error', 'selected', 'highlighted'); // Reset classes

                if (value !== 0) {
                    cell.classList.add('prefilled');
                    cell.contentEditable = false;
                } else {
                    cell.classList.add('editable');
                    cell.contentEditable = true;
                    cell.setAttribute('inputmode', 'numeric'); // Hint for mobile keyboards
                    cell.setAttribute('pattern', '[1-9]'); // Basic pattern hint
                }
                k++;
            }
        }
        clearHighlightsAndSelection();
        validateBoard(); // Initial validation for prefilled numbers (should be correct)
        statusMessage.textContent = "";
    }

    function getCellElement(row, col) {
        // Find cell using data attributes more reliably than index calculation
        return gridElement.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
    }

    function handleCellClick(event) {
        const clickedCell = event.target;

        // Ignore clicks on non-cells (like grid borders)
        if (!clickedCell.classList.contains('cell')) return;

        // Allow selecting prefilled cells for highlighting, but not editing
        selectCell(clickedCell);
    }

    function selectCell(cell) {
         // Clear previous selection and highlights
        clearHighlightsAndSelection();

        selectedCell = cell;
        selectedCell.classList.add('selected');
        highlightRelated(selectedCell);

        // If it's an editable cell, focus it for immediate input
        if (selectedCell.classList.contains('editable')) {
            // Delay focus slightly to ensure click processing is complete
            setTimeout(() => selectedCell.focus(), 0);
        }
    }

    function clearHighlightsAndSelection() {
        const allCells = gridElement.querySelectorAll('.cell');
        allCells.forEach(c => {
            c.classList.remove('selected', 'highlighted');
            // Don't remove 'error' here, validation handles that
        });
        selectedCell = null;
    }


    function highlightRelated(cell) {
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        const box = parseInt(cell.dataset.box);

        for (let i = 0; i < N; i++) {
            // Highlight row
            getCellElement(row, i)?.classList.add('highlighted');
            // Highlight column
            getCellElement(i, col)?.classList.add('highlighted');
        }

        // Highlight box
        const allCells = gridElement.querySelectorAll('.cell');
        allCells.forEach(c => {
            if (parseInt(c.dataset.box) === box) {
                c.classList.add('highlighted');
            }
        });

        // Re-apply selected style as highlight might overwrite it
        cell.classList.add('selected');
        // Prevent highlighting from making prefilled cells look editable
        const highlightedCells = gridElement.querySelectorAll('.highlighted');
        highlightedCells.forEach(hc => {
            if(hc.classList.contains('prefilled') && hc !== cell) {
                 hc.classList.remove('highlighted'); // Optional: remove highlight from prefilled
                 // Or apply a different prefilled-highlight style in CSS
            }
        });

         // Ensure the selected cell itself has the 'selected' style dominant
        if (cell.classList.contains('highlighted')) {
             cell.classList.remove('highlighted');
        }
    }

     function handleKeyDown(event) {
        const cell = event.target;
        // Allow navigation keys (arrows, tab, backspace, delete) and digits 1-9
        if (
            ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab', 'Backspace', 'Delete'].includes(event.key) ||
            (event.key >= '1' && event.key <= '9')
        ) {
            // If a digit is pressed in a cell that already has a digit, overwrite it
            if (event.key >= '1' && event.key <= '9' && cell.textContent.length > 0 && getSelection().isCollapsed) {
                 // If selection is collapsed (caret), allow overwrite
                // Prevent adding more digits if cell already has one
                if (cell.textContent.length >= 1 && event.key !== 'Backspace' && event.key !== 'Delete' ) {
                     // Check if text is selected, allow overwrite if selected
                     const selection = window.getSelection();
                     if (selection.toString().length === 0) {
                         // Prevent typing more digits if one already exists and nothing is selected
                          event.preventDefault();
                          // Optionally, just replace the content
                          cell.textContent = event.key;
                          // Move cursor to end (needed for contenteditable)
                           const range = document.createRange();
                           const sel = window.getSelection();
                           range.selectNodeContents(cell);
                           range.collapse(false); // false collapses to the end
                           sel.removeAllRanges();
                           sel.addRange(range);

                          // Trigger input handling manually after programmatic change
                          handleCellInput({ target: cell });
                     }
                }
            }
             // Allow backspace/delete even if content exists
             else if ((event.key === 'Backspace' || event.key === 'Delete')) {
                  // Let the default action happen, input event will handle validation
             }

        } else {
            // Prevent any other key (letters, symbols, etc.)
            event.preventDefault();
        }
    }


    function handleCellInput(event) {
        const cell = event.target;
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        let value = cell.textContent.trim();

        // 1. Sanitize Input: Keep only the first digit 1-9, or empty
        if (value.length > 1 || !/^[1-9]?$/.test(value)) {
            value = value.replace(/[^1-9]/g, ''); // Remove non-digits
            if (value.length > 1) {
                value = value[0]; // Keep only the first digit
            }
            // Update the cell content visually, which might re-trigger input - be careful
            // It's safer to handle this in keydown, but fallback here
             cell.textContent = value;

             // Move cursor to end after correction (important for contenteditable)
             const range = document.createRange();
             const sel = window.getSelection();
             range.selectNodeContents(cell);
             range.collapse(false);
             sel.removeAllRanges();
             sel.addRange(range);

        }

        const num = value === '' ? 0 : parseInt(value);

        // 2. Update Internal Board
        board[r][c] = num;

        // 3. Validate the board (check for conflicts)
        validateBoard();

        // 4. Check for Win Condition
         checkWinCondition(); // Check win after every valid input
    }


    function isValid(r, c, num) {
        if (num === 0) return true; // Empty cell is always valid in isolation

        // Check Row
        for (let col = 0; col < N; col++) {
            if (col !== c && board[r][col] === num) {
                return false;
            }
        }

        // Check Column
        for (let row = 0; row < N; row++) {
            if (row !== r && board[row][c] === num) {
                return false;
            }
        }

        // Check 3x3 Box
        const startRow = Math.floor(r / 3) * 3;
        const startCol = Math.floor(c / 3) * 3;
        for (let row = startRow; row < startRow + 3; row++) {
            for (let col = startCol; col < startCol + 3; col++) {
                if ((row !== r || col !== c) && board[row][col] === num) {
                    return false;
                }
            }
        }

        return true;
    }

     function validateBoard() {
        let hasErrors = false;
        // Clear previous errors first
        const allCells = gridElement.querySelectorAll('.cell');
        allCells.forEach(cell => cell.classList.remove('error'));

        for (let r = 0; r < N; r++) {
            for (let c = 0; c < N; c++) {
                const num = board[r][c];
                const cell = getCellElement(r,c);
                if (num !== 0) { // Only validate filled cells
                    if (!isMoveValidGlobally(r, c, num)) {
                        if (!cell.classList.contains('prefilled')) { // Only mark user errors
                            cell.classList.add('error');
                             hasErrors = true;
                        }
                         // Mark conflicting cells as well
                         markConflicts(r, c, num);
                    }
                }
            }
        }
         // Update status message based on errors
         if (!hasErrors && isBoardFull()) {
              // If no errors and board is full, it *might* be solved
              // The checkWinCondition will confirm
         } else if (hasErrors) {
              // statusMessage.textContent = "There are conflicting numbers.";
         } else {
              // statusMessage.textContent = ""; // Clear message if no errors currently
         }
         return !hasErrors; // Return true if board is currently valid
    }

     function markConflicts(r, c, num) {
         // Mark conflicting cells in row
        for (let col = 0; col < N; col++) {
            if (col !== c && board[r][col] === num) {
                getCellElement(r, col)?.classList.add('error');
            }
        }
        // Mark conflicting cells in column
        for (let row = 0; row < N; row++) {
            if (row !== r && board[row][c] === num) {
                 getCellElement(row, c)?.classList.add('error');
            }
        }
        // Mark conflicting cells in box
        const startRow = Math.floor(r / 3) * 3;
        const startCol = Math.floor(c / 3) * 3;
        for (let row = startRow; row < startRow + 3; row++) {
            for (let col = startCol; col < startCol + 3; col++) {
                if ((row !== r || col !== c) && board[row][col] === num) {
                    getCellElement(row, col)?.classList.add('error');
                }
            }
        }
     }


     // Checks if placing 'num' at (r, c) violates Sudoku rules across the whole board
    function isMoveValidGlobally(r, c, num) {
         if (num === 0) return true;

        // Check Row
        let rowCount = 0;
        for (let col = 0; col < N; col++) {
            if (board[r][col] === num) rowCount++;
        }
        if (rowCount > 1) return false;


        // Check Column
         let colCount = 0;
         for (let row = 0; row < N; row++) {
             if (board[row][c] === num) colCount++;
         }
         if (colCount > 1) return false;

        // Check 3x3 Box
        const startRow = Math.floor(r / 3) * 3;
        const startCol = Math.floor(c / 3) * 3;
        let boxCount = 0;
        for (let row = startRow; row < startRow + 3; row++) {
            for (let col = startCol; col < startCol + 3; col++) {
                 if (board[row][col] === num) boxCount++;
            }
        }
        if (boxCount > 1) return false;


        return true; // No conflicts found for this number globally
    }


    function isBoardFull() {
        for (let r = 0; r < N; r++) {
            for (let c = 0; c < N; c++) {
                if (board[r][c] === 0) {
                    return false;
                }
            }
        }
        return true;
    }

     function checkWinCondition() {
         if (isBoardFull() && validateBoard()) { // Check if full AND valid
             statusMessage.textContent = "Congratulations! You solved it!";
             statusMessage.style.color = 'green';
              // Disable further input maybe?
             const editableCells = gridElement.querySelectorAll('.editable');
             editableCells.forEach(cell => cell.contentEditable = false);
             clearHighlightsAndSelection(); // Clear selection/highlights on win
             return true;
         } else {
              statusMessage.textContent = ""; // Clear message if not won yet
              statusMessage.style.color = 'black'; // Reset color
             return false;
         }
     }


    // --- Button Event Listeners ---
    checkButton.addEventListener('click', () => {
         // Validate the entire board and update UI
         const isValidBoard = validateBoard(); // This now highlights errors
         if (isBoardFull()) {
            if (isValidBoard) {
                checkWinCondition(); // Should display win message
            } else {
                 statusMessage.textContent = "There are errors in the grid.";
                 statusMessage.style.color = 'red';
            }
         } else {
              if (isValidBoard) {
                    statusMessage.textContent = "Grid is valid so far, but not complete.";
                    statusMessage.style.color = 'blue';
              } else {
                   statusMessage.textContent = "There are errors in the grid.";
                   statusMessage.style.color = 'red';
              }
         }

         // Clear message after a few seconds
         setTimeout(() => {
             if (!checkWinCondition()) { // Don't clear win message
                  statusMessage.textContent = "";
                   statusMessage.style.color = 'black';
             }
         }, 3000);
    });


     resetButton.addEventListener('click', () => {
         // Reload the current puzzle using the stored initial state
         let k = 0;
         const currentPuzzleString = initialBoard.flat().join(''); // Recreate string from initial state
         loadPuzzle(currentPuzzleString); // Reload using the function
          statusMessage.textContent = "Board reset to initial state.";
           statusMessage.style.color = 'orange';
           setTimeout(() => { statusMessage.textContent = ""; statusMessage.style.color = 'black'; }, 2000);
     });


     newGameButton.addEventListener('click', () => {
         currentPuzzleIndex = (currentPuzzleIndex + 1) % puzzles.length; // Cycle through puzzles
         createGrid(); // Recreate grid structure
         loadPuzzle(puzzles[currentPuzzleIndex]); // Load the new puzzle
          statusMessage.textContent = `Loaded New Game (${['Easy', 'Medium', 'Hard'][currentPuzzleIndex]})`;
          statusMessage.style.color = 'purple';
          setTimeout(() => { statusMessage.textContent = ""; statusMessage.style.color = 'black'; }, 2500);
     });


    // --- Initial Setup ---
    createGrid();
    loadPuzzle(puzzles[currentPuzzleIndex]); // Load the first puzzle initially

}); // End DOMContentLoaded
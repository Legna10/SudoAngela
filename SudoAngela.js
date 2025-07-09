// Class to store each move in the game
class Move {
    constructor(row, col, value) {
        this.row = row;
        this.col = col;
        this.value = value;
    }
}

//Class to implement a queue for hint
class Queue {
    constructor() {
        this.items = [];
    }

    //Add an item to the queue
    enqueue(item) {
        this.items.push(item);
    }

    //Remove and return the first item from the queue
    dequeue() {
        if (this.isEmpty()) return null;
        return this.items.shift();
    }

    //Check if the queue is empty
    isEmpty() {
        return this.items.length === 0;
    }

    //Peek at the first item without removing it
    peek() {
        return this.isEmpty() ? null : this.items[0];
    }
}

//Class to store history of moves for undo
class HistoryStack {
    constructor() {
        this.stack = [];
    }

    //Add steps to the stack
    push(move) {
        this.stack.push(move);
    }

    //Remove and restore the top step of the stack
    pop() {
        return this.stack.pop();
    }

    //Check if the stack is empty
    isEmpty() {
        return this.stack.length === 0;
    }
}

// Class for the Sudoku game
class SudoAngela {
    constructor() {
        this.grid = Array.from({ length: 9 }, () => Array(9).fill('')); //grid
        this.historyStack = new HistoryStack(); //Stack ofr undo
        this.hintQueue = new Queue(); //Use Queue for hints
    }

    //Generate a valid Sudoku board
    generateSudoAngela() {
        this.solution = [];

        this.grid = Array.from({ length: 9 }, () => Array(9).fill('')); //Clear the grid
        this.hintQueue = new Queue(); //Clear the hint queue
        this.historyStack = new HistoryStack();

        //Fill the diagonal boxes
        for (let i = 0; i < 9; i += 3) {
            this.fillDiagonalBox(i, i);
        }

        //Solve the Sudoku to fill the board
        this.solveSudoAngelaGrid();
        this.solution = this.grid.map(row => row.slice());

        this.removeNumbers(); //Remove random numbers to create a puzzle
        this.createBoard();
    }

    //Method to fill a 3x3 diagonal box starting from (row, col)
    fillDiagonalBox(row, col) {
        const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9]; 
        //Fill the 3x3 box with random numbers from the numbers array
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {
                let randIndex = Math.floor(Math.random() * numbers.length); //Select a random index from the numbers array
                this.grid[row + i][col + j] = numbers[randIndex]; //Place the random number in the grid
                numbers.splice(randIndex, 1); //Remove the number to avoid duplicates
            }
        }
    }

    //Functtion ro remove numbers in cells
    removeNumbers() {
        let count = 60; //Number of cells to remove
        while (count > 0) { //loop, removing cells
            const row = Math.floor(Math.random() * 9); //Random row betwen 0 and 8
            const col = Math.floor(Math.random() * 9); //Random column between 0 and 8
            if (this.grid[row][col] !== '') { //Check if the selected cell is not empty
                this.historyStack.push(new Move(row, col, this.grid[row][col])); //Save for undo
                this.hintQueue.enqueue({ row, col, value: this.grid[row][col] }); //Save hint in queue
                this.grid[row][col] = ''; //Remove the number
                count--; //Decrement the count of cells to be removed
            }
        }
    }

    //Validation function
    isValid(row, col, num) {
        // Check if `num` is not in the current row, column, or 3x3 box
        for (let i = 0; i < 9; i++) {
            //Check if `num` is already present in the current row or coloumn or 3x3 grid
            if (this.grid[row][i] == num || this.grid[i][col] == num ||
                this.grid[3 * Math.floor(row / 3) + Math.floor(i / 3)][3 * Math.floor(col / 3) + i % 3] == num) {
                return false;
            }
        }
        return true; //If `num` is not found in the row, column, or box, return true (valid placement)
    }

    //Solve Sudoku grid
    solveSudoAngelaGrid() {
        for (let row = 0; row < 9; row++) { //Loop through each row of the grid
            for (let col = 0; col < 9; col++) { //Loop through each column of the grid
                if (this.grid[row][col] === '') { //Check if the current cell is empty
                    for (let num = 1; num <= 9; num++) { //Try placing each number from 1 to 9 in the empty cell
                        if (this.isValid(row, col, num)) { //Check if placing 'num' in the current cell is valid
                            this.grid[row][col] = num; //Place the number in the current cell
                            this.hintQueue.enqueue({ row, col, value: num }); //Add to hint queue
                            if (this.solveSudoAngelaGrid()) {  //Recursively call the function to continue solving
                                return true; 
                            }
                            this.grid[row][col] = ''; //Backtrack
                        }
                    }
                    return false; //No valid number found, backtrack
                }
            }
        }
        return true; //All cells filled
    }

    //Function to solve using backtracking and update the board
    solveSudoAngela() {
        if (this.solveSudoAngelaGrid()) {
            this.createBoard(); //Update the board to reflect the solved grid
            //Check if the grid is completely filled
            if (this.grid.every(row => row.every(cell => cell !== ''))) {
                alert("SudoAngela solved!"); //Pop-up notification/success messsage
            }
        } else {
            alert("SudoAngela cannot be solved."); //error message
        }
    }

    // Undo function
    undo() {
        if (this.historyStack.isEmpty()) return; //Check if the history stack is empty
        const lastAction = this.historyStack.pop(); //Take the last step of the stack
        console.log(`Undoing move at row: ${lastAction.row}, col: ${lastAction.col}, value: ${lastAction.value}`);
        this.grid[lastAction.row][lastAction.col] = lastAction.value; //Restore old value
        this.createBoard(); //Regenerate board
    }

    //Hint function
    hint() {
        //Check if there are any hints in the hint queue
        if (!this.hintQueue.isEmpty()) {
            const hint = this.hintQueue.dequeue(); //Retrieve the first hint from the queue            
            this.grid[hint.row][hint.col] = hint.value; //Update grid with hint value
            this.createBoard(); //Update board to display hints
        } else {
            alert('No more hints available!'); //Error mesage, if no more hints are available
        }
    }

    // Create board
    createBoard() {
        //Get the board element from the DOM to display the Sudoku grid
        const sudoAngelaBoard = document.getElementById('sudoAngela-board'); 
        sudoAngelaBoard.innerHTML = '';  //Clear the previous board content
        for (let row = 0; row < 9; row++) { //Create input fields for each cell in the 9x9 grid
            for (let col = 0; col < 9; col++) {
                const cell = document.createElement('input'); //Create an input element for the Sudoku cell
                cell.type = 'text'; //Set the input type to text
                cell.maxLength = 1; //Set the maximum length of input to 1 character
                cell.classList.add('cell'); //Add CSS class for styling
                cell.dataset.row = row; //Store the row index
                cell.dataset.col = col; //Store the column index
                cell.value = this.grid[row][col]; //Set initial value

                //Event listener to handle input
                cell.addEventListener('input', (event) => {
                    const value = event.target.value; //Get the current input value
                    const prevValue = this.grid[row][col]; //Store the previous value
                    //Validate input
                    if (value && (isNaN(value) || value < 1 || value > 9)) {
                        event.target.value = ''; // Clear input
                        alert('Please enter a number between 1 and 9'); //Error message
                    } else {
                        //If valid, save value in grid
                        this.historyStack.push(new Move(row, col, prevValue)); //Save step for undo
                        this.grid[row][col] = value; //Update grid with new value
                
                        //Validate grid after input
                        if (!this.isGridValid()) {
                            alert('Invalid input! Please check for duplicates in the same row, column, or box.'); //erros message
                            this.grid[row][col] = ''; //Clear cell if invalid
                            event.target.value = ''; //Clear input
                        }
                
                        //Check if all cells are filled after input
                        if (this.grid.every(row => row.every(cell => cell !== ''))) {
                            alert("SudoAngela completed!"); //Popup
                        }
                    }
                });                
                sudoAngelaBoard.appendChild(cell); //Add the cell to the board
            }
        }
    }
    
    //Check if the grid is valid
    isGridValid() {
        for (let i = 0; i < 9; i++) { //loop each row
            const rowSet = new Set(); //Set to track unique values in the current row
            const colSet = new Set(); //Set to track unique values in the current column
            const boxSet = new Set(); //Set to track unique values in the current 3x3 box
            for (let j = 0; j < 9; j++) { //loop each column
                //Check for duplicates in the current row
                if (this.grid[i][j] !== '') { 
                    if (rowSet.has(this.grid[i][j])) return false; //Duplicate found
                    rowSet.add(this.grid[i][j]); //Add current value to the row set
                }
                //Check for duplicates in the current column
                if (this.grid[j][i] !== '') {
                    if (colSet.has(this.grid[j][i])) return false;  
                    colSet.add(this.grid[j][i]); //Add current value to the column set
                }
                //Check for duplicates in the current 3x3 box
                const boxRow = 3 * Math.floor(i / 3);
                const boxCol = 3 * Math.floor(i % 3);
                const boxValue = this.grid[boxRow + Math.floor(j / 3)][boxCol + j % 3]; //Get the value from the box
                if (boxValue !== '') { //Check for duplicates in the current 3x3 box
                    if (boxSet.has(boxValue)) return false; //Duplicate found
                    boxSet.add(boxValue); //Add current value to the box set
                }
            }
        }
        return true; // If no duplicates found
    }
}

// Create the game instance
const sudoAngela = new SudoAngela();

// Generate the Sudoku game board
sudoAngela.generateSudoAngela();
sudoAngela.createBoard();

// Add event listeners to buttons
document.getElementById('undo-button').addEventListener('click', () => {
    sudoAngela.undo();
});

document.getElementById('hint-button').addEventListener('click', () => {
    sudoAngela.hint();
});

document.getElementById('solve-button').addEventListener('click', () => {
    sudoAngela.solveSudoAngela();
});

document.getElementById('new-game-button').addEventListener('click', () => {
    sudoAngela.generateSudoAngela(); // Generate a new Sudoku puzzle
    sudoAngela.createBoard(); // Create the new board
});

document.getElementById('next-level-button').addEventListener('click', () => {
    // Implement your logic for next level (e.g., increasing difficulty)
    alert('Next level feature is not yet implemented.');
});

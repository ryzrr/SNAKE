document.addEventListener('DOMContentLoaded', () => {
    // Game settings
    const GRID_SIZE = 20;
    const GAME_SPEED = 150;
    const INITIAL_SNAKE_LENGTH = 3;
    
    // Game elements
    const gameBoard = document.getElementById('game-board');
    const scoreElement = document.getElementById('score');
    const finalScoreElement = document.getElementById('final-score');
    const gameOverElement = document.getElementById('game-over');
    const restartBtn = document.getElementById('restart-btn');
    
    // Control buttons
    const upBtn = document.getElementById('up-btn');
    const downBtn = document.getElementById('down-btn');
    const leftBtn = document.getElementById('left-btn');
    const rightBtn = document.getElementById('right-btn');
    
    // Game state
    let snake = [];
    let food = {};
    let direction = 'right';
    let nextDirection = 'right';
    let score = 0;
    let gameInterval;
    let isGameOver = false;
    
    // Initialize the game
    function initGame() {
        // Reset game state
        snake = [];
        direction = 'right';
        nextDirection = 'right';
        score = 0;
        isGameOver = false;
        
        // Clear the game board
        gameBoard.innerHTML = '';
        gameBoard.style.gridTemplateColumns = `repeat(${GRID_SIZE}, 1fr)`;
        gameBoard.style.gridTemplateRows = `repeat(${GRID_SIZE}, 1fr)`;
        
        // Create the grid cells
        for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            gameBoard.appendChild(cell);
        }
        
        // Initialize the snake
        const startX = Math.floor(GRID_SIZE / 2);
        const startY = Math.floor(GRID_SIZE / 2);
        
        for (let i = 0; i < INITIAL_SNAKE_LENGTH; i++) {
            snake.push({
                x: startX - i,
                y: startY
            });
        }
        
        // Draw the initial snake
        drawSnake();
        
        // Place the first food
        placeFood();
        
        // Update the score display
        updateScore();
        
        // Hide game over screen
        gameOverElement.classList.remove('show');
        
        // Start the game loop
        if (gameInterval) clearInterval(gameInterval);
        gameInterval = setInterval(gameLoop, GAME_SPEED);
    }
    
    // Main game loop
    function gameLoop() {
        moveSnake();
        checkCollision();
        
        if (!isGameOver) {
            drawSnake();
            checkFood();
        }
    }
    
    // Move the snake
    function moveSnake() {
        // Update direction
        direction = nextDirection;
        
        // Calculate new head position
        const head = { ...snake[0] };
        
        switch (direction) {
            case 'up':
                head.y--;
                break;
            case 'down':
                head.y++;
                break;
            case 'left':
                head.x--;
                break;
            case 'right':
                head.x++;
                break;
        }
        
        // Add new head to the beginning of the snake
        snake.unshift(head);
        
        // Remove the tail unless the snake ate food
        if (head.x !== food.x || head.y !== food.y) {
            snake.pop();
        } else {
            // Snake ate food, place new food and update score
            placeFood();
            score += 10;
            updateScore();
            
            // Speed up the game slightly
            if (gameInterval) {
                clearInterval(gameInterval);
                const newSpeed = Math.max(GAME_SPEED - Math.floor(score / 50) * 5, 70);
                gameInterval = setInterval(gameLoop, newSpeed);
            }
        }
    }
    
    // Check for collisions
    function checkCollision() {
        const head = snake[0];
        
        // Check wall collision
        if (
            head.x < 0 || 
            head.x >= GRID_SIZE || 
            head.y < 0 || 
            head.y >= GRID_SIZE
        ) {
            gameOver();
            return;
        }
        
        // Check self collision (starting from index 1 to skip the head)
        for (let i = 1; i < snake.length; i++) {
            if (head.x === snake[i].x && head.y === snake[i].y) {
                gameOver();
                return;
            }
        }
    }
    
    // Check if snake ate food
    function checkFood() {
        const head = snake[0];
        
        if (head.x === food.x && head.y === food.y) {
            // Play eating sound effect
            playEatingSound();
        }
    }
    
    // Draw the snake on the board
    function drawSnake() {
        // Clear all snake cells
        const cells = document.querySelectorAll('.snake-cell, .food-cell');
        cells.forEach(cell => {
            cell.classList.remove('snake-cell', 'snake-head', 'food-cell');
        });
        
        // Draw snake
        snake.forEach((segment, index) => {
            if (segment.x >= 0 && segment.x < GRID_SIZE && segment.y >= 0 && segment.y < GRID_SIZE) {
                const cellIndex = segment.y * GRID_SIZE + segment.x;
                const cell = gameBoard.children[cellIndex];
                
                if (cell) {
                    cell.classList.add('snake-cell');
                    
                    // Add special class for the head
                    if (index === 0) {
                        cell.classList.add('snake-head');
                    }
                }
            }
        });
        
        // Draw food
        if (food.x >= 0 && food.x < GRID_SIZE && food.y >= 0 && food.y < GRID_SIZE) {
            const foodIndex = food.y * GRID_SIZE + food.x;
            const foodCell = gameBoard.children[foodIndex];
            
            if (foodCell) {
                foodCell.classList.add('food-cell');
            }
        }
    }
    
    // Place food at a random empty position
    function placeFood() {
        const emptyCells = [];
        
        // Find all empty cells
        for (let y = 0; y < GRID_SIZE; y++) {
            for (let x = 0; x < GRID_SIZE; x++) {
                // Check if this cell is occupied by the snake
                let isOccupied = false;
                
                for (const segment of snake) {
                    if (segment.x === x && segment.y === y) {
                        isOccupied = true;
                        break;
                    }
                }
                
                if (!isOccupied) {
                    emptyCells.push({ x, y });
                }
            }
        }
        
        // Randomly select an empty cell
        if (emptyCells.length > 0) {
            const randomIndex = Math.floor(Math.random() * emptyCells.length);
            food = emptyCells[randomIndex];
        }
    }
    
    // Update the score display
    function updateScore() {
        scoreElement.textContent = score;
        finalScoreElement.textContent = score;
    }
    
    // Game over
    function gameOver() {
        isGameOver = true;
        clearInterval(gameInterval);
        gameOverElement.classList.add('show');
        playGameOverSound();
    }
    
    // Sound effects
    function playEatingSound() {
        // Simple audio feedback using Web Audio API
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(440, audioContext.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.1);
    }
    
    function playGameOverSound() {
        // Game over sound effect
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(220, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(110, audioContext.currentTime + 0.5);
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.5);
    }
    
    // Event listeners for keyboard controls
    document.addEventListener('keydown', (e) => {
        switch (e.key) {
            case 'ArrowUp':
                if (direction !== 'down') nextDirection = 'up';
                e.preventDefault();
                break;
            case 'ArrowDown':
                if (direction !== 'up') nextDirection = 'down';
                e.preventDefault();
                break;
            case 'ArrowLeft':
                if (direction !== 'right') nextDirection = 'left';
                e.preventDefault();
                break;
            case 'ArrowRight':
                if (direction !== 'left') nextDirection = 'right';
                e.preventDefault();
                break;
        }
    });
    
    // Event listeners for touch controls
    upBtn.addEventListener('click', () => {
        if (direction !== 'down') nextDirection = 'up';
    });
    
    downBtn.addEventListener('click', () => {
        if (direction !== 'up') nextDirection = 'down';
    });
    
    leftBtn.addEventListener('click', () => {
        if (direction !== 'right') nextDirection = 'left';
    });
    
    rightBtn.addEventListener('click', () => {
        if (direction !== 'left') nextDirection = 'right';
    });
    
    // Event listener for restart button
    restartBtn.addEventListener('click', initGame);
    
    // Initialize the game when the page loads
    initGame();
});
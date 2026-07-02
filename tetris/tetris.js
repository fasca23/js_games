document.addEventListener('DOMContentLoaded', function() {
    const BOARD_WIDTH = 10;
    const BOARD_HEIGHT = 20;
    const BLOCK_SIZE = 30;
    const NEXT_SIZE = 16;
    
    const boardCanvas = document.getElementById('boardCanvas');
    if (!boardCanvas) {
        console.error('Board canvas not found!');
        return;
    }
    
    const ctx = boardCanvas.getContext('2d');
    const nextCanvas = document.getElementById('nextCanvas');
    const nextCtx = nextCanvas.getContext('2d');
    const scoreSpan = document.getElementById('scoreValue');
    const gameStatusSpan = document.getElementById('gameStatusText');
    
    if (!scoreSpan || !gameStatusSpan || !nextCanvas) {
        console.error('UI elements not found!');
        return;
    }
    
    // Цвета фигур в неоновом стиле
    const TETROMINOS = [
        { shape: [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]], color: '#00ffff' }, // I - Cyan
        { shape: [[0,0,0,0],[0,1,1,0],[0,1,1,0],[0,0,0,0]], color: '#ffff00' }, // O - Yellow
        { shape: [[0,0,0,0],[0,1,0,0],[1,1,1,0],[0,0,0,0]], color: '#ff00ff' }, // T - Purple
        { shape: [[0,0,0,0],[0,1,1,0],[1,1,0,0],[0,0,0,0]], color: '#00ff00' }, // S - Green
        { shape: [[0,0,0,0],[1,1,0,0],[0,1,1,0],[0,0,0,0]], color: '#ff0000' }, // Z - Red
        { shape: [[0,0,0,0],[1,0,0,0],[1,1,1,0],[0,0,0,0]], color: '#ffaa00' }, // L - Orange
        { shape: [[0,0,0,0],[0,0,1,0],[1,1,1,0],[0,0,0,0]], color: '#0000ff' }  // J - Blue
    ];
    
    let board = [];
    let currentPiece = null;
    let nextTetromino = null;
    let score = 0;
    let clearedLines = 0;
    let gameActive = true;
    let gamePaused = false;
    let gameLoopInterval = null;
    
    // Настройки скорости
    const BASE_INTERVAL_MS = 500;
    const MIN_INTERVAL_MS = 80;
    const SPEED_STEP = 30;
    const LINES_PER_STEP = 3;
    
    let currentInterval = BASE_INTERVAL_MS;
    let speedLevel = 1;
    
    function initBoard() {
        board = Array(BOARD_HEIGHT).fill().map(() => Array(BOARD_WIDTH).fill(null));
    }
    
    function getRandomTetromino() {
        const idx = Math.floor(Math.random() * TETROMINOS.length);
        const original = TETROMINOS[idx];
        return { shape: original.shape.map(row => [...row]), color: original.color };
    }
    
    function spawnNewPiece() {
        if(!nextTetromino) nextTetromino = getRandomTetromino();
        const newPiece = {
            shape: nextTetromino.shape.map(row => [...row]),
            color: nextTetromino.color,
            x: Math.floor((BOARD_WIDTH - 4) / 2),
            y: 0
        };
        nextTetromino = getRandomTetromino();
        if(collision(newPiece.shape, newPiece.x, newPiece.y)) {
            gameActive = false;
            gamePaused = false;
            if(gameLoopInterval) { clearInterval(gameLoopInterval); gameLoopInterval = null; }
            drawBoard(); // Отрисовать Game Over
            setTimeout(() => alert(`😵 Игра окончена! Ваш счёт: ${score}`), 100);
            return false;
        }
        currentPiece = newPiece;
        return true;
    }
    
    function collision(shape, offsetX, offsetY) {
        for(let row = 0; row < shape.length; row++) {
            for(let col = 0; col < shape[0].length; col++) {
                if(shape[row][col] !== 0) {
                    const bx = offsetX + col, by = offsetY + row;
                    if(bx < 0 || bx >= BOARD_WIDTH || by >= BOARD_HEIGHT || by < 0) return true;
                    if(by >= 0 && board[by][bx] !== null) return true;
                }
            }
        }
        return false;
    }
    
    function mergePiece() {
        if(!currentPiece) return;
        for(let row = 0; row < currentPiece.shape.length; row++) {
            for(let col = 0; col < currentPiece.shape[0].length; col++) {
                if(currentPiece.shape[row][col] !== 0) {
                    const bx = currentPiece.x + col, by = currentPiece.y + row;
                    if(by >= 0 && by < BOARD_HEIGHT && bx >= 0 && bx < BOARD_WIDTH) {
                        board[by][bx] = currentPiece.color;
                    }
                }
            }
        }
        clearLines();
        const success = spawnNewPiece();
        if(!success) { 
            drawBoard(); 
            return; 
        }
        drawBoard();
        if(!gameActive && gameLoopInterval) { 
            clearInterval(gameLoopInterval); 
            gameLoopInterval = null; 
        }
    }
    
    function clearLines() {
        let rowsCleared = 0;
        for(let row = BOARD_HEIGHT-1; row >= 0; ) {
            if(board[row].every(cell => cell !== null)) {
                for(let r = row; r > 0; r--) board[r] = [...board[r-1]];
                board[0] = Array(BOARD_WIDTH).fill(null);
                rowsCleared++;
            } else { row--; }
        }
        if(rowsCleared > 0) {
            const pointsMap = {1: 100, 2: 300, 3: 600, 4: 1000};
            score += pointsMap[rowsCleared] || 100 * rowsCleared;
            clearedLines += rowsCleared;
            updateSpeed();
            updateScoreUI();
        }
    }
    
    function updateSpeed() {
        const newLevel = Math.floor(clearedLines / LINES_PER_STEP) + 1;
        if(newLevel !== speedLevel) {
            speedLevel = newLevel;
            currentInterval = Math.max(MIN_INTERVAL_MS, BASE_INTERVAL_MS - (speedLevel - 1) * SPEED_STEP);
            
            if(gameLoopInterval) clearInterval(gameLoopInterval);
            if(gameActive && !gamePaused) {
                gameLoopInterval = setInterval(() => {
                    if(gameActive && currentPiece && !gamePaused) {
                        movePiece(0, 1);
                        if(!gameActive && gameLoopInterval) { 
                            clearInterval(gameLoopInterval); 
                            gameLoopInterval = null; 
                        }
                    }
                }, currentInterval);
            }
        }
    }
    
    function getSpeedEmoji(interval) {
        if(interval >= 400) return '🐢';
        if(interval >= 250) return '🐇';
        if(interval >= 150) return '🦊';
        if(interval >= 100) return '🚀';
        return '⚡';
    }
    
    function movePiece(dx, dy) {
        if(!gameActive || !currentPiece || gamePaused) return false;
        if(!collision(currentPiece.shape, currentPiece.x + dx, currentPiece.y + dy)) {
            currentPiece.x += dx;
            currentPiece.y += dy;
            drawBoard();
            return true;
        }
        if(dy === 1) {
            mergePiece();
            if(!gameActive && gameLoopInterval) { 
                clearInterval(gameLoopInterval); 
                gameLoopInterval = null; 
            }
        }
        return false;
    }
    
    function rotatePiece() {
        if(!gameActive || !currentPiece || gamePaused) return;
        const oldShape = currentPiece.shape;
        const rotated = Array(4).fill().map(() => Array(4).fill(0));
        for(let i = 0; i < 4; i++)
            for(let j = 0; j < 4; j++)
                rotated[j][3 - i] = oldShape[i][j];
        
        if(!collision(rotated, currentPiece.x, currentPiece.y)) {
            currentPiece.shape = rotated;
        } else {
            for(let offset of [-1, 1, -2, 2]) {
                if(!collision(rotated, currentPiece.x + offset, currentPiece.y)) {
                    currentPiece.shape = rotated;
                    currentPiece.x += offset;
                    break;
                }
            }
        }
        drawBoard();
    }
    
    function hardDrop() {
        if(!gameActive || !currentPiece || gamePaused) return;
        while(!collision(currentPiece.shape, currentPiece.x, currentPiece.y + 1)) currentPiece.y++;
        mergePiece();
        if(!gameActive && gameLoopInterval) { 
            clearInterval(gameLoopInterval); 
            gameLoopInterval = null; 
        }
    }
    
    function togglePause() {
        if(!gameActive) return;
        gamePaused = !gamePaused;
        drawBoard();
        updateStatusText();
    }
    
    function drawBoard() {
        // Очистка фона
        ctx.fillStyle = '#111';
        ctx.fillRect(0, 0, BOARD_WIDTH * BLOCK_SIZE, BOARD_HEIGHT * BLOCK_SIZE);
        
        // Сетка
        ctx.strokeStyle = '#2a2a2a';
        ctx.lineWidth = 0.5;
        for (let i = 0; i <= BOARD_WIDTH; i++) {
            ctx.beginPath();
            ctx.moveTo(i * BLOCK_SIZE, 0);
            ctx.lineTo(i * BLOCK_SIZE, BOARD_HEIGHT * BLOCK_SIZE);
            ctx.stroke();
        }
        for (let i = 0; i <= BOARD_HEIGHT; i++) {
            ctx.beginPath();
            ctx.moveTo(0, i * BLOCK_SIZE);
            ctx.lineTo(BOARD_WIDTH * BLOCK_SIZE, i * BLOCK_SIZE);
            ctx.stroke();
        }
        
        // Отрисовка зафиксированных блоков
        for(let row = 0; row < BOARD_HEIGHT; row++) {
            for(let col = 0; col < BOARD_WIDTH; col++) {
                if(board[row][col]) {
                    ctx.fillStyle = board[row][col];
                    ctx.shadowBlur = 10;
                    ctx.shadowColor = board[row][col];
                    ctx.fillRect(col * BLOCK_SIZE + 1, row * BLOCK_SIZE + 1, BLOCK_SIZE - 2, BLOCK_SIZE - 2);
                    ctx.shadowBlur = 0;
                }
            }
        }
        
        // Отрисовка текущей фигуры
        if(currentPiece && gameActive && !gamePaused) {
            const shape = currentPiece.shape;
            for(let row = 0; row < shape.length; row++) {
                for(let col = 0; col < shape[0].length; col++) {
                    if(shape[row][col]) {
                        const x = (currentPiece.x + col) * BLOCK_SIZE;
                        const y = (currentPiece.y + row) * BLOCK_SIZE;
                        ctx.fillStyle = currentPiece.color;
                        ctx.shadowBlur = 10;
                        ctx.shadowColor = currentPiece.color;
                        ctx.fillRect(x + 1, y + 1, BLOCK_SIZE - 2, BLOCK_SIZE - 2);
                        ctx.shadowBlur = 0;
                    }
                }
            }
        }
        
        // Game Over / Pause overlay
        if(!gameActive) {
            ctx.fillStyle = 'rgba(0,0,0,0.8)';
            ctx.fillRect(0, 0, BOARD_WIDTH * BLOCK_SIZE, BOARD_HEIGHT * BLOCK_SIZE);
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 24px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('GAME OVER', BOARD_WIDTH * BLOCK_SIZE / 2, BOARD_HEIGHT * BLOCK_SIZE / 2 - 10);
            ctx.font = '16px Arial';
            ctx.fillStyle = '#0f0';
            ctx.fillText(`Счёт: ${score}`, BOARD_WIDTH * BLOCK_SIZE / 2, BOARD_HEIGHT * BLOCK_SIZE / 2 + 20);
        } else if(gamePaused) {
            ctx.fillStyle = 'rgba(0,0,0,0.7)';
            ctx.fillRect(0, 0, BOARD_WIDTH * BLOCK_SIZE, BOARD_HEIGHT * BLOCK_SIZE);
            ctx.fillStyle = '#ffd700';
            ctx.font = 'bold 30px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('ПАУЗА', BOARD_WIDTH * BLOCK_SIZE / 2, BOARD_HEIGHT * BLOCK_SIZE / 2);
        }
    }
    
    function drawNext() {
        nextCtx.clearRect(0, 0, 80, 80);
        nextCtx.fillStyle = '#111';
        nextCtx.fillRect(0, 0, 80, 80);
        
        if(nextTetromino && !gamePaused) {
            const shape = nextTetromino.shape;
            // Центрируем фигуру в превью
            let minX = 4, maxX = 0, minY = 4, maxY = 0;
            for(let r=0; r<4; r++) {
                for(let c=0; c<4; c++) {
                    if(shape[r][c]) {
                        minX = Math.min(minX, c);
                        maxX = Math.max(maxX, c);
                        minY = Math.min(minY, r);
                        maxY = Math.max(maxY, r);
                    }
                }
            }
            
            const w = maxX - minX + 1;
            const h = maxY - minY + 1;
            const offsetX = (80 - w * NEXT_SIZE) / 2 - minX * NEXT_SIZE;
            const offsetY = (80 - h * NEXT_SIZE) / 2 - minY * NEXT_SIZE;
            
            for(let row = 0; row < 4; row++) {
                for(let col = 0; col < 4; col++) {
                    if(shape[row][col]) {
                        nextCtx.fillStyle = nextTetromino.color;
                        nextCtx.shadowBlur = 5;
                        nextCtx.shadowColor = nextTetromino.color;
                        nextCtx.fillRect(offsetX + col * NEXT_SIZE, offsetY + row * NEXT_SIZE, NEXT_SIZE - 1, NEXT_SIZE - 1);
                        nextCtx.shadowBlur = 0;
                    }
                }
            }
        }
    }
    
    function updateScoreUI() { 
        scoreSpan.innerText = score;
        updateStatusText();
    }
    
    function updateStatusText() {
        if (gameActive && !gamePaused) {
            gameStatusSpan.innerHTML = `⚡ Скорость: ${currentInterval}мс ${getSpeedEmoji(currentInterval)}`;
        } else if (gamePaused) {
            gameStatusSpan.innerHTML = '⏸️ ПАУЗА';
        }
    }
    
    function renderAll() {
        drawBoard();
        drawNext();
        updateScoreUI();
    }
    
    function resetGame() {
        if(gameLoopInterval) { clearInterval(gameLoopInterval); gameLoopInterval = null; }
        initBoard();
        score = 0;
        clearedLines = 0;
        speedLevel = 1;
        currentInterval = BASE_INTERVAL_MS;
        gameActive = true;
        gamePaused = false;
        updateScoreUI();
        nextTetromino = getRandomTetromino();
        
        const newPiece = {
            shape: nextTetromino.shape.map(row => [...row]),
            color: nextTetromino.color,
            x: Math.floor((BOARD_WIDTH - 4) / 2),
            y: 0
        };
        nextTetromino = getRandomTetromino();
        if(collision(newPiece.shape, newPiece.x, newPiece.y)) {
            gameActive = false;
            gamePaused = false;
            renderAll();
            return;
        }
        currentPiece = newPiece;
        gameActive = true;
        
        gameLoopInterval = setInterval(() => {
            if(gameActive && currentPiece && !gamePaused) {
                movePiece(0, 1);
                if(!gameActive && gameLoopInterval) { 
                    clearInterval(gameLoopInterval); 
                    gameLoopInterval = null; 
                }
            }
        }, currentInterval);
        
        renderAll();
    }
    
    function handleKeydown(e) {
        if(!gameActive && e.code !== 'Space') return;
        
        if(e.key === ' ' || e.code === 'Space') {
            e.preventDefault();
            togglePause();
            return;
        }
        
        if(gamePaused) return;
        
        switch(e.key) {
            case 'ArrowLeft': 
            case 'a': 
            case 'A': 
                e.preventDefault(); 
                movePiece(-1,0); 
                break;
            case 'ArrowRight': 
            case 'd': 
            case 'D': 
                e.preventDefault(); 
                movePiece(1,0); 
                break;
            case 'ArrowDown': 
            case 's': 
            case 'S': 
                e.preventDefault(); 
                movePiece(0,1); 
                break;
            case 'ArrowUp': 
            case 'w': 
            case 'W': 
                e.preventDefault(); 
                rotatePiece(); 
                break;
        }
        renderAll();
    }
    
    // Мобильные кнопки
    const btnLeft = document.getElementById('btnLeft');
    const btnRight = document.getElementById('btnRight');
    const btnDown = document.getElementById('btnDown');
    const btnRotate = document.getElementById('btnRotate');
    const btnHardDrop = document.getElementById('btnHardDrop');
    
    if (btnLeft) btnLeft.addEventListener('click', (e) => { e.preventDefault(); movePiece(-1,0); });
    if (btnRight) btnRight.addEventListener('click', (e) => { e.preventDefault(); movePiece(1,0); });
    if (btnDown) btnDown.addEventListener('click', (e) => { e.preventDefault(); movePiece(0,1); });
    if (btnRotate) btnRotate.addEventListener('click', (e) => { e.preventDefault(); rotatePiece(); });
    if (btnHardDrop) btnHardDrop.addEventListener('click', (e) => { e.preventDefault(); hardDrop(); });
    
    // Предотвращение зума на кнопках
    document.querySelectorAll('.ctrl-btn').forEach(btn => {
        btn.addEventListener('touchstart', function(e) {
            e.preventDefault();
            this.click();
        });
    });
    
    // Глобальные функции для кнопок
    window.restartGame = function() {
        resetGame();
    };
    
    // Запуск игры
    resetGame();
    document.addEventListener('keydown', handleKeydown);
    
    console.log('🎮 Тетрис запущен!');
});
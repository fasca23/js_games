document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) {
        console.error('Canvas not found!');
        return;
    }
    
    const ctx = canvas.getContext('2d');
    const flagsSpan = document.getElementById('flagsValue');
    const timeSpan = document.getElementById('timeValue');
    const modeBtn = document.getElementById('modeBtn');
    
    if (!flagsSpan || !timeSpan || !modeBtn) {
        console.error('UI elements not found!');
        return;
    }
    
    // Настройки игры
    const COLS = 10;
    const ROWS = 10;
    const MINES_COUNT = 15;
    const CELL_SIZE = 35; // Размер клетки
    
    // Установка размера канваса
    canvas.width = COLS * CELL_SIZE;
    canvas.height = ROWS * CELL_SIZE;
    
    let board = [];
    let gameOver = false;
    let gameWon = false;
    let flagsPlaced = 0;
    let revealedCount = 0;
    let timerInterval = null;
    let seconds = 0;
    let isFlagMode = false; // Режим флага для мобильных
    
    // Цвета для цифр как в классике, но адаптированные под темную тему
    const NUMBER_COLORS = [
        '', '#00ffff', '#00ff00', '#ff0000', '#0000ff', '#ff00ff', '#00ffff', '#ffffff', '#888888'
    ];

    function initGame() {
        board = [];
        gameOver = false;
        gameWon = false;
        flagsPlaced = 0;
        revealedCount = 0;
        seconds = 0;
        stopTimer();
        updateTimeDisplay();
        updateFlagsDisplay();
        
        // Создание пустой доски
        for (let r = 0; r < ROWS; r++) {
            let row = [];
            for (let c = 0; c < COLS; c++) {
                row.push({
                    x: c * CELL_SIZE,
                    y: r * CELL_SIZE,
                    mine: false,
                    revealed: false,
                    flagged: false,
                    neighborMines: 0
                });
            }
            board.push(row);
        }
        
        // Расстановка мин
        let minesToPlace = MINES_COUNT;
        while (minesToPlace > 0) {
            const r = Math.floor(Math.random() * ROWS);
            const c = Math.floor(Math.random() * COLS);
            if (!board[r][c].mine) {
                board[r][c].mine = true;
                minesToPlace--;
            }
        }
        
        // Подсчет соседей
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                if (board[r][c].mine) continue;
                let count = 0;
                for (let i = -1; i <= 1; i++) {
                    for (let j = -1; j <= 1; j++) {
                        const nr = r + i;
                        const nc = c + j;
                        if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && board[nr][nc].mine) {
                            count++;
                        }
                    }
                }
                board[r][c].neighborMines = count;
            }
        }
        
        draw();
    }
    
    function startTimer() {
        if (timerInterval) return;
        timerInterval = setInterval(() => {
            seconds++;
            updateTimeDisplay();
        }, 1000);
    }
    
    function stopTimer() {
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
    }
    
    function updateTimeDisplay() {
        timeSpan.textContent = `${seconds}с`;
    }
    
    function updateFlagsDisplay() {
        flagsSpan.textContent = `${flagsPlaced}/${MINES_COUNT}`;
    }
    
    function toggleMode() {
        isFlagMode = !isFlagMode;
        modeBtn.textContent = isFlagMode ? '🚩 Режим: Флаг' : '⛏️ Режим: Копать';
        modeBtn.style.background = isFlagMode 
            ? 'linear-gradient(135deg, #ff4444, #cc0000)' 
            : 'linear-gradient(135deg, #ffd700, #ffaa00)';
    }
    
    function revealCell(r, c) {
        if (gameOver || gameWon) return;
        const cell = board[r][c];
        
        if (cell.revealed || cell.flagged) return;
        
        if (!timerInterval && seconds === 0) startTimer();
        
        cell.revealed = true;
        revealedCount++;
        
        if (cell.mine) {
            gameOver = true;
            stopTimer();
            // Показать все мины
            board.forEach(row => row.forEach(c => {
                if (c.mine) c.revealed = true;
            }));
            draw();
            setTimeout(() => alert(`💥 Бум! Вы проиграли. Время: ${seconds}с`), 100);
            return;
        }
        
        // Если вокруг нет мин, открываем соседей (Flood Fill)
        if (cell.neighborMines === 0) {
            for (let i = -1; i <= 1; i++) {
                for (let j = -1; j <= 1; j++) {
                    const nr = r + i;
                    const nc = c + j;
                    if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
                        revealCell(nr, nc);
                    }
                }
            }
        }
        
        checkWin();
        draw();
    }
    
    function toggleFlag(r, c) {
        if (gameOver || gameWon) return;
        const cell = board[r][c];
        
        if (cell.revealed) return;
        
        if (!timerInterval && seconds === 0) startTimer();
        
        if (cell.flagged) {
            cell.flagged = false;
            flagsPlaced--;
        } else {
            cell.flagged = true;
            flagsPlaced++;
        }
        
        updateFlagsDisplay();
        draw();
    }
    
    function checkWin() {
        const totalCells = COLS * ROWS;
        if (revealedCount === totalCells - MINES_COUNT) {
            gameWon = true;
            stopTimer();
            // Автоматически ставим флаги на оставшиеся мины
            board.forEach(row => row.forEach(c => {
                if (c.mine && !c.flagged) {
                    c.flagged = true;
                    flagsPlaced++;
                }
            }));
            updateFlagsDisplay();
            draw();
            setTimeout(() => alert(`🎉 Победа! Время: ${seconds}с`), 100);
        }
    }
    
    function getCellFromCoords(x, y) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        
        const canvasX = (x - rect.left) * scaleX;
        const canvasY = (y - rect.top) * scaleY;
        
        const c = Math.floor(canvasX / CELL_SIZE);
        const r = Math.floor(canvasY / CELL_SIZE);
        
        if (r >= 0 && r < ROWS && c >= 0 && c < COLS) {
            return { r, c };
        }
        return null;
    }
    
    function draw() {
        // Очистка
        ctx.fillStyle = '#111';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Сетка
        ctx.strokeStyle = '#0f0'; // Ярко-зеленый
        ctx.lineWidth = 1;
        ctx.shadowBlur = 5; // Добавляем свечение
        ctx.shadowColor = '#0f0';
        
        for (let i = 0; i <= COLS; i++) {
            ctx.beginPath();
            ctx.moveTo(i * CELL_SIZE, 0);
            ctx.lineTo(i * CELL_SIZE, canvas.height);
            ctx.stroke();
        }
        for (let i = 0; i <= ROWS; i++) {
            ctx.beginPath();
            ctx.moveTo(0, i * CELL_SIZE);
            ctx.lineTo(canvas.width, i * CELL_SIZE);
            ctx.stroke();
        }
        
        ctx.shadowBlur = 0; // Сбрасываем свечение для остальной отрисовки
        
        // Отрисовка клеток
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                const cell = board[r][c];
                
                if (cell.revealed) {
                    if (cell.mine) {
                        ctx.fillStyle = '#ff4444';
                        ctx.fillRect(cell.x + 2, cell.y + 2, CELL_SIZE - 4, CELL_SIZE - 4);
                        ctx.fillStyle = '#000';
                        ctx.font = '20px Arial';
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillText('💣', cell.x + CELL_SIZE/2, cell.y + CELL_SIZE/2);
                    } else if (cell.neighborMines > 0) {
                        ctx.fillStyle = '#1a1a1a'; // Темный фон для открытых
                        ctx.fillRect(cell.x + 1, cell.y + 1, CELL_SIZE - 2, CELL_SIZE - 2);
                        
                        ctx.fillStyle = NUMBER_COLORS[cell.neighborMines] || '#fff';
                        ctx.font = 'bold 18px Arial';
                        ctx.textAlign = 'center';
                        ctx.textBaseline = 'middle';
                        ctx.fillText(cell.neighborMines, cell.x + CELL_SIZE/2, cell.y + CELL_SIZE/2);
                    } else {
                        ctx.fillStyle = '#1a1a1a';
                        ctx.fillRect(cell.x + 1, cell.y + 1, CELL_SIZE - 2, CELL_SIZE - 2);
                    }
                } else if (cell.flagged) {
                    ctx.fillStyle = '#ffd700';
                    ctx.font = '20px Arial';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText('🚩', cell.x + CELL_SIZE/2, cell.y + CELL_SIZE/2);
                } else {
                    // Закрытая клетка
                    ctx.fillStyle = '#3a3a3a';
                    ctx.fillRect(cell.x + 2, cell.y + 2, CELL_SIZE - 4, CELL_SIZE - 4);
                }
            }
        }
        
        // Game Over / Win overlay
        if (gameOver) {
            ctx.fillStyle = 'rgba(0,0,0,0.8)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#ff4444';
            ctx.font = 'bold 24px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('GAME OVER', canvas.width/2, canvas.height/2);
        } else if (gameWon) {
            ctx.fillStyle = 'rgba(0,0,0,0.8)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#0f0';
            ctx.font = 'bold 24px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('ПОБЕДА!', canvas.width/2, canvas.height/2);
        }
    }
    
    // Обработчики событий
    canvas.addEventListener('click', (e) => {
        if (isFlagMode) {
            const coords = getCellFromCoords(e.clientX, e.clientY);
            if (coords) toggleFlag(coords.r, coords.c);
        } else {
            const coords = getCellFromCoords(e.clientX, e.clientY);
            if (coords) revealCell(coords.r, coords.c);
        }
    });
    
    canvas.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        const coords = getCellFromCoords(e.clientX, e.clientY);
        if (coords) toggleFlag(coords.r, coords.c);
    });
    
    // Долгое нажатие для мобильных
    let touchTimer;
    canvas.addEventListener('touchstart', (e) => {
        const touch = e.touches[0];
        touchTimer = setTimeout(() => {
            const coords = getCellFromCoords(touch.clientX, touch.clientY);
            if (coords) toggleFlag(coords.r, coords.c);
        }, 500);
    }, {passive: true});
    
    canvas.addEventListener('touchend', () => {
        clearTimeout(touchTimer);
    });
    
    canvas.addEventListener('touchmove', () => {
        clearTimeout(touchTimer);
    });
    
    // Глобальные функции
    window.restartGame = function() {
        initGame();
    };
    
    window.toggleMode = toggleMode;
    
    // Запуск
    initGame();
});
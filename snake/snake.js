document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) {
        console.error('Canvas not found!');
        return;
    }
    
    const ctx = canvas.getContext('2d');
    const scoreSpan = document.getElementById('scoreValue');
    const speedSpan = document.getElementById('speedValue');
    const pauseBtn = document.getElementById('pauseBtn');
    
    if (!scoreSpan || !speedSpan || !pauseBtn) {
        console.error('UI elements not found!');
        return;
    }
    
    const GRID_SIZE = 20;
    const CELL_SIZE = canvas.width / GRID_SIZE;
    
    const BASE_INTERVAL = 200;
    const MIN_INTERVAL = 70;
    const SPEED_STEP = 10;
    const SCORE_PER_STEP = 3;
    
    let snake = [];
    let direction = 'RIGHT';
    let nextDirection = 'RIGHT';
    let food = { x: 15, y: 10 };
    let score = 0;
    let gameRunning = true;
    let gamePaused = false;
    let gameInterval = null;
    let currentInterval = BASE_INTERVAL;
    
    let touchStartX = 0;
    let touchStartY = 0;
    const SWIPE_THRESHOLD = 30;
    
    function initGame() {
        snake = [
            { x: 10, y: 10 },
            { x: 9, y: 10 },
            { x: 8, y: 10 }
        ];
        direction = 'RIGHT';
        nextDirection = 'RIGHT';
        score = 0;
        currentInterval = BASE_INTERVAL;
        scoreSpan.textContent = score;
        updateSpeedDisplay();
        gameRunning = true;
        gamePaused = false;
        updatePauseButton();
        generateRandomFood();
    }
    
    function generateRandomFood() {
        if (snake.length >= GRID_SIZE * GRID_SIZE) {
            gameRunning = false;
            alert("🎉 Поздравляю! Ты выиграл! 🎉");
            return;
        }
        
        let newFood = null;
        let attempts = 0;
        while (!newFood && attempts < 2000) {
            const randX = Math.floor(Math.random() * GRID_SIZE);
            const randY = Math.floor(Math.random() * GRID_SIZE);
            if (!snake.some(s => s.x === randX && s.y === randY)) {
                newFood = { x: randX, y: randY };
            }
            attempts++;
        }
        
        if (!newFood) {
            for (let i = 0; i < GRID_SIZE; i++) {
                for (let j = 0; j < GRID_SIZE; j++) {
                    if (!snake.some(s => s.x === i && s.y === j)) {
                        newFood = { x: i, y: j };
                        break;
                    }
                }
                if (newFood) break;
            }
        }
        food = newFood;
    }
    
    function updateSpeed() {
        const steps = Math.floor(score / SCORE_PER_STEP);
        currentInterval = Math.max(MIN_INTERVAL, BASE_INTERVAL - steps * SPEED_STEP);
        resetInterval();
        updateSpeedDisplay();
    }
    
    function getSpeedEmoji(interval) {
        if (interval >= 180) return '🐢';
        if (interval >= 140) return '🐇';
        if (interval >= 100) return '🦊';
        if (interval >= 80) return '🚀';
        return '⚡';
    }
    
    function updateSpeedDisplay() {
        speedSpan.textContent = `${currentInterval}мс ${getSpeedEmoji(currentInterval)}`;
    }
    
    function resetInterval() {
        if (gameInterval) clearInterval(gameInterval);
        if (gameRunning && !gamePaused) {
            gameInterval = setInterval(() => { 
                updateGame(); 
                draw(); 
            }, currentInterval);
        }
    }
    
    function updateGame() {
        if (!gameRunning || gamePaused) return;
        
        if ((nextDirection === 'RIGHT' && direction !== 'LEFT') ||
            (nextDirection === 'LEFT' && direction !== 'RIGHT') ||
            (nextDirection === 'UP' && direction !== 'DOWN') ||
            (nextDirection === 'DOWN' && direction !== 'UP')) {
            direction = nextDirection;
        }
        
        let newHead = { ...snake[0] };
        switch (direction) {
            case 'RIGHT': newHead.x++; break;
            case 'LEFT':  newHead.x--; break;
            case 'UP':    newHead.y--; break;
            case 'DOWN':  newHead.y++; break;
        }
        
        const willEat = (newHead.x === food.x && newHead.y === food.y);
        
        snake.unshift(newHead);
        if (!willEat) {
            snake.pop();
        } else {
            score++;
            scoreSpan.textContent = score;
            generateRandomFood();
            updateSpeed();
            if (!gameRunning) return;
        }
        
        const head = snake[0];
        
        if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
            gameOver();
            return;
        }
        
        if (snake.slice(1).some(s => s.x === head.x && s.y === head.y)) {
            gameOver();
            return;
        }
    }
    
    function gameOver() {
        gameRunning = false;
        gamePaused = false;
        if (gameInterval) clearInterval(gameInterval);
        updatePauseButton();
        draw();
        setTimeout(() => {
            alert(`😵 Игра окончена! Ваш счёт: ${score}`);
        }, 100);
    }
    
    function togglePause() {
        if (!gameRunning) return;
        
        gamePaused = !gamePaused;
        updatePauseButton();
        
        if (gamePaused) {
            if (gameInterval) clearInterval(gameInterval);
            draw();
        } else {
            gameInterval = setInterval(() => { 
                updateGame(); 
                draw(); 
            }, currentInterval);
        }
    }
    
    function updatePauseButton() {
        if (!gameRunning) {
            pauseBtn.textContent = '⏸️ Пауза';
            pauseBtn.style.opacity = '0.5';
            pauseBtn.style.pointerEvents = 'none';
        } else if (gamePaused) {
            pauseBtn.textContent = '▶️ Продолжить';
            pauseBtn.style.opacity = '1';
            pauseBtn.style.pointerEvents = 'auto';
        } else {
            pauseBtn.textContent = '⏸️ Пауза';
            pauseBtn.style.opacity = '1';
            pauseBtn.style.pointerEvents = 'auto';
        }
    }
    
    function draw() {
        ctx.fillStyle = '#111';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Сетка
        ctx.strokeStyle = '#2a2a2a';
        ctx.lineWidth = 0.5;
        for (let i = 0; i <= GRID_SIZE; i++) {
            ctx.beginPath();
            ctx.moveTo(i * CELL_SIZE, 0);
            ctx.lineTo(i * CELL_SIZE, canvas.height);
            ctx.stroke();
            ctx.moveTo(0, i * CELL_SIZE);
            ctx.lineTo(canvas.width, i * CELL_SIZE);
            ctx.stroke();
        }
        
        // Еда
        if (food) {
            ctx.fillStyle = '#ff4444';
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#ff0000';
            ctx.fillRect(food.x * CELL_SIZE + 1, food.y * CELL_SIZE + 1, CELL_SIZE - 2, CELL_SIZE - 2);
            ctx.shadowBlur = 0;
        }
        
        // Змейка
        snake.forEach((seg, i) => {
            ctx.fillStyle = i === 0 ? '#2ecc2e' : '#1a8a1a';
            ctx.fillRect(seg.x * CELL_SIZE + 1, seg.y * CELL_SIZE + 1, CELL_SIZE - 2, CELL_SIZE - 2);
        });
        
        // Game Over
        if (!gameRunning && snake.length > 0) {
            ctx.fillStyle = 'rgba(0,0,0,0.8)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 24px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('GAME OVER', canvas.width/2, canvas.height/2 - 10);
            ctx.font = '16px Arial';
            ctx.fillStyle = '#0f0';
            ctx.fillText(`Счёт: ${score}`, canvas.width/2, canvas.height/2 + 20);
        } 
        // Пауза
        else if (gamePaused) {
            ctx.fillStyle = 'rgba(0,0,0,0.7)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#ffd700';
            ctx.font = 'bold 30px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('ПАУЗА', canvas.width/2, canvas.height/2);
        }
    }
    
    function handleKeydown(e) {
        if (!gameRunning) return;
        
        if (e.key === ' ' || e.code === 'Space') {
            e.preventDefault();
            togglePause();
            return;
        }
        
        if (gamePaused) return;
        
        const key = e.key;
        e.preventDefault();
        if (key === 'ArrowUp' || key === 'w' || key === 'W') nextDirection = 'UP';
        else if (key === 'ArrowDown' || key === 's' || key === 'S') nextDirection = 'DOWN';
        else if (key === 'ArrowLeft' || key === 'a' || key === 'A') nextDirection = 'LEFT';
        else if (key === 'ArrowRight' || key === 'd' || key === 'D') nextDirection = 'RIGHT';
    }
    
    // Мобильные кнопки
    const btnUp = document.getElementById('btnUp');
    const btnDown = document.getElementById('btnDown');
    const btnLeft = document.getElementById('btnLeft');
    const btnRight = document.getElementById('btnRight');
    
    if (btnUp) btnUp.addEventListener('click', (e) => {
        e.preventDefault();
        if (gameRunning && !gamePaused) nextDirection = 'UP';
    });
    if (btnDown) btnDown.addEventListener('click', (e) => {
        e.preventDefault();
        if (gameRunning && !gamePaused) nextDirection = 'DOWN';
    });
    if (btnLeft) btnLeft.addEventListener('click', (e) => {
        e.preventDefault();
        if (gameRunning && !gamePaused) nextDirection = 'LEFT';
    });
    if (btnRight) btnRight.addEventListener('click', (e) => {
        e.preventDefault();
        if (gameRunning && !gamePaused) nextDirection = 'RIGHT';
    });
    
    // Предотвращение зума на кнопках
    document.querySelectorAll('.control-btn').forEach(btn => {
        btn.addEventListener('touchstart', function(e) {
            e.preventDefault();
            this.click();
        });
    });
    
    // Свайпы
    function handleTouchStart(e) {
        e.preventDefault();
        const touch = e.touches[0];
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
    }
    
    function handleTouchMove(e) {
        e.preventDefault();
    }
    
    function handleTouchEnd(e) {
        e.preventDefault();
        
        if (!gameRunning || gamePaused || touchStartX === 0 || touchStartY === 0) return;
        
        const touchEnd = e.changedTouches[0];
        const dx = touchEnd.clientX - touchStartX;
        const dy = touchEnd.clientY - touchStartY;
        
        touchStartX = 0;
        touchStartY = 0;
        
        if (Math.abs(dx) < SWIPE_THRESHOLD && Math.abs(dy) < SWIPE_THRESHOLD) return;
        
        if (Math.abs(dx) > Math.abs(dy)) {
            nextDirection = dx > 0 ? 'RIGHT' : 'LEFT';
        } else {
            nextDirection = dy > 0 ? 'DOWN' : 'UP';
        }
    }
    
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
    
    // Глобальные функции для кнопок
    window.restartGame = function() {
        if (gameInterval) clearInterval(gameInterval);
        initGame();
        gameRunning = true;
        gamePaused = false;
        updatePauseButton();
        resetInterval();
        draw();
    };
    
    window.togglePause = togglePause;
    
    // Запуск игры
    initGame();
    resetInterval();
    updatePauseButton();
    draw();
    document.addEventListener('keydown', handleKeydown);
    
    console.log('🐍 Игра Змейка запущена!');
});

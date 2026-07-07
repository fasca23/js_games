document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const scoreSpan = document.getElementById('scoreValue');
    const livesSpan = document.getElementById('livesValue');
    const levelSpan = document.getElementById('levelValue');
    const pauseBtn = document.getElementById('pauseBtn');
    
    const COLS = 21;
    const ROWS = 21;
    const CELL_SIZE = 20;
    
    canvas.width = COLS * CELL_SIZE;
    canvas.height = ROWS * CELL_SIZE;
    
    // Исправленная карта с правильным домиком призраков
    const originalMap = [
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,2,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,2,1],
        [1,3,1,1,1,2,1,1,1,2,1,2,1,1,1,2,1,1,1,3,1],
        [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
        [1,2,1,1,1,2,1,2,1,1,1,1,1,2,1,2,1,1,1,2,1],
        [1,2,2,2,2,2,1,2,2,2,1,2,2,2,1,2,2,2,2,2,1],
        [1,1,1,1,1,2,1,1,1,0,1,0,1,1,1,2,1,1,1,1,1],
        [0,0,0,0,1,2,1,0,0,0,0,0,0,0,1,2,1,0,0,0,0],
        [1,1,1,1,1,2,1,1,1,1,0,1,1,1,1,2,1,1,1,1,1],
        [0,0,0,0,0,2,0,0,1,0,0,0,1,0,0,2,0,0,0,0,0],
        [1,1,1,1,1,2,1,0,1,1,1,1,1,0,1,2,1,1,1,1,1],
        [0,0,0,0,1,2,1,0,0,0,0,0,0,0,1,2,1,0,0,0,0],
        [1,1,1,1,1,2,1,0,1,1,1,1,1,0,1,2,1,1,1,1,1],
        [1,2,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,2,1],
        [1,3,1,1,1,2,1,1,1,2,1,2,1,1,1,2,1,1,1,3,1],
        [1,2,2,1,2,2,2,2,2,2,2,2,2,2,2,2,2,1,2,2,1],
        [1,1,2,1,2,1,2,1,1,1,1,1,1,1,2,1,2,1,2,1,1],
        [1,2,2,2,2,1,2,2,2,2,1,2,2,2,2,1,2,2,2,2,1],
        [1,2,1,1,1,1,1,1,1,2,1,2,1,1,1,1,1,1,1,2,1],
        [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
    ];
    
    let map = [];
    let score = 0;
    let lives = 3;
    let level = 1;
    let dotsRemaining = 0;
    let gameRunning = false;
    let gamePaused = false;
    let pacman = { x: 10, y: 15, dx: 0, dy: 0 };
    let ghosts = [];
    let ghostMode = 'scatter';
    let ghostTimer = 0;
    let animationFrame;
    let frameCount = 0;
    const GAME_SPEED = 6;
    const ghostColors = ['#ff0000', '#ffb8ff', '#00ffff', '#ffb852'];

    function initGame() {
        map = originalMap.map(row => [...row]);
        score = 0;
        lives = 3;
        level = 1;
        gameRunning = true;
        gamePaused = false;
        frameCount = 0;
        if (pauseBtn) pauseBtn.textContent = '⏸️ Пауза';
        if (scoreSpan) scoreSpan.textContent = '0';
        if (livesSpan) livesSpan.textContent = '3';
        if (levelSpan) levelSpan.textContent = '1';
        
        resetPositions();
        countDots();
        
        if (animationFrame) cancelAnimationFrame(animationFrame);
        gameLoop();
    }

    function resetPositions() {
        // Пакман внизу по центру
        pacman = { x: 10, y: 15, dx: 0, dy: 0 };
        
        // Призраки стартуют ВНЕ домика - рядом с выходом
        ghosts = [
            { x: 9, y: 8, dx: 1, dy: 0, color: ghostColors[0], exitTimer: 0 },   // Blinky - уже снаружи
            { x: 10, y: 8, dx: -1, dy: 0, color: ghostColors[1], exitTimer: 50 }, // Pinky - выходит через 50 кадров
            { x: 11, y: 8, dx: 0, dy: 1, color: ghostColors[2], exitTimer: 100 }, // Inky - выходит через 100 кадров
            { x: 10, y: 9, dx: 0, dy: -1, color: ghostColors[3], exitTimer: 150 } // Clyde - выходит через 150 кадров
        ];
        
        ghostMode = 'scatter';
        ghostTimer = 300;
    }

    function countDots() {
        dotsRemaining = 0;
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                if (map[r][c] === 2 || map[r][c] === 3) {
                    dotsRemaining++;
                }
            }
        }
    }

    function setDirection(dx, dy) {
        if (!gameRunning || gamePaused) return;
        
        const newX = pacman.x + dx;
        const newY = pacman.y + dy;
        
        if (canMoveTo(newX, newY)) {
            pacman.dx = dx;
            pacman.dy = dy;
        }
    }

    function canMoveTo(x, y) {
        // Туннель
        if ((y === 9 || y === 11) && (x < 0 || x >= COLS)) return true;
        
        if (x < 0 || x >= COLS || y < 0 || y >= ROWS) return false;
        
        const cellX = Math.floor(x);
        const cellY = Math.floor(y);
        
        if (!map[cellY]) return false;
        return map[cellY][cellX] !== 1;
    }

    function movePacman() {
        if (pacman.dx === 0 && pacman.dy === 0) return;
        
        const newX = pacman.x + pacman.dx;
        const newY = pacman.y + pacman.dy;
        
        if (canMoveTo(newX, newY)) {
            pacman.x = newX;
            pacman.y = newY;
            
            if (pacman.x < 0) pacman.x = COLS - 1;
            if (pacman.x >= COLS) pacman.x = 0;
            
            const cellX = Math.floor(pacman.x);
            const cellY = Math.floor(pacman.y);
            
            if (map[cellY] && map[cellY][cellX] === 2) {
                map[cellY][cellX] = 0;
                score += 10;
                dotsRemaining--;
                if (scoreSpan) scoreSpan.textContent = score;
            } else if (map[cellY] && map[cellY][cellX] === 3) {
                map[cellY][cellX] = 0;
                score += 50;
                dotsRemaining--;
                if (scoreSpan) scoreSpan.textContent = score;
                ghostMode = 'frightened';
                ghostTimer = 200;
            }
            
            if (dotsRemaining === 0) {
                level++;
                if (levelSpan) levelSpan.textContent = level;
                map = originalMap.map(row => [...row]);
                resetPositions();
                countDots();
            }
        } else {
            pacman.dx = 0;
            pacman.dy = 0;
        }
    }

    function moveGhosts() {
        if (ghostTimer > 0) {
            ghostTimer--;
            if (ghostTimer === 0 && ghostMode === 'frightened') {
                ghostMode = 'scatter';
            }
        }
        
        ghosts.forEach(ghost => {
            // Таймер выхода из домика
            if (ghost.exitTimer > 0) {
                ghost.exitTimer--;
                
                // Движение к выходу (позиция 10, 8)
                if (ghost.y > 8) {
                    if (canMoveTo(ghost.x, ghost.y - 1)) {
                        ghost.y -= 1;
                    }
                } else if (ghost.x !== 10) {
                    if (ghost.x < 10 && canMoveTo(ghost.x + 1, ghost.y)) {
                        ghost.x += 1;
                    } else if (ghost.x > 10 && canMoveTo(ghost.x - 1, ghost.y)) {
                        ghost.x -= 1;
                    }
                }
                
                if (ghost.exitTimer === 0) {
                    ghost.x = 10;
                    ghost.y = 8;
                    ghost.dx = Math.random() > 0.5 ? 1 : -1;
                    ghost.dy = 0;
                }
                return;
            }
            
            const cellX = Math.floor(ghost.x);
            const cellY = Math.floor(ghost.y);
            
            const possibleDirs = [];
            const directions = [{dx:0,dy:-1}, {dx:1,dy:0}, {dx:0,dy:1}, {dx:-1,dy:0}];
            
            for (const dir of directions) {
                if (ghostMode !== 'frightened') {
                    if (dir.dx === -ghost.dx && dir.dy === -ghost.dy) continue;
                }
                
                const nextX = cellX + dir.dx;
                const nextY = cellY + dir.dy;
                
                if (canMoveTo(nextX, nextY)) {
                    possibleDirs.push(dir);
                }
            }
            
            if (possibleDirs.length > 0) {
                let chosenDir;
                
                if (ghostMode === 'frightened') {
                    chosenDir = possibleDirs[Math.floor(Math.random() * possibleDirs.length)];
                } else {
                    const target = ghostMode === 'scatter' ? 
                        getScatterTarget(ghost) : 
                        { x: pacman.x, y: pacman.y };
                    
                    chosenDir = possibleDirs.reduce((best, dir) => {
                        const dist = Math.hypot(
                            cellX + dir.dx - target.x,
                            cellY + dir.dy - target.y
                        );
                        return dist < best.dist ? { dir, dist } : best;
                    }, { dir: possibleDirs[0], dist: Infinity }).dir;
                }
                
                ghost.dx = chosenDir.dx;
                ghost.dy = chosenDir.dy;
            }
            
            const newX = ghost.x + ghost.dx;
            const newY = ghost.y + ghost.dy;
            
            if (canMoveTo(newX, newY)) {
                ghost.x = newX;
                ghost.y = newY;
                
                if (ghost.x < 0) ghost.x = COLS - 1;
                if (ghost.x >= COLS) ghost.x = 0;
            }
        });
        
        for (const ghost of ghosts) {
            if (ghost.exitTimer > 0) continue;
            
            const dist = Math.hypot(pacman.x - ghost.x, pacman.y - ghost.y);
            
            if (dist < 0.9) {
                if (ghostMode === 'frightened') {
                    ghost.x = 10;
                    ghost.y = 9;
                    ghost.dx = 0;
                    ghost.dy = -1;
                    ghost.exitTimer = 100;
                    score += 200;
                    if (scoreSpan) scoreSpan.textContent = score;
                } else {
                    lives--;
                    if (livesSpan) livesSpan.textContent = lives;
                    
                    if (lives <= 0) {
                        gameRunning = false;
                    } else {
                        resetPositions();
                    }
                    return;
                }
            }
        }
    }

    function getScatterTarget(ghost) {
        const index = ghosts.indexOf(ghost);
        const targets = [
            { x: COLS - 2, y: 1 },
            { x: 1, y: 1 },
            { x: COLS - 2, y: ROWS - 2 },
            { x: 1, y: ROWS - 2 }
        ];
        return targets[index] || { x: 1, y: 1 };
    }

    function draw() {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        for (let r = 0; r < ROWS; r++) {
            if (!map[r]) continue;
            
            for (let c = 0; c < COLS; c++) {
                const x = c * CELL_SIZE;
                const y = r * CELL_SIZE;
                const cell = map[r][c];
                
                if (cell === 1) {
                    ctx.fillStyle = '#2121de';
                    ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
                    ctx.fillStyle = '#000';
                    ctx.fillRect(x + 2, y + 2, CELL_SIZE - 4, CELL_SIZE - 4);
                } else if (cell === 2) {
                    ctx.fillStyle = '#ffb8ae';
                    ctx.beginPath();
                    ctx.arc(x + 10, y + 10, 3, 0, Math.PI * 2);
                    ctx.fill();
                } else if (cell === 3) {
                    const alpha = 0.5 + 0.3 * Math.sin(Date.now() / 200);
                    ctx.fillStyle = `rgba(255, 184, 174, ${alpha})`;
                    ctx.beginPath();
                    ctx.arc(x + 10, y + 10, 7, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
        }
        
        // Рисуем дверь домика призраков
        ctx.fillStyle = '#ffb8ae';
        ctx.fillRect(9 * CELL_SIZE + 2, 8 * CELL_SIZE, CELL_SIZE - 4, 4);
        ctx.fillRect(10 * CELL_SIZE + 2, 8 * CELL_SIZE, CELL_SIZE - 4, 4);
        ctx.fillRect(11 * CELL_SIZE + 2, 8 * CELL_SIZE, CELL_SIZE - 4, 4);
        
        ghosts.forEach(ghost => {
            const x = ghost.x * CELL_SIZE;
            const y = ghost.y * CELL_SIZE;
            const color = ghostMode === 'frightened' ? '#2121ff' : ghost.color;
            
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(x + 10, y + 10, 9, Math.PI, 0);
            
            const waveOffset = Math.sin(Date.now() / 200 + ghosts.indexOf(ghost)) * 2;
            const bottomY = y + 19;
            
            for (let i = 0; i <= 4; i++) {
                const wx = x + (i * 20) / 4;
                const wy = bottomY + (i % 2 === 0 ? waveOffset : -waveOffset);
                ctx.lineTo(wx, wy);
            }
            
            ctx.lineTo(x + 1, y + 10);
            ctx.fill();
            
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(x + 6, y + 8, 4, 0, Math.PI * 2);
            ctx.arc(x + 14, y + 8, 4, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = '#00f';
            ctx.beginPath();
            ctx.arc(x + 6 + ghost.dx * 1.5, y + 8 + ghost.dy * 1.5, 2, 0, Math.PI * 2);
            ctx.arc(x + 14 + ghost.dx * 1.5, y + 8 + ghost.dy * 1.5, 2, 0, Math.PI * 2);
            ctx.fill();
        });
        
        const px = pacman.x * CELL_SIZE;
        const py = pacman.y * CELL_SIZE;
        
        ctx.save();
        ctx.translate(px + 10, py + 10);
        
        let angle = 0;
        if (pacman.dx === 1) angle = 0;
        else if (pacman.dx === -1) angle = Math.PI;
        else if (pacman.dy === -1) angle = -Math.PI / 2;
        else if (pacman.dy === 1) angle = Math.PI / 2;
        
        ctx.rotate(angle);
        
        ctx.fillStyle = '#ffff00';
        ctx.beginPath();
        const mouthAngle = Math.abs(Math.sin(frameCount * 0.3)) * 0.25 * Math.PI;
        ctx.arc(0, 0, 9, mouthAngle, 2 * Math.PI - mouthAngle);
        ctx.lineTo(0, 0);
        ctx.fill();
        
        ctx.restore();
        
        if (gamePaused) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#ffff00';
            ctx.font = 'bold 30px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('ПАУЗА', canvas.width / 2, canvas.height / 2);
        }
        
        if (!gameRunning && lives <= 0) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#ff0000';
            ctx.font = 'bold 24px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2);
        }
    }

    function gameLoop() {
        if (!gameRunning) {
            draw();
            return;
        }
        
        frameCount++;
        
        if (!gamePaused && frameCount % GAME_SPEED === 0) {
            movePacman();
            moveGhosts();
        }
        
        draw();
        animationFrame = requestAnimationFrame(gameLoop);
    }

    window.addEventListener('keydown', function(e) {
        if (!gameRunning) {
            if (e.key === ' ' || e.key === 'Enter') {
                initGame();
                e.preventDefault();
            }
            return;
        }
        
        switch(e.key) {
            case 'ArrowLeft':
            case 'a':
            case 'A':
                setDirection(-1, 0);
                e.preventDefault();
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                setDirection(1, 0);
                e.preventDefault();
                break;
            case 'ArrowUp':
            case 'w':
            case 'W':
                setDirection(0, -1);
                e.preventDefault();
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                setDirection(0, 1);
                e.preventDefault();
                break;
            case ' ':
                if (gameRunning) {
                    gamePaused = !gamePaused;
                    if (pauseBtn) pauseBtn.textContent = gamePaused ? '▶️ Играть' : '⏸️ Пауза';
                }
                e.preventDefault();
                break;
        }
    });

    window.restartGame = function() {
        if (animationFrame) cancelAnimationFrame(animationFrame);
        initGame();
    };
    
    window.togglePause = function() {
        if (!gameRunning) return;
        gamePaused = !gamePaused;
        if (pauseBtn) pauseBtn.textContent = gamePaused ? '▶️ Играть' : '⏸️ Пауза';
    };
    
    window.setDirection = setDirection;
    
    initGame();
});
class Ghost {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.dx = Math.random() > 0.5 ? 1 : -1;
        this.dy = 0;
        this.type = type;
        this.trail = [];
        this.stealTimer = 0;
        this.stuckTimer = 0;
        
        if (Math.random() > 0.5) {
            this.dx = 0;
            this.dy = Math.random() > 0.5 ? 1 : -1;
        }
    }
    
    move(grid, targetX, targetY, hamsterIsOutside, hamsterPath, timestamp) {
        if (this.type === 'snake') {
            this.trail.push({ x: this.x, y: this.y });
            if (this.trail.length > 10) this.trail.shift();
        }
        
        switch(this.type) {
            case 'chaser':
                this.moveChaser(grid, targetX, targetY, hamsterIsOutside);
                break;
            case 'patrol':
                this.movePatrol(grid, targetX, targetY, hamsterPath);
                break;
            case 'snake':
                this.moveSnake(grid, targetX, targetY);
                break;
            case 'thief':
                return this.moveThief(grid, timestamp);
        }
        return null;
    }
    
    moveThief(grid, timestamp) {
        // Всегда двигаемся
        this.doMoveThief(grid);
        
        // Кража каждый интервал
        if (!this.stealTimer) this.stealTimer = timestamp;
        if (timestamp - this.stealTimer >= CONFIG.THIEF_STEAL_INTERVAL) {
            this.stealTimer = timestamp;
            const size = CONFIG.THIEF_STEAL_SIZE;
            const half = Math.floor(size / 2);
            let stolen = 0;
            const cells = [];
            
            for (let dy = -half; dy <= half; dy++) {
                for (let dx = -half; dx <= half; dx++) {
                    const sx = this.x + dx;
                    const sy = this.y + dy;
                    
                    if (sx > 0 && sx < CONFIG.COLS - 1 && sy > 0 && sy < CONFIG.ROWS - 1) {
                        if (grid.grid[sy][sx] === 1) {
                            grid.grid[sy][sx] = 0;
                            grid.capturedCount--;
                            stolen++;
                            cells.push({ x: sx, y: sy });
                        }
                    }
                }
            }
            
            if (stolen > 0) {
                return { stolen, cells };
            }
        }
        return null;
    }
    
    doMoveThief(grid) {
        const directions = [
            { dx: 0, dy: -1 }, { dx: 1, dy: 0 },
            { dx: 0, dy: 1 }, { dx: -1, dy: 0 }
        ];
        
        // Проверяем, не застрял ли
        const currentValid = grid.isCaptured(this.x, this.y);
        if (!currentValid) {
            // Оказался на свободной клетке — ищем ближайшую захваченную
            for (const dir of directions) {
                if (grid.isCaptured(this.x + dir.dx, this.y + dir.dy)) {
                    this.x += dir.dx;
                    this.y += dir.dy;
                    return;
                }
            }
            // Ищем любую захваченную поблизости
            for (let r = 1; r < 5; r++) {
                for (let dy = -r; dy <= r; dy++) {
                    for (let dx = -r; dx <= r; dx++) {
                        if (grid.isCaptured(this.x + dx, this.y + dy)) {
                            this.x += dx > 0 ? 1 : dx < 0 ? -1 : 0;
                            this.y += dy > 0 ? 1 : dy < 0 ? -1 : 0;
                            return;
                        }
                    }
                }
            }
        }
        
        // Собираем все возможные направления по территории
        const validDirs = directions.filter(d => {
            const nx = this.x + d.dx;
            const ny = this.y + d.dy;
            return grid.isCaptured(nx, ny) && !(d.dx === -this.dx && d.dy === -this.dy);
        });
        
        if (validDirs.length > 0) {
            const dir = validDirs[Math.floor(Math.random() * validDirs.length)];
            this.dx = dir.dx;
            this.dy = dir.dy;
            this.x += this.dx;
            this.y += this.dy;
            this.stuckTimer = 0;
        } else {
            this.stuckTimer++;
            // Если застрял надолго — телепорт в случайную захваченную клетку
            if (this.stuckTimer > 20) {
                this.teleportToCaptured(grid);
                this.stuckTimer = 0;
            }
        }
    }
    
    teleportToCaptured(grid) {
        const captured = [];
        for (let y = 3; y < CONFIG.ROWS - 3; y++) {
            for (let x = 3; x < CONFIG.COLS - 3; x++) {
                if (grid.isCaptured(x, y)) captured.push({x, y});
            }
        }
        if (captured.length > 0) {
            const spot = captured[Math.floor(Math.random() * captured.length)];
            this.x = spot.x;
            this.y = spot.y;
        }
    }
    
    moveChaser(grid, targetX, targetY, hamsterIsOutside) {
        const dist = Math.hypot(targetX - this.x, targetY - this.y);
        
        if (hamsterIsOutside) {
            if (dist < 5) {
                if (Math.random() < 0.95) this.moveToward(targetX, targetY);
            } else if (dist < 12) {
                if (Math.random() < 0.8) this.moveToward(targetX, targetY);
                else this.randomDirection(grid);
            } else {
                if (Math.random() < 0.6) this.moveToward(targetX, targetY);
                else this.randomDirection(grid);
            }
        } else {
            this.movePatrol(grid, targetX, targetY, []);
            return;
        }
        
        this.applyMovement(grid);
    }
    
    moveToward(targetX, targetY) {
        const dx = targetX - this.x;
        const dy = targetY - this.y;
        
        if (Math.abs(dx) > Math.abs(dy)) {
            this.dx = dx > 0 ? 1 : -1;
            this.dy = 0;
        } else {
            this.dy = dy > 0 ? 1 : -1;
            this.dx = 0;
        }
    }
    
    movePatrol(grid, targetX, targetY, hamsterPath) {
        const directions = [
            { dx: 1, dy: 0 }, { dx: -1, dy: 0 },
            { dx: 0, dy: 1 }, { dx: 0, dy: -1 }
        ];
        
        if (hamsterPath && hamsterPath.length > 0) {
            const lastPath = hamsterPath[hamsterPath.length - 1];
            const distToPath = Math.hypot(lastPath.x - this.x, lastPath.y - this.y);
            
            if (distToPath < 5 && Math.random() < 0.7) {
                const dx = lastPath.x - this.x;
                const dy = lastPath.y - this.y;
                
                let dir;
                if (Math.abs(dx) > Math.abs(dy)) {
                    dir = { dx: dx > 0 ? 1 : -1, dy: 0 };
                } else {
                    dir = { dx: 0, dy: dy > 0 ? 1 : -1 };
                }
                
                if (!grid.isCaptured(this.x + dir.dx, this.y + dir.dy)) {
                    this.dx = dir.dx;
                    this.dy = dir.dy;
                    this.applyMovement(grid);
                    return;
                }
            }
        }
        
        let bestDir = { dx: this.dx, dy: this.dy };
        let bestScore = -Infinity;
        
        for (const dir of directions) {
            if (dir.dx === -this.dx && dir.dy === -this.dy) continue;
            
            const nx = this.x + dir.dx;
            const ny = this.y + dir.dy;
            
            if (grid.isCaptured(nx, ny)) continue;
            
            let capturedNeighbors = 0;
            for (const d of directions) {
                if (grid.isCaptured(nx + d.dx, ny + d.dy)) capturedNeighbors++;
            }
            
            const score = capturedNeighbors >= 1 && capturedNeighbors <= 2 ? 10 : 
                         capturedNeighbors === 3 ? 5 : 0;
            
            if (score > bestScore) {
                bestScore = score;
                bestDir = dir;
            }
        }
        
        if (bestScore <= 0) {
            const freeDirs = directions.filter(d => !grid.isCaptured(this.x + d.dx, this.y + d.dy));
            if (freeDirs.length > 0) {
                bestDir = freeDirs[Math.floor(Math.random() * freeDirs.length)];
            }
        }
        
        this.dx = bestDir.dx;
        this.dy = bestDir.dy;
        this.applyMovement(grid);
    }
    
    moveSnake(grid, targetX, targetY) {
        const dist = Math.hypot(targetX - this.x, targetY - this.y);
        
        if (dist < 6) {
            if (Math.random() < 0.8) {
                const dx = targetX - this.x;
                const dy = targetY - this.y;
                
                if (Math.abs(dx) > Math.abs(dy)) {
                    this.dx = 0;
                    this.dy = Math.random() > 0.5 ? 1 : -1;
                } else {
                    this.dy = 0;
                    this.dx = Math.random() > 0.5 ? 1 : -1;
                }
            } else {
                this.randomDirection(grid);
            }
        } else if (Math.random() < 0.5) {
            const dx = targetX - this.x;
            const dy = targetY - this.y;
            
            if (Math.abs(dx) > Math.abs(dy)) {
                this.dx = dx > 0 ? 1 : -1;
                this.dy = 0;
            } else {
                this.dy = dy > 0 ? 1 : -1;
                this.dx = 0;
            }
        } else {
            this.randomDirection(grid);
        }
        
        this.applyMovement(grid);
    }
    
    randomDirection(grid) {
        const dirs = [
            { dx: 1, dy: 0 }, { dx: -1, dy: 0 },
            { dx: 0, dy: 1 }, { dx: 0, dy: -1 }
        ];
        
        const freeDirs = dirs.filter(d => {
            const nx = this.x + d.dx;
            const ny = this.y + d.dy;
            return !grid.isCaptured(nx, ny) && !(d.dx === -this.dx && d.dy === -this.dy);
        });
        
        if (freeDirs.length > 0) {
            const dir = freeDirs[Math.floor(Math.random() * freeDirs.length)];
            this.dx = dir.dx;
            this.dy = dir.dy;
        }
    }
    
    applyMovement(grid) {
        let newX = this.x + this.dx;
        let newY = this.y + this.dy;
        
        if (grid.isCaptured(newX, newY)) {
            const tempDx = this.dx;
            const tempDy = this.dy;
            
            this.dx = -tempDx;
            this.dy = -tempDy;
            newX = this.x + this.dx;
            newY = this.y + this.dy;
            
            if (grid.isCaptured(newX, newY)) {
                const dirs = [
                    { dx: 1, dy: 0 }, { dx: -1, dy: 0 },
                    { dx: 0, dy: 1 }, { dx: 0, dy: -1 }
                ];
                let found = false;
                for (const dir of dirs) {
                    const tx = this.x + dir.dx;
                    const ty = this.y + dir.dy;
                    if (!grid.isCaptured(tx, ty)) {
                        this.dx = dir.dx;
                        this.dy = dir.dy;
                        newX = tx;
                        newY = ty;
                        found = true;
                        break;
                    }
                }
                if (!found) {
                    this.dx = 0;
                    this.dy = 0;
                    return;
                }
            }
        }
        
        this.x = newX;
        this.y = newY;
    }
    
    getPosition() {
        return { x: this.x, y: this.y };
    }
}

class GhostManager {
    constructor() {
        this.ghosts = [];
        this.thiefAdded = false;
    }
    
    reset(hamsterX, hamsterY, grid) {
        this.ghosts = [];
        this.thiefAdded = false;
        this.addGhost(hamsterX, hamsterY, grid, 'chaser');
        this.addGhost(hamsterX, hamsterY, grid, 'patrol');
        this.addGhost(hamsterX, hamsterY, grid, 'snake');
    }
    
    addGhost(hamsterX, hamsterY, grid, type) {
        if (this.ghosts.length >= CONFIG.MAX_GHOSTS) return;
        
        let gx, gy;
        let attempts = 0;
        
        if (type === 'thief') {
            // Вор ищет захваченную клетку
            const captured = [];
            for (let y = 2; y < CONFIG.ROWS - 2; y++) {
                for (let x = 2; x < CONFIG.COLS - 2; x++) {
                    if (grid.isCaptured(x, y)) captured.push({x, y});
                }
            }
            if (captured.length === 0) return; // нет места
            const spot = captured[Math.floor(Math.random() * captured.length)];
            gx = spot.x;
            gy = spot.y;
        } else {
            do {
                gx = Math.floor(Math.random() * (CONFIG.COLS - 6)) + 3;
                gy = Math.floor(Math.random() * (CONFIG.ROWS - 6)) + 3;
                attempts++;
            } while ((grid.isCaptured(gx, gy) || 
                      (Math.abs(gx - hamsterX) < 5 && Math.abs(gy - hamsterY) < 5)) 
                      && attempts < 100);
            if (attempts >= 100) return;
        }
        
        this.ghosts.push(new Ghost(gx, gy, type));
    }
    
    checkThresholds(percent, hamsterX, hamsterY, grid) {
        // Вор при 10%
        if (percent >= CONFIG.THIEF_APPEAR_AT && !this.thiefAdded) {
            this.addGhost(hamsterX, hamsterY, grid, 'thief');
            this.thiefAdded = true;
        }
        if (percent >= CONFIG.GHOST_THRESHOLD_1 && this.ghosts.length < 5) {
            this.addGhost(hamsterX, hamsterY, grid, 'patrol');
        }
        if (percent >= CONFIG.GHOST_THRESHOLD_2 && this.ghosts.length < 6) {
            this.addGhost(hamsterX, hamsterY, grid, 'snake');
        }
        if (percent >= CONFIG.GHOST_THRESHOLD_3 && this.ghosts.length < 7) {
            this.addGhost(hamsterX, hamsterY, grid, 'chaser');
        }
    }
    
    update(grid, targetX, targetY, hamsterIsOutside, hamsterPath, timestamp) {
        for (const ghost of this.ghosts) {
            const stealResult = ghost.move(grid, targetX, targetY, hamsterIsOutside, hamsterPath, timestamp);
            
            if (stealResult && stealResult.stolen > 0 && window._onSteal) {
                window._onSteal(stealResult.cells);
            }
        }
    }
    
    checkCollision(x, y) {
        for (const ghost of this.ghosts) {
            if (ghost.type === 'thief') continue;
            
            if (ghost.x === x && ghost.y === y) {
                return true;
            }
            
            if (ghost.type === 'snake') {
                for (const trail of ghost.trail) {
                    if (trail.x === x && trail.y === y) {
                        return true;
                    }
                }
            }
        }
        return false;
    }
    
    count() {
        return this.ghosts.length;
    }
    
    getAll() {
        return this.ghosts;
    }
}
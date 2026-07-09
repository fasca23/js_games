class Ghost {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.dx = Math.random() > 0.5 ? 1 : -1;
        this.dy = 0;
        this.type = type;
        this.trail = []; // след для змейки
        this.trailTimer = 0;
        this.stunned = false;
        this.stunTimer = 0;
        
        if (Math.random() > 0.5) {
            this.dx = 0;
            this.dy = Math.random() > 0.5 ? 1 : -1;
        }
    }
    
    move(grid, targetX, targetY) {
        if (this.stunned) {
            this.stunTimer--;
            if (this.stunTimer <= 0) this.stunned = false;
            return;
        }
        
        // Обновляем след змейки
        if (this.type === 'snake') {
            this.trail.push({ x: this.x, y: this.y });
            if (this.trail.length > 15) this.trail.shift();
        }
        
        switch(this.type) {
            case 'chaser':
                this.moveChaser(grid, targetX, targetY);
                break;
            case 'patrol':
                this.movePatrol(grid);
                break;
            case 'snake':
                this.moveSnake(grid, targetX, targetY);
                break;
        }
    }
    
    moveChaser(grid, targetX, targetY) {
        // Преследует хомяка
        if (Math.random() < 0.85) {
            const dx = targetX - this.x;
            const dy = targetY - this.y;
            
            if (Math.abs(dx) > Math.abs(dy)) {
                this.dx = dx > 0 ? 1 : -1;
                this.dy = 0;
            } else {
                this.dy = dy > 0 ? 1 : -1;
                this.dx = 0;
            }
        } else if (Math.random() < 0.3) {
            // Иногда случайное движение
            const dirs = [{ dx: 1, dy: 0 }, { dx: -1, dy: 0 }, { dx: 0, dy: 1 }, { dx: 0, dy: -1 }];
            const dir = dirs[Math.floor(Math.random() * dirs.length)];
            this.dx = dir.dx;
            this.dy = dir.dy;
        }
        
        this.applyMovement(grid);
    }
    
    movePatrol(grid) {
        // Патрулирует вдоль границы территории
        const directions = [
            { dx: 1, dy: 0 }, { dx: -1, dy: 0 },
            { dx: 0, dy: 1 }, { dx: 0, dy: -1 }
        ];
        
        // Предпочитает держаться рядом с границей территории
        let bestDir = { dx: this.dx, dy: this.dy };
        let bestScore = -Infinity;
        
        for (const dir of directions) {
            if (dir.dx === -this.dx && dir.dy === -this.dy) continue;
            
            const nx = this.x + dir.dx;
            const ny = this.y + dir.dy;
            
            if (grid.isCaptured(nx, ny)) continue;
            
            // Считаем количество соседних захваченных клеток
            let capturedNeighbors = 0;
            for (const d of directions) {
                if (grid.isCaptured(nx + d.dx, ny + d.dy)) capturedNeighbors++;
            }
            
            // Патрульный любит границы (1-3 захваченных соседа)
            const score = capturedNeighbors >= 1 && capturedNeighbors <= 3 ? 10 : 0;
            
            if (score > bestScore) {
                bestScore = score;
                bestDir = dir;
            }
        }
        
        if (bestScore === -Infinity) {
            // Если нет хорошего направления, случайное
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
        // Оставляет след, преследует хомяка
        if (Math.random() < 0.7) {
            const dx = targetX - this.x;
            const dy = targetY - this.y;
            
            // Предпочитает двигаться перпендикулярно, чтобы отрезать путь
            if (Math.abs(dx) > Math.abs(dy)) {
                this.dy = dy > 0 ? 1 : -1;
                this.dx = 0;
            } else {
                this.dx = dx > 0 ? 1 : -1;
                this.dy = 0;
            }
        } else {
            const dirs = [{ dx: 1, dy: 0 }, { dx: -1, dy: 0 }, { dx: 0, dy: 1 }, { dx: 0, dy: -1 }];
            const dir = dirs[Math.floor(Math.random() * dirs.length)];
            this.dx = dir.dx;
            this.dy = dir.dy;
        }
        
        this.applyMovement(grid);
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
    }
    
    reset(hamsterX, hamsterY, grid) {
        this.ghosts = [];
        
        // 1 преследователь
        this.addGhost(hamsterX, hamsterY, grid, 'chaser');
        // 1 патрульный
        this.addGhost(hamsterX, hamsterY, grid, 'patrol');
        // 1 змейка
        this.addGhost(hamsterX, hamsterY, grid, 'snake');
    }
    
    addGhost(hamsterX, hamsterY, grid, type) {
        if (this.ghosts.length >= CONFIG.MAX_GHOSTS) return;
        
        let gx, gy;
        let attempts = 0;
        do {
            gx = Math.floor(Math.random() * (CONFIG.COLS - 4)) + 2;
            gy = Math.floor(Math.random() * (CONFIG.ROWS - 4)) + 2;
            attempts++;
        } while ((grid.isCaptured(gx, gy) || (gx === hamsterX && gy === hamsterY)) && attempts < 100);
        
        if (attempts < 100) {
            this.ghosts.push(new Ghost(gx, gy, type));
        }
    }
    
    checkThresholds(percent, hamsterX, hamsterY, grid) {
        // Добавляем дополнительного преследователя
        if (percent >= CONFIG.GHOST_THRESHOLD_1 && this.ghosts.length < 4) {
            this.addGhost(hamsterX, hamsterY, grid, 'chaser');
        }
        if (percent >= CONFIG.GHOST_THRESHOLD_2 && this.ghosts.length < 5) {
            this.addGhost(hamsterX, hamsterY, grid, 'snake');
        }
    }
    
    update(grid, targetX, targetY) {
        for (const ghost of this.ghosts) {
            ghost.move(grid, targetX, targetY);
        }
    }
    
    checkCollision(x, y) {
        for (const ghost of this.ghosts) {
            // Проверка столкновения с призраком
            if (ghost.x === x && ghost.y === y) {
                return true;
            }
            
            // Проверка столкновения со следом змейки
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
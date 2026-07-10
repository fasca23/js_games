class Ghost {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.dx = Math.random() > 0.5 ? 1 : -1;
        this.dy = 0;
        this.type = type;
        this.trail = [];
        this.stunned = false;
        this.stunTimer = 0;
        
        if (Math.random() > 0.5) {
            this.dx = 0;
            this.dy = Math.random() > 0.5 ? 1 : -1;
        }
    }
    
    move(grid, targetX, targetY, hamsterIsOutside, hamsterPath) {
        if (this.stunned) {
            this.stunTimer--;
            if (this.stunTimer <= 0) this.stunned = false;
            return;
        }
        
        // Обновляем след змейки
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
        }
    }
    
    moveChaser(grid, targetX, targetY, hamsterIsOutside) {
        const dist = Math.hypot(targetX - this.x, targetY - this.y);
        
        if (hamsterIsOutside) {
            // Хомяк снаружи - всегда преследуем, но с разной точностью
            if (dist < 5) {
                // Близко - агрессивно, 95% точность
                if (Math.random() < 0.95) {
                    this.moveToward(targetX, targetY);
                }
            } else if (dist < 12) {
                // Средне - 80% точность
                if (Math.random() < 0.8) {
                    this.moveToward(targetX, targetY);
                } else {
                    this.randomDirection(grid);
                }
            } else {
                // Далеко - 60% точность
                if (Math.random() < 0.6) {
                    this.moveToward(targetX, targetY);
                } else {
                    this.randomDirection(grid);
                }
            }
        } else {
            // Хомяк на территории - патрулируем у границы
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
        
        // Если хомяк прокладывает путь - пытаемся перехватить
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
        
        // Обычное патрулирование вдоль границ
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
    }
    
    reset(hamsterX, hamsterY, grid) {
        this.ghosts = [];
        this.addGhost(hamsterX, hamsterY, grid, 'chaser');
        this.addGhost(hamsterX, hamsterY, grid, 'patrol');
        this.addGhost(hamsterX, hamsterY, grid, 'snake');
    }
    
    addGhost(hamsterX, hamsterY, grid, type) {
        if (this.ghosts.length >= CONFIG.MAX_GHOSTS) return;
        
        let gx, gy;
        let attempts = 0;
        do {
            gx = Math.floor(Math.random() * (CONFIG.COLS - 6)) + 3;
            gy = Math.floor(Math.random() * (CONFIG.ROWS - 6)) + 3;
            attempts++;
        } while ((grid.isCaptured(gx, gy) || 
                  (Math.abs(gx - hamsterX) < 5 && Math.abs(gy - hamsterY) < 5)) 
                  && attempts < 100);
        
        if (attempts < 100) {
            this.ghosts.push(new Ghost(gx, gy, type));
        }
    }
    
    checkThresholds(percent, hamsterX, hamsterY, grid) {
        if (percent >= CONFIG.GHOST_THRESHOLD_1 && this.ghosts.length < 4) {
            this.addGhost(hamsterX, hamsterY, grid, 'patrol');
        }
        if (percent >= CONFIG.GHOST_THRESHOLD_2 && this.ghosts.length < 5) {
            this.addGhost(hamsterX, hamsterY, grid, 'snake');
        }
    }
    
    update(grid, targetX, targetY, hamsterIsOutside, hamsterPath) {
        for (const ghost of this.ghosts) {
            ghost.move(grid, targetX, targetY, hamsterIsOutside, hamsterPath);
        }
    }
    
    checkCollision(x, y) {
        for (const ghost of this.ghosts) {
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
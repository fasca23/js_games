class Ghost {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.dx = 0;
        this.dy = 0;
        this.color = color;
        this.startX = x;
        this.startY = y;
    }
    
    reset() {
        this.x = this.startX;
        this.y = this.startY;
        this.dx = 0;
        this.dy = 0;
    }
    
    move(map, mode, target) {
        const cellX = Math.floor(this.x);
        const cellY = Math.floor(this.y);
        
        const possibleDirs = this.getPossibleDirections(cellX, cellY, map, mode);
        
        if (possibleDirs.length > 0) {
            const chosenDir = this.chooseDirection(possibleDirs, mode, target);
            this.dx = chosenDir.dx;
            this.dy = chosenDir.dy;
        }
        
        const speed = mode === 'frightened' ? CONFIG.GHOST_FRIGHTENED_SPEED : CONFIG.GHOST_SPEED;
        const newX = this.x + this.dx * speed;
        const newY = this.y + this.dy * speed;
        
        if (canMoveTo(newX, newY, map)) {
            this.x = newX;
            this.y = newY;
            
            if (this.x < 0) this.x = CONFIG.COLS - 1;
            if (this.x >= CONFIG.COLS) this.x = 0;
        }
    }
    
    getPossibleDirections(cellX, cellY, map, mode) {
        const directions = [
            { dx: 0, dy: -1 },
            { dx: 1, dy: 0 },
            { dx: 0, dy: 1 },
            { dx: -1, dy: 0 }
        ];
        
        const possible = [];
        
        for (const dir of directions) {
            // В режиме испуга призраки могут разворачиваться
            if (mode !== 'frightened') {
                if (dir.dx === -this.dx && dir.dy === -this.dy) {
                    let hasOtherPaths = false;
                    for (const otherDir of directions) {
                        if (otherDir !== dir && 
                            !(otherDir.dx === -this.dx && otherDir.dy === -this.dy)) {
                            const nx = cellX + otherDir.dx;
                            const ny = cellY + otherDir.dy;
                            if (canMoveTo(nx, ny, map)) {
                                hasOtherPaths = true;
                                break;
                            }
                        }
                    }
                    if (hasOtherPaths) continue;
                }
            }
            
            const nextX = cellX + dir.dx;
            const nextY = cellY + dir.dy;
            
            if (canMoveTo(nextX, nextY, map)) {
                possible.push(dir);
            }
        }
        
        return possible;
    }
    
    chooseDirection(possibleDirs, mode, target) {
        if (mode === 'frightened') {
            // В режиме испуга убегают от пакмана (выбирают дальнее направление)
            return possibleDirs.reduce((best, dir) => {
                const cellX = Math.floor(this.x);
                const cellY = Math.floor(this.y);
                const dist = Math.hypot(
                    cellX + dir.dx - target.x,
                    cellY + dir.dy - target.y
                );
                return dist > best.dist ? { dir, dist } : best;
            }, { dir: possibleDirs[0], dist: -Infinity }).dir;
        }
        
        // В обычном режиме преследуют пакмана
        return possibleDirs.reduce((best, dir) => {
            const cellX = Math.floor(this.x);
            const cellY = Math.floor(this.y);
            const dist = Math.hypot(
                cellX + dir.dx - target.x,
                cellY + dir.dy - target.y
            );
            return dist < best.dist ? { dir, dist } : best;
        }, { dir: possibleDirs[0], dist: Infinity }).dir;
    }
    
    getPosition() {
        return { x: this.x, y: this.y };
    }
}

class GhostManager {
    constructor() {
        this.ghosts = [];
        this.mode = 'chase';
        this.modeTimer = 0;  // Добавлен таймер
        
        this.init();
    }
    
    init() {
        this.ghosts = [
            new Ghost(1, 1, CONFIG.COLORS.GHOSTS[0]),    // Blinky - левый верх
            new Ghost(19, 19, CONFIG.COLORS.GHOSTS[3])    // Clyde - правый низ
        ];
    }
    
    reset() {
        this.ghosts.forEach(g => g.reset());
        this.mode = 'chase';
        this.modeTimer = 0;
    }
    
    update(map, pacmanPos) {
        // Обработка таймера режима испуга
        if (this.modeTimer > 0) {
            this.modeTimer--;
            if (this.modeTimer === 0 && this.mode === 'frightened') {
                this.mode = 'chase';  // Возвращаемся в режим преследования
            }
        }
        
        this.ghosts.forEach((ghost, index) => {
            const target = this.getChaseTarget(index, pacmanPos);
            ghost.move(map, this.mode, target);
        });
    }
    
    getChaseTarget(index, pacmanPos) {
        return { x: pacmanPos.x, y: pacmanPos.y };
    }
    
    setFrightened() {
        this.mode = 'frightened';
        this.modeTimer = CONFIG.FRIGHTENED_DURATION;
    }

    checkCollisions(pacmanPos) {
        for (const ghost of this.ghosts) {
            const dist = Math.hypot(
                pacmanPos.x - ghost.x,
                pacmanPos.y - ghost.y
            );
            
            if (dist < 1.0) {
                if (this.mode === 'frightened') {
                    // Съедаем призрака
                    ghost.x = ghost.startX;
                    ghost.y = ghost.startY;
                    ghost.dx = 0;
                    ghost.dy = 0;
                    return 'eaten';
                } else {
                    // Призрак съедает пакмана
                    return 'kill';
                }
            }
        }
        
        return null;
    }
    
    getMode() {
        return this.mode;  // Добавлен метод для получения режима
    }
    
    getAllPositions() {
        return this.ghosts.map(g => ({
            x: g.x,
            y: g.y,
            dx: g.dx,
            dy: g.dy,
            color: g.color
        }));
    }
}
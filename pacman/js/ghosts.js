class Ghost {
    constructor(x, y, color, exitDelay) {
        this.x = x;
        this.y = y;
        this.dx = 0;
        this.dy = 0;
        this.color = color;
        this.exitTimer = exitDelay;
        this.startX = x;
        this.startY = y;
        this.speed = 1.0;
    }
    
    reset() {
        this.x = this.startX;
        this.y = this.startY;
        this.dx = 0;
        this.dy = 0;
        this.exitTimer = 0; // Сразу активны
        this.speed = 1.0;
    }
    
    move(map, mode, target) {
        // Без задержки выхода - сразу атакуют
        if (this.exitTimer > 0) {
            this.exitTimer = 0;
            this.x = 10;
            this.y = 8;
        }
        
        const cellX = Math.floor(this.x);
        const cellY = Math.floor(this.y);
        
        const possibleDirs = this.getPossibleDirections(cellX, cellY, map, mode);
        
        if (possibleDirs.length > 0) {
            const chosenDir = this.chooseDirection(possibleDirs, mode, target);
            this.dx = chosenDir.dx;
            this.dy = chosenDir.dy;
        }
        
        // Максимальная скорость
        const speedMultiplier = mode === 'frightened' ? 0.6 : this.speed;
        const newX = this.x + this.dx * speedMultiplier;
        const newY = this.y + this.dy * speedMultiplier;
        
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
            // Никогда не разворачиваемся, кроме тупиков
            if (mode !== 'frightened') {
                if (dir.dx === -this.dx && dir.dy === -this.dy) {
                    // Проверяем, есть ли другие пути
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
            // Убегают от пакмана
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
        
        // Всегда выбираем оптимальный путь к цели
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
        this.mode = 'chase'; // Всегда преследуют
        this.modeTimer = 9999; // Бесконечное преследование
        this.scatterTargets = [
            { x: CONFIG.COLS - 2, y: 1 },
            { x: 1, y: 1 },
            { x: CONFIG.COLS - 2, y: CONFIG.ROWS - 2 },
            { x: 1, y: CONFIG.ROWS - 2 }
        ];
        
        this.init();
    }
    
    init() {
        // Все призраки сразу активны и быстрые
        this.ghosts = [
            new Ghost(9, 8, CONFIG.COLORS.GHOSTS[0], 0),    // Blinky - сразу
            new Ghost(10, 8, CONFIG.COLORS.GHOSTS[1], 0),    // Pinky - сразу
            new Ghost(11, 8, CONFIG.COLORS.GHOSTS[2], 0),    // Inky - сразу
            new Ghost(10, 9, CONFIG.COLORS.GHOSTS[3], 0)     // Clyde - сразу
        ];
        
        // Все быстрее пакмана
        this.ghosts[0].speed = 1.4; // Blinky - очень быстрый
        this.ghosts[1].speed = 1.3; // Pinky - быстрый
        this.ghosts[2].speed = 1.2; // Inky - быстрый
        this.ghosts[3].speed = 1.1; // Clyde - чуть быстрее пакмана
    }
    
    reset() {
        this.ghosts.forEach(g => g.reset());
        this.mode = 'chase';
        this.modeTimer = 9999;
        
        // Восстанавливаем скорости
        this.ghosts[0].speed = 1.4;
        this.ghosts[1].speed = 1.3;
        this.ghosts[2].speed = 1.2;
        this.ghosts[3].speed = 1.1;
    }
    
    update(map, pacmanPos) {
        // Всегда в режиме преследования
        this.mode = 'chase';
        
        this.ghosts.forEach((ghost, index) => {
            // Разные стратегии атаки
            const target = this.getChaseTarget(index, pacmanPos, map);
            ghost.move(map, this.mode, target);
        });
    }
    
    getChaseTarget(index, pacmanPos, map) {
        switch(index) {
            case 0: // Blinky - напрямую к пакману
                return pacmanPos;
                
            case 1: // Pinky - забегает вперед на 4 клетки
                return {
                    x: pacmanPos.x + 4,
                    y: pacmanPos.y + 4
                };
                
            case 2: // Inky - пытается окружить
                const blinky = this.ghosts[0].getPosition();
                return {
                    x: pacmanPos.x + (pacmanPos.x - blinky.x) * 2,
                    y: pacmanPos.y + (pacmanPos.y - blinky.y) * 2
                };
                
            case 3: // Clyde - атакует с другой стороны
                const pinky = this.ghosts[1].getPosition();
                return {
                    x: pacmanPos.x - (pinky.x - pacmanPos.x),
                    y: pacmanPos.y - (pinky.y - pacmanPos.y)
                };
        }
    }
    
    setFrightened() {
        this.mode = 'frightened';
        this.modeTimer = 100; // Очень короткий режим испуга
    }
    
    checkCollisions(pacmanPos) {
        for (const ghost of this.ghosts) {
            const dist = Math.hypot(
                pacmanPos.x - ghost.x,
                pacmanPos.y - ghost.y
            );
            
            // Большой радиус поражения
            if (dist < 1.2) {
                if (this.mode === 'frightened') {
                    ghost.x = 10;
                    ghost.y = 9;
                    ghost.exitTimer = 0; // Сразу возвращаются
                    return 'eaten';
                } else {
                    return 'kill';
                }
            }
        }
        
        return null;
    }
    
    getAllPositions() {
        return this.ghosts.map(g => ({
            x: g.x,
            y: g.y,
            dx: g.dx,
            dy: g.dy,
            color: g.color,
            exitTimer: g.exitTimer
        }));
    }
}
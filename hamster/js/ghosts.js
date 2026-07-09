class Ghost {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.dx = Math.random() > 0.5 ? 1 : -1;
        this.dy = 0;
        this.type = type;
        
        if (Math.random() > 0.5) {
            this.dx = 0;
            this.dy = Math.random() > 0.5 ? 1 : -1;
        }
    }
    
    move(grid, targetX, targetY) {
        // Преследователь
        if (this.type === 'chaser' && Math.random() < 0.8) {
            const dx = targetX - this.x;
            const dy = targetY - this.y;
            
            if (Math.abs(dx) > Math.abs(dy)) {
                this.dx = dx > 0 ? 1 : -1;
                this.dy = 0;
            } else {
                this.dy = dy > 0 ? 1 : -1;
                this.dx = 0;
            }
        } else if (Math.random() < 0.2) {
            const dirs = [
                { dx: 1, dy: 0 }, { dx: -1, dy: 0 },
                { dx: 0, dy: 1 }, { dx: 0, dy: -1 }
            ];
            const dir = dirs[Math.floor(Math.random() * dirs.length)];
            this.dx = dir.dx;
            this.dy = dir.dy;
        }
        
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
        for (let i = 0; i < CONFIG.INITIAL_GHOSTS; i++) {
            this.addGhost(hamsterX, hamsterY, grid);
        }
    }
    
    addGhost(hamsterX, hamsterY, grid) {
        if (this.ghosts.length >= CONFIG.MAX_GHOSTS) return;
        
        let gx, gy;
        do {
            gx = Math.floor(Math.random() * (CONFIG.COLS - 4)) + 2;
            gy = Math.floor(Math.random() * (CONFIG.ROWS - 4)) + 2;
        } while (grid.isCaptured(gx, gy) || (gx === hamsterX && gy === hamsterY));
        
        this.ghosts.push(new Ghost(
            gx, gy,
            Math.random() > 0.5 ? 'chaser' : 'random'
        ));
    }
    
    checkThresholds(percent, hamsterX, hamsterY, grid) {
        if (percent >= CONFIG.GHOST_THRESHOLD_1 && this.ghosts.length < 3) this.addGhost(hamsterX, hamsterY, grid);
        if (percent >= CONFIG.GHOST_THRESHOLD_2 && this.ghosts.length < 4) this.addGhost(hamsterX, hamsterY, grid);
        if (percent >= CONFIG.GHOST_THRESHOLD_3 && this.ghosts.length < 5) this.addGhost(hamsterX, hamsterY, grid);
    }
    
    update(grid, targetX, targetY) {
        for (const ghost of this.ghosts) {
            ghost.move(grid, targetX, targetY);
        }
    }
    
    checkCollision(x, y) {
        for (const ghost of this.ghosts) {
            if (ghost.x === x && ghost.y === y) {
                return true;
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
class Grid {
    constructor() {
        this.grid = [];
        this.capturedCount = 0;
        this.reset();
    }
    
    reset() {
        this.grid = [];
        for (let y = 0; y < CONFIG.ROWS; y++) {
            this.grid[y] = [];
            for (let x = 0; x < CONFIG.COLS; x++) {
                if (x === 0 || x === CONFIG.COLS - 1 || y === 0 || y === CONFIG.ROWS - 1) {
                    this.grid[y][x] = 2; // граница
                } else {
                    this.grid[y][x] = 0; // свободно
                }
            }
        }
        // Границы + стартовая клетка
        this.capturedCount = (CONFIG.COLS * 2 + CONFIG.ROWS * 2 - 4);
    }
    
    capture(x, y) {
        if (this.grid[y][x] === 0) {
            this.grid[y][x] = 1;
            this.capturedCount++;
        }
    }
    
    captureArea(cells) {
        let captured = 0;
        for (const cell of cells) {
            if (this.grid[cell.y][cell.x] === 0) {
                this.grid[cell.y][cell.x] = 1;
                captured++;
            }
        }
        this.capturedCount += captured;
        return captured;
    }
    
    isCaptured(x, y) {
        if (x < 0 || x >= CONFIG.COLS || y < 0 || y >= CONFIG.ROWS) return true;
        return this.grid[y][x] === 1 || this.grid[y][x] === 2;
    }
    
    isFree(x, y) {
        if (x < 0 || x >= CONFIG.COLS || y < 0 || y >= CONFIG.ROWS) return false;
        return this.grid[y][x] === 0;
    }
    
    getPercent() {
        return Math.floor((this.capturedCount / (CONFIG.COLS * CONFIG.ROWS)) * 100);
    }
    
    findSafeSpot(ghosts, excludeX, excludeY, minDist) {
        const spots = [];
        for (let y = 0; y < CONFIG.ROWS; y++) {
            for (let x = 0; x < CONFIG.COLS; x++) {
                if (this.isCaptured(x, y)) {
                    let ghostNearby = false;
                    for (const ghost of ghosts) {
                        if (Math.abs(ghost.x - x) <= minDist && Math.abs(ghost.y - y) <= minDist) {
                            ghostNearby = true;
                            break;
                        }
                    }
                    if (!ghostNearby) {
                        spots.push({ x, y });
                    }
                }
            }
        }
        return spots;
    }
}
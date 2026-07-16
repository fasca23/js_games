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
        this.recount();
    }
    
    recount() {
        this.capturedCount = 0;
        for (let y = 0; y < CONFIG.ROWS; y++) {
            for (let x = 0; x < CONFIG.COLS; x++) {
                if (this.grid[y][x] === 1 || this.grid[y][x] === 2) {
                    this.capturedCount++;
                }
            }
        }
    }
    
    capture(x, y) {
        if (this.grid[y][x] === 0) {
            this.grid[y][x] = 1;
            this.capturedCount++;
        }
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
    let innerCaptured = 0;
    let innerTotal = 0;
    for (let y = 1; y < CONFIG.ROWS - 1; y++) {
        for (let x = 1; x < CONFIG.COLS - 1; x++) {
            innerTotal++;
            if (this.grid[y][x] === 1 || this.grid[y][x] === 2) {
                innerCaptured++;
            }
        }
    }
    if (innerTotal === 0) return 0;
    return Math.floor((innerCaptured / innerTotal) * 100);
}
    
    findSafeSpot(ghosts, minDist) {
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
    
captureEnclosedArea(pathCells) {
    const tempGrid = this.grid.map(row => [...row]);
    
    for (const cell of pathCells) {
        if (cell.x >= 0 && cell.x < CONFIG.COLS && cell.y >= 0 && cell.y < CONFIG.ROWS) {
            tempGrid[cell.y][cell.x] = 2;
        }
    }
    
    if (pathCells.length === 0) return { captured: 0, killedGhosts: [] };
    
    const midPath = pathCells[Math.floor(pathCells.length / 2)];
    
    const directions = [
        { dx: 1, dy: 0 }, { dx: -1, dy: 0 },
        { dx: 0, dy: 1 }, { dx: 0, dy: -1 }
    ];
    
    let bestArea = null;
    let bestSize = Infinity;
    let touchesEdge = false;
    
    for (const dir of directions) {
        const startX = midPath.x + dir.dx;
        const startY = midPath.y + dir.dy;
        
        if (startX < 0 || startX >= CONFIG.COLS || startY < 0 || startY >= CONFIG.ROWS) continue;
        if (tempGrid[startY][startX] !== 0) continue;
        
        const area = [];
        const queue = [{ x: startX, y: startY }];
        const visited = new Set();
        let edge = false;
        
        while (queue.length > 0) {
            const { x, y } = queue.shift();
            const key = `${x},${y}`;
            
            if (visited.has(key)) continue;
            if (x < 0 || x >= CONFIG.COLS || y < 0 || y >= CONFIG.ROWS) continue;
            if (tempGrid[y][x] !== 0) continue;
            
            // Проверка на край
            if (x === 0 || x === CONFIG.COLS - 1 || y === 0 || y === CONFIG.ROWS - 1) {
                edge = true;
            }
            
            visited.add(key);
            area.push({ x, y });
            
            queue.push({ x: x + 1, y });
            queue.push({ x: x - 1, y });
            queue.push({ x, y: y + 1 });
            queue.push({ x, y: y - 1 });
        }
        
        // Выбираем меньшую область
        if (area.length > 0 && area.length < bestSize) {
            bestSize = area.length;
            bestArea = area;
            touchesEdge = edge;
        }
    }
    
    const captured = [];
    
    if (bestArea && bestSize < (CONFIG.COLS * CONFIG.ROWS) * 0.5) {
        for (const cell of bestArea) {
            if (this.grid[cell.y][cell.x] === 0) {
                this.grid[cell.y][cell.x] = 1;
                this.capturedCount++;
                captured.push(cell);
            }
        }
        for (const cell of pathCells) {
            if (this.grid[cell.y][cell.x] === 0) {
                this.grid[cell.y][cell.x] = 1;
                this.capturedCount++;
                captured.push(cell);
            }
        }
    }
    
    return { captured: captured.length, killedGhosts: [] };
}
}
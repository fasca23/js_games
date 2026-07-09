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
        this.capturedCount = (CONFIG.COLS * 2 + CONFIG.ROWS * 2 - 4);
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
        return Math.floor((this.capturedCount / (CONFIG.COLS * CONFIG.ROWS)) * 100);
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
    
    // Flood fill для захвата замкнутой области
    captureEnclosedArea(pathCells) {
        // Создаем временную карту с путем
        const tempGrid = this.grid.map(row => [...row]);
        
        // Отмечаем путь как границу
        for (const cell of pathCells) {
            if (cell.x >= 0 && cell.x < CONFIG.COLS && cell.y >= 0 && cell.y < CONFIG.ROWS) {
                tempGrid[cell.y][cell.x] = 2; // временная граница
            }
        }
        
        // Находим область, которая закрашивается
        // Проверяем соседние клетки пути - какая сторона меньше
        const captured = [];
        const killedGhosts = [];
        
        // Проверяем 4 направления от середины пути
        const midPath = pathCells[Math.floor(pathCells.length / 2)];
        
        const directions = [
            { dx: 1, dy: 0 }, { dx: -1, dy: 0 },
            { dx: 0, dy: 1 }, { dx: 0, dy: -1 }
        ];
        
        for (const dir of directions) {
            const startX = midPath.x + dir.dx;
            const startY = midPath.y + dir.dy;
            
            if (startX < 0 || startX >= CONFIG.COLS || startY < 0 || startY >= CONFIG.ROWS) continue;
            if (tempGrid[startY][startX] !== 0) continue;
            
            // Flood fill
            const area = [];
            const queue = [{ x: startX, y: startY }];
            const visited = new Set();
            
            while (queue.length > 0) {
                const { x, y } = queue.shift();
                const key = `${x},${y}`;
                
                if (visited.has(key)) continue;
                if (x < 0 || x >= CONFIG.COLS || y < 0 || y >= CONFIG.ROWS) continue;
                if (tempGrid[y][x] !== 0) continue;
                
                visited.add(key);
                area.push({ x, y });
                
                queue.push({ x: x + 1, y });
                queue.push({ x: x - 1, y });
                queue.push({ x, y: y + 1 });
                queue.push({ x, y: y - 1 });
            }
            
            // Если область не граничит с краем - это замкнутая область
            let touchesEdge = false;
            for (const cell of area) {
                if (cell.x === 0 || cell.x === CONFIG.COLS - 1 || 
                    cell.y === 0 || cell.y === CONFIG.ROWS - 1) {
                    touchesEdge = true;
                    break;
                }
                // Проверяем соседей
                for (const d of directions) {
                    const nx = cell.x + d.dx;
                    const ny = cell.y + d.dy;
                    if (nx < 0 || nx >= CONFIG.COLS || ny < 0 || ny >= CONFIG.ROWS) {
                        touchesEdge = true;
                        break;
                    }
                }
                if (touchesEdge) break;
            }
            
            // Если не касается края и меньше 50% поля - захватываем
            if (!touchesEdge && area.length > 0 && area.length < (CONFIG.COLS * CONFIG.ROWS) * 0.5) {
                for (const cell of area) {
                    if (this.grid[cell.y][cell.x] === 0) {
                        this.grid[cell.y][cell.x] = 1;
                        this.capturedCount++;
                        captured.push(cell);
                    }
                }
                // Захватываем и сам путь
                for (const cell of pathCells) {
                    if (this.grid[cell.y][cell.x] === 0) {
                        this.grid[cell.y][cell.x] = 1;
                        this.capturedCount++;
                        captured.push(cell);
                    }
                }
                break;
            }
        }
        
        return { captured: captured.length, killedGhosts };
    }
}
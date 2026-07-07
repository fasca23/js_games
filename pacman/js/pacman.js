class Pacman {
    constructor() {
        this.reset();
    }
    
    reset() {
        this.x = 10;
        this.y = 15;
        this.dx = 0;
        this.dy = 0;
    }
    
    setDirection(dx, dy) {
        this.dx = dx;
        this.dy = dy;
    }
    
    move(map) {
        if (this.dx === 0 && this.dy === 0) return { moved: false, collected: null };
        
        const newX = this.x + this.dx;
        const newY = this.y + this.dy;
        
        if (canMoveTo(newX, newY, map)) {
            this.x = newX;
            this.y = newY;
            
            if (this.x < 0) this.x = CONFIG.COLS - 1;
            if (this.x >= CONFIG.COLS) this.x = 0;
            
            const cellX = Math.floor(this.x);
            const cellY = Math.floor(this.y);
            
            let collected = null;
            
            if (map.isDot(cellX, cellY)) {
                map.setCell(cellX, cellY, CELL_TYPES.EMPTY);
                collected = 'dot';
            } else if (map.isPower(cellX, cellY)) {
                map.setCell(cellX, cellY, CELL_TYPES.EMPTY);
                collected = 'power';
            }
            
            return { moved: true, collected };
        }
        
        this.dx = 0;
        this.dy = 0;
        return { moved: false, collected: null };
    }
    
    getPosition() {
        return { x: this.x, y: this.y };
    }
    
    getDirection() {
        return { dx: this.dx, dy: this.dy };
    }
}

function canMoveTo(x, y, map) {
    if ((y === 9 || y === 11) && (x < 0 || x >= CONFIG.COLS)) return true;
    if (x < 0 || x >= CONFIG.COLS || y < 0 || y >= CONFIG.ROWS) return false;
    return !map.isWall(Math.floor(x), Math.floor(y));
}
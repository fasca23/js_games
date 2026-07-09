class Hamster {
    constructor() {
        this.reset();
    }
    
    reset() {
        this.x = Math.floor(CONFIG.COLS / 2);
        this.y = Math.floor(CONFIG.ROWS / 2);
        this.dx = 0;
        this.dy = 0;
        this.nextDx = 0;
        this.nextDy = 0;
        this.path = [];
        this.isOutside = false;
    }
    
    setDirection(dx, dy) {
        if (dx === -this.dx && dy === -this.dy && (dx !== 0 || dy !== 0)) return;
        this.nextDx = dx;
        this.nextDy = dy;
    }
    
    update(grid) {
        if (this.nextDx !== 0 || this.nextDy !== 0) {
            this.dx = this.nextDx;
            this.dy = this.nextDy;
        }
        
        if (this.dx === 0 && this.dy === 0) return null;
        
        const newX = this.x + this.dx;
        const newY = this.y + this.dy;
        
        if (newX < 0 || newX >= CONFIG.COLS || newY < 0 || newY >= CONFIG.ROWS) return null;
        
        // Возвращение на территорию
        if (this.isOutside && grid.isCaptured(newX, newY)) {
            this.x = newX;
            this.y = newY;
            const captured = grid.captureArea(this.path);
            this.path = [];
            this.isOutside = false;
            return { type: 'capture', count: captured };
        }
        
        // Выход с территории
        if (!this.isOutside && grid.isCaptured(this.x, this.y) && !grid.isCaptured(newX, newY)) {
            this.isOutside = true;
            this.path = [{ x: newX, y: newY }];
            this.x = newX;
            this.y = newY;
            return { type: 'exit' };
        }
        
        // Движение снаружи
        if (this.isOutside && !grid.isCaptured(newX, newY)) {
            let alreadyInPath = false;
            for (const cell of this.path) {
                if (cell.x === newX && cell.y === newY) {
                    alreadyInPath = true;
                    break;
                }
            }
            if (!alreadyInPath) {
                this.path.push({ x: newX, y: newY });
            }
            this.x = newX;
            this.y = newY;
            return { type: 'move' };
        }
        
        // Движение по территории
        if (!this.isOutside && grid.isCaptured(this.x, this.y) && grid.isCaptured(newX, newY)) {
            this.x = newX;
            this.y = newY;
            return { type: 'move' };
        }
        
        return null;
    }
    
    getPosition() {
        return { x: this.x, y: this.y };
    }
    
    isOnTerritory(grid) {
        return grid.isCaptured(this.x, this.y);
    }
}
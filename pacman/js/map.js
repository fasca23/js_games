const MAP_DATA = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,2,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,2,1],
    [1,3,1,1,1,2,1,1,1,2,1,2,1,1,1,2,1,1,1,3,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,2,1,1,1,2,1,2,1,1,1,1,1,2,1,2,1,1,1,2,1],
    [1,2,2,2,2,2,1,2,2,2,1,2,2,2,1,2,2,2,2,2,1],
    [1,1,1,1,1,2,1,1,1,0,1,0,1,1,1,2,1,1,1,1,1],
    [0,0,0,0,1,2,1,0,0,0,0,0,0,0,1,2,1,0,0,0,0],
    [1,1,1,1,1,2,1,1,1,1,0,1,1,1,1,2,1,1,1,1,1],
    [0,0,0,0,0,2,0,0,1,0,0,0,1,0,0,2,0,0,0,0,0],
    [1,1,1,1,1,2,1,0,1,1,1,1,1,0,1,2,1,1,1,1,1],
    [0,0,0,0,1,2,1,0,0,0,0,0,0,0,1,2,1,0,0,0,0],
    [1,1,1,1,1,2,1,0,1,1,1,1,1,0,1,2,1,1,1,1,1],
    [1,2,2,2,2,2,2,2,2,2,1,2,2,2,2,2,2,2,2,2,1],
    [1,3,1,1,1,2,1,1,1,2,1,2,1,1,1,2,1,1,1,3,1],
    [1,2,2,1,2,2,2,2,2,2,2,2,2,2,2,2,2,1,2,2,1],
    [1,1,2,1,2,1,2,1,1,1,1,1,1,1,2,1,2,1,2,1,1],
    [1,2,2,2,2,1,2,2,2,2,1,2,2,2,2,1,2,2,2,2,1],
    [1,2,1,1,1,1,1,1,1,2,1,2,1,1,1,1,1,1,1,2,1],
    [1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

const CELL_TYPES = {
    EMPTY: 0,
    WALL: 1,
    DOT: 2,
    POWER: 3
};

class Map {
    constructor() {
        this.grid = [];
        this.reset();
    }
    
    reset() {
        this.grid = MAP_DATA.map(row => [...row]);
    }
    
    getCell(x, y) {
        if (y < 0 || y >= this.grid.length) return null;
        if (x < 0 || x >= this.grid[0].length) return null;
        return this.grid[y][x];
    }
    
    setCell(x, y, value) {
        if (y >= 0 && y < this.grid.length && x >= 0 && x < this.grid[0].length) {
            this.grid[y][x] = value;
        }
    }
    
    isWall(x, y) {
        const cell = this.getCell(x, y);
        return cell === CELL_TYPES.WALL;
    }
    
    isDot(x, y) {
        const cell = this.getCell(x, y);
        return cell === CELL_TYPES.DOT;
    }
    
    isPower(x, y) {
        const cell = this.getCell(x, y);
        return cell === CELL_TYPES.POWER;
    }
    
    countDots() {
        let count = 0;
        for (let r = 0; r < CONFIG.ROWS; r++) {
            for (let c = 0; c < CONFIG.COLS; c++) {
                if (this.grid[r][c] === CELL_TYPES.DOT || this.grid[r][c] === CELL_TYPES.POWER) {
                    count++;
                }
            }
        }
        return count;
    }
}
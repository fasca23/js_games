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

// Но нам нужно открыть домик призраков!
// Меняем клетки (8,8), (9,8), (10,8), (11,8), (12,8) на проход (0)
// Это создаст выход из домика вверх

const GHOST_HOUSE_MODIFICATIONS = [
    { x: 8, y: 8, value: 0 },  // Открываем левую стену домика
    { x: 9, y: 8, value: 0 },  // Проход
    { x: 10, y: 8, value: 0 }, // Выход
    { x: 11, y: 8, value: 0 }, // Проход  
    { x: 12, y: 8, value: 0 }, // Открываем правую стену домика
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
        
        // Открываем домик призраков
        for (const mod of GHOST_HOUSE_MODIFICATIONS) {
            this.grid[mod.y][mod.x] = mod.value;
        }
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
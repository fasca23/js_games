const CONFIG = {
    COLS: 21,
    ROWS: 21,
    CELL_SIZE: 20,
    GAME_SPEED: 12,
    INITIAL_LIVES: 3,
    
    // Скорости
    PACMAN_SPEED: 1.0,
    GHOST_SPEED: 1.0,
    GHOST_FRIGHTENED_SPEED: 0.5,
    
    // Очки
    DOT_SCORE: 10,
    POWER_SCORE: 50,
    GHOST_SCORE: 200,
    
    // Длительность режима испуга (в кадрах)
    FRIGHTENED_DURATION: 100,
    
    COLORS: {
        WALL: '#2121de',
        DOT: '#ffb8ae',
        POWER: '#ffb8ae',
        PACMAN: '#ffff00',
        GHOST_FRIGHTENED: '#2121ff',
        GHOSTS: ['#ff0000', '#ffb8ff', '#00ffff', '#ffb852']
    }
};
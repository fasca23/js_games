const CONFIG = {
    COLS: 19,
    ROWS: 19,
    GAME_SPEED: 120,
    INITIAL_LIVES: 3,
    WIN_PERCENT: 80,
    
    HAMSTER_SIZE: 0.60,
    GHOST_SIZE: 0.55,
    EYE_SIZE: 0.12,
    PUPIL_SIZE: 0.06,
    
    INITIAL_GHOSTS: 4,          // 3 обычных + 1 вор сразу
    MAX_GHOSTS: 7,
    
    // Вор
    THIEF_APPEAR_AT: 10,         // появляется сразу
    THIEF_STEAL_SIZE: 3,        // крадёт область 3x3
    THIEF_STEAL_INTERVAL: 500, // интервал кражи 1 сек
    THIEF_MOVE_DELAY: 1,        // двигается каждый 2-й кадр
    
    GHOST_THRESHOLD_1: 30,
    GHOST_THRESHOLD_2: 50,
    GHOST_THRESHOLD_3: 75,
    
    COLORS: {
        BG: '#000',
        CAPTURED: '#1a3a1a',
        BORDER: '#2a4a2a',
        PATH: '#3a6a3a',
        GRID_LINE: '#0a2a0a',
        HAMSTER: '#daa520',
        HAMSTER_EAR: '#b8860b',
        HAMSTER_FACE: '#ffcc80',
        HAMSTER_NOSE: '#ff69b4',
        GHOST_CHASER: '#ff0040',
        GHOST_PATROL: '#ffaa00',
        GHOST_SNAKE: '#cc44cc',
        GHOST_THIEF: '#ff00ff',      // ярко-розовый
        GHOST_GLOW: '#ff0040',
        THIEF_GLOW: '#ff00ff'
    }
};
const CONFIG = {
    COLS: 19,
    ROWS: 19,
    GAME_SPEED: 120,
    INITIAL_LIVES: 3,
    WIN_PERCENT: 80,
    
    // Размеры спрайтов (относительно cellSize)
    HAMSTER_SIZE: 0.60,
    GHOST_SIZE: 0.55,
    EYE_SIZE: 0.12,
    PUPIL_SIZE: 0.06,
    
    // Призраки
    INITIAL_GHOSTS: 3,
    MAX_GHOSTS: 5,
    
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
        GHOST_RANDOM: '#ff6600',
        GHOST_GLOW: '#ff0040'
    }
};
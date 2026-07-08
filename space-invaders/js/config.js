const CONFIG = {
    CANVAS_WIDTH: 800,
    CANVAS_HEIGHT: 550,
    
    PLAYER_WIDTH: 48,
    PLAYER_HEIGHT: 20,
    PLAYER_SPEED: 7,
    PLAYER_Y_OFFSET: 50,
    
    BULLET_WIDTH: 4,
    BULLET_HEIGHT: 12,
    BULLET_SPEED: -6.5,
    SHOOT_COOLDOWN: 12,
    
    ALIEN_ROWS: 5,
    ALIEN_COLS: 9,
    ALIEN_WIDTH: 42,
    ALIEN_HEIGHT: 32,
    ALIEN_GRID_X: 60,
    ALIEN_GRID_Y: 55,
    ALIEN_STEP_DELAY: 38,
    ALIEN_EDGE_BUFFER: 18,
    
    ALIEN_BULLET_WIDTH: 5,
    ALIEN_BULLET_HEIGHT: 10,
    ALIEN_BULLET_SPEED: 4.2,
    ALIEN_SHOOT_DELAY: 35,
    
    INVINCIBLE_FRAMES: 45,
    
    COLORS: {
        BG: '#020218',
        STAR: 'rgba(255,240,200,0.4)',
        PLAYER: '#66ffcc',
        PLAYER_GLOW: '#aaffdd',
        BULLET: '#ffdf70',
        ALIEN_BULLET: '#ff4d6d',
        ALIEN_ROW1: ['#41b341', '#1f841f'],
        ALIEN_ROW2: ['#c05ad8', '#8033a0'],
        ALIEN_ROW3: ['#e9812e', '#b54b1a'],
        EXPLOSION: 'rgba(255,100,20,0.7)'
    }
};
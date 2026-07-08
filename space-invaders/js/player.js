class Player {
    constructor() {
        this.reset();
    }
    
    reset() {
        this.x = CONFIG.CANVAS_WIDTH / 2 - CONFIG.PLAYER_WIDTH / 2;
        this.y = CONFIG.CANVAS_HEIGHT - CONFIG.PLAYER_Y_OFFSET;
        this.invincible = 0;
    }
    
    move(dx) {
        this.x += dx * CONFIG.PLAYER_SPEED;
        
        if (this.x < 5) this.x = 5;
        if (this.x > CONFIG.CANVAS_WIDTH - CONFIG.PLAYER_WIDTH - 5) {
            this.x = CONFIG.CANVAS_WIDTH - CONFIG.PLAYER_WIDTH - 5;
        }
    }
    
    update() {
        if (this.invincible > 0) this.invincible--;
    }
    
    hit() {
        if (this.invincible > 0) return false;
        this.invincible = CONFIG.INVINCIBLE_FRAMES;
        return true;
    }
    
    getBounds() {
        return {
            x: this.x,
            y: this.y,
            w: CONFIG.PLAYER_WIDTH,
            h: CONFIG.PLAYER_HEIGHT
        };
    }
    
    getPosition() {
        return { x: this.x, y: this.y };
    }
}
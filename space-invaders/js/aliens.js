class Alien {
    constructor(x, y, row, col) {
        this.x = x;
        this.y = y;
        this.row = row;
        this.col = col;
        this.type = row % 3;
        this.alive = true;
    }
    
    getBounds() {
        return {
            x: this.x,
            y: this.y,
            w: CONFIG.ALIEN_WIDTH,
            h: CONFIG.ALIEN_HEIGHT
        };
    }
}

class AlienArmy {
    constructor() {
        this.aliens = [];
        this.direction = 1;
        this.stepDelay = 0;
        this.baseStepFrames = CONFIG.ALIEN_STEP_DELAY;
        this.currentStepFrames = this.baseStepFrames;
        this.wave = 1;
        this.reset();
    }
    
    reset() {
        this.aliens = [];
        for (let row = 0; row < CONFIG.ALIEN_ROWS; row++) {
            for (let col = 0; col < CONFIG.ALIEN_COLS; col++) {
                this.aliens.push(new Alien(
                    CONFIG.ALIEN_GRID_X + col * (CONFIG.ALIEN_WIDTH + 8),
                    CONFIG.ALIEN_GRID_Y + row * (CONFIG.ALIEN_HEIGHT + 6),
                    row, col
                ));
            }
        }
        this.direction = 1;
        this.stepDelay = 0;
        this.currentStepFrames = this.baseStepFrames;
    }
    
    nextWave() {
        this.wave++;
        this.reset();
        // Ускорение с каждой волной: -3 кадра, минимум 5
        this.baseStepFrames = Math.max(5, CONFIG.ALIEN_STEP_DELAY - (this.wave - 1) * 3);
        this.currentStepFrames = this.baseStepFrames;
    }
    
    getWave() {
        return this.wave;
    }
    
    update() {
        const alive = this.getAlive();
        if (alive.length === 0) return false;
        
        if (this.stepDelay <= 0) {
            let needReverse = false;
            
            for (const alien of alive) {
                const nextX = alien.x + CONFIG.ALIEN_WIDTH * 0.28 * this.direction;
                if (nextX > CONFIG.CANVAS_WIDTH - CONFIG.ALIEN_EDGE_BUFFER || 
                    nextX < CONFIG.ALIEN_EDGE_BUFFER) {
                    needReverse = true;
                    break;
                }
            }
            
            if (needReverse) {
                this.direction *= -1;
                for (const alien of alive) {
                    alien.y += 12;
                }
                // Дополнительное ускорение при смене направления
                this.currentStepFrames = Math.max(5, this.currentStepFrames - 1);
            } else {
                for (const alien of alive) {
                    alien.x += CONFIG.ALIEN_WIDTH * 0.28 * this.direction;
                }
            }
            
            this.stepDelay = this.currentStepFrames;
        } else {
            this.stepDelay--;
        }
        
        return true;
    }
    
    getAlive() {
        return this.aliens.filter(a => a.alive);
    }
    
    checkHit(bullet) {
        for (const alien of this.aliens) {
            if (!alien.alive) continue;
            
            const b = alien.getBounds();
            if (bullet.x < b.x + b.w && bullet.x + bullet.w > b.x &&
                bullet.y < b.y + b.h && bullet.y + bullet.h > b.y) {
                alien.alive = false;
                return { x: b.x + b.w / 2, y: b.y + b.h / 2 };
            }
        }
        return null;
    }
    
    reachedPlayer(playerY) {
        for (const alien of this.getAlive()) {
            if (alien.y + CONFIG.ALIEN_HEIGHT >= playerY + 12) {
                return true;
            }
        }
        return false;
    }
    
    count() {
        return this.getAlive().length;
    }
}
class BulletManager {
    constructor() {
        this.playerBullets = [];
        this.alienBullets = [];
        this.shootCooldown = 0;
        this.alienShootTimer = 5;
    }
    
    reset() {
        this.playerBullets = [];
        this.alienBullets = [];
        this.shootCooldown = 0;
        this.alienShootTimer = 5;
    }
    
    playerShoot(playerX, playerY) {
        if (this.shootCooldown > 0) return false;
        
        this.playerBullets.push({
            x: playerX + CONFIG.PLAYER_WIDTH / 2 - CONFIG.BULLET_WIDTH / 2,
            y: playerY - 8,
            w: CONFIG.BULLET_WIDTH,
            h: CONFIG.BULLET_HEIGHT
        });
        
        this.shootCooldown = CONFIG.SHOOT_COOLDOWN;
        return true;
    }
    
    alienShoot(aliens) {
        const alive = aliens.filter(a => a.alive);
        if (alive.length === 0) return;
        
        const shooter = alive[Math.floor(Math.random() * alive.length)];
        this.alienBullets.push({
            x: shooter.x + CONFIG.ALIEN_WIDTH / 2 - CONFIG.ALIEN_BULLET_WIDTH / 2,
            y: shooter.y + CONFIG.ALIEN_HEIGHT - 4,
            w: CONFIG.ALIEN_BULLET_WIDTH,
            h: CONFIG.ALIEN_BULLET_HEIGHT
        });
    }
    
    update() {
        if (this.shootCooldown > 0) this.shootCooldown--;
        
        // Движение пуль игрока
        for (let i = this.playerBullets.length - 1; i >= 0; i--) {
            this.playerBullets[i].y += CONFIG.BULLET_SPEED;
            if (this.playerBullets[i].y < -20 || this.playerBullets[i].y > CONFIG.CANVAS_HEIGHT + 20) {
                this.playerBullets.splice(i, 1);
            }
        }
        
        // Движение пуль пришельцев
        for (let i = this.alienBullets.length - 1; i >= 0; i--) {
            this.alienBullets[i].y += CONFIG.ALIEN_BULLET_SPEED;
            if (this.alienBullets[i].y > CONFIG.CANVAS_HEIGHT + 50) {
                this.alienBullets.splice(i, 1);
            }
        }
        
        // Таймер стрельбы пришельцев
        if (this.alienShootTimer <= 0) {
            this.alienShootTimer = CONFIG.ALIEN_SHOOT_DELAY + Math.floor(Math.random() * 20);
            return true; // Пора стрелять
        } else {
            this.alienShootTimer--;
        }
        
        return false;
    }
    
    checkPlayerHit(playerBounds) {
        for (let i = this.alienBullets.length - 1; i >= 0; i--) {
            const ab = this.alienBullets[i];
            if (ab.x < playerBounds.x + playerBounds.w && 
                ab.x + ab.w > playerBounds.x &&
                ab.y < playerBounds.y + playerBounds.h && 
                ab.y + ab.h > playerBounds.y) {
                this.alienBullets.splice(i, 1);
                return true;
            }
        }
        return false;
    }
    
    getPlayerBullets() {
        return this.playerBullets;
    }
    
    getAlienBullets() {
        return this.alienBullets;
    }
}
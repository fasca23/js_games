class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.stars = [];
        
        // Генерируем звезды
        for (let i = 0; i < 180; i++) {
            this.stars.push({
                x: (i * 131) % CONFIG.CANVAS_WIDTH,
                y: (i * 57) % CONFIG.CANVAS_HEIGHT,
                brightness: Math.random() * 0.6 + 0.2
            });
        }
    }
    
    clear() {
        this.ctx.fillStyle = CONFIG.COLORS.BG;
        this.ctx.fillRect(0, 0, CONFIG.CANVAS_WIDTH, CONFIG.CANVAS_HEIGHT);
        
        // Звезды
        for (const star of this.stars) {
            this.ctx.fillStyle = `rgba(255,240,200,${star.brightness})`;
            this.ctx.fillRect(star.x, star.y, 1.5, 1.5);
        }
    }
    
    drawPlayer(player) {
        if (player.invincible > 0 && Math.floor(Date.now() / 40) % 3 === 0) {
            this.ctx.fillStyle = CONFIG.COLORS.PLAYER_GLOW;
        } else {
            this.ctx.fillStyle = CONFIG.COLORS.PLAYER;
        }
        
        const { x, y } = player.getPosition();
        this.ctx.fillRect(x, y, CONFIG.PLAYER_WIDTH, CONFIG.PLAYER_HEIGHT);
        
        // Детали
        this.ctx.fillStyle = '#fff';
        this.ctx.fillRect(x + 8, y - 6, 8, 8);
        this.ctx.fillRect(x + CONFIG.PLAYER_WIDTH - 16, y - 6, 8, 8);
        
        this.ctx.fillStyle = '#5fddaf';
        this.ctx.fillRect(x + CONFIG.PLAYER_WIDTH / 2 - 5, y - 4, 10, 8);
    }
    
    drawAliens(aliens) {
        for (const alien of aliens) {
            if (!alien.alive) continue;
            
            let colors;
            if (alien.type === 0) colors = CONFIG.COLORS.ALIEN_ROW1;
            else if (alien.type === 1) colors = CONFIG.COLORS.ALIEN_ROW2;
            else colors = CONFIG.COLORS.ALIEN_ROW3;
            
            const grad = this.ctx.createLinearGradient(
                alien.x, alien.y,
                alien.x + CONFIG.ALIEN_WIDTH, alien.y + CONFIG.ALIEN_HEIGHT
            );
            grad.addColorStop(0, colors[0]);
            grad.addColorStop(1, colors[1]);
            
            this.ctx.fillStyle = grad;
            this.ctx.shadowBlur = 5;
            this.ctx.shadowColor = '#0f0';
            this.ctx.fillRect(alien.x, alien.y, CONFIG.ALIEN_WIDTH, CONFIG.ALIEN_HEIGHT);
            
            // Глаза
            this.ctx.fillStyle = '#fff';
            this.ctx.fillRect(alien.x + 8, alien.y + 8, 8, 8);
            this.ctx.fillRect(alien.x + CONFIG.ALIEN_WIDTH - 16, alien.y + 8, 8, 8);
            
            // Зрачки
            this.ctx.fillStyle = '#000';
            this.ctx.fillRect(alien.x + 10, alien.y + 10, 4, 5);
            this.ctx.fillRect(alien.x + CONFIG.ALIEN_WIDTH - 14, alien.y + 10, 4, 5);
        }
        this.ctx.shadowBlur = 0;
    }
    
    drawBullets(playerBullets, alienBullets) {
        for (const bullet of playerBullets) {
            this.ctx.fillStyle = CONFIG.COLORS.BULLET;
            this.ctx.shadowBlur = 8;
            this.ctx.shadowColor = 'yellow';
            this.ctx.fillRect(bullet.x, bullet.y, bullet.w, bullet.h);
        }
        
        for (const bullet of alienBullets) {
            this.ctx.fillStyle = CONFIG.COLORS.ALIEN_BULLET;
            this.ctx.shadowBlur = 6;
            this.ctx.shadowColor = '#f00';
            this.ctx.fillRect(bullet.x, bullet.y, bullet.w, bullet.h);
        }
        
        this.ctx.shadowBlur = 0;
    }
    
    drawExplosion(x, y) {
        this.ctx.beginPath();
        this.ctx.arc(x, y, 12, 0, Math.PI * 2);
        this.ctx.fillStyle = CONFIG.COLORS.EXPLOSION;
        this.ctx.fill();
    }
    
    drawOverlay(text, color) {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = color;
        this.ctx.font = 'bold 34px monospace';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(text, this.canvas.width / 2, this.canvas.height / 2);
    }
}
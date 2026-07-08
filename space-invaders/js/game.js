class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.canvas.width = CONFIG.CANVAS_WIDTH;
        this.canvas.height = CONFIG.CANVAS_HEIGHT;
        
        this.renderer = new Renderer(this.canvas);
        this.player = new Player();
        this.aliens = new AlienArmy();
        this.bullets = new BulletManager();
        
        this.score = 0;
        this.lives = 3;
        this.gameRunning = false;
        this.gamePaused = false;
        this.gameOver = false;
        this.gameWon = false;
        this.animationFrame = null;
        
        this.keys = {
            ArrowLeft: false,
            ArrowRight: false,
            Space: false
        };
        
        this.uiScore = document.getElementById('scoreValue');
        this.uiLives = document.getElementById('livesValue');
        this.uiEnemies = document.getElementById('enemiesValue');
        this.uiPause = document.getElementById('pauseBtn');
        
        this.setupControls();
    }
    
    init() {
        this.player.reset();
        this.aliens.reset();
        this.bullets.reset();
        
        this.score = 0;
        this.lives = 3;
        this.gameRunning = true;
        this.gamePaused = false;
        this.gameOver = false;
        this.gameWon = false;
        
        this.updateUI();
        
        if (this.uiPause) this.uiPause.textContent = '⏸️ Пауза';
        
        if (this.animationFrame) cancelAnimationFrame(this.animationFrame);
        this.gameLoop();
    }
    
    updateUI() {
        if (this.uiScore) this.uiScore.textContent = this.score;
        if (this.uiLives) this.uiLives.textContent = this.lives;
        if (this.uiEnemies) this.uiEnemies.textContent = this.aliens.count();
    }
    
    saveHighscore() {
        const saved = localStorage.getItem('spaceinvaders_highscore') || 0;
        if (this.score > saved) {
            localStorage.setItem('spaceinvaders_highscore', this.score);
            const el = document.getElementById('highscoreValue');
            if (el) el.textContent = this.score;
        }
    }
    
    setupControls() {
        window.addEventListener('keydown', (e) => {
            if (!this.gameRunning) {
                if (e.key === ' ' || e.key === 'Enter') {
                    this.init();
                    e.preventDefault();
                }
                return;
            }
            
            if (e.key === 'ArrowLeft') { this.keys.ArrowLeft = true; e.preventDefault(); }
            if (e.key === 'ArrowRight') { this.keys.ArrowRight = true; e.preventDefault(); }
            if (e.key === ' ' || e.key === 'Space') { this.keys.Space = true; e.preventDefault(); }
        });
        
        window.addEventListener('keyup', (e) => {
            if (e.key === 'ArrowLeft') { this.keys.ArrowLeft = false; e.preventDefault(); }
            if (e.key === 'ArrowRight') { this.keys.ArrowRight = false; e.preventDefault(); }
            if (e.key === ' ' || e.key === 'Space') { this.keys.Space = false; e.preventDefault(); }
        });
    }
    
    togglePause() {
        if (!this.gameRunning) return;
        this.gamePaused = !this.gamePaused;
        if (this.uiPause) {
            this.uiPause.textContent = this.gamePaused ? '▶️ Играть' : '⏸️ Пауза';
        }
    }
    
    update() {
        if (this.gamePaused || this.gameOver || this.gameWon) return;
        
        // Движение игрока
        if (this.keys.ArrowLeft) this.player.move(-1);
        if (this.keys.ArrowRight) this.player.move(1);
        
        this.player.update();
        
        // Стрельба игрока
        if (this.keys.Space) {
            this.bullets.playerShoot(this.player.x, this.player.y);
        }
        
        // Обновление пуль
        const shouldAlienShoot = this.bullets.update();
        
        // Стрельба пришельцев
        if (shouldAlienShoot) {
            this.bullets.alienShoot(this.aliens.aliens);
        }
        
        // Проверка попаданий по пришельцам
        const playerBullets = this.bullets.getPlayerBullets();
        for (let i = playerBullets.length - 1; i >= 0; i--) {
            const hit = this.aliens.checkHit(playerBullets[i]);
            if (hit) {
                this.score += 10;
                this.updateUI();
                playerBullets.splice(i, 1);
            }
        }
        
        // Движение пришельцев
        this.aliens.update();
        
        // Проверка попадания в игрока
        if (this.bullets.checkPlayerHit(this.player.getBounds())) {
            if (this.player.hit()) {
                this.lives--;
                this.updateUI();
                
                if (this.lives <= 0) {
                    this.gameOver = true;
                    this.gameRunning = false;
                    this.saveHighscore();
                    return;
                }
            }
        }
        
        // Пришельцы достигли игрока
        if (this.aliens.reachedPlayer(this.player.y)) {
            this.gameOver = true;
            this.gameRunning = false;
            this.saveHighscore();
            return;
        }
        
        // Все пришельцы уничтожены
        if (this.aliens.count() === 0) {
            this.gameWon = true;
            this.gameRunning = false;
            this.saveHighscore();
        }
        
        this.updateUI();
    }
    
    render() {
        this.renderer.clear();
        this.renderer.drawAliens(this.aliens.aliens);
        this.renderer.drawBullets(
            this.bullets.getPlayerBullets(),
            this.bullets.getAlienBullets()
        );
        this.renderer.drawPlayer(this.player);
        
        if (this.gamePaused && !this.gameOver && !this.gameWon) {
            this.renderer.drawOverlay('ПАУЗА', '#ffff00');
        }
        
        if (this.gameOver) {
            this.renderer.drawOverlay('GAME OVER', '#ff0000');
        }
        
        if (this.gameWon) {
            this.renderer.drawOverlay('ПОБЕДА!', '#00ff00');
        }
    }
    
    gameLoop() {
        if (this.gameOver || this.gameWon) {
            this.render();
            return;
        }
        
        if (!this.gameRunning) {
            this.render();
            return;
        }
        
        this.update();
        this.render();
        this.animationFrame = requestAnimationFrame(() => this.gameLoop());
    }
}
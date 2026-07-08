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
        this.lives = CONFIG.INITIAL_LIVES;
        this.survivalTime = 0;
        this.bestScore = 0;
        this.autoFire = false;
        this.timerInterval = null;
        this.gameRunning = false;
        this.gamePaused = false;
        this.gameOver = false;
        this.animationFrame = null;
        
        this.keys = {
            ArrowLeft: false,
            ArrowRight: false
        };
        
        this.uiScore = document.getElementById('scoreValue');
        this.uiLives = document.getElementById('livesValue');
        this.uiEnemies = document.getElementById('enemiesValue');
        this.uiWave = document.getElementById('waveValue');
        this.uiTime = document.getElementById('timeValue');
        this.uiPause = document.getElementById('pauseBtn');
        
        this.setupControls();
    }
    
    init() {
        this.player.reset();
        this.aliens = new AlienArmy();
        this.bullets.reset();
        
        this.score = 0;
        this.lives = CONFIG.INITIAL_LIVES;
        this.survivalTime = 0;
        this.bestScore = parseInt(localStorage.getItem('spaceinvaders_best_score') || 0);
        this.autoFire = false;
        this.gameRunning = true;
        this.gamePaused = false;
        this.gameOver = false;
        
        this.updateFireButton();
        this.startTimer();
        this.updateUI();
        
        if (this.uiPause) this.uiPause.textContent = '⏸️ Пауза';
        if (this.uiTime) this.uiTime.textContent = '0с';
        if (this.uiWave) this.uiWave.textContent = '1';
        
        if (this.animationFrame) cancelAnimationFrame(this.animationFrame);
        this.gameLoop();
    }
    
    startTimer() {
        this.stopTimer();
        this.timerInterval = setInterval(() => {
            if (this.gameRunning && !this.gamePaused && !this.gameOver) {
                this.survivalTime++;
                if (this.uiTime) this.uiTime.textContent = this.survivalTime + 'с';
            }
        }, 1000);
    }
    
    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }
    
    updateUI() {
        if (this.uiScore) this.uiScore.textContent = this.score;
        if (this.uiLives) this.uiLives.textContent = this.lives;
        if (this.uiEnemies) this.uiEnemies.textContent = this.aliens.count();
        if (this.uiWave) this.uiWave.textContent = this.aliens.getWave();
    }
    
    updateFireButton() {
        const btnFire = document.getElementById('btnFire');
        if (btnFire) {
            if (this.autoFire) {
                btnFire.classList.add('firing');
            } else {
                btnFire.classList.remove('firing');
            }
        }
    }
    
    saveRecords() {
        this.stopTimer();
        
        const savedTime = localStorage.getItem('spaceinvaders_best_time') || 0;
        if (this.survivalTime > savedTime) {
            localStorage.setItem('spaceinvaders_best_time', this.survivalTime);
        }
        
        const savedScore = localStorage.getItem('spaceinvaders_best_score') || 0;
        if (this.score > savedScore) {
            localStorage.setItem('spaceinvaders_best_score', this.score);
        }
        
        const savedWave = localStorage.getItem('spaceinvaders_best_wave') || 0;
        if (this.aliens.getWave() > savedWave) {
            localStorage.setItem('spaceinvaders_best_wave', this.aliens.getWave());
        }
        
        this.updateRecordsDisplay();
    }
    
    updateRecordsDisplay() {
        const bestTime = localStorage.getItem('spaceinvaders_best_time') || 0;
        const bestScore = localStorage.getItem('spaceinvaders_best_score') || 0;
        const bestWave = localStorage.getItem('spaceinvaders_best_wave') || 0;
        
        const elTime = document.getElementById('bestTimeValue');
        const elScore = document.getElementById('bestScoreValue');
        const elWave = document.getElementById('bestWaveValue');
        
        if (elTime) elTime.textContent = bestTime + 'с';
        if (elScore) elScore.textContent = bestScore;
        if (elWave) elWave.textContent = bestWave;
    }
    
    setupControls() {
        window.addEventListener('keydown', (e) => {
            if (!this.gameRunning && !this.gameOver) {
                if (e.key === ' ' || e.key === 'Enter') {
                    this.init();
                    e.preventDefault();
                }
                return;
            }
            
            if (e.key === 'ArrowLeft') { this.keys.ArrowLeft = true; e.preventDefault(); }
            if (e.key === 'ArrowRight') { this.keys.ArrowRight = true; e.preventDefault(); }
            
            if (e.key === ' ' || e.key === 'Space') {
                this.autoFire = !this.autoFire;
                this.updateFireButton();
                e.preventDefault();
            }
        });
        
        window.addEventListener('keyup', (e) => {
            if (e.key === 'ArrowLeft') { this.keys.ArrowLeft = false; e.preventDefault(); }
            if (e.key === 'ArrowRight') { this.keys.ArrowRight = false; e.preventDefault(); }
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
        if (this.gamePaused || this.gameOver) return;
        
        if (this.keys.ArrowLeft) this.player.move(-1);
        if (this.keys.ArrowRight) this.player.move(1);
        
        this.player.update();
        
        // Автострельба или ручная
        if (this.autoFire) {
            this.bullets.playerShoot(this.player.x, this.player.y);
        }
        
        const shouldAlienShoot = this.bullets.update();
        
        if (shouldAlienShoot) {
            this.bullets.alienShoot(this.aliens.aliens);
        }
        
        const playerBullets = this.bullets.getPlayerBullets();
        for (let i = playerBullets.length - 1; i >= 0; i--) {
            const hit = this.aliens.checkHit(playerBullets[i]);
            if (hit) {
                this.score += 10;
                if (this.score > this.bestScore) this.bestScore = this.score;
                this.updateUI();
                playerBullets.splice(i, 1);
            }
        }
        
        this.aliens.update();
        
        if (this.bullets.checkPlayerHit(this.player.getBounds())) {
            if (this.player.hit()) {
                this.lives--;
                this.updateUI();
                
                if (this.lives <= 0) {
                    this.gameOver = true;
                    this.gameRunning = false;
                    this.autoFire = false;
                    this.updateFireButton();
                    this.saveRecords();
                    return;
                }
            }
        }
        
        if (this.aliens.reachedPlayer(this.player.y)) {
            this.gameOver = true;
            this.gameRunning = false;
            this.autoFire = false;
            this.updateFireButton();
            this.saveRecords();
            return;
        }
        
        if (this.aliens.count() === 0) {
            this.aliens.nextWave();
            this.bullets.alienBullets = [];
            this.score += 100;
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
        
        if (this.gamePaused && !this.gameOver) {
            this.renderer.drawOverlay('ПАУЗА', '#ffff00');
        }
        
        if (this.gameOver) {
            this.renderer.drawOverlay('ИГРА ОКОНЧЕНА', '#ff0000');
        }
    }
    
    gameLoop() {
        if (this.gameOver) {
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
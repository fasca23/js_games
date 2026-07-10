class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.renderer = new Renderer(this.canvas);
        this.grid = new Grid();
        this.hamster = new Hamster();
        this.ghostManager = new GhostManager();
        
        this.score = 0;
        this.lives = CONFIG.INITIAL_LIVES;
        this.gameRunning = false;
        this.gamePaused = false;
        this.gameOver = false;
        this.gameWon = false;
        this.gameLoop = null;
        
        this.uiScore = document.getElementById('scoreValue');
        this.uiLives = document.getElementById('livesValue');
        this.uiGhosts = document.getElementById('ghostCount');
        this.uiPause = document.getElementById('pauseBtn');
        
        this.setupControls();
        
        window.addEventListener('resize', () => {
            this.renderer.resize();
            this.render();
        });
    }
    
    init() {
        this.grid.reset();
        this.hamster.reset();
        
        this.grid.capture(this.hamster.x, this.hamster.y);
        
        this.ghostManager.reset(this.hamster.x, this.hamster.y, this.grid);
        
        this.score = 0;
        this.lives = CONFIG.INITIAL_LIVES;
        this.gameRunning = true;
        this.gamePaused = false;
        this.gameOver = false;
        this.gameWon = false;
        
        this.updateUI();
        
        if (this.uiPause) this.uiPause.textContent = '⏸️ Пауза';
        
        clearInterval(this.gameLoop);
        this.gameLoop = setInterval(() => this.update(), CONFIG.GAME_SPEED);
        
        this.render();
    }
    
    updateUI() {
        if (this.uiScore) this.uiScore.textContent = this.grid.getPercent() + '%';
        if (this.uiLives) this.uiLives.textContent = this.lives;
        if (this.uiGhosts) this.uiGhosts.textContent = this.ghostManager.count();
    }
    
    saveHighscore() {
        const percent = this.grid.getPercent();
        const saved = localStorage.getItem('hamster_highscore') || 0;
        if (percent > saved) {
            localStorage.setItem('hamster_highscore', percent);
            const el = document.getElementById('highscoreValue');
            if (el) el.textContent = percent + '%';
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
            
            switch(e.key) {
                case 'ArrowUp': case 'w': case 'W':
                    e.preventDefault();
                    this.hamster.setDirection(0, -1);
                    break;
                case 'ArrowDown': case 's': case 'S':
                    e.preventDefault();
                    this.hamster.setDirection(0, 1);
                    break;
                case 'ArrowLeft': case 'a': case 'A':
                    e.preventDefault();
                    this.hamster.setDirection(-1, 0);
                    break;
                case 'ArrowRight': case 'd': case 'D':
                    e.preventDefault();
                    this.hamster.setDirection(1, 0);
                    break;
            }
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
        
        const result = this.hamster.update(this.grid);
        
        if (result && result.type === 'capture') {
            this.updateUI();
            const percent = this.grid.getPercent();
            this.ghostManager.checkThresholds(percent, this.hamster.x, this.hamster.y, this.grid);
            
            if (percent >= CONFIG.WIN_PERCENT) {
                this.gameWon = true;
                this.gameRunning = false;
                clearInterval(this.gameLoop);
                this.saveHighscore();
                this.render();
                return;
            }
        }
        
        // Передаём isOutside и path в update
        this.ghostManager.update(
            this.grid, 
            this.hamster.x, 
            this.hamster.y, 
            this.hamster.isOutside, 
            this.hamster.path
        );
        
        if (this.ghostManager.checkCollision(this.hamster.x, this.hamster.y)) {
            this.lives--;
            this.updateUI();
            
            if (this.lives <= 0) {
                this.gameOver = true;
                this.gameRunning = false;
                clearInterval(this.gameLoop);
                this.saveHighscore();
                this.render();
                return;
            }
            
            this.resetHamster();
        }
        
        this.render();
    }
    
    resetHamster() {
        const spots = this.grid.findSafeSpot(
            this.ghostManager.getAll(),
            2
        );
        
        if (spots.length > 0) {
            const spot = spots[Math.floor(Math.random() * spots.length)];
            this.hamster.x = spot.x;
            this.hamster.y = spot.y;
        }
        
        this.hamster.dx = 0;
        this.hamster.dy = 0;
        this.hamster.nextDx = 0;
        this.hamster.nextDy = 0;
        this.hamster.path = [];
        this.hamster.isOutside = false;
    }
    
    render() {
        this.renderer.clear();
        this.renderer.drawGrid(this.grid);
        this.renderer.drawPath(this.hamster.path);
        this.renderer.drawGridLines();
        
        for (const ghost of this.ghostManager.getAll()) {
            this.renderer.drawGhost(ghost);
        }
        
        this.renderer.drawHamster(this.hamster);
        
        if (this.gamePaused && !this.gameOver && !this.gameWon) {
            this.renderer.drawOverlay('ПАУЗА', '#ffff00');
        }
        
        if (this.gameOver) {
            this.renderer.drawOverlay('ИГРА ОКОНЧЕНА', '#ff0000');
        }
        
        if (this.gameWon) {
            this.renderer.drawOverlay('ПОБЕДА!', '#00ff00');
        }
    }
}
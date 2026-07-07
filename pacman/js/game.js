class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.canvas.width = CONFIG.COLS * CONFIG.CELL_SIZE;
        this.canvas.height = CONFIG.ROWS * CONFIG.CELL_SIZE;
        
        this.renderer = new Renderer(this.canvas);
        this.map = new Map();
        this.pacman = new Pacman();
        this.ghostManager = new GhostManager();
        
        this.score = 0;
        this.lives = CONFIG.INITIAL_LIVES;
        this.level = 1;
        this.dotsRemaining = 0;
        this.gameRunning = false;
        this.gamePaused = false;
        this.animationFrame = null;
        
        this.uiScore = document.getElementById('scoreValue');
        this.uiLives = document.getElementById('livesValue');
        this.uiLevel = document.getElementById('levelValue');
        this.uiPause = document.getElementById('pauseBtn');
        
        this.setupControls();
    }
    
    init() {
        this.map.reset();
        this.pacman.reset();
        this.ghostManager.reset();
        
        this.score = 0;
        this.lives = CONFIG.INITIAL_LIVES;
        this.level = 1;
        this.dotsRemaining = this.map.countDots();
        this.gameRunning = true;
        this.gamePaused = false;
        
        this.updateUI();
        
        if (this.uiPause) this.uiPause.textContent = '⏸️ Пауза';
        
        if (this.animationFrame) cancelAnimationFrame(this.animationFrame);
        this.gameLoop();
    }
    
    updateUI() {
        if (this.uiScore) this.uiScore.textContent = this.score;
        if (this.uiLives) this.uiLives.textContent = this.lives;
        if (this.uiLevel) this.uiLevel.textContent = this.level;
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
                case 'ArrowLeft': case 'a': case 'A':
                    this.pacman.setDirection(-1, 0);
                    e.preventDefault();
                    break;
                case 'ArrowRight': case 'd': case 'D':
                    this.pacman.setDirection(1, 0);
                    e.preventDefault();
                    break;
                case 'ArrowUp': case 'w': case 'W':
                    this.pacman.setDirection(0, -1);
                    e.preventDefault();
                    break;
                case 'ArrowDown': case 's': case 'S':
                    this.pacman.setDirection(0, 1);
                    e.preventDefault();
                    break;
                case ' ':
                    this.togglePause();
                    e.preventDefault();
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
        if (this.gamePaused) return;
        
        const result = this.pacman.move(this.map);
        
        if (result.collected === 'dot') {
            this.score += CONFIG.DOT_SCORE;
            this.dotsRemaining--;
            this.updateUI();
        } else if (result.collected === 'power') {
            this.score += CONFIG.POWER_SCORE;
            this.dotsRemaining--;
            this.ghostManager.setFrightened();
            this.updateUI();
        }
        
        this.ghostManager.update(this.map, this.pacman.getPosition());
        
        const collision = this.ghostManager.checkCollisions(this.pacman.getPosition());
        
        if (collision === 'eaten') {
            this.score += CONFIG.GHOST_SCORE;
            this.updateUI();
        } else if (collision === 'kill') {
            this.lives--;
            this.updateUI();
            
            if (this.lives <= 0) {
                this.gameOver();
                return;
            }
            
            this.pacman.reset();
            this.ghostManager.reset();
        }
        
        if (this.dotsRemaining === 0) {
            this.nextLevel();
        }
    }
    
    nextLevel() {
        this.level++;
        this.map.reset();
        this.pacman.reset();
        this.ghostManager.reset();
        this.dotsRemaining = this.map.countDots();
        this.updateUI();
    }
    
    gameOver() {
        this.gameRunning = false;
        this.renderer.drawOverlay('GAME OVER', '#ff0000');
        
        setTimeout(() => {
            alert(`💀 Игра окончена!\nСчёт: ${this.score}\nУровень: ${this.level}`);
        }, 100);
    }
    
    render() {
        this.renderer.clear();
        this.renderer.drawMap(this.map);
        this.renderer.drawGhosts(
            this.ghostManager.getAllPositions(),
            this.ghostManager.mode
        );
        this.renderer.drawPacman(this.pacman);
        this.renderer.update();
        
        if (this.gamePaused) {
            this.renderer.drawOverlay('ПАУЗА', '#ffff00');
        }
    }
    
    gameLoop() {
        if (!this.gameRunning) {
            this.render();
            return;
        }
        
        if (this.renderer.frameCount % CONFIG.GAME_SPEED === 0) {
            this.update();
        }
        
        this.render();
        this.animationFrame = requestAnimationFrame(() => this.gameLoop());
    }
}
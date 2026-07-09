class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.cellSize = 0;
        this.resize();
    }
    
    resize() {
        const maxWidth = Math.min(window.innerWidth - 30, 500);
        const maxHeight = Math.min(window.innerHeight - 350, 500);
        const size = Math.min(maxWidth, maxHeight);
        this.canvas.width = size;
        this.canvas.height = size;
        this.cellSize = size / CONFIG.COLS;
    }
    
    clear() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    drawGrid(grid) {
        for (let y = 0; y < CONFIG.ROWS; y++) {
            for (let x = 0; x < CONFIG.COLS; x++) {
                if (grid.grid[y][x] === 1) {
                    this.ctx.fillStyle = CONFIG.COLORS.CAPTURED;
                } else if (grid.grid[y][x] === 2) {
                    this.ctx.fillStyle = CONFIG.COLORS.BORDER;
                } else {
                    continue;
                }
                this.ctx.fillRect(
                    x * this.cellSize, y * this.cellSize,
                    this.cellSize, this.cellSize
                );
            }
        }
    }
    
    drawPath(path) {
        if (!path || path.length === 0) return;
        this.ctx.fillStyle = CONFIG.COLORS.PATH;
        for (const cell of path) {
            this.ctx.fillRect(
                cell.x * this.cellSize, cell.y * this.cellSize,
                this.cellSize, this.cellSize
            );
        }
    }
    
    drawGridLines() {
        this.ctx.strokeStyle = CONFIG.COLORS.GRID_LINE;
        this.ctx.lineWidth = 0.5;
        for (let x = 0; x <= CONFIG.COLS; x++) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * this.cellSize, 0);
            this.ctx.lineTo(x * this.cellSize, this.canvas.height);
            this.ctx.stroke();
        }
        for (let y = 0; y <= CONFIG.ROWS; y++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y * this.cellSize);
            this.ctx.lineTo(this.canvas.width, y * this.cellSize);
            this.ctx.stroke();
        }
    }
    
    drawGhost(ghost) {
        const gx = ghost.x * this.cellSize + this.cellSize / 2;
        const gy = ghost.y * this.cellSize + this.cellSize / 2;
        
        // Отрисовка следа змейки
        if (ghost.type === 'snake' && ghost.trail && ghost.trail.length > 0) {
            this.ctx.fillStyle = 'rgba(255, 100, 100, 0.3)';
            for (const trail of ghost.trail) {
                this.ctx.fillRect(
                    trail.x * this.cellSize + this.cellSize * 0.3,
                    trail.y * this.cellSize + this.cellSize * 0.3,
                    this.cellSize * 0.4,
                    this.cellSize * 0.4
                );
            }
        }
        
        // Цвет в зависимости от типа
        let color, glowColor;
        switch(ghost.type) {
            case 'chaser':
                color = CONFIG.COLORS.GHOST_CHASER;
                glowColor = CONFIG.COLORS.GHOST_GLOW;
                break;
            case 'patrol':
                color = '#ffaa00';
                glowColor = '#ffaa00';
                break;
            case 'snake':
                color = '#cc44cc';
                glowColor = '#cc44cc';
                break;
            default:
                color = CONFIG.COLORS.GHOST_RANDOM;
                glowColor = CONFIG.COLORS.GHOST_GLOW;
        }
        
        this.ctx.shadowColor = glowColor;
        this.ctx.shadowBlur = 15;
        
        // Тело призрака
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(gx, gy - this.cellSize * 0.1, this.cellSize * 0.35, Math.PI, 0);
        this.ctx.lineTo(gx + this.cellSize * 0.35, gy + this.cellSize * 0.3);
        
        const waves = 3;
        const waveWidth = (this.cellSize * 0.7) / waves;
        for (let i = 0; i < waves; i++) {
            const wx = gx - this.cellSize * 0.35 + i * waveWidth;
            this.ctx.lineTo(wx + waveWidth / 2, gy + this.cellSize * 0.1);
            this.ctx.lineTo(wx + waveWidth, gy + this.cellSize * 0.3);
        }
        
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
        
        // Глаза
        this.ctx.fillStyle = 'white';
        this.ctx.beginPath();
        this.ctx.arc(gx - this.cellSize * 0.12, gy - this.cellSize * 0.15, this.cellSize * 0.08, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.arc(gx + this.cellSize * 0.12, gy - this.cellSize * 0.15, this.cellSize * 0.08, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Зрачки
        this.ctx.fillStyle = 'black';
        this.ctx.beginPath();
        this.ctx.arc(gx - this.cellSize * 0.1, gy - this.cellSize * 0.15, this.cellSize * 0.04, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.arc(gx + this.cellSize * 0.14, gy - this.cellSize * 0.15, this.cellSize * 0.04, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    drawHamster(hamster) {
        const hx = hamster.x * this.cellSize + this.cellSize / 2;
        const hy = hamster.y * this.cellSize + this.cellSize / 2;
        
        this.ctx.shadowColor = '#ffaa00';
        this.ctx.shadowBlur = 12;
        
        // Тело
        this.ctx.fillStyle = CONFIG.COLORS.HAMSTER;
        this.ctx.beginPath();
        this.ctx.arc(hx, hy, this.cellSize * 0.35, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Уши
        this.ctx.fillStyle = CONFIG.COLORS.HAMSTER_EAR;
        this.ctx.beginPath();
        this.ctx.arc(hx - this.cellSize * 0.2, hy - this.cellSize * 0.3, this.cellSize * 0.13, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.arc(hx + this.cellSize * 0.2, hy - this.cellSize * 0.3, this.cellSize * 0.13, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Внутренняя часть ушей
        this.ctx.fillStyle = CONFIG.COLORS.HAMSTER_FACE;
        this.ctx.beginPath();
        this.ctx.arc(hx - this.cellSize * 0.2, hy - this.cellSize * 0.3, this.cellSize * 0.07, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.arc(hx + this.cellSize * 0.2, hy - this.cellSize * 0.3, this.cellSize * 0.07, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Мордочка
        this.ctx.fillStyle = CONFIG.COLORS.HAMSTER_FACE;
        this.ctx.beginPath();
        this.ctx.ellipse(hx, hy + this.cellSize * 0.05, this.cellSize * 0.18, this.cellSize * 0.13, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Нос
        this.ctx.fillStyle = CONFIG.COLORS.HAMSTER_NOSE;
        this.ctx.beginPath();
        this.ctx.arc(hx, hy + this.cellSize * 0.03, this.cellSize * 0.05, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.shadowBlur = 0;
        
        // Глаза
        this.ctx.fillStyle = 'black';
        this.ctx.beginPath();
        this.ctx.arc(hx - this.cellSize * 0.1, hy - this.cellSize * 0.05, this.cellSize * 0.06, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.arc(hx + this.cellSize * 0.1, hy - this.cellSize * 0.05, this.cellSize * 0.06, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Блики в глазах
        this.ctx.fillStyle = 'white';
        this.ctx.beginPath();
        this.ctx.arc(hx - this.cellSize * 0.08, hy - this.cellSize * 0.07, this.cellSize * 0.025, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.arc(hx + this.cellSize * 0.12, hy - this.cellSize * 0.07, this.cellSize * 0.025, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    drawOverlay(text, color) {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = color;
        this.ctx.font = 'bold 24px monospace';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(text, this.canvas.width / 2, this.canvas.height / 2);
    }
}
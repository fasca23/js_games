class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.cellSize = 0;
        this.stealFlashCells = [];
        this.stealFlashTimer = 0;
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
        
        // Отрисовка flashing клеток (вор украл)
        if (this.stealFlashTimer > 0) {
            const alpha = this.stealFlashTimer / 30;
            this.ctx.fillStyle = `rgba(255, 235, 59, ${alpha})`;
            for (const cell of this.stealFlashCells) {
                this.ctx.fillRect(
                    cell.x * this.cellSize, cell.y * this.cellSize,
                    this.cellSize, this.cellSize
                );
            }
            this.stealFlashTimer--;
        }
    }
    
    flashSteal(cells) {
        this.stealFlashCells = cells;
        this.stealFlashTimer = 15;
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
        const size = this.cellSize * CONFIG.GHOST_SIZE;
        
        // След змейки
        if (ghost.type === 'snake' && ghost.trail && ghost.trail.length > 0) {
            this.ctx.fillStyle = 'rgba(255, 100, 100, 0.35)';
            for (const trail of ghost.trail) {
                this.ctx.fillRect(
                    trail.x * this.cellSize + this.cellSize * 0.25,
                    trail.y * this.cellSize + this.cellSize * 0.25,
                    this.cellSize * 0.5,
                    this.cellSize * 0.5
                );
            }
        }
        
        // Цвет по типу
        let color, glowColor;
        switch(ghost.type) {
            case 'chaser':
                color = CONFIG.COLORS.GHOST_CHASER;
                glowColor = CONFIG.COLORS.GHOST_GLOW;
                break;
            case 'patrol':
                color = CONFIG.COLORS.GHOST_PATROL;
                glowColor = CONFIG.COLORS.GHOST_PATROL;
                break;
            case 'snake':
                color = CONFIG.COLORS.GHOST_SNAKE;
                glowColor = CONFIG.COLORS.GHOST_SNAKE;
                break;
            case 'thief':
                color = CONFIG.COLORS.GHOST_THIEF;
                glowColor = CONFIG.COLORS.THIEF_GLOW;
                break;
            default:
                color = CONFIG.COLORS.GHOST_CHASER;
                glowColor = CONFIG.COLORS.GHOST_GLOW;
        }
        
        this.ctx.shadowColor = glowColor;
        this.ctx.shadowBlur = 15;
        
        // Тело призрака
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(gx, gy - size * 0.25, size, Math.PI, 0);
        this.ctx.lineTo(gx + size, gy + size * 0.6);
        
        const waves = 3;
        const waveWidth = (size * 2) / waves;
        for (let i = 0; i < waves; i++) {
            const wx = gx - size + i * waveWidth;
            this.ctx.lineTo(wx + waveWidth / 2, gy + size * 0.25);
            this.ctx.lineTo(wx + waveWidth, gy + size * 0.6);
        }
        
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
        
        // Иконка вора
        if (ghost.type === 'thief') {
            this.ctx.fillStyle = '#000';
            this.ctx.font = `${this.cellSize * 0.5}px Arial`;
            this.ctx.textAlign = 'center';
            this.ctx.fillText('🔑', gx, gy - size * 0.7);
        }
        
        // Глаза
        const eyeSize = this.cellSize * CONFIG.EYE_SIZE;
        const pupilSize = this.cellSize * CONFIG.PUPIL_SIZE;
        
        this.ctx.fillStyle = 'white';
        this.ctx.beginPath();
        this.ctx.arc(gx - size * 0.35, gy - size * 0.3, eyeSize, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.arc(gx + size * 0.35, gy - size * 0.3, eyeSize, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Зрачки
        this.ctx.fillStyle = 'black';
        this.ctx.beginPath();
        this.ctx.arc(gx - size * 0.3, gy - size * 0.3, pupilSize, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.arc(gx + size * 0.4, gy - size * 0.3, pupilSize, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    drawHamster(hamster) {
        const hx = hamster.x * this.cellSize + this.cellSize / 2;
        const hy = hamster.y * this.cellSize + this.cellSize / 2;
        const size = this.cellSize * CONFIG.HAMSTER_SIZE;
        
        this.ctx.shadowColor = '#ffaa00';
        this.ctx.shadowBlur = 15;
        
        // Тело
        this.ctx.fillStyle = CONFIG.COLORS.HAMSTER;
        this.ctx.beginPath();
        this.ctx.arc(hx, hy, size, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Уши
        const earSize = size * 0.4;
        this.ctx.fillStyle = CONFIG.COLORS.HAMSTER_EAR;
        this.ctx.beginPath();
        this.ctx.arc(hx - size * 0.55, hy - size * 0.8, earSize, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.arc(hx + size * 0.55, hy - size * 0.8, earSize, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Внутренняя часть ушей
        this.ctx.fillStyle = CONFIG.COLORS.HAMSTER_FACE;
        this.ctx.beginPath();
        this.ctx.arc(hx - size * 0.55, hy - size * 0.8, earSize * 0.55, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.arc(hx + size * 0.55, hy - size * 0.8, earSize * 0.55, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Мордочка
        this.ctx.fillStyle = CONFIG.COLORS.HAMSTER_FACE;
        this.ctx.beginPath();
        this.ctx.ellipse(hx, hy + size * 0.15, size * 0.5, size * 0.35, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Нос
        this.ctx.fillStyle = CONFIG.COLORS.HAMSTER_NOSE;
        this.ctx.beginPath();
        this.ctx.arc(hx, hy + size * 0.1, size * 0.15, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.shadowBlur = 0;
        
        // Глаза
        const eyeSize = size * 0.18;
        this.ctx.fillStyle = 'black';
        this.ctx.beginPath();
        this.ctx.arc(hx - size * 0.3, hy - size * 0.15, eyeSize, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.arc(hx + size * 0.3, hy - size * 0.15, eyeSize, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Блики
        this.ctx.fillStyle = 'white';
        this.ctx.beginPath();
        this.ctx.arc(hx - size * 0.25, hy - size * 0.2, eyeSize * 0.4, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.arc(hx + size * 0.35, hy - size * 0.2, eyeSize * 0.4, 0, Math.PI * 2);
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
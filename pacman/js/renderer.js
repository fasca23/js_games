class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.frameCount = 0;
    }
    
    clear() {
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    drawMap(map) {
        for (let r = 0; r < CONFIG.ROWS; r++) {
            for (let c = 0; c < CONFIG.COLS; c++) {
                const x = c * CONFIG.CELL_SIZE;
                const y = r * CONFIG.CELL_SIZE;
                const cell = map.getCell(c, r);
                
                if (cell === CELL_TYPES.WALL) {
                    this.drawWall(x, y);
                } else if (cell === CELL_TYPES.DOT) {
                    this.drawDot(x, y);
                } else if (cell === CELL_TYPES.POWER) {
                    this.drawPower(x, y);
                }
            }
        }
    }
    
    drawWall(x, y) {
        this.ctx.fillStyle = CONFIG.COLORS.WALL;
        this.ctx.fillRect(x, y, CONFIG.CELL_SIZE, CONFIG.CELL_SIZE);
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(x + 2, y + 2, CONFIG.CELL_SIZE - 4, CONFIG.CELL_SIZE - 4);
    }
    
    drawDot(x, y) {
        this.ctx.fillStyle = CONFIG.COLORS.DOT;
        this.ctx.beginPath();
        this.ctx.arc(x + 10, y + 10, 3, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    drawPower(x, y) {
        const alpha = 0.5 + 0.3 * Math.sin(Date.now() / 200);
        this.ctx.fillStyle = `rgba(255, 184, 174, ${alpha})`;
        this.ctx.beginPath();
        this.ctx.arc(x + 10, y + 10, 7, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    drawPacman(pacman) {
        const px = pacman.x * CONFIG.CELL_SIZE;
        const py = pacman.y * CONFIG.CELL_SIZE;
        const { dx, dy } = pacman.getDirection();
        
        this.ctx.save();
        this.ctx.translate(px + 10, py + 10);
        
        let angle = 0;
        if (dx === 1) angle = 0;
        else if (dx === -1) angle = Math.PI;
        else if (dy === -1) angle = -Math.PI / 2;
        else if (dy === 1) angle = Math.PI / 2;
        
        this.ctx.rotate(angle);
        
        this.ctx.fillStyle = CONFIG.COLORS.PACMAN;
        this.ctx.beginPath();
        const mouthAngle = Math.abs(Math.sin(this.frameCount * 0.3)) * 0.25 * Math.PI;
        this.ctx.arc(0, 0, 9, mouthAngle, 2 * Math.PI - mouthAngle);
        this.ctx.lineTo(0, 0);
        this.ctx.fill();
        
        this.ctx.restore();
    }
    
    drawGhosts(ghostPositions, mode) {
        ghostPositions.forEach((ghost, index) => {
            const x = ghost.x * CONFIG.CELL_SIZE;
            const y = ghost.y * CONFIG.CELL_SIZE;
            
            if (ghost.exitTimer > 0 && ghost.y > 8) return;
            
            const color = mode === 'frightened' ? CONFIG.COLORS.GHOST_FRIGHTENED : ghost.color;
            
            this.ctx.fillStyle = color;
            this.ctx.beginPath();
            this.ctx.arc(x + 10, y + 10, 9, Math.PI, 0);
            
            const waveOffset = Math.sin(Date.now() / 200 + index) * 2;
            const bottomY = y + 19;
            
            for (let i = 0; i <= 4; i++) {
                const wx = x + (i * 20) / 4;
                const wy = bottomY + (i % 2 === 0 ? waveOffset : -waveOffset);
                this.ctx.lineTo(wx, wy);
            }
            
            this.ctx.lineTo(x + 1, y + 10);
            this.ctx.fill();
            
            this.ctx.fillStyle = '#fff';
            this.ctx.beginPath();
            this.ctx.arc(x + 6, y + 8, 4, 0, Math.PI * 2);
            this.ctx.arc(x + 14, y + 8, 4, 0, Math.PI * 2);
            this.ctx.fill();
            
            this.ctx.fillStyle = '#00f';
            this.ctx.beginPath();
            this.ctx.arc(x + 6 + ghost.dx * 1.5, y + 8 + ghost.dy * 1.5, 2, 0, Math.PI * 2);
            this.ctx.arc(x + 14 + ghost.dx * 1.5, y + 8 + ghost.dy * 1.5, 2, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }
    
    drawOverlay(text, color) {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = color;
        this.ctx.font = 'bold 24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(text, this.canvas.width / 2, this.canvas.height / 2);
    }
    
    update() {
        this.frameCount++;
    }
}
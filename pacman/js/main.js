document.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
    game.init();
    
    window.restartGame = () => game.init();
    window.togglePause = () => game.togglePause();
    window.setDirection = (dx, dy) => game.pacman.setDirection(dx, dy);
});
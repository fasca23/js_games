document.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
    game.init();
    
    // Глобальные функции для кнопок
    window.restartGame = () => game.init();
    window.togglePause = () => game.togglePause();
    window.setDirection = (dx, dy) => game.pacman.setDirection(dx, dy);
    
    // Мобильные кнопки управления
    const btnUp = document.getElementById('btnUp');
    const btnDown = document.getElementById('btnDown');
    const btnLeft = document.getElementById('btnLeft');
    const btnRight = document.getElementById('btnRight');
    
    if (btnUp) {
        btnUp.addEventListener('touchstart', (e) => {
            e.preventDefault();
            game.pacman.setDirection(0, -1);
        });
        btnUp.addEventListener('mousedown', (e) => {
            e.preventDefault();
            game.pacman.setDirection(0, -1);
        });
    }
    
    if (btnDown) {
        btnDown.addEventListener('touchstart', (e) => {
            e.preventDefault();
            game.pacman.setDirection(0, 1);
        });
        btnDown.addEventListener('mousedown', (e) => {
            e.preventDefault();
            game.pacman.setDirection(0, 1);
        });
    }
    
    if (btnLeft) {
        btnLeft.addEventListener('touchstart', (e) => {
            e.preventDefault();
            game.pacman.setDirection(-1, 0);
        });
        btnLeft.addEventListener('mousedown', (e) => {
            e.preventDefault();
            game.pacman.setDirection(-1, 0);
        });
    }
    
    if (btnRight) {
        btnRight.addEventListener('touchstart', (e) => {
            e.preventDefault();
            game.pacman.setDirection(1, 0);
        });
        btnRight.addEventListener('mousedown', (e) => {
            e.preventDefault();
            game.pacman.setDirection(1, 0);
        });
    }
});
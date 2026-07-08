document.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
    game.init();
    
    // Загружаем рекорд
    const highscoreValue = document.getElementById('highscoreValue');
    const savedTime = localStorage.getItem('spaceinvaders_best_time') || 0;
    if (highscoreValue) {
        highscoreValue.textContent = savedTime + 'с';
    }
    
    // Глобальные функции
    window.restartGame = () => game.init();
    window.togglePause = () => game.togglePause();
    
    // Мобильные кнопки
    const btnLeft = document.getElementById('btnLeft');
    const btnRight = document.getElementById('btnRight');
    const btnFire = document.getElementById('btnFire');
    
    if (btnLeft) {
        btnLeft.addEventListener('touchstart', (e) => {
            e.preventDefault();
            game.keys.ArrowLeft = true;
        });
        btnLeft.addEventListener('touchend', (e) => {
            e.preventDefault();
            game.keys.ArrowLeft = false;
        });
    }
    
    if (btnRight) {
        btnRight.addEventListener('touchstart', (e) => {
            e.preventDefault();
            game.keys.ArrowRight = true;
        });
        btnRight.addEventListener('touchend', (e) => {
            e.preventDefault();
            game.keys.ArrowRight = false;
        });
    }
    
    if (btnFire) {
        btnFire.addEventListener('touchstart', (e) => {
            e.preventDefault();
            game.keys.Space = true;
        });
        btnFire.addEventListener('touchend', (e) => {
            e.preventDefault();
            game.keys.Space = false;
        });
    }
});
document.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
    game.init();
    
    // Рекорд
    const highscoreValue = document.getElementById('highscoreValue');
    const saved = localStorage.getItem('hamster_highscore') || 0;
    if (highscoreValue) {
        highscoreValue.textContent = saved + '%';
    }
    
    window.restartGame = () => game.init();
    window.togglePause = () => game.togglePause();
    
    // Мобильные кнопки
    const btnUp = document.getElementById('btnUp');
    const btnDown = document.getElementById('btnDown');
    const btnLeft = document.getElementById('btnLeft');
    const btnRight = document.getElementById('btnRight');
    
    function addMoveButton(btn, dx, dy) {
        if (!btn) return;
        btn.style.touchAction = 'none';
        
        btn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            e.stopPropagation();
            game.hamster.setDirection(dx, dy);
        }, { passive: false });
        
        btn.addEventListener('mousedown', (e) => {
            e.preventDefault();
            e.stopPropagation();
            game.hamster.setDirection(dx, dy);
        });
    }
    
    addMoveButton(btnUp, 0, -1);
    addMoveButton(btnDown, 0, 1);
    addMoveButton(btnLeft, -1, 0);
    addMoveButton(btnRight, 1, 0);
    
    // Предотвращение скролла на кнопках
    const gameWrapper = document.querySelector('.game-wrapper');
    if (gameWrapper) {
        gameWrapper.addEventListener('touchmove', (e) => {
            if (e.target.closest('.control-btn')) {
                e.preventDefault();
            }
        }, { passive: false });
    }
});
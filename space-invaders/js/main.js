document.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
    game.init();
    
    game.updateRecordsDisplay();
    
    window.restartGame = () => game.init();
    window.togglePause = () => game.togglePause();
    
    // Мобильные кнопки
    const btnLeft = document.getElementById('btnLeft');
    const btnRight = document.getElementById('btnRight');
    const btnFire = document.getElementById('btnFire');
    
    function addMoveButton(btn, key) {
        if (!btn) return;
        
        btn.style.touchAction = 'none';
        
        btn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            e.stopPropagation();
            game.keys[key] = true;
        }, { passive: false });
        
        btn.addEventListener('touchend', (e) => {
            e.preventDefault();
            e.stopPropagation();
            game.keys[key] = false;
        }, { passive: false });
        
        btn.addEventListener('touchcancel', (e) => {
            e.preventDefault();
            e.stopPropagation();
            game.keys[key] = false;
        }, { passive: false });
        
        btn.addEventListener('mousedown', (e) => {
            e.preventDefault();
            e.stopPropagation();
            game.keys[key] = true;
        });
        
        btn.addEventListener('mouseup', (e) => {
            e.preventDefault();
            e.stopPropagation();
            game.keys[key] = false;
        });
        
        btn.addEventListener('mouseleave', (e) => {
            game.keys[key] = false;
        });
    }
    
    addMoveButton(btnLeft, 'ArrowLeft');
    addMoveButton(btnRight, 'ArrowRight');
    
    // Кнопка огня
    if (btnFire) {
        btnFire.style.touchAction = 'none';
        
        const toggleFire = (e) => {
            e.preventDefault();
            e.stopPropagation();
            game.autoFire = !game.autoFire;
            game.updateFireButton();
        };
        
        btnFire.addEventListener('touchstart', toggleFire, { passive: false });
        btnFire.addEventListener('click', toggleFire);
    }
    
    // Предотвращаем скролл на кнопках
    const gameWrapper = document.querySelector('.game-wrapper');
    if (gameWrapper) {
        gameWrapper.addEventListener('touchmove', (e) => {
            if (e.target.closest('.control-btn')) {
                e.preventDefault();
            }
        }, { passive: false });
    }
});
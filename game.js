// Configurações
const config = {
    gravity: 0.5,
    speed: 5,
    jump: 12
};

// Elementos
const game = document.getElementById('game');
const batman = document.getElementById('batman');
const hud = document.getElementById('hud');
const startScreen = document.getElementById('start-screen');
const startBtn = document.getElementById('start-btn');

// Estado do jogo
let gameState = {
    score: 0,
    lives: 3,
    vy: 0,
    platforms: [],
    enemies: [],
    running: false
};

// Iniciar jogo
function init() {
    gameState = {
        score: 0,
        lives: 3,
        vy: 0,
        platforms: [],
        enemies: [],
        running: true
    };
    
    startScreen.style.display = 'none';
    batman.style.left = '100px';
    batman.style.top = '300px';
    
    // Criar plataformas
    createPlatform(0, 380, 800, 20);
    createPlatform(100, 300, 200, 20);
    createPlatform(400, 250, 150, 20);
    
    // Criar inimigos
    createEnemy(300, 340);
    createEnemy(500, 190);
    
    updateHUD();
}

function createPlatform(x, y, w, h) {
    const platform = document.createElement('div');
    platform.className = 'platform';
    platform.style.left = x + 'px';
    platform.style.top = y + 'px';
    platform.style.width = w + 'px';
    game.appendChild(platform);
    gameState.platforms.push({x, y, w, h, el: platform});
}

function createEnemy(x, y) {
    const enemy = document.createElement('div');
    enemy.className = 'enemy';
    enemy.style.left = x + 'px';
    enemy.style.top = y + 'px';
    game.appendChild(enemy);
    gameState.enemies.push({x, y, el: enemy, dir: Math.random() > 0.5 ? 1 : -1});
}

function updateHUD() {
    hud.textContent = `Vidas: ${gameState.lives} | Pontos: ${gameState.score}`;
}

function update() {
    if (!gameState.running) return;
    
    // Gravidade
    gameState.vy += config.gravity;
    let top = parseInt(batman.style.top) + gameState.vy;
    batman.style.top = top + 'px';
    
    // Colisão com plataformas
    let onGround = false;
    const bx = parseInt(batman.style.left);
    const by = parseInt(batman.style.top);
    
    gameState.platforms.forEach(p => {
        if (bx < p.x + p.w && bx + 50 > p.x && 
            by < p.y + p.h && by + 80 > p.y && gameState.vy > 0) {
            batman.style.top = (p.y - 80) + 'px';
            gameState.vy = 0;
            onGround = true;
        }
    });
    
    // Movimentar inimigos
    gameState.enemies.forEach(e => {
        e.x += e.dir * 2;
        e.el.style.left = e.x + 'px';
        
        if (e.x < 0 || e.x > 760) e.dir *= -1;
    });
    
    // Verificar game over
    if (by > 400) {
        gameState.lives--;
        if (gameState.lives <= 0) gameOver();
        else {
            batman.style.left = '100px';
            batman.style.top = '300px';
            gameState.vy = 0;
        }
        updateHUD();
    }
    
    requestAnimationFrame(update);
}

function gameOver() {
    gameState.running = false;
    startScreen.style.display = 'flex';
    game.querySelectorAll('.platform, .enemy').forEach(el => el.remove());
}

// Controles
document.addEventListener('keydown', e => {
    if (!gameState.running) return;
    
    const left = parseInt(batman.style.left);
    
    if (e.key === 'ArrowLeft') batman.style.left = (left - config.speed) + 'px';
    if (e.key === 'ArrowRight') batman.style.left = (left + config.speed) + 'px';
    if (e.key === ' ' && gameState.vy === 0) gameState.vy = -config.jump;
    if (e.key === 'f') shootBatarang();
});

function shootBatarang() {
    const batarang = document.createElement('div');
    batarang.className = 'batarang';
    batarang.style.left = (parseInt(batman.style.left) + 25) + 'px';
    batarang.style.top = (parseInt(batman.style.top) + 40) + 'px';
    game.appendChild(batarang);
    
    let pos = parseInt(batarang.style.left);
    const move = setInterval(() => {
        pos += 10;
        batarang.style.left = pos + 'px';
        
        if (pos > 800) {
            clearInterval(move);
            batarang.remove();
        }
    }, 30);
}

// Iniciar
startBtn.addEventListener('click', init);
init();
update();
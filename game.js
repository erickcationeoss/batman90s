// Configurações
const player = document.getElementById('player');
const enemy = document.getElementById('enemy');
const stageWidth = 800;
let playerHP = 100;
let enemyHP = 100;
let stamina = 100;
let isJumping = false;
let isDefending = false;
let isAttacking = false;
let playerPos = 100;
let enemyPos = 620;
let enemyDirection = -1;
let enemySpeed = 0;

// Inicia o jogo
function init() {
    updateUI();
    gameLoop();
}

// Atualiza interface
function updateUI() {
    document.getElementById('health').textContent = playerHP;
    document.getElementById('enemy-health').textContent = enemyHP;
    document.getElementById('stamina').textContent = stamina;
}

// Loop principal
function gameLoop() {
    requestAnimationFrame(gameLoop);
    enemyAI();
}

// Controles
document.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    if (key === 'a' && playerPos > 0) playerPos -= 8;
    if (key === 'd' && playerPos < stageWidth - 80) playerPos += 8;
    if (key === 'w' && !isJumping) jump();
    if (key === ' ' && stamina >= 20 && !isAttacking) attack('punch');
    if (key === 's' && stamina >= 30 && !isAttacking) attack('kick');
    if (key === 'f') defend();
    player.style.left = playerPos + 'px';
});

document.addEventListener('keyup', (e) => {
    if (e.key.toLowerCase() === 'f') {
        isDefending = false;
        player.classList.remove('defending');
    }
});

// Pulo
function jump() {
    isJumping = true;
    let velocity = -15;
    let position = 0;

    const jumpInterval = setInterval(() => {
        position += velocity;
        velocity += 0.7;
        player.style.bottom = (20 + position) + 'px';

        if (position >= 0) {
            player.style.bottom = '20px';
            clearInterval(jumpInterval);
            isJumping = false;
        }
    }, 16);
}

// Ataque
function attack(type) {
    isAttacking = true;
    const damage = type === 'punch' ? 10 : 15;
    stamina -= type === 'punch' ? 20 : 30;

    player.classList.add('attacking');
    setTimeout(() => {
        player.classList.remove('attacking');
        isAttacking = false;
    }, 200);

    if (Math.abs(playerPos - enemyPos) < 120) {
        enemyHP -= damage;
        enemy.classList.add('attacking');
        setTimeout(() => enemy.classList.remove('attacking'), 200);
    }
    updateUI();
}

// Defesa
function defend() {
    isDefending = true;
    player.classList.add('defending');
}

// IA do Inimigo
function enemyAI() {
    // Movimento
    enemySpeed = enemyDirection * 2;
    enemyPos += enemySpeed;

    // Mudança de direção
    if (enemyPos <= 0 || enemyPos >= stageWidth - 80) {
        enemyDirection *= -1;
    }

    // Ataque
    if (Math.random() < 0.015 && Math.abs(playerPos - enemyPos) < 200) {
        enemyAttack();
    }

    enemy.style.left = enemyPos + 'px';
}

// Ataque do Inimigo
function enemyAttack() {
    enemy.classList.add('attacking');
    setTimeout(() => {
        enemy.classList.remove('attacking');
        if (Math.abs(playerPos - enemyPos) < 120 && !isDefending) {
            playerHP -= 12;
            updateUI();
            
            if (playerHP <= 0) {
                alert(`GAME OVER!`);
                resetGame();
            }
        }
    }, 200);
}

// Regenera Stamina
setInterval(() => {
    if (stamina < 100) stamina += 0.5;
    updateUI();
}, 100);

// Reinicia o jogo
function resetGame() {
    playerHP = 100;
    enemyHP = 100;
    stamina = 100;
    playerPos = 100;
    enemyPos = 620;
    player.style.left = playerPos + 'px';
    enemy.style.left = enemyPos + 'px';
    updateUI();
}

// Inicia
init();
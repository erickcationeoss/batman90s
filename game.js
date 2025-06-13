// Variáveis do jogo
let playerCharacter = null;
let playerHP = 100;
let enemyHP = 100;
let isJumping = false;
let isDefending = false;
let isAttacking = false;
let playerPos = 100;
let enemyPos = 620;
let enemyDirection = -1;

// Elementos DOM
const characterSelect = document.getElementById('character-select');
const gameScreen = document.getElementById('game-screen');
const playerElement = document.getElementById('player');
const enemyElement = document.getElementById('enemy');
const playerHealthBar = document.getElementById('player-health');
const enemyHealthBar = document.getElementById('enemy-health');
const effectsContainer = document.getElementById('effects');

// Seleção de Personagem
function selectCharacter(character) {
    playerCharacter = character;
    characterSelect.style.display = 'none';
    gameScreen.style.display = 'block';
    startGame();
}

// Inicia o jogo
function startGame() {
    updateUI();
    gameLoop();
}

// Atualiza a interface
function updateUI() {
    playerHealthBar.style.width = `${playerHP}%`;
    enemyHealthBar.style.width = `${enemyHP}%`;
}

// Loop principal
function gameLoop() {
    requestAnimationFrame(gameLoop);
    enemyAI();
}

// Controles
document.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    if (key === 'a' && playerPos > 0) playerPos -= 10;
    if (key === 'd' && playerPos < 800 - 80) playerPos += 10;
    if (key === 'w' && !isJumping) jump();
    if (key === ' ' && !isAttacking) attack('punch');
    if (key === 's' && !isAttacking) attack('kick');
    if (key === 'f') defend();
    playerElement.style.left = playerPos + 'px';
});

document.addEventListener('keyup', (e) => {
    if (e.key.toLowerCase() === 'f') {
        isDefending = false;
        playerElement.classList.remove('defending');
    }
});

// Pulo
function jump() {
    isJumping = true;
    let velocity = -15;
    let position = 0;

    const jumpInterval = setInterval(() => {
        position += velocity;
        velocity += 0.8;
        playerElement.style.bottom = (20 + position) + 'px';

        if (position >= 0) {
            playerElement.style.bottom = '20px';
            clearInterval(jumpInterval);
            isJumping = false;
        }
    }, 20);
}

// Ataque
function attack(type) {
    isAttacking = true;
    const damage = type === 'punch' ? 10 : 15;

    playerElement.classList.add('attacking');
    setTimeout(() => {
        playerElement.classList.remove('attacking');
        isAttacking = false;
    }, 200);

    if (Math.abs(playerPos - enemyPos) < 120) {
        createHitEffect(enemyPos + 40, 100);
        enemyHP -= damage;
        enemyElement.classList.add('attacking');
        setTimeout(() => enemyElement.classList.remove('attacking'), 200);
        
        if (enemyHP <= 0) {
            enemyHP = 0;
            endGame();
        }
    }
    updateUI();
}

// Defesa
function defend() {
    isDefending = true;
    playerElement.classList.add('defending');
}

// Efeito de hit
function createHitEffect(x, y) {
    const effect = document.createElement('div');
    effect.className = 'effect hit-effect';
    effect.style.left = `${x - 25}px`;
    effect.style.top = `${y - 25}px`;
    effectsContainer.appendChild(effect);
    
    setTimeout(() => {
        effect.remove();
    }, 300);
}

// IA do Inimigo
function enemyAI() {
    // Movimento
    enemyPos += enemyDirection * 3;

    // Mudança de direção
    if (enemyPos <= 0 || enemyPos >= 800 - 80) {
        enemyDirection *= -1;
    }

    // Ataque aleatório
    if (Math.random() < 0.01 && Math.abs(playerPos - enemyPos) < 150) {
        enemyAttack();
    }

    enemyElement.style.left = enemyPos + 'px';
}

// Ataque do Inimigo
function enemyAttack() {
    enemyElement.classList.add('attacking');
    setTimeout(() => {
        enemyElement.classList.remove('attacking');
        if (Math.abs(playerPos - enemyPos) < 120 && !isDefending) {
            createHitEffect(playerPos + 40, 100);
            playerHP -= 10;
            
            if (playerHP <= 0) {
                playerHP = 0;
                endGame();
            }
        }
    }, 200);
}

// Finaliza o jogo
function endGame() {
    alert(playerHP <= 0 ? "Você perdeu!" : "Você venceu!");
    resetGame();
}

// Reinicia o jogo
function resetGame() {
    playerHP = 100;
    enemyHP = 100;
    playerPos = 100;
    enemyPos = 620;
    playerElement.style.left = playerPos + 'px';
    enemyElement.style.left = enemyPos + 'px';
    updateUI();
}
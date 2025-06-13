// Variáveis globais
let playerCharacter = null;
let playerHP = 100;
let enemyHP = 100;
let isJumping = false;
let isDefending = false;
let isAttacking = false;
let playerPos = 100;
let enemyPos = 620;
let enemyDirection = -1;
let gameActive = false;

// Elementos DOM
const characterSelect = document.getElementById('character-select');
const gameScreen = document.getElementById('game-screen');
const playerElement = document.getElementById('player');
const enemyElement = document.getElementById('enemy');
const playerHealthBar = document.getElementById('player-health');
const enemyHealthBar = document.getElementById('enemy-health');
const effectsContainer = document.getElementById('effects');

// Inicialização
document.getElementById('hero').addEventListener('click', () => selectCharacter('hero'));
document.getElementById('villain').addEventListener('click', () => selectCharacter('villain'));

function selectCharacter(character) {
    playerCharacter = character;
    characterSelect.style.display = 'none';
    gameScreen.style.display = 'block';
    startGame();
}

function startGame() {
    gameActive = true;
    updateUI();
    requestAnimationFrame(gameLoop);
}

function updateUI() {
    playerHealthBar.style.width = `${playerHP}%`;
    enemyHealthBar.style.width = `${enemyHP}%`;
}

// Controles
const keys = {
    a: false,
    d: false,
    w: false,
    ' ': false,
    s: false,
    f: false
};

document.addEventListener('keydown', (e) => {
    if (!gameActive) return;
    const key = e.key.toLowerCase();
    if (key in keys) keys[key] = true;
});

document.addEventListener('keyup', (e) => {
    const key = e.key.toLowerCase();
    if (key in keys) keys[key] = false;
    if (key === 'f') isDefending = false;
});

// Loop principal
function gameLoop() {
    if (!gameActive) return;
    
    // Movimento do jogador
    if (keys.a) playerPos = Math.max(0, playerPos - 5);
    if (keys.d) playerPos = Math.min(720, playerPos + 5);
    if (keys.w && !isJumping) jump();
    if (keys[' '] && !isAttacking) attack('punch');
    if (keys.s && !isAttacking) attack('kick');
    if (keys.f) defend();

    playerElement.style.left = `${playerPos}px`;
    
    // IA do inimigo
    enemyAI();
    
    requestAnimationFrame(gameLoop);
}

// Sistema de pulo
function jump() {
    isJumping = true;
    let velocity = -12;
    let position = 0;

    const jumpInterval = setInterval(() => {
        position += velocity;
        velocity += 0.7;
        playerElement.style.bottom = `${20 + position}px`;

        if (position >= 0) {
            playerElement.style.bottom = '20px';
            clearInterval(jumpInterval);
            isJumping = false;
        }
    }, 16);
}

// Sistema de ataque
function attack(type) {
    isAttacking = true;
    const damage = type === 'punch' ? 10 : 15;

    playerElement.classList.add('attacking');
    setTimeout(() => {
        playerElement.classList.remove('attacking');
        isAttacking = false;
    }, 200);

    if (Math.abs(playerPos - enemyPos) < 100) {
        createHitEffect(enemyPos + 40, 100);
        enemyHP -= damage;
        enemyElement.classList.add('attacking');
        setTimeout(() => enemyElement.classList.remove('attacking'), 200);
        
        if (enemyHP <= 0) endGame(false);
    }
    updateUI();
}

// Sistema de defesa
function defend() {
    isDefending = true;
    playerElement.classList.add('defending');
}

// IA do inimigo (agora funcional)
function enemyAI() {
    // Movimento básico
    enemyPos += enemyDirection * 2;
    
    // Mudança de direção
    if (enemyPos <= 0 || enemyPos >= 720) {
        enemyDirection *= -1;
    }

    // Ataque aleatório
    if (Math.random() < 0.01 && Math.abs(playerPos - enemyPos) < 150) {
        enemyAttack();
    }

    enemyElement.style.left = `${enemyPos}px`;
}

function enemyAttack() {
    enemyElement.classList.add('attacking');
    setTimeout(() => {
        enemyElement.classList.remove('attacking');
        if (Math.abs(playerPos - enemyPos) < 100 && !isDefending) {
            createHitEffect(playerPos + 40, 100);
            playerHP -= 10;
            if (playerHP <= 0) endGame(true);
            updateUI();
        }
    }, 200);
}

// Efeitos visuais
function createHitEffect(x, y) {
    const effect = document.createElement('div');
    effect.className = 'effect hit-effect';
    effect.style.left = `${x - 25}px`;
    effect.style.top = `${y - 25}px`;
    effectsContainer.appendChild(effect);
    setTimeout(() => effect.remove(), 300);
}

// Final do jogo
function endGame(playerLost) {
    gameActive = false;
    setTimeout(() => {
        alert(playerLost ? "Você perdeu!" : "Você venceu!");
        resetGame();
    }, 500);
}

function resetGame() {
    playerHP = 100;
    enemyHP = 100;
    playerPos = 100;
    enemyPos = 620;
    playerElement.style.left = `${playerPos}px`;
    enemyElement.style.left = `${enemyPos}px`;
    playerElement.classList.remove('defending', 'attacking');
    enemyElement.classList.remove('attacking');
    updateUI();
    characterSelect.style.display = 'flex';
    gameScreen.style.display = 'none';
}
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
            playerHP -= 12;a// Variáveis do jogo
let playerCharacter = null;
let playerHP = 100;
let enemyHP = 100;
let stamina = 100;
let isJumping = false;
let isDefending = false;
let isAttacking = false;
let playerPos = 100;
let enemyPos = 620;
let enemyDirection = -1;
let round = 1;
let gameActive = false;

// Elementos DOM
const characterSelect = document.getElementById('character-select');
const gameScreen = document.getElementById('game-screen');
const playerElement = document.getElementById('player');
const enemyElement = document.getElementById('enemy');
const playerHealthBar = document.getElementById('player-health');
const enemyHealthBar = document.getElementById('enemy-health');
const effectsContainer = document.getElementById('effects');
const roundElement = document.querySelector('.round');

// Seleção de Personagem
function selectCharacter(character) {
    playerCharacter = character;
    characterSelect.style.display = 'none';
    gameScreen.style.display = 'block';
    
    if (character === 'villain') {
        playerElement.style.background = '#ff3333';
        playerElement.style.borderColor = '#cc1111';
        enemyElement.style.background = '#3366ff';
        enemyElement.style.borderColor = '#1144cc';
    }
    
    startGame();
}

// Inicia o jogo
function startGame() {
    gameActive = true;
    updateUI();
    announceRound();
    gameLoop();
}

// Anuncia o round
function announceRound() {
    roundElement.textContent = `ROUND ${round}`;
    roundElement.style.display = 'block';
    
    setTimeout(() => {
        roundElement.style.display = 'none';
    }, 2000);
}

// Atualiza a interface
function updateUI() {
    playerHealthBar.style.width = `${playerHP}%`;
    enemyHealthBar.style.width = `${enemyHP}%`;
    
    // Muda cor da barra conforme a vida
    playerHealthBar.style.background = playerHP > 30 ? '#0f0' : '#f00';
    enemyHealthBar.style.background = enemyHP > 30 ? '#0f0' : '#f00';
}

// Loop principal
function gameLoop() {
    if (!gameActive) return;
    
    requestAnimationFrame(gameLoop);
    enemyAI();
    updateUI();
}

// Controles
document.addEventListener('keydown', (e) => {
    if (!gameActive) return;
    
    const key = e.key.toLowerCase();
    if (key === 'a' && playerPos > 0) playerPos -= 8;
    if (key === 'd' && playerPos < stageWidth - 80) playerPos += 8;
    if (key === 'w' && !isJumping) jump();
    if (key === ' ' && stamina >= 20 && !isAttacking) attack('punch');
    if (key === 's' && stamina >= 30 && !isAttacking) attack('kick');
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
        velocity += 0.7;
        playerElement.style.bottom = (20 + position) + 'px';

        if (position >= 0) {
            playerElement.style.bottom = '20px';
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
            endRound('player');
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

// Efeito de K.O.
function createKOEffect() {
    const ko = document.createElement('div');
    ko.className = 'effect ko-effect';
    ko.textContent = 'K.O.!';
    effectsContainer.appendChild(ko);
    
    setTimeout(() => {
        ko.remove();
    }, 1500);
}

// IA do Inimigo
function enemyAI() {
    // Movimento
    enemySpeed = enemyDirection * 2;
    enemyPos += enemySpeed;

    // Mudança de direção
    if (enemyPos <= 0 || enemyPos >= 800 - 80) {
        enemyDirection *= -1;
    }

    // Ataque
    if (Math.random() < 0.015 && Math.abs(playerPos - enemyPos) < 200) {
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
            playerHP -= 12;
            
            if (playerHP <= 0) {
                playerHP = 0;
                endRound('enemy');
            }
        }
    }, 200);
}

// Finaliza o round
function endRound(winner) {
    gameActive = false;
    createKOEffect();
    
    setTimeout(() => {
        if (round < 3) {
            round++;
            resetRound();
            announceRound();
            gameActive = true;
        } else {
            alert(`${winner === 'player' ? 'PLAYER 1' : 'PLAYER 2'} VENCEU!`);
            resetGame();
        }
    }, 2000);
}

// Reseta o round
function resetRound() {
    playerHP = 100;
    enemyHP = 100;
    stamina = 100;
    playerPos = 100;
    enemyPos = 620;
    playerElement.style.left = playerPos + 'px';
    enemyElement.style.left = enemyPos + 'px';
    updateUI();
}

// Reseta o jogo
function resetGame() {
    round = 1;
    characterSelect.style.display = 'flex';
    gameScreen.style.display = 'none';
    resetRound();
}
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
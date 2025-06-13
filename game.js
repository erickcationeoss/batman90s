// Variáveis do jogo
let playerCharacter = null;
let playerHP = 100;
let enemyHP = 100;
let stamina = 100;
let isJumping = false;
let isDefending = false;
let isAttacking = false;
let playerPos = 100;
let enemyPos = 920;
let enemyDirection = -1;
let round = 1;
let gameActive = false;
let specialCooldown = false;
let timeLeft = 99;
let timerInterval;

// Elementos DOM
const characterSelect = document.getElementById('character-select');
const gameScreen = document.getElementById('game-screen');
const playerElement = document.getElementById('player');
const enemyElement = document.getElementById('enemy');
const playerHealthBar = document.getElementById('player-health');
const enemyHealthBar = document.getElementById('enemy-health');
const effectsContainer = document.getElementById('effects');
const roundElement = document.querySelector('.round');
const playerNameElement = document.getElementById('player-name');
const enemyNameElement = document.getElementById('enemy-name');
const timerElement = document.querySelector('.timer');

// Seleção de Personagem
function selectCharacter(character) {
    playerCharacter = character;
    characterSelect.style.display = 'none';
    gameScreen.style.display = 'block';
    
    if (character === 'villain') {
        playerNameElement.textContent = 'VEGA';
        enemyNameElement.textContent = 'RYU';
    } else {
        playerNameElement.textContent = 'RYU';
        enemyNameElement.textContent = 'VEGA';
    }
    
    startGame();
}

// Inicia o jogo
function startGame() {
    gameActive = true;
    updateUI();
    announceRound();
    startTimer();
    gameLoop();
}

// Temporizador
function startTimer() {
    timeLeft = 99;
    timerElement.textContent = timeLeft;
    
    if (timerInterval) clearInterval(timerInterval);
    
    timerInterval = setInterval(() => {
        timeLeft--;
        timerElement.textContent = timeLeft;
        
        if (timeLeft <= 0) {
            endRound('timeout');
        }
    }, 1000);
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
    if (key === 'd' && playerPos < 1000 - 80) playerPos += 8;
    if (key === 'w' && !isJumping) jump();
    if (key === ' ' && stamina >= 20 && !isAttacking) attack('punch');
    if (key === 's' && stamina >= 30 && !isAttacking) attack('kick');
    if (key === 'f') defend();
    if (key === 'q' && !specialCooldown) specialAttack();
    
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

// Ataque básico
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

// Ataque especial
function specialAttack() {
    if (stamina < 50) return;
    
    specialCooldown = true;
    stamina -= 50;
    
    if (playerCharacter === 'hero') {
        // Hadouken
        const hadouken = document.createElement('div');
        hadouken.className = 'effect hadouken';
        hadouken.style.left = `${playerPos + 80}px`;
        hadouken.style.bottom = '100px';
        effectsContainer.appendChild(hadouken);
        
        setTimeout(() => {
            hadouken.remove();
            if (Math.abs(playerPos - enemyPos) < 200) {
                enemyHP -= 30;
                createHitEffect(enemyPos + 40, 100);
                if (enemyHP <= 0) {
                    enemyHP = 0;
                    endRound('player');
                }
            }
        }, 1000);
    } else {
        // Arranhão
        const claw = document.createElement('div');
        claw.className = 'effect claw';
        claw.style.left = `${playerPos + 80}px`;
        claw.style.bottom = '100px';
        effectsContainer.appendChild(claw);
        
        setTimeout(() => {
            claw.remove();
            if (Math.abs(playerPos - enemyPos) < 120) {
                enemyHP -= 25;
                createHitEffect(enemyPos + 40, 100);
                if (enemyHP <= 0) {
                    enemyHP = 0;
                    endRound('player');
                }
            }
        }, 400);
    }
    
    setTimeout(() => {
        specialCooldown = false;
    }, 3000);
    
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
    if (enemyPos <= 0 || enemyPos >= 1000 - 80) {
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
    clearInterval(timerInterval);
    
    if (winner !== 'timeout') {
        createKOEffect();
    }
    
    setTimeout(() => {
        if (round < 3) {
            round++;
            resetRound();
            announceRound();
            startTimer();
            gameActive = true;
        } else {
            alert(`${winner === 'player' ? playerNameElement.textContent : enemyNameElement.textContent} VENCEU!`);
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
    enemyPos = 920;
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
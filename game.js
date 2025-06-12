// Variáveis do jogo
const player = document.getElementById('player');
const enemy = document.getElementById('enemy');
let playerHP = 100;
let enemyHP = 100;
let score = 0;
let stamina = 100;
let isJumping = false;
let isDefending = false;
let playerPos = 100;
let enemyPos = 620;
let enemySpeed = 0;
let enemyDirection = -1; // -1 = esquerda, 1 = direita
const stageWidth = 800;

// Atualiza a tela
function updateDisplay() {
    document.getElementById('health').textContent = playerHP;
    document.getElementById('score').textContent = score;
    document.getElementById('stamina').textContent = stamina;
}

// Controles
document.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    if (key === 'a' && playerPos > 0) {
        playerPos -= 10;
    } else if (key === 'd' && playerPos < stageWidth - 80) {
        playerPos += 10;
    } else if (key === 'w' && !isJumping) {
        jump();
    } else if (key === ' ' && stamina >= 20) {
        attack('punch');
    } else if (key === 's' && stamina >= 30) {
        attack('kick');
    } else if (key === 'f') {
        defend();
    }
    player.style.left = playerPos + 'px';
});

document.addEventListener('keyup', (e) => {
    if (e.key.toLowerCase() === 'f') {
        isDefending = false;
        player.style.backgroundColor = 'rgba(52, 152, 219, 0.3)';
    }
});

// Pulo com física
function jump() {
    if (isJumping) return;
    isJumping = true;
    let velocity = -15;
    let position = 0;

    const jumpInterval = setInterval(() => {
        position += velocity;
        velocity += 0.8; // Gravidade
        player.style.bottom = position + 'px';

        if (position >= 0) {
            player.style.bottom = '0';
            clearInterval(jumpInterval);
            isJumping = false;
        }
    }, 20);
}

// Ataque (soco ou chute)
function attack(type) {
    if (isAttacking) return;
    isAttacking = true;
    const damage = type === 'punch' ? 10 : 15;
    stamina -= type === 'punch' ? 20 : 30;

    player.classList.add('attacking');
    setTimeout(() => {
        player.classList.remove('attacking');
        isAttacking = false;
    }, 200);

    // Verifica colisão
    if (Math.abs(playerPos - enemyPos) < 100) {
        enemyHP -= damage;
        score += damage;
        enemy.style.backgroundColor = 'rgba(255, 0, 0, 0.5)';
        setTimeout(() => {
            enemy.style.backgroundColor = 'rgba(231, 76, 60, 0.3)';
        }, 200);
    }
    updateDisplay();
}

// Defesa
function defend() {
    isDefending = true;
    player.style.backgroundColor = 'rgba(52, 152, 219, 0.6)';
}

// IA do Inimigo (movimento fluido)
function enemyAI() {
    // Movimento com aceleração
    enemySpeed = enemyDirection * 2;
    enemyPos += enemySpeed;

    // Muda de direção ao chegar nos limites
    if (enemyPos <= 0 || enemyPos >= stageWidth - 80) {
        enemyDirection *= -1;
    }

    // Ataque aleatório
    if (Math.random() < 0.01 && Math.abs(playerPos - enemyPos) < 150) {
        enemyAttack();
    }

    enemy.style.left = enemyPos + 'px';
}

// Ataque do inimigo
function enemyAttack() {
    enemy.classList.add('attacking');
    setTimeout(() => {
        enemy.classList.remove('attacking');
        if (Math.abs(playerPos - enemyPos) < 100 && !isDefending) {
            playerHP -= 10;
            player.style.backgroundColor = 'rgba(255, 0, 0, 0.5)';
            setTimeout(() => {
                player.style.backgroundColor = 'rgba(52, 152, 219, 0.3)';
            }, 200);
            updateDisplay();
        }
    }, 200);
}

// Regenera stamina
setInterval(() => {
    if (stamina < 100) stamina += 1;
    updateDisplay();
}, 200);

// Loop principal
setInterval(enemyAI, 50);
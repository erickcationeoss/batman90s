// Variáveis do jogo
const player = document.getElementById('player');
const enemy = document.getElementById('enemy');
let playerHP = 100;
let score = 0;
let isJumping = false;
let isDefending = false;
let playerPos = 100;
let enemyPos = 450;
let enemyDirection = -1; // -1 = esquerda, 1 = direita

// Controles
document.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    if (key === 'a' && playerPos > 0) {
        playerPos -= 10;
    } else if (key === 'd' && playerPos < 550) {
        playerPos += 10;
    } else if (key === 'w' && !isJumping) {
        jump();
    } else if (key === ' ' && !isDefending) {
        attack('punch');
    } else if (key === 's' && !isDefending) {
        attack('kick');
    } else if (key === 'f') {
        defend();
    }
    player.style.left = playerPos + 'px';
});

document.addEventListener('keyup', (e) => {
    if (e.key.toLowerCase() === 'f') {
        isDefending = false;
        const defense = document.querySelector('.defense');
        if (defense) defense.remove();
    }
});

// Pulo
function jump() {
    isJumping = true;
    let jumpHeight = 0;
    const jumpInterval = setInterval(() => {
        jumpHeight += 4;
        player.style.bottom = jumpHeight + 'px';
        if (jumpHeight >= 80) {
            clearInterval(jumpInterval);
            const fallInterval = setInterval(() => {
                jumpHeight -= 4;
                player.style.bottom = jumpHeight + 'px';
                if (jumpHeight <= 0) {
                    clearInterval(fallInterval);
                    isJumping = false;
                }
            }, 20);
        }
    }, 20);
}

// Ataque (soco ou chute)
function attack(type) {
    const attackBox = document.createElement('div');
    attackBox.className = `attack ${type}`;
    attackBox.style.left = (playerPos + 50) + 'px';
    document.querySelector('.stage').appendChild(attackBox);

    const attackInterval = setInterval(() => {
        const currentPos = parseInt(attackBox.style.left);
        attackBox.style.left = (currentPos + 15) + 'px';

        // Colisão com o inimigo
        if (currentPos + 30 > enemyPos && currentPos < enemyPos + 50) {
            clearInterval(attackInterval);
            attackBox.remove();
            score += type === 'punch' ? 10 : 15;
            document.getElementById('score').textContent = score;
        } else if (currentPos > 600) {
            clearInterval(attackInterval);
            attackBox.remove();
        }
    }, 20);
}

// Defesa
function defend() {
    isDefending = true;
    const defense = document.createElement('div');
    defense.className = 'defense';
    defense.style.left = playerPos + 'px';
    document.querySelector('.stage').appendChild(defense);
}

// IA do Inimigo
function enemyAI() {
    // Movimento aleatório
    enemyPos += enemyDirection * 5;
    if (enemyPos <= 0 || enemyPos >= 550) {
        enemyDirection *= -1;
    }
    enemy.style.left = enemyPos + 'px';

    // Ataque aleatório
    if (Math.random() < 0.02) {
        const enemyAttack = document.createElement('div');
        enemyAttack.className = 'attack punch';
        enemyAttack.style.left = (enemyPos - 20) + 'px';
        document.querySelector('.stage').appendChild(enemyAttack);

        const attackInterval = setInterval(() => {
            const currentPos = parseInt(enemyAttack.style.left);
            enemyAttack.style.left = (currentPos - 10) + 'px';

            // Colisão com o jogador
            if (currentPos < playerPos + 50 && currentPos > playerPos) {
                if (!isDefending) {
                    playerHP -= 10;
                    document.getElementById('health').textContent = playerHP;
                    if (playerHP <= 0) {
                        alert(`Game Over! Pontuação: ${score}`);
                        resetGame();
                    }
                }
                clearInterval(attackInterval);
                enemyAttack.remove();
            } else if (currentPos < 0) {
                clearInterval(attackInterval);
                enemyAttack.remove();
            }
        }, 20);
    }
}

// Reinicia o jogo
function resetGame() {
    playerHP = 100;
    score = 0;
    document.getElementById('health').textContent = playerHP;
    document.getElementById('score').textContent = score;
    playerPos = 100;
    enemyPos = 450;
    player.style.left = playerPos + 'px';
    enemy.style.left = enemyPos + 'px';
}

// Loop do jogo
setInterval(enemyAI, 50);
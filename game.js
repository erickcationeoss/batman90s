// Variáveis do jogo
const player = document.getElementById('player');
const enemy = document.getElementById('enemy');
const stage = document.querySelector('.stage');
let playerHP = 100;
let score = 0;
let isJumping = false;
let playerPos = 50;
let enemyAttackInterval;

// Movimento do jogador
document.addEventListener('keydown', (e) => {
    switch (e.key.toLowerCase()) {
        case 'a': // Esquerda
            playerPos = Math.max(0, playerPos - 10);
            break;
        case 'd': // Direita
            playerPos = Math.min(550, playerPos + 10);
            break;
        case 'w': // Pulo
            if (!isJumping) jump();
            break;
        case ' ': // Ataque
            attack();
            break;
    }
    player.style.left = playerPos + 'px';
});

// Pulo
function jump() {
    isJumping = true;
    let jumpHeight = 0;
    const jumpUp = setInterval(() => {
        jumpHeight += 2;
        player.style.bottom = jumpHeight + 'px';
        if (jumpHeight >= 50) {
            clearInterval(jumpUp);
            const jumpDown = setInterval(() => {
                jumpHeight -= 2;
                player.style.bottom = jumpHeight + 'px';
                if (jumpHeight <= 0) {
                    clearInterval(jumpDown);
                    isJumping = false;
                }
            }, 20);
        }
    }, 20);
}

// Ataque do jogador
function attack() {
    const attackBox = document.createElement('div');
    attackBox.className = 'attack';
    attackBox.style.left = (playerPos + 50) + 'px';
    stage.appendChild(attackBox);

    // Movimento do ataque
    const attackInterval = setInterval(() => {
        const currentPos = parseInt(attackBox.style.left);
        attackBox.style.left = (currentPos + 10) + 'px';

        // Verifica colisão com o inimigo
        if (currentPos > 500) {
            clearInterval(attackInterval);
            attackBox.remove();
            score += 10;
            document.getElementById('score').textContent = score;
        }
    }, 20);
}

// Ataque do inimigo (aleatório)
function startEnemyAttacks() {
    enemyAttackInterval = setInterval(() => {
        const attackBox = document.createElement('div');
        attackBox.className = 'attack';
        attackBox.style.left = '500px';
        stage.appendChild(attackBox);

        const attackInterval = setInterval(() => {
            const currentPos = parseInt(attackBox.style.left);
            attackBox.style.left = (currentPos - 10) + 'px';

            // Verifica colisão com o jogador
            if (currentPos < playerPos + 50 && currentPos > playerPos) {
                playerHP -= 10;
                document.getElementById('health').textContent = playerHP;
                if (playerHP <= 0) {
                    alert(`Game Over! Pontuação: ${score}`);
                    resetGame();
                }
            }

            if (currentPos < 0) {
                clearInterval(attackInterval);
                attackBox.remove();
            }
        }, 20);
    }, 2000); // Ataque a cada 2 segundos
}

// Reinicia o jogo
function resetGame() {
    playerHP = 100;
    score = 0;
    document.getElementById('health').textContent = playerHP;
    document.getElementById('score').textContent = score;
}

// Inicia o jogo
startEnemyAttacks();
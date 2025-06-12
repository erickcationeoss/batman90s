// Configurações do jogo
const config = {
    playerSpeed: 12,
    jumpForce: 20,
    gravity: 0.95,
    punchDamage: 15,
    kickDamage: 22,
    punchCost: 20,
    kickCost: 30,
    enemySpeed: 4,
    enemyAttackRange: 120,
    staminaRegen: 1,
    enemyAttackCooldown: 1500,
    playerAttackCooldown: 400,
    knockbackForce: 30
};

// Elementos do jogo
const player = document.getElementById('player');
const enemy = document.getElementById('enemy');
const stageWidth = 800;
const playerWidth = 60;
const enemyWidth = 60;

// Elementos de UI
const gameOverScreen = document.getElementById('game-over-screen');
const resultMessage = document.getElementById('result-message');
const finalScore = document.getElementById('final-score');
const restartButton = document.getElementById('restart-button');

// Estado do jogo
let gameState = {
    player: {
        hp: 100,
        maxHp: 100,
        stamina: 100,
        pos: 100,
        velY: 0,
        isJumping: false,
        isDefending: false,
        isAttacking: false,
        lastAttack: 0,
        direction: 1
    },
    enemy: {
        hp: 100,
        maxHp: 100,
        pos: stageWidth - 100 - enemyWidth,
        speed: 0,
        direction: -1,
        lastAttack: 0,
        isAttacking: false
    },
    score: 0,
    lastFrame: performance.now(),
    isGameOver: false,
    animationFrameId: null
};

// Controles
const keys = {
    a: false,
    d: false,
    w: false,
    ' ': false,
    s: false,
    f: false
};

// Inicialização
function initGame() {
    // Resetar estado
    resetGame();
    
    // Configurar controles
    document.addEventListener('keydown', (e) => {
        const key = e.key.toLowerCase();
        if (Object.keys(keys).includes(key)) {
            keys[key] = true;
            e.preventDefault();
        }
    });

    document.addEventListener('keyup', (e) => {
        const key = e.key.toLowerCase();
        if (Object.keys(keys).includes(key)) {
            keys[key] = false;
            e.preventDefault();
        }
        
        if (key === 'f') {
            gameState.player.isDefending = false;
            player.classList.remove('defending');
        }
    });

    restartButton.addEventListener('click', resetGame);
    
    // Iniciar loop do jogo
    gameState.animationFrameId = requestAnimationFrame(gameLoop);
}

// Atualiza a interface
function updateDisplay() {
    // Atualiza barras de vida
    const playerHealthPercent = (gameState.player.hp / gameState.player.maxHp) * 100;
    const enemyHealthPercent = (gameState.enemy.hp / gameState.enemy.maxHp) * 100;
    
    document.getElementById('player-health-fill').style.width = `${playerHealthPercent}%`;
    document.getElementById('enemy-health-fill').style.width = `${enemyHealthPercent}%`;
    
    document.getElementById('player-health-text').textContent = gameState.player.hp;
    document.getElementById('enemy-health-text').textContent = gameState.enemy.hp;
    document.getElementById('score').textContent = gameState.score;
}

// Movimento do jogador
function updatePlayer(deltaTime) {
    const playerState = gameState.player;
    
    // Movimento horizontal mais fluido
    if (keys.a) {
        playerState.pos -= config.playerSpeed * (deltaTime / 16);
        playerState.direction = -1;
    }
    if (keys.d) {
        playerState.pos += config.playerSpeed * (deltaTime / 16);
        playerState.direction = 1;
    }
    
    // Limites do palco
    playerState.pos = Math.max(0, Math.min(stageWidth - playerWidth, playerState.pos));
    
    // Pulo com física melhorada
    if (keys.w && !playerState.isJumping) {
        playerState.velY = -config.jumpForce;
        playerState.isJumping = true;
        player.classList.add('jumping');
    }
    
    // Aplicar gravidade com deltaTime
    playerState.velY += config.gravity * (deltaTime / 16);
    playerState.isJumping = playerState.velY < 0 || Math.abs(playerState.velY) > 0.1;
    
    // Atualizar estado de pulo
    player.classList.toggle('jumping', playerState.isJumping);
    
    // Ataques com cooldown
    const now = performance.now();
    if (!playerState.isAttacking) {
        if (keys[' '] && now - playerState.lastAttack > config.playerAttackCooldown) {
            attack('punch');
        } else if (keys.s && now - playerState.lastAttack > config.playerAttackCooldown + 100) {
            attack('kick');
        }
    }
    
    // Defesa
    if (keys.f && !playerState.isAttacking) {
        playerState.isDefending = true;
        player.classList.add('defending');
    }
    
    // Atualizar posição e direção
    player.style.left = `${playerState.pos}px`;
    player.style.transform = `scaleX(${playerState.direction})`;
}

// Ataque do jogador
function attack(type) {
    const playerState = gameState.player;
    const now = performance.now();
    
    playerState.isAttacking = true;
    playerState.lastAttack = now;
    
    const damage = type === 'punch' ? config.punchDamage : config.kickDamage;
    const staminaCost = type === 'punch' ? config.punchCost : config.kickCost;
    
    if (playerState.stamina < staminaCost) {
        playerState.isAttacking = false;
        return;
    }
    
    playerState.stamina -= staminaCost;
    player.classList.add('attacking');
    
    setTimeout(() => {
        player.classList.remove('attacking');
        playerState.isAttacking = false;
    }, type === 'punch' ? 150 : 200);
    
    // Verificar se acertou o inimigo
    if (Math.abs(playerState.pos - gameState.enemy.pos) < 100) {
        gameState.enemy.hp = Math.max(0, gameState.enemy.hp - damage);
        gameState.score += damage;
        enemy.classList.add('hurt');
        setTimeout(() => enemy.classList.remove('hurt'), 200);
        
        // Knockback no inimigo mais fluido
        const knockbackDir = playerState.pos < gameState.enemy.pos ? 1 : -1;
        gameState.enemy.pos += knockbackDir * (config.knockbackForce * (damage / 20));
    }
    
    updateDisplay();
    checkGameOver();
}

// IA do Inimigo
function updateEnemy(deltaTime) {
    const enemyState = gameState.enemy;
    const playerState = gameState.player;
    
    // Perseguição mais inteligente e fluida
    const targetPos = playerState.pos + (playerWidth/2) - (enemyWidth/2);
    const distance = targetPos - enemyState.pos;
    
    // Movimento com aceleração suave
    enemyState.speed = distance * 0.05 * (deltaTime / 16);
    
    // Limita a velocidade máxima
    enemyState.speed = Math.max(-config.enemySpeed, Math.min(config.enemySpeed, enemyState.speed));
    
    enemyState.pos += enemyState.speed;
    
    // Mantém dentro dos limites
    enemyState.pos = Math.max(0, Math.min(stageWidth - enemyWidth, enemyState.pos));
    
    // Direção do inimigo
    if (Math.abs(enemyState.speed) > 0.5) {
        enemyState.direction = Math.sign(enemyState.speed);
        enemy.style.transform = `scaleX(${enemyState.direction})`;
    }
    
    // Ataque com tempo de recarga
    const now = performance.now();
    if (Math.abs(playerState.pos - enemyState.pos) < config.enemyAttackRange && 
        !enemyState.isAttacking && 
        now - enemyState.lastAttack > config.enemyAttackCooldown) {
        enemyAttack();
        enemyState.lastAttack = now;
    }
    
    enemy.style.left = `${enemyState.pos}px`;
}

// Ataque do Inimigo
function enemyAttack() {
    const enemyState = gameState.enemy;
    const playerState = gameState.player;
    
    enemyState.isAttacking = true;
    enemy.classList.add('attacking');
    
    setTimeout(() => {
        enemy.classList.remove('attacking');
        enemyState.isAttacking = false;
        
        // Verifica se acertou o jogador
        if (Math.abs(playerState.pos - enemyState.pos) < 100) {
            if (!playerState.isDefending) {
                playerState.hp = Math.max(0, playerState.hp - 12);
                player.classList.add('hurt');
                setTimeout(() => player.classList.remove('hurt'), 200);
                
                // Knockback no jogador
                const knockbackDir = playerState.pos < enemyState.pos ? -1 : 1;
                playerState.pos += knockbackDir * (config.knockbackForce / 2);
            } else {
                // Defesa bem-sucedida
                playerState.stamina = Math.min(100, playerState.stamina + 8);
            }
            updateDisplay();
            checkGameOver();
        }
    }, 300);
}

// Regeneração de stamina
function regenStamina(deltaTime) {
    const playerState = gameState.player;
    
    if (!playerState.isAttacking && !playerState.isDefending) {
        playerState.stamina = Math.min(100, 
            playerState.stamina + (config.staminaRegen * (deltaTime / 16)));
    }
}

// Verifica condições de vitória/derrota
function checkGameOver() {
    if (gameState.isGameOver) return;
    
    if (gameState.player.hp <= 0) {
        endGame(false);
    } else if (gameState.enemy.hp <= 0) {
        endGame(true);
    }
}

// Finaliza o jogo
function endGame(isVictory) {
    gameState.isGameOver = true;
    cancelAnimationFrame(gameState.animationFrameId);
    
    resultMessage.textContent = isVictory ? "Você Venceu!" : "Game Over!";
    resultMessage.style.color = isVictory ? "#2ecc71" : "#e74c3c";
    finalScore.textContent = `Pontuação: ${gameState.score}`;
    gameOverScreen.style.display = "flex";
}

// Reinicia o jogo
function resetGame() {
    // Cancelar qualquer animação pendente
    if (gameState.animationFrameId) {
        cancelAnimationFrame(gameState.animationFrameId);
    }
    
    // Resetar estado
    gameState = {
        player: {
            hp: 100,
            maxHp: 100,
            stamina: 100,
            pos: 100,
            velY: 0,
            isJumping: false,
            isDefending: false,
            isAttacking: false,
            lastAttack: 0,
            direction: 1
        },
        enemy: {
            hp: 100,
            maxHp: 100,
            pos: stageWidth - 100 - enemyWidth,
            speed: 0,
            direction: -1,
            lastAttack: 0,
            isAttacking: false
        },
        score: 0,
        lastFrame: performance.now(),
        isGameOver: false,
        animationFrameId: null
    };
    
    // Resetar elementos visuais
    player.className = 'player';
    enemy.className = 'enemy';
    player.style.left = '100px';
    enemy.style.left = `${stageWidth - 100 - enemyWidth}px`;
    gameOverScreen.style.display = 'none';
    
    updateDisplay();
    
    // Reiniciar loop do jogo
    gameState.animationFrameId = requestAnimationFrame(gameLoop);
}

// Loop principal do jogo
function gameLoop(timestamp) {
    const deltaTime = timestamp - gameState.lastFrame;
    gameState.lastFrame = timestamp;
    
    if (!gameState.isGameOver) {
        updatePlayer(deltaTime);
        updateEnemy(deltaTime);
        regenStamina(deltaTime);
        checkGameOver();
    }
    
    gameState.animationFrameId = requestAnimationFrame(gameLoop);
}

// Iniciar o jogo quando a página carregar
window.addEventListener('load', initGame);
// Configurações do jogo
const config = {
    playerSpeed: 10,
    jumpForce: 18,
    gravity: 0.9,
    punchDamage: 15,
    kickDamage: 22,
    punchCost: 20,
    kickCost: 30,
    enemySpeed: 3,
    enemyAttackRange: 120,
    staminaRegen: 0.8,
    enemyAttackCooldown: 1500,
    playerAttackCooldown: 400
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
    lastFrame: 0,
    isGameOver: false
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
function init() {
    document.addEventListener('keydown', (e) => {
        const key = e.key.toLowerCase();
        if (Object.keys(keys).includes(key)) keys[key] = true;
    });

    document.addEventListener('keyup', (e) => {
        const key = e.key.toLowerCase();
        if (Object.keys(keys).includes(key)) keys[key] = false;
        
        if (key === 'f') {
            gameState.player.isDefending = false;
            player.classList.remove('defending');
        }
    });

    restartButton.addEventListener('click', resetGame);
    
    updateDisplay();
    requestAnimationFrame(gameLoop);
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
    const player = gameState.player;
    
    // Movimento horizontal
    if (keys.a) {
        player.pos -= config.playerSpeed;
        player.direction = -1;
    }
    if (keys.d) {
        player.pos += config.playerSpeed;
        player.direction = 1;
    }
    
    // Limites do palco
    player.pos = Math.max(0, Math.min(stageWidth - playerWidth, player.pos));
    
    // Pulo
    if (keys.w && !player.isJumping) {
        player.velY = -config.jumpForce;
        player.isJumping = true;
        player.classList.add('jumping');
    }
    
    // Aplicar gravidade
    player.velY += config.gravity;
    player.isJumping = player.velY !== 0;
    
    // Atualizar estado de pulo
    player.classList.toggle('jumping', player.isJumping);
    
    // Ataques
    const now = Date.now();
    if (!player.isAttacking) {
        if (keys[' '] && now - player.lastAttack > config.playerAttackCooldown) {
            attack('punch');
        } else if (keys.s && now - player.lastAttack > config.playerAttackCooldown + 100) {
            attack('kick');
        }
    }
    
    // Defesa
    if (keys.f) {
        player.isDefending = true;
        player.classList.add('defending');
    }
    
    // Atualizar posição e direção
    document.getElementById('player').style.left = player.pos + 'px';
    document.getElementById('player').style.transform = `scaleX(${player.direction})`;
}

// Ataque do jogador
function attack(type) {
    const player = gameState.player;
    const now = Date.now();
    
    player.isAttacking = true;
    player.lastAttack = now;
    
    const damage = type === 'punch' ? config.punchDamage : config.kickDamage;
    const staminaCost = type === 'punch' ? config.punchCost : config.kickCost;
    
    if (player.stamina < staminaCost) return;
    
    player.stamina -= staminaCost;
    player.classList.add('attacking');
    
    setTimeout(() => {
        player.classList.remove('attacking');
        player.isAttacking = false;
    }, type === 'punch' ? 150 : 200);
    
    // Verificar se acertou o inimigo
    if (Math.abs(player.pos - gameState.enemy.pos) < 100) {
        gameState.enemy.hp = Math.max(0, gameState.enemy.hp - damage);
        gameState.score += damage;
        enemy.classList.add('hurt');
        setTimeout(() => enemy.classList.remove('hurt'), 200);
        
        // Knockback no inimigo
        const knockbackDir = player.pos < gameState.enemy.pos ? 1 : -1;
        gameState.enemy.pos += knockbackDir * 20;
    }
    
    updateDisplay();
    checkGameOver();
}

// IA do Inimigo
function updateEnemy(deltaTime) {
    const enemy = gameState.enemy;
    const player = gameState.player;
    
    // Perseguição suave
    const targetPos = player.pos + (playerWidth/2) - (enemyWidth/2);
    const distance = targetPos - enemy.pos;
    
    // Suaviza o movimento com aceleração
    enemy.speed = distance * 0.04;
    
    // Limita a velocidade máxima
    enemy.speed = Math.max(-config.enemySpeed, Math.min(config.enemySpeed, enemy.speed));
    
    enemy.pos += enemy.speed * deltaTime * 0.1;
    
    // Mantém dentro dos limites
    enemy.pos = Math.max(0, Math.min(stageWidth - enemyWidth, enemy.pos));
    
    // Flip da direção
    if (enemy.speed !== 0) {
        enemy.direction = Math.sign(enemy.speed);
        enemy.style.transform = `scaleX(${enemy.direction})`;
    }
    
    // Ataque
    const now = Date.now();
    if (Math.abs(player.pos - enemy.pos) < config.enemyAttackRange && 
        !enemy.isAttacking && 
        now - enemy.lastAttack > config.enemyAttackCooldown) {
        enemyAttack();
        enemy.lastAttack = now;
    }
    
    enemy.style.left = enemy.pos + 'px';
}

// Ataque do Inimigo
function enemyAttack() {
    const enemy = gameState.enemy;
    const player = gameState.player;
    
    enemy.isAttacking = true;
    enemy.classList.add('attacking');
    
    setTimeout(() => {
        enemy.classList.remove('attacking');
        enemy.isAttacking = false;
        
        // Verifica se acertou o jogador
        if (Math.abs(player.pos - enemy.pos) < 100) {
            if (!player.isDefending) {
                player.hp = Math.max(0, player.hp - 12);
                player.classList.add('hurt');
                setTimeout(() => player.classList.remove('hurt'), 200);
                
                // Knockback no jogador
                const knockbackDir = player.pos < enemy.pos ? -1 : 1;
                player.pos += knockbackDir * 25;
            } else {
                // Defesa bem-sucedida
                player.stamina = Math.min(100, player.stamina + 8);
            }
            updateDisplay();
            checkGameOver();
        }
    }, 300);
}

// Regeneração de stamina
function regenStamina(deltaTime) {
    const player = gameState.player;
    
    if (!player.isAttacking && !player.isDefending) {
        player.stamina = Math.min(100, player.stamina + config.staminaRegen * deltaTime * 0.1);
    }
}

// Verifica condições de vitória/derrota
function checkGameOver() {
    if (gameState.isGameOver) return;
    
    if (gameState.player.hp <= 0) {
        gameState.isGameOver = true;
        showGameOver(false);
    } else if (gameState.enemy.hp <= 0) {
        gameState.isGameOver = true;
        showGameOver(true);
    }
}

// Mostra tela de Game Over
function showGameOver(isVictory) {
    resultMessage.textContent = isVictory ? "Você Venceu!" : "Game Over!";
    resultMessage.style.color = isVictory ? "#2ecc71" : "#e74c3c";
    finalScore.textContent = `Pontuação: ${gameState.score}`;
    gameOverScreen.style.display = "flex";
}

// Reinicia o jogo
function resetGame() {
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
        lastFrame: 0,
        isGameOver: false
    };
    
    player.className = 'player';
    enemy.className = 'enemy';
    player.style.left = '100px';
    enemy.style.left = (stageWidth - 100 - enemyWidth) + 'px';
    gameOverScreen.style.display = 'none';
    
    updateDisplay();
}

// Loop principal do jogo
function gameLoop(timestamp) {
    if (!gameState.lastFrame) gameState.lastFrame = timestamp;
    const deltaTime = timestamp - gameState.lastFrame;
    gameState.lastFrame = timestamp;
    
    if (!gameState.isGameOver) {
        updatePlayer(deltaTime);
        updateEnemy(deltaTime);
        regenStamina(deltaTime);
        checkGameOver();
    }
    
    requestAnimationFrame(gameLoop);
}

// Inicia o jogo
init();
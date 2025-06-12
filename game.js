// Configurações do jogo
const config = {
    playerSpeed: 8,
    jumpForce: 16,
    gravity: 0.8,
    punchDamage: 12,
    kickDamage: 18,
    punchCost: 15,
    kickCost: 25,
    enemySpeed: 2.5,
    enemyAttackRange: 120,
    staminaRegen: 0.5
};

// Elementos do jogo
const player = document.getElementById('player');
const enemy = document.getElementById('enemy');
const stageWidth = 800;
const playerWidth = 60;
const enemyWidth = 60;

// Estado do jogo
let gameState = {
    player: {
        hp: 100,
        stamina: 100,
        pos: 100,
        velY: 0,
        isJumping: false,
        isDefending: false,
        isAttacking: false,
        lastAttack: 0
    },
    enemy: {
        hp: 100,
        pos: stageWidth - 100 - enemyWidth,
        speed: 0,
        direction: -1,
        lastAttack: 0
    },
    score: 0,
    lastFrame: 0
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

// Atualiza a interface
function updateDisplay() {
    document.getElementById('health').textContent = gameState.player.hp;
    document.getElementById('score').textContent = gameState.score;
    document.getElementById('stamina').textContent = Math.floor(gameState.player.stamina);
    
    // Atualiza barras de status
    document.querySelector('#health::after').style.backgroundSize = `${gameState.player.hp}% 100%`;
    document.querySelector('#stamina::after').style.backgroundSize = `${gameState.player.stamina}% 100%`;
}

// Movimento do jogador
function updatePlayer(deltaTime) {
    const player = gameState.player;
    
    // Movimento horizontal
    if (keys.a && player.pos > 0) {
        player.pos -= config.playerSpeed;
    }
    if (keys.d && player.pos < stageWidth - playerWidth) {
        player.pos += config.playerSpeed;
    }
    
    // Pulo
    if (keys.w && !player.isJumping) {
        player.velY = -config.jumpForce;
        player.isJumping = true;
        player.classList.add('jumping');
    }
    
    // Aplicar gravidade
    player.velY += config.gravity;
    player.isJumping = player.velY !== 0;
    
    // Atualizar posição vertical (simulada)
    player.classList.toggle('jumping', player.isJumping);
    
    // Ataques
    const now = Date.now();
    if (!player.isAttacking) {
        if (keys[' '] && player.stamina >= config.punchCost && now - player.lastAttack > 300) {
            attack('punch');
        } else if (keys.s && player.stamina >= config.kickCost && now - player.lastAttack > 500) {
            attack('kick');
        }
    }
    
    // Defesa
    if (keys.f) {
        player.isDefending = true;
        player.classList.add('defending');
    }
    
    // Atualizar posição
    document.getElementById('player').style.left = player.pos + 'px';
}

// Ataque do jogador
function attack(type) {
    const player = gameState.player;
    player.isAttacking = true;
    player.lastAttack = Date.now();
    
    const damage = type === 'punch' ? config.punchDamage : config.kickDamage;
    player.stamina -= type === 'punch' ? config.punchCost : config.kickCost;
    
    player.classList.add('attacking');
    setTimeout(() => {
        player.classList.remove('attacking');
        player.isAttacking = false;
    }, type === 'punch' ? 150 : 200);
    
    // Verificar se acertou o inimigo
    if (Math.abs(player.pos - gameState.enemy.pos) < 100) {
        gameState.enemy.hp -= damage;
        gameState.score += damage;
        enemy.classList.add('hurt');
        setTimeout(() => enemy.classList.remove('hurt'), 200);
    }
    
    updateDisplay();
}

// IA do Inimigo
function updateEnemy(deltaTime) {
    const enemy = gameState.enemy;
    const player = gameState.player;
    
    // Movimento básico com aceleração suave
    const targetPos = player.pos + (playerWidth/2) - (enemyWidth/2);
    const distance = targetPos - enemy.pos;
    
    // Suaviza o movimento
    enemy.speed = distance * 0.05;
    
    // Limita a velocidade máxima
    enemy.speed = Math.max(-config.enemySpeed, Math.min(config.enemySpeed, enemy.speed));
    
    enemy.pos += enemy.speed * deltaTime * 0.1;
    
    // Mantém dentro dos limites
    enemy.pos = Math.max(0, Math.min(stageWidth - enemyWidth, enemy.pos));
    
    // Flip da direção
    if (enemy.speed !== 0) {
        enemy.direction = Math.sign(enemy.speed);
        enemy.style.transform = `scaleX(${enemy.direction > 0 ? 1 : -1})`;
    }
    
    // Ataque aleatório
    const now = Date.now();
    if (Math.abs(player.pos - enemy.pos) < config.enemyAttackRange && 
        now - enemy.lastAttack > 1000 + Math.random() * 2000) {
        enemyAttack();
        enemy.lastAttack = now;
    }
    
    enemy.style.left = enemy.pos + 'px';
}

// Ataque do Inimigo
function enemyAttack() {
    const enemy = gameState.enemy;
    const player = gameState.player;
    
    enemy.classList.add('attacking');
    setTimeout(() => {
        enemy.classList.remove('attacking');
        
        // Verifica se acertou o jogador
        if (Math.abs(player.pos - enemy.pos) < 100) {
            if (!player.isDefending) {
                player.hp -= 10;
                player.classList.add('hurt');
                setTimeout(() => player.classList.remove('hurt'), 200);
                updateDisplay();
                
                // Knockback
                const knockbackDir = player.pos < enemy.pos ? -1 : 1;
                player.pos += knockbackDir * 30;
                player.pos = Math.max(0, Math.min(stageWidth - playerWidth, player.pos));
            } else {
                // Defesa bem-sucedida
                player.stamina = Math.min(100, player.stamina + 5);
                updateDisplay();
            }
        }
    }, 200);
}

// Regeneração de stamina
function regenStamina(deltaTime) {
    if (!gameState.player.isAttacking && !gameState.player.isDefending) {
        gameState.player.stamina = Math.min(100, gameState.player.stamina + config.staminaRegen * deltaTime * 0.1);
    }
    updateDisplay();
}

// Loop principal do jogo
function gameLoop(timestamp) {
    if (!gameState.lastFrame) gameState.lastFrame = timestamp;
    const deltaTime = timestamp - gameState.lastFrame;
    gameState.lastFrame = timestamp;
    
    updatePlayer(deltaTime);
    updateEnemy(deltaTime);
    regenStamina(deltaTime);
    
    // Verifica condições de vitória/derrota
    if (gameState.player.hp <= 0) {
        alert(`Game Over! Sua pontuação: ${gameState.score}`);
        resetGame();
    } else if (gameState.enemy.hp <= 0) {
        gameState.score += 50;
        alert(`Você venceu! Nova pontuação: ${gameState.score}`);
        resetGame();
    }
    
    requestAnimationFrame(gameLoop);
}

// Reinicia o jogo
function resetGame() {
    gameState = {
        player: {
            hp: 100,
            stamina: 100,
            pos: 100,
            velY: 0,
            isJumping: false,
            isDefending: false,
            isAttacking: false,
            lastAttack: 0
        },
        enemy: {
            hp: 100,
            pos: stageWidth - 100 - enemyWidth,
            speed: 0,
            direction: -1,
            lastAttack: 0
        },
        score: 0,
        lastFrame: 0
    };
    updateDisplay();
    player.className = 'player';
    enemy.className = 'enemy';
    player.style.left = '100px';
    enemy.style.left = (stageWidth - 100 - enemyWidth) + 'px';
}

// Inicia o jogo
updateDisplay();
requestAnimationFrame(gameLoop);
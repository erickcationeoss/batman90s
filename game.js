class StreetFighterGame {
    constructor() {
        // Configurações do jogo
        this.config = {
            stageWidth: window.innerWidth,
            stageHeight: window.innerHeight,
            gravity: 0.9,
            jumpForce: -18,
            moveSpeed: 5,
            attackCooldown: 300,
            specialCooldown: 3000,
            superCooldown: 5000,
            roundTime: 99,
            groundLevel: 100
        };

        // Estado do jogo
        this.state = {
            playerCharacter: null,
            playerHP: 100,
            enemyHP: 100,
            playerStamina: 100,
            enemyStamina: 100,
            playerPos: 200,
            enemyPos: window.innerWidth - 280,
            isJumping: false,
            isDefending: false,
            isAttacking: false,
            enemyIsAttacking: false,
            timeLeft: this.config.roundTime,
            round: 1,
            playerWins: 0,
            enemyWins: 0,
            gameActive: false,
            keys: {},
            lastSpecial: 0,
            lastSuper: 0
        };

        // Elementos DOM
        this.dom = {
            app: document.getElementById('app'),
            characterSelect: document.getElementById('character-select'),
            gameScreen: document.getElementById('game-screen'),
            resultScreen: document.getElementById('result-screen'),
            player: document.getElementById('player'),
            enemy: document.getElementById('enemy'),
            playerHealth: document.getElementById('player-health'),
            enemyHealth: document.getElementById('enemy-health'),
            playerStamina: document.getElementById('player-stamina'),
            enemyStamina: document.getElementById('enemy-stamina'),
            timer: document.querySelector('.timer'),
            roundDisplay: document.querySelector('.round-display'),
            resultTitle: document.getElementById('result-title'),
            resultMessage: document.getElementById('result-message'),
            rematchBtn: document.getElementById('rematch-btn'),
            effects: document.getElementById('effects')
        };

        // Inicialização
        this.init();
    }

    init() {
        // Event listeners
        document.getElementById('hero').addEventListener('click', () => this.selectCharacter('hero'));
        document.getElementById('villain').addEventListener('click', () => this.selectCharacter('villain'));
        document.getElementById('ninja').addEventListener('click', () => this.selectCharacter('ninja'));
        document.getElementById('shadow').addEventListener('click', () => this.selectCharacter('shadow'));
        this.dom.rematchBtn.addEventListener('click', () => this.resetGame());

        window.addEventListener('keydown', (e) => this.handleKeyDown(e));
        window.addEventListener('keyup', (e) => this.handleKeyUp(e));
        window.addEventListener('resize', () => this.handleResize());

        // Inicia o loop do jogo
        requestAnimationFrame(() => this.gameLoop());
    }

    selectCharacter(character) {
        this.state.playerCharacter = character;
        this.dom.characterSelect.classList.add('hidden');
        this.dom.gameScreen.classList.remove('hidden');
        
        // Remove todas as classes de personagem
        this.dom.player.classList.remove('hero', 'villain', 'ninja', 'shadow');
        this.dom.enemy.classList.remove('hero', 'villain', 'ninja', 'shadow');
        
        // Adiciona classes baseadas na seleção
        this.dom.player.classList.add(character);
        
        // Define o inimigo como um personagem aleatório diferente
        const characters = ['hero', 'villain', 'ninja', 'shadow'].filter(c => c !== character);
        const enemyCharacter = characters[Math.floor(Math.random() * characters.length)];
        this.dom.enemy.classList.add(enemyCharacter);
        
        this.startGame();
    }

    startGame() {
        this.state.gameActive = true;
        this.updateUI();
        this.startTimer();
        this.showRoundDisplay();
    }

    startTimer() {
        clearInterval(this.timerInterval);
        this.state.timeLeft = this.config.roundTime;
        this.dom.timer.textContent = this.state.timeLeft;
        
        this.timerInterval = setInterval(() => {
            this.state.timeLeft--;
            this.dom.timer.textContent = this.state.timeLeft;
            
            if (this.state.timeLeft <= 0) {
                this.endRound('timeout');
            }
        }, 1000);
    }

    showRoundDisplay() {
        this.dom.roundDisplay.textContent = `ROUND ${this.state.round}`;
        this.dom.roundDisplay.style.opacity = '1';
        setTimeout(() => {
            this.dom.roundDisplay.style.opacity = '0';
        }, 2000);
    }

    gameLoop() {
        if (this.state.gameActive) {
            this.handleInput();
            this.enemyAI();
            this.updatePositions();
            this.updateUI();
        }
        requestAnimationFrame(() => this.gameLoop());
    }

    handleInput() {
        // Movimento
        if (this.state.keys.a) {
            this.state.playerPos = Math.max(0, this.state.playerPos - this.config.moveSpeed);
            if (!this.state.isJumping && Math.random() > 0.7) {
                this.createDustEffect(this.state.playerPos + 40, this.config.groundLevel + 10);
            }
        }
        if (this.state.keys.d) {
            this.state.playerPos = Math.min(this.config.stageWidth - 80, this.state.playerPos + this.config.moveSpeed);
            if (!this.state.isJumping && Math.random() > 0.7) {
                this.createDustEffect(this.state.playerPos + 40, this.config.groundLevel + 10);
            }
        }

        // Pulo
        if (this.state.keys.w && !this.state.isJumping) {
            this.jump();
        }

        // Ataques
        if (this.state.keys.r && !this.state.isAttacking && this.state.playerStamina >= 10) {
            this.attack('punch');
        }
        if (this.state.keys.e && !this.state.isAttacking && this.state.playerStamina >= 15) {
            this.attack('kick');
        }

        // Defesa
        if (this.state.keys.f) {
            this.defend();
        } else if (this.state.isDefending) {
            this.state.isDefending = false;
            this.dom.player.classList.remove('defending');
            this.dom.player.style.opacity = '1';
        }

        // Ataque especial
        const now = Date.now();
        if (this.state.keys.q && !this.state.isAttacking && this.state.playerStamina >= 30 && now - this.state.lastSpecial > this.config.specialCooldown) {
            this.specialAttack();
            this.state.lastSpecial = now;
        }

        // Ataque super
        if (this.state.keys.t && !this.state.isAttacking && this.state.playerStamina >= 50 && now - this.state.lastSuper > this.config.superCooldown) {
            this.superAttack();
            this.state.lastSuper = now;
        }
    }

    jump() {
        if (this.state.isJumping) return;
        
        this.state.isJumping = true;
        this.dom.player.classList.add('jumping');
        
        setTimeout(() => {
            this.dom.player.classList.remove('jumping');
            this.state.isJumping = false;
        }, 800);
    }

    attack(type) {
        this.state.isAttacking = true;
        const damage = type === 'punch' ? 10 : 15;
        const staminaCost = type === 'punch' ? 10 : 15;
        
        this.state.playerStamina -= staminaCost;

        // Animação de ataque
        if (type === 'punch') {
            this.dom.player.querySelector('.arm.right').classList.add('attacking');
        } else {
            this.dom.player.querySelector('.leg.right').classList.add('attacking');
        }

        setTimeout(() => {
            // Remove classes de ataque
            this.dom.player.querySelector('.arm.right').classList.remove('attacking');
            this.dom.player.querySelector('.leg.right').classList.remove('attacking');
            this.state.isAttacking = false;
        }, this.config.attackCooldown);

        // Lógica de hit
        if (this.checkHit()) {
            this.createHitEffect(this.state.enemyPos + 40, 150);
            this.state.enemyHP -= damage;
            
            // Animação de hit no inimigo
            this.dom.enemy.classList.add('hit');
            setTimeout(() => this.dom.enemy.classList.remove('hit'), 200);
            
            if (this.state.enemyHP <= 0) {
                this.state.enemyHP = 0;
                this.endRound('player');
            }
        }
    }

    specialAttack() {
        this.state.isAttacking = true;
        this.state.playerStamina -= 30;

        switch(this.state.playerCharacter) {
            case 'hero':
                // Hadouken
                const hadouken = document.createElement('div');
                hadouken.className = 'effect hadouken';
                hadouken.style.left = `${this.state.playerPos + 80}px`;
                hadouken.style.bottom = '150px';
                this.dom.effects.appendChild(hadouken);
                
                setTimeout(() => {
                    hadouken.remove();
                    if (Math.abs(this.state.playerPos - this.state.enemyPos) < 300) {
                        this.state.enemyHP -= 25;
                        this.createHitEffect(this.state.enemyPos + 40, 150);
                        if (this.state.enemyHP <= 0) {
                            this.state.enemyHP = 0;
                            this.endRound('player');
                        }
                    }
                }, 1000);
                break;
                
            case 'villain':
                // Shoryuken
                const shoryuken = document.createElement('div');
                shoryuken.className = 'effect shoryuken';
                shoryuken.style.left = `${this.state.playerPos + 40}px`;
                shoryuken.style.bottom = '100px';
                this.dom.effects.appendChild(shoryuken);
                
                setTimeout(() => {
                    shoryuken.remove();
                    if (Math.abs(this.state.playerPos - this.state.enemyPos) < 150) {
                        this.state.enemyHP -= 30;
                        this.createHitEffect(this.state.enemyPos + 40, 150);
                        if (this.state.enemyHP <= 0) {
                            this.state.enemyHP = 0;
                            this.endRound('player');
                        }
                    }
                }, 800);
                break;
                
            case 'ninja':
                // Shuriken
                const shuriken = document.createElement('div');
                shuriken.className = 'effect shuriken';
                shuriken.style.left = `${this.state.playerPos + 80}px`;
                shuriken.style.bottom = '160px';
                this.dom.effects.appendChild(shuriken);
                
                setTimeout(() => {
                    shuriken.remove();
                    if (Math.abs(this.state.playerPos - this.state.enemyPos) < 300) {
                        this.state.enemyHP -= 20;
                        this.createHitEffect(this.state.enemyPos + 40, 150);
                        if (this.state.enemyHP <= 0) {
                            this.state.enemyHP = 0;
                            this.endRound('player');
                        }
                    }
                }, 1500);
                break;
                
            case 'shadow':
                // Dark Blast
                const darkBlast = document.createElement('div');
                darkBlast.className = 'effect dark-blast';
                darkBlast.style.left = `${this.state.playerPos + 80}px`;
                darkBlast.style.bottom = '150px';
                this.dom.effects.appendChild(darkBlast);
                
                setTimeout(() => {
                    darkBlast.remove();
                    if (Math.abs(this.state.playerPos - this.state.enemyPos) < 300) {
                        this.state.enemyHP -= 25;
                        this.createHitEffect(this.state.enemyPos + 40, 150);
                        if (this.state.enemyHP <= 0) {
                            this.state.enemyHP = 0;
                            this.endRound('player');
                        }
                    }
                }, 1000);
                break;
        }

        setTimeout(() => {
            this.state.isAttacking = false;
        }, this.config.attackCooldown);
    }

    superAttack() {
        this.state.isAttacking = true;
        this.state.playerStamina -= 50;

        switch(this.state.playerCharacter) {
            case 'hero':
                // Kamehameha
                const kamehameha = document.createElement('div');
                kamehameha.className = 'effect kamehameha';
                kamehameha.style.left = `${this.state.playerPos + 80}px`;
                kamehameha.style.bottom = '150px';
                this.dom.effects.appendChild(kamehameha);
                
                setTimeout(() => {
                    kamehameha.remove();
                    if (Math.abs(this.state.playerPos - this.state.enemyPos) < 400) {
                        this.state.enemyHP -= 40;
                        this.createHitEffect(this.state.enemyPos + 40, 150);
                        if (this.state.enemyHP <= 0) {
                            this.state.enemyHP = 0;
                            this.endRound('player');
                        }
                    }
                }, 800);
                break;
                
            case 'villain':
                // Megaton Punch
                const megatonPunch = document.createElement('div');
                megatonPunch.className = 'effect megaton-punch';
                megatonPunch.style.left = `${this.state.enemyPos + 20}px`;
                megatonPunch.style.bottom = '150px';
                this.dom.effects.appendChild(megatonPunch);
                
                setTimeout(() => {
                    megatonPunch.remove();
                    if (Math.abs(this.state.playerPos - this.state.enemyPos) < 200) {
                        this.state.enemyHP -= 50;
                        this.createHitEffect(this.state.enemyPos + 40, 150);
                        if (this.state.enemyHP <= 0) {
                            this.state.enemyHP = 0;
                            this.endRound('player');
                        }
                    }
                }, 500);
                break;
                
            case 'ninja':
                // Tornado Kick
                const tornadoKick = document.createElement('div');
                tornadoKick.className = 'effect tornado-kick';
                tornadoKick.style.left = `${this.state.enemyPos}px`;
                tornadoKick.style.bottom = '100px';
                this.dom.effects.appendChild(tornadoKick);
                
                setTimeout(() => {
                    tornadoKick.remove();
                    if (Math.abs(this.state.playerPos - this.state.enemyPos) < 150) {
                        this.state.enemyHP -= 45;
                        this.createHitEffect(this.state.enemyPos + 40, 150);
                        if (this.state.enemyHP <= 0) {
                            this.state.enemyHP = 0;
                            this.endRound('player');
                        }
                    }
                }, 1000);
                break;
                
            case 'shadow':
                // Shadow Clone
                const shadowClone = document.createElement('div');
                shadowClone.className = 'effect shadow-clone';
                shadowClone.style.left = `${this.state.enemyPos}px`;
                shadowClone.style.bottom = '100px';
                this.dom.effects.appendChild(shadowClone);
                
                // Cria 3 clones adicionais
                for (let i = 0; i < 3; i++) {
                    setTimeout(() => {
                        const clone = document.createElement('div');
                        clone.className = 'effect shadow-clone';
                        clone.style.left = `${this.state.enemyPos + (i * 20)}px`;
                        clone.style.bottom = '100px';
                        this.dom.effects.appendChild(clone);
                        
                        setTimeout(() => {
                            clone.remove();
                        }, 1000);
                    }, i * 200);
                }
                
                setTimeout(() => {
                    shadowClone.remove();
                    if (Math.abs(this.state.playerPos - this.state.enemyPos) < 200) {
                        this.state.enemyHP -= 35;
                        this.createHitEffect(this.state.enemyPos + 40, 150);
                        if (this.state.enemyHP <= 0) {
                            this.state.enemyHP = 0;
                            this.endRound('player');
                        }
                    }
                }, 1000);
                break;
        }

        setTimeout(() => {
            this.state.isAttacking = false;
        }, this.config.attackCooldown);
    }

    defend() {
        this.state.isDefending = true;
        this.dom.player.classList.add('defending');
        this.dom.player.style.opacity = '0.7';
    }

    enemyAI() {
        if (this.state.enemyIsAttacking) return;

        // Movimento inteligente
        const distance = Math.abs(this.state.playerPos - this.state.enemyPos);
        
        if (distance > 250) {
            // Persegue o jogador
            if (this.state.playerPos < this.state.enemyPos) {
                this.state.enemyPos -= 3;
            } else {
                this.state.enemyPos += 3;
            }
        } else if (distance < 100) {
            // Mantém distância
            if (this.state.playerPos < this.state.enemyPos) {
                this.state.enemyPos += 2;
            } else {
                this.state.enemyPos -= 2;
            }
        }

        // Ataque aleatório
        if (distance < 200 && Math.random() < 0.01 && this.state.enemyStamina >= 10) {
            this.enemyAttack();
        }
        
        // Ataque especial aleatório
        if (distance < 250 && Math.random() < 0.005 && this.state.enemyStamina >= 30) {
            this.enemySpecialAttack();
        }
    }

    enemyAttack() {
        this.state.enemyIsAttacking = true;
        const attackType = Math.random() > 0.3 ? 'punch' : 'kick';
        const damage = attackType === 'punch' ? 10 : 15;
        this.state.enemyStamina -= attackType === 'punch' ? 10 : 15;

        // Animação de ataque
        if (attackType === 'punch') {
            this.dom.enemy.querySelector('.arm.left').classList.add('attacking');
        } else {
            this.dom.enemy.querySelector('.leg.left').classList.add('attacking');
        }

        setTimeout(() => {
            // Remove classes de ataque
            this.dom.enemy.querySelector('.arm.left').classList.remove('attacking');
            this.dom.enemy.querySelector('.leg.left').classList.remove('attacking');
            this.state.enemyIsAttacking = false;
        }, this.config.attackCooldown / 2);

        if (this.checkHit(true) && !this.state.isDefending) {
            this.createHitEffect(this.state.playerPos + 40, 150);
            this.state.playerHP -= damage;
            
            if (this.state.playerHP <= 0) {
                this.state.playerHP = 0;
                this.endRound('enemy');
            }
        }
    }

    enemySpecialAttack() {
        this.state.enemyIsAttacking = true;
        this.state.enemyStamina -= 30;
        
        const enemyCharacter = this.dom.enemy.classList.contains('hero') ? 'hero' :
                              this.dom.enemy.classList.contains('villain') ? 'villain' :
                              this.dom.enemy.classList.contains('ninja') ? 'ninja' : 'shadow';

        switch(enemyCharacter) {
            case 'hero':
                // Hadouken
                const hadouken = document.createElement('div');
                hadouken.className = 'effect hadouken';
                hadouken.style.left = `${this.state.enemyPos - 40}px`;
                hadouken.style.bottom = '150px';
                this.dom.effects.appendChild(hadouken);
                
                setTimeout(() => {
                    hadouken.remove();
                    if (Math.abs(this.state.playerPos - this.state.enemyPos) < 300) {
                        this.state.playerHP -= 25;
                        this.createHitEffect(this.state.playerPos + 40, 150);
                        if (this.state.playerHP <= 0) {
                            this.state.playerHP = 0;
                            this.endRound('enemy');
                        }
                    }
                }, 1000);
                break;
                
            case 'villain':
                // Shoryuken
                const shoryuken = document.createElement('div');
                shoryuken.className = 'effect shoryuken';
                shoryuken.style.left = `${this.state.enemyPos - 20}px`;
                shoryuken.style.bottom = '100px';
                this.dom.effects.appendChild(shoryuken);
                
                setTimeout(() => {
                    shoryuken.remove();
                    if (Math.abs(this.state.playerPos - this.state.enemyPos) < 150) {
                        this.state.playerHP -= 30;
                        this.createHitEffect(this.state.playerPos + 40, 150);
                        if (this.state.playerHP <= 0) {
                            this.state.playerHP = 0;
                            this.endRound('enemy');
                        }
                    }
                }, 800);
                break;
                
            case 'ninja':
                // Shuriken
                const shuriken = document.createElement('div');
                shuriken.className = 'effect shuriken';
                shuriken.style.left = `${this.state.enemyPos - 30}px`;
                shuriken.style.bottom = '160px';
                this.dom.effects.appendChild(shuriken);
                
                setTimeout(() => {
                    shuriken.remove();
                    if (Math.abs(this.state.playerPos - this.state.enemyPos) < 300) {
                        this.state.playerHP -= 20;
                        this.createHitEffect(this.state.playerPos + 40, 150);
                        if (this.state.playerHP <= 0) {
                            this.state.playerHP = 0;
                            this.endRound('enemy');
                        }
                    }
                }, 1500);
                break;
                
            case 'shadow':
                // Dark Blast
                const darkBlast = document.createElement('div');
                darkBlast.className = 'effect dark-blast';
                darkBlast.style.left = `${this.state.enemyPos - 30}px`;
                darkBlast.style.bottom = '150px';
                this.dom.effects.appendChild(darkBlast);
                
                setTimeout(() => {
                    darkBlast.remove();
                    if (Math.abs(this.state.playerPos - this.state.enemyPos) < 300) {
                        this.state.playerHP -= 25;
                        this.createHitEffect(this.state.playerPos + 40, 150);
                        if (this.state.playerHP <= 0) {
                            this.state.playerHP = 0;
                            this.endRound('enemy');
                        }
                    }
                }, 1000);
                break;
        }

        setTimeout(() => {
            this.state.enemyIsAttacking = false;
        }, this.config.attackCooldown);
    }

    checkHit(isEnemyAttacking = false) {
        const attackerPos = isEnemyAttacking ? this.state.enemyPos : this.state.playerPos;
        const defenderPos = isEnemyAttacking ? this.state.playerPos : this.state.enemyPos;
        return Math.abs(attackerPos - defenderPos) < 120;
    }

    createHitEffect(x, y) {
        const effect = document.createElement('div');
        effect.className = 'effect hit-spark';
        effect.style.left = `${x - 15}px`;
        effect.style.top = `${y - 15}px`;
        this.dom.effects.appendChild(effect);
        setTimeout(() => effect.remove(), 300);
    }

    createDustEffect(x, y) {
        const dust = document.createElement('div');
        dust.className = 'effect dust-effect';
        dust.style.left = `${x - 10}px`;
        dust.style.top = `${y}px`;
        this.dom.effects.appendChild(dust);
        setTimeout(() => dust.remove(), 500);
    }

    updatePositions() {
        this.dom.player.style.left = `${this.state.playerPos}px`;
        this.dom.enemy.style.left = `${this.state.enemyPos}px`;
    }

    updateUI() {
        this.dom.playerHealth.style.width = `${this.state.playerHP}%`;
        this.dom.enemyHealth.style.width = `${this.state.enemyHP}%`;
        this.dom.playerStamina.style.width = `${this.state.playerStamina}%`;
        this.dom.enemyStamina.style.width = `${this.state.enemyStamina}%`;

        // Regeneração de stamina
        if (this.state.playerStamina < 100) {
            this.state.playerStamina += 0.2;
        }
        if (this.state.enemyStamina < 100) {
            this.state.enemyStamina += 0.1;
        }
    }

    endRound(winner) {
        clearInterval(this.timerInterval);
        this.state.gameActive = false;

        if (winner === 'player') {
            this.state.playerWins++;
        } else if (winner === 'enemy') {
            this.state.enemyWins++;
        }

        setTimeout(() => {
            if (this.state.playerWins >= 2 || this.state.enemyWins >= 2) {
                this.showResult();
            } else {
                this.nextRound();
            }
        }, 1500);
    }

    nextRound() {
        this.state.round++;
        this.resetCharacters();
        this.showRoundDisplay();
        this.startGame();
    }

    resetCharacters() {
        this.state.playerHP = 100;
        this.state.enemyHP = 100;
        this.state.playerStamina = 100;
        this.state.enemyStamina = 100;
        this.state.playerPos = 200;
        this.state.enemyPos = this.config.stageWidth - 280;
        this.state.isJumping = false;
        this.state.isDefending = false;
        this.state.isAttacking = false;
        this.state.enemyIsAttacking = false;
        this.state.lastSpecial = 0;
        this.state.lastSuper = 0;

        // Reseta todas as animações
        this.dom.player.classList.remove('defending', 'attacking', 'punch', 'kick', 'hit', 'jumping');
        this.dom.enemy.classList.remove('attacking', 'hit', 'jumping');
        this.dom.player.style.opacity = '1';
        this.dom.player.style.transform = 'scale(1)';
        this.dom.player.style.bottom = `${this.config.groundLevel}px`;
        
        // Reseta membros
        this.dom.player.querySelector('.arm.right').classList.remove('attacking');
        this.dom.player.querySelector('.leg.right').classList.remove('attacking');
        this.dom.enemy.querySelector('.arm.left').classList.remove('attacking');
        this.dom.enemy.querySelector('.leg.left').classList.remove('attacking');
        
        // Limpa efeitos
        this.dom.effects.innerHTML = '';
    }

    showResult() {
        this.dom.gameScreen.classList.add('hidden');
        this.dom.resultScreen.classList.remove('hidden');

        if (this.state.playerWins >= 2) {
            this.dom.resultTitle.textContent = 'VITÓRIA!';
            this.dom.resultMessage.textContent = `Você venceu por ${this.state.playerWins} a ${this.state.enemyWins}`;
        } else if (this.state.enemyWins >= 2) {
            this.dom.resultTitle.textContent = 'DERROTA!';
            this.dom.resultMessage.textContent = `Você perdeu por ${this.state.enemyWins} a ${this.state.playerWins}`;
        } else {
            this.dom.resultTitle.textContent = 'EMPATE!';
            this.dom.resultMessage.textContent = `O jogo terminou empatado`;
        }
    }

    resetGame() {
        this.state.playerWins = 0;
        this.state.enemyWins = 0;
        this.state.round = 1;
        this.dom.resultScreen.classList.add('hidden');
        this.dom.gameScreen.classList.remove('hidden');
        this.resetCharacters();
        this.startGame();
    }

    handleKeyDown(e) {
        const key = e.key.toLowerCase();
        this.state.keys[key] = true;
    }

    handleKeyUp(e) {
        const key = e.key.toLowerCase();
        this.state.keys[key] = false;
    }

    handleResize() {
        this.config.stageWidth = window.innerWidth;
        this.config.stageHeight = window.innerHeight;
        this.state.enemyPos = this.config.stageWidth - 280;
        this.updatePositions();
    }
}

// Inicia o jogo quando a página carregar
window.onload = () => new StreetFighterGame();
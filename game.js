// Variáveis do jogo
let playerCharacter = null;
let gameActive = false;
let playerHP = 100;
let enemyHP = 100;
let timeLeft = 60;
let timerInterval;

// Elementos DOM
const characterSelect = document.getElementById('character-select');
const gameScreen = document.getElementById('game-screen');
const heroBtn = document.getElementById('hero');
const villainBtn = document.getElementById('villain');
const playerElement = document.getElementById('player');
const enemyElement = document.getElementById('enemy');
const playerHealth = document.getElementById('player-health');
const enemyHealth = document.getElementById('enemy-health');
const timerElement = document.querySelector('.timer');
const effectsContainer = document.getElementById('effects');

// Seleção de Personagem (agora funcional)
heroBtn.addEventListener('click', () => {
    selectCharacter('hero');
});

villainBtn.addEventListener('click', () => {
    selectCharacter('villain');
});

function selectCharacter(character) {
    playerCharacter = character;
    characterSelect.style.display = 'none';
    gameScreen.style.display = 'block';
    startGame();
}

// IA Melhorada
function enemyAI() {
    if (!gameActive) return;

    // Movimento mais inteligente
    const distance = Math.abs(playerElement.offsetLeft - enemyElement.offsetLeft);
    
    if (distance > 200) {
        // Persegue o jogador
        if (playerElement.offsetLeft < enemyElement.offsetLeft) {
            enemyElement.style.right = (parseInt(enemyElement.style.right) || 100) + 5 + 'px';
        } else {
            enemyElement.style.right = (parseInt(enemyElement.style.right) || 100) - 5 + 'px';
        }
    } else if (distance < 80) {
        // Recua se muito perto
        if (playerElement.offsetLeft < enemyElement.offsetLeft) {
            enemyElement.style.right = (parseInt(enemyElement.style.right) || 100) - 5 + 'px';
        } else {
            enemyElement.style.right = (parseInt(enemyElement.style.right) || 100) + 5 + 'px';
        }
    }

    // Ataque mais estratégico
    if (distance < 150 && Math.random() < 0.02) {
        enemyAttack();
    }
}

// Restante do código mantido similar ao anterior, mas com as melhorias de IA
// [O resto da implementação do jogo permanece similar]
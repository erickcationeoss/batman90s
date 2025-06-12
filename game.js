// Variáveis do jogo
let score = 0;
let lives = 3;
let felix = document.getElementById('felix');
let building = document.querySelector('.building');
let windows = [];
let bricks = [];

// Posição inicial do Felix
let felixPos = { x: 100, y: 300 };
felix.style.left = felixPos.x + 'px';
felix.style.top = felixPos.y + 'px';

// Cria janelas quebradas
function createWindows() {
    for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 3; j++) {
            const window = document.createElement('div');
            window.className = 'window broken';
            window.style.left = (150 + i * 100) + 'px';
            window.style.top = (50 + j * 100) + 'px';
            building.appendChild(window);
            windows.push(window);
        }
    }
}

// Movimento do Felix
document.addEventListener('keydown', (e) => {
    const speed = 20;
    switch (e.key) {
        case 'ArrowUp': felixPos.y -= speed; break;
        case 'ArrowDown': felixPos.y += speed; break;
        case 'ArrowLeft': felixPos.x -= speed; break;
        case 'ArrowRight': felixPos.x += speed; break;
    }
    // Limita movimento dentro do prédio
    felixPos.x = Math.max(0, Math.min(560, felixPos.x));
    felixPos.y = Math.max(0, Math.min(340, felixPos.y));
    felix.style.left = felixPos.x + 'px';
    felix.style.top = felixPos.y + 'px';
    checkWindowCollision();
});

// Verifica se Felix consertou uma janela
function checkWindowCollision() {
    windows.forEach(window => {
        if (window.classList.contains('broken')) {
            const rect = window.getBoundingClientRect();
            if (
                felixPos.x < rect.right && felixPos.x + 40 > rect.left &&
                felixPos.y < rect.bottom && felixPos.y + 60 > rect.top
            ) {
                window.classList.remove('broken');
                score += 10;
                document.getElementById('score').textContent = score;
            }
        }
    });
}

// Tijolos lançados pelo Ralph
function createBrick() {
    const brick = document.createElement('div');
    brick.className = 'brick';
    brick.style.left = Math.random() * 570 + 'px';
    brick.style.top = '0px';
    building.appendChild(brick);
    bricks.push(brick);
    animateBrick(brick);
}

function animateBrick(brick) {
    let posY = 0;
    const fallSpeed = 3;
    const brickInterval = setInterval(() => {
        posY += fallSpeed;
        brick.style.top = posY + 'px';
        // Verifica colisão com Felix
        if (posY + 30 > felixPos.y && posY < felixPos.y + 60 &&
            parseInt(brick.style.left) + 30 > felixPos.x && parseInt(brick.style.left) < felixPos.x + 40) {
            lives--;
            document.getElementById('lives').textContent = lives;
            if (lives <= 0) gameOver();
            clearInterval(brickInterval);
            brick.remove();
        }
        // Remove tijolo se sair da tela
        if (posY > 400) {
            clearInterval(brickInterval);
            brick.remove();
        }
    }, 20);
}

// Game Over
function gameOver() {
    alert(`Game Over! Pontuação: ${score}`);
    resetGame();
}

function resetGame() {
    score = 0;
    lives = 3;
    document.getElementById('score').textContent = score;
    document.getElementById('lives').textContent = lives;
    windows.forEach(w => w.classList.add('broken'));
}

// Inicia o jogo
createWindows();
setInterval(createBrick, 2000); // Novos tijolos a cada 2s
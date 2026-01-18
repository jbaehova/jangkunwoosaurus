// 게임 캔버스 및 컨텍스트
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// UI 요소
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const submitScoreBtn = document.getElementById('submit-score-btn');
const playerNameInput = document.getElementById('player-name');
const currentScoreDisplay = document.getElementById('current-score');
const highScoreDisplay = document.getElementById('high-score');
const finalScoreDisplay = document.getElementById('final-score');

// 게임 상태
let gameRunning = false;
let score = 0;
let highScore = localStorage.getItem('dinoHighScore') || 0;
let gameSpeed = 5;
let lastScoreMilestone = 0;
let animationFrameId = null;
let lastFrameTime = 0;

// 공룡 캐릭터
const dino = {
    x: 50,
    y: 0,
    width: 60,
    height: 60,
    velocityY: 0,
    jumping: false,
    grounded: true,
    bobOffset: 0,
    bobDirection: 1
};

// 물리 설정
const GRAVITY = 0.8;
const JUMP_FORCE = -15;
const GROUND_Y = canvas.height - 50;

// 장애물 배열
let obstacles = [];

// 구름 배열 (배경)
let clouds = [];

// 땅 오프셋 (스크롤 효과)
let groundOffset = 0;

// 공룡 이미지
const dinoImage = new Image();
let dinoImageLoaded = false;
dinoImage.onload = () => {
    dinoImageLoaded = true;
};
dinoImage.onerror = () => {
    console.log('dino.png 로드 실패 - 기본 캐릭터 사용');
};
dinoImage.src = 'assets/dino.png';

// 초기화
function init() {
    dino.y = GROUND_Y - dino.height;
    highScoreDisplay.textContent = `최고: ${highScore}`;
    loadLeaderboard();
}

// 게임 시작
function startGame() {
    // 이미 게임이 실행 중이면 중복 실행 방지
    if (gameRunning || animationFrameId !== null) {
        console.warn('게임이 이미 실행 중입니다.');
        return;
    }

    // 이전 애니메이션 프레임이 있으면 취소
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }

    gameRunning = true;
    score = 0;
    gameSpeed = 5;
    lastScoreMilestone = 0;
    lastFrameTime = 0;
    obstacles = [];
    clouds = [];
    dino.y = GROUND_Y - dino.height;
    dino.velocityY = 0;
    dino.jumping = false;
    dino.grounded = true;

    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');

    // 초기 구름 생성
    for (let i = 0; i < 3; i++) {
        clouds.push(createCloud(Math.random() * canvas.width));
    }

    gameLoop(0);
}

// 게임 오버
function gameOver() {
    gameRunning = false;

    // 애니메이션 프레임 취소
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }

    lastFrameTime = 0;

    finalScoreDisplay.textContent = score;

    if (score > highScore) {
        highScore = score;
        localStorage.setItem('dinoHighScore', highScore);
        highScoreDisplay.textContent = `최고: ${highScore}`;
    }

    gameOverScreen.classList.remove('hidden');
    playerNameInput.value = '';
    playerNameInput.focus();
}

// 점프
function jump() {
    if (dino.grounded && gameRunning) {
        dino.velocityY = JUMP_FORCE;
        dino.jumping = true;
        dino.grounded = false;
    }
}

// 장애물 생성
function createObstacle() {
    const types = ['cactus-small', 'cactus-large', 'bird'];
    const type = types[Math.floor(Math.random() * types.length)];

    let obstacle = {
        x: canvas.width,
        type: type
    };

    switch (type) {
        case 'cactus-small':
            obstacle.width = 20;
            obstacle.height = 40;
            obstacle.y = GROUND_Y - obstacle.height;
            break;
        case 'cactus-large':
            obstacle.width = 30;
            obstacle.height = 60;
            obstacle.y = GROUND_Y - obstacle.height;
            break;
        case 'bird':
            obstacle.width = 40;
            obstacle.height = 30;
            // 새는 다양한 높이에서 날아옴
            const heights = [GROUND_Y - 80, GROUND_Y - 50, GROUND_Y - 120];
            obstacle.y = heights[Math.floor(Math.random() * heights.length)];
            obstacle.wingOffset = 0;
            obstacle.wingDirection = 1;
            break;
    }

    return obstacle;
}

// 구름 생성
function createCloud(x = canvas.width) {
    return {
        x: x || canvas.width,
        y: Math.random() * 100 + 20,
        width: Math.random() * 40 + 40,
        speed: Math.random() * 0.5 + 0.5
    };
}

// 충돌 감지
function checkCollision(obstacle) {
    // 충돌 박스를 약간 줄여서 관대하게 처리
    const padding = 10;
    return (
        dino.x + padding < obstacle.x + obstacle.width - padding &&
        dino.x + dino.width - padding > obstacle.x + padding &&
        dino.y + padding < obstacle.y + obstacle.height - padding &&
        dino.y + dino.height - padding > obstacle.y + padding
    );
}

// 업데이트
function update() {
    // 중력 적용
    dino.velocityY += GRAVITY;
    dino.y += dino.velocityY;

    // 땅 충돌
    if (dino.y >= GROUND_Y - dino.height) {
        dino.y = GROUND_Y - dino.height;
        dino.velocityY = 0;
        dino.jumping = false;
        dino.grounded = true;
    }

    // 달리기 애니메이션 (상하 흔들림)
    if (dino.grounded) {
        dino.bobOffset += 0.3 * dino.bobDirection;
        if (Math.abs(dino.bobOffset) > 2) {
            dino.bobDirection *= -1;
        }
    } else {
        dino.bobOffset = 0;
    }

    // 장애물 업데이트
    obstacles.forEach((obstacle, index) => {
        obstacle.x -= gameSpeed;

        // 새 날개 애니메이션
        if (obstacle.type === 'bird') {
            obstacle.wingOffset += 0.5 * obstacle.wingDirection;
            if (Math.abs(obstacle.wingOffset) > 5) {
                obstacle.wingDirection *= -1;
            }
        }

        // 화면 밖으로 나간 장애물 제거
        if (obstacle.x + obstacle.width < 0) {
            obstacles.splice(index, 1);
        }

        // 충돌 감지
        if (checkCollision(obstacle)) {
            gameOver();
        }
    });

    // 새 장애물 생성
    if (obstacles.length === 0 || obstacles[obstacles.length - 1].x < canvas.width - 300 - Math.random() * 200) {
        obstacles.push(createObstacle());
    }

    // 구름 업데이트
    clouds.forEach((cloud, index) => {
        cloud.x -= cloud.speed;
        if (cloud.x + cloud.width < 0) {
            clouds.splice(index, 1);
            clouds.push(createCloud());
        }
    });

    // 땅 스크롤
    groundOffset = (groundOffset + gameSpeed) % 20;

    // 점수 업데이트
    score++;
    currentScoreDisplay.textContent = `점수: ${score}`;

    // 100점마다 효과
    if (score - lastScoreMilestone >= 100) {
        lastScoreMilestone = Math.floor(score / 100) * 100;
        canvas.classList.add('flash-effect');
        setTimeout(() => canvas.classList.remove('flash-effect'), 900);

        // 속도 증가
        if (gameSpeed < 15) {
            gameSpeed += 0.5;
        }
    }
}

// 렌더링
function render() {
    // 배경 클리어
    ctx.fillStyle = '#f7f7f7';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 구름 그리기
    ctx.fillStyle = '#ddd';
    clouds.forEach(cloud => {
        const x = Math.floor(cloud.x);
        const y = Math.floor(cloud.y);
        ctx.beginPath();
        ctx.arc(x, y, cloud.width / 3, 0, Math.PI * 2);
        ctx.arc(x + cloud.width / 3, y - 5, cloud.width / 4, 0, Math.PI * 2);
        ctx.arc(x + cloud.width / 2, y, cloud.width / 3, 0, Math.PI * 2);
        ctx.fill();
    });

    // 땅 그리기
    ctx.fillStyle = '#333';
    ctx.fillRect(0, GROUND_Y, canvas.width, 3);

    // 땅 텍스처 (점선)
    ctx.fillStyle = '#666';
    for (let i = -groundOffset; i < canvas.width; i += 20) {
        ctx.fillRect(i, GROUND_Y + 10, 10, 2);
    }

    // 장애물 그리기
    obstacles.forEach(obstacle => {
        const x = Math.floor(obstacle.x);
        const y = Math.floor(obstacle.y);

        if (obstacle.type === 'cactus-small' || obstacle.type === 'cactus-large') {
            // 선인장
            ctx.fillStyle = '#2d5016';
            ctx.fillRect(x, y, obstacle.width, obstacle.height);

            // 선인장 가시
            ctx.fillStyle = '#1a3009';
            const armY = y + obstacle.height * 0.3;
            ctx.fillRect(x - 8, armY, 10, 8);
            ctx.fillRect(x + obstacle.width - 2, armY + 10, 10, 8);
        } else if (obstacle.type === 'bird') {
            // 새 (익룡)
            ctx.fillStyle = '#8b4513';

            // 몸통
            ctx.fillRect(x + 10, y + 10, 20, 15);

            // 머리
            ctx.fillRect(x + 30, y + 8, 10, 10);

            // 부리
            ctx.fillStyle = '#ff6600';
            ctx.beginPath();
            ctx.moveTo(x + 40, y + 13);
            ctx.lineTo(x + 48, y + 15);
            ctx.lineTo(x + 40, y + 17);
            ctx.fill();

            // 날개
            ctx.fillStyle = '#8b4513';
            ctx.beginPath();
            ctx.moveTo(x + 15, y + 15);
            ctx.lineTo(x + 25, y - 5 + obstacle.wingOffset);
            ctx.lineTo(x + 30, y + 15);
            ctx.fill();
        }
    });

    // 공룡 그리기
    const dinoDrawY = Math.floor(dino.y + dino.bobOffset);
    const dinoDrawX = Math.floor(dino.x);

    if (dinoImageLoaded) {
        // 이미지가 로드된 경우 이미지 사용
        ctx.drawImage(dinoImage, dinoDrawX, dinoDrawY, dino.width, dino.height);
    } else {
        // 이미지가 없는 경우 기본 공룡 그리기
        drawDefaultDino(dinoDrawX, dinoDrawY);
    }
}

// 기본 공룡 그리기 (이미지가 없을 때)
function drawDefaultDino(x, y) {
    ctx.fillStyle = '#535353';

    // 몸통
    ctx.fillRect(x + 15, y + 15, 35, 30);

    // 머리
    ctx.fillRect(x + 30, y + 5, 25, 25);

    // 눈
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + 45, y + 10, 6, 6);
    ctx.fillStyle = '#000';
    ctx.fillRect(x + 47, y + 12, 3, 3);

    // 다리
    ctx.fillStyle = '#535353';
    if (dino.grounded) {
        // 달리는 애니메이션
        const legOffset = Math.sin(Date.now() / 100) * 3;
        ctx.fillRect(x + 20, y + 45 + legOffset, 8, 15 - legOffset);
        ctx.fillRect(x + 35, y + 45 - legOffset, 8, 15 + legOffset);
    } else {
        // 점프 중
        ctx.fillRect(x + 20, y + 40, 8, 10);
        ctx.fillRect(x + 35, y + 40, 8, 10);
    }

    // 꼬리
    ctx.fillRect(x, y + 20, 20, 10);
    ctx.fillRect(x - 5, y + 25, 10, 5);

    // 팔
    ctx.fillRect(x + 45, y + 25, 10, 5);
}

// 게임 루프
function gameLoop(currentTime) {
    if (!gameRunning) {
        animationFrameId = null;
        lastFrameTime = 0;
        return;
    }

    // 프레임 제한: 최소 16ms 간격 (약 60fps)
    if (currentTime - lastFrameTime < 16) {
        animationFrameId = requestAnimationFrame(gameLoop);
        return;
    }

    lastFrameTime = currentTime;
    update();
    render();
    animationFrameId = requestAnimationFrame(gameLoop);
}

// 이벤트 리스너 - 터치와 클릭 중복 방지
let lastInteractionTime = 0;

function handleStartGame(e) {
    const now = Date.now();
    // 300ms 내에 중복 호출 방지
    if (now - lastInteractionTime < 300) {
        return;
    }
    lastInteractionTime = now;
    startGame();
}

startBtn.addEventListener('click', handleStartGame);
restartBtn.addEventListener('click', handleStartGame);
startBtn.addEventListener('touchend', (e) => {
    e.preventDefault();
    handleStartGame(e);
}, { passive: false });
restartBtn.addEventListener('touchend', (e) => {
    e.preventDefault();
    handleStartGame(e);
}, { passive: false });

// 점수 제출
submitScoreBtn.addEventListener('click', async () => {
    const name = playerNameInput.value.trim();
    if (name && name.length <= 10) {
        submitScoreBtn.disabled = true;
        submitScoreBtn.textContent = '등록 중...';

        const success = await saveScore(name, score);

        if (success) {
            submitScoreBtn.textContent = '등록 완료!';
            await loadLeaderboard();
        } else {
            submitScoreBtn.textContent = '등록 실패';
        }

        setTimeout(() => {
            submitScoreBtn.disabled = false;
            submitScoreBtn.textContent = '점수 등록';
        }, 2000);
    } else {
        alert('이름을 입력해주세요 (최대 10자)');
    }
});

// 키보드 입력
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();

        if (!gameRunning && startScreen.classList.contains('hidden') && gameOverScreen.classList.contains('hidden')) {
            startGame();
        } else if (gameRunning) {
            jump();
        }
    }
});

// 터치 입력 (모바일)
let touchHandled = false;

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (gameRunning && !touchHandled) {
        touchHandled = true;
        jump();
    }
}, { passive: false });

canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    touchHandled = false;
}, { passive: false });

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
}, { passive: false });

document.addEventListener('touchstart', (e) => {
    if (!gameRunning && startScreen.classList.contains('hidden') && gameOverScreen.classList.contains('hidden')) {
        e.preventDefault();
        handleStartGame(e);
    }
}, { passive: false });

// 마우스 클릭 이벤트도 처리 (데스크톱용)
canvas.addEventListener('click', (e) => {
    if (gameRunning) {
        jump();
    }
});

// Enter 키로 점수 제출
playerNameInput.addEventListener('keydown', (e) => {
    if (e.code === 'Enter') {
        submitScoreBtn.click();
    }
});

// 초기화 실행
init();

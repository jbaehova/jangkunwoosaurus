// 리더보드 관련 함수들

const leaderboardList = document.getElementById('leaderboard-list');
const COLLECTION_NAME = 'leaderboard';

// 점수 저장
async function saveScore(name, score) {
    if (!firebaseInitialized || !db) {
        console.log('Firebase가 초기화되지 않았습니다.');
        // 로컬 스토리지에 백업 저장
        saveToLocalStorage(name, score);
        return false;
    }

    try {
        await db.collection(COLLECTION_NAME).add({
            name: name,
            score: score,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        console.log('점수 저장 완료!');
        return true;
    } catch (error) {
        console.error('점수 저장 실패:', error);
        // 로컬 스토리지에 백업 저장
        saveToLocalStorage(name, score);
        return false;
    }
}

// 로컬 스토리지에 백업 저장
function saveToLocalStorage(name, score) {
    const localScores = JSON.parse(localStorage.getItem('dinoLocalScores') || '[]');
    localScores.push({
        name: name,
        score: score,
        timestamp: new Date().toISOString()
    });
    // 최고 점수 10개만 유지
    localScores.sort((a, b) => b.score - a.score);
    localStorage.setItem('dinoLocalScores', JSON.stringify(localScores.slice(0, 10)));
}

// 리더보드 로드
async function loadLeaderboard() {
    leaderboardList.innerHTML = '<p class="loading">로딩 중...</p>';

    // Firebase 연결 확인
    if (!firebaseInitialized || !db) {
        // 로컬 스토리지에서 로드
        loadFromLocalStorage();
        return;
    }

    try {
        const snapshot = await db.collection(COLLECTION_NAME)
            .orderBy('score', 'desc')
            .limit(10)
            .get();

        if (snapshot.empty) {
            // Firestore가 비어있으면 로컬 데이터 확인
            loadFromLocalStorage();
            return;
        }

        const scores = [];
        snapshot.forEach(doc => {
            scores.push({
                id: doc.id,
                ...doc.data()
            });
        });

        renderLeaderboard(scores);
    } catch (error) {
        console.error('리더보드 로드 실패:', error);
        loadFromLocalStorage();
    }
}

// 로컬 스토리지에서 로드
function loadFromLocalStorage() {
    const localScores = JSON.parse(localStorage.getItem('dinoLocalScores') || '[]');

    if (localScores.length === 0) {
        leaderboardList.innerHTML = `
            <p class="loading">아직 기록이 없습니다.</p>
            <p class="loading" style="font-size: 12px; margin-top: 10px;">
                Firebase를 설정하면 온라인 리더보드를 사용할 수 있습니다.
            </p>
        `;
        return;
    }

    renderLeaderboard(localScores, true);
}

// 리더보드 렌더링
function renderLeaderboard(scores, isLocal = false) {
    if (scores.length === 0) {
        leaderboardList.innerHTML = '<p class="loading">아직 기록이 없습니다.</p>';
        return;
    }

    let html = '';

    if (isLocal) {
        html += '<p style="font-size: 11px; color: #999; text-align: center; margin-bottom: 10px;">로컬 기록</p>';
    }

    scores.forEach((entry, index) => {
        const rank = index + 1;
        const medal = rank <= 3 ? ['🥇', '🥈', '🥉'][rank - 1] : rank;

        html += `
            <div class="leaderboard-item">
                <span class="rank">${medal}</span>
                <span class="name">${escapeHtml(entry.name)}</span>
                <span class="score">${entry.score.toLocaleString()}</span>
            </div>
        `;
    });

    leaderboardList.innerHTML = html;
}

// XSS 방지를 위한 HTML 이스케이프
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 실시간 리더보드 업데이트 (Firebase 연결 시)
function setupRealtimeLeaderboard() {
    if (!firebaseInitialized || !db) {
        return;
    }

    db.collection(COLLECTION_NAME)
        .orderBy('score', 'desc')
        .limit(10)
        .onSnapshot(snapshot => {
            const scores = [];
            snapshot.forEach(doc => {
                scores.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            renderLeaderboard(scores);
        }, error => {
            console.error('실시간 업데이트 실패:', error);
        });
}

// Firebase 초기화 후 실시간 리더보드 설정
setTimeout(() => {
    if (firebaseInitialized) {
        setupRealtimeLeaderboard();
    }
}, 1000);

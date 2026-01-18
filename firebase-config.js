 const firebaseConfig = {
    apiKey: "AIzaSyD0kWu2yRQsYG9LE43rL_jI53EytwkwH4w",
    authDomain: "dino-game-2b33b.firebaseapp.com",
    projectId: "dino-game-2b33b",
    storageBucket: "dino-game-2b33b.firebasestorage.app",
    messagingSenderId: "390686259315",
    appId: "1:390686259315:web:be2801a7d5ba497d9d5206"
};

// Firebase 초기화
let db = null;
let firebaseInitialized = false;

function initializeFirebase() {
    try {
        // Firebase 설정이 완료되었는지 확인
        if (firebaseConfig.apiKey === "YOUR_API_KEY") {
            console.log('Firebase 설정이 필요합니다. firebase-config.js 파일을 수정하세요.');
            return false;
        }

        // Firebase 앱 초기화
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }

        // Firestore 초기화
        db = firebase.firestore();
        firebaseInitialized = true;
        console.log('Firebase 초기화 완료!');
        return true;
    } catch (error) {
        console.error('Firebase 초기화 실패:', error);
        return false;
    }
}

// 페이지 로드 시 Firebase 초기화
initializeFirebase();

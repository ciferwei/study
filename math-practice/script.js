// 游戏状态
let gameState = {
    isPlaying: false,
    difficulty: 'easy',
    startTime: null,
    timerInterval: null,
    gameTimerInterval: null,
    timeLimit: 120000, // 2分钟
    currentQuestion: null,
    score: 0,
    totalQuestions: 0,
    correctAnswers: 0,
    consecutiveCorrect: 0,
    bestScores: {},
    phase: 'waiting'
};

// DOM元素
const gameArea = document.getElementById('gameArea');
const waitingPhase = document.getElementById('waitingPhase');
const playingPhase = document.getElementById('playingPhase');
const questionDisplay = document.getElementById('question');
const answerInput = document.getElementById('answerInput');
const submitBtn = document.getElementById('submitBtn');
const feedback = document.getElementById('feedback');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const fullscreenBtn = document.getElementById('fullscreenBtn');
const fullscreenIcon = document.getElementById('fullscreenIcon');
const fullscreenText = document.getElementById('fullscreenText');
const difficultySelect = document.getElementById('difficulty');
const difficultyButtons = document.getElementById('difficultyButtons');
const difficultyBtnElements = difficultyButtons ? difficultyButtons.querySelectorAll('.difficulty-btn') : [];
const timerDisplay = document.getElementById('timer');
const scoreDisplay = document.getElementById('score');
const accuracyDisplay = document.getElementById('accuracy');
const bestScoreDisplay = document.getElementById('bestScore');
const resultModal = document.getElementById('resultModal');
const resultTitle = document.getElementById('resultTitle');
const resultTotal = document.getElementById('resultTotal');
const resultCorrect = document.getElementById('resultCorrect');
const resultAccuracy = document.getElementById('resultAccuracy');
const resultTime = document.getElementById('resultTime');
const resultScore = document.getElementById('resultScore');
const resultMessage = document.getElementById('resultMessage');
const closeModal = document.getElementById('closeModal');
const historyList = document.getElementById('historyList');
const clearHistoryBtn = document.getElementById('clearHistory');

// 注册Service Worker
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./service-worker.js')
                .then((registration) => {
                    console.log('Service Worker注册成功:', registration.scope);
                })
                .catch((error) => {
                    console.log('Service Worker注册失败:', error);
                });
        });
    }
}

// 初始化
function init() {
    registerServiceWorker();
    
    loadBestScores();
    loadHistory();
    updateBestScoreDisplay();
    initDifficultyButtons();
    
    startBtn.addEventListener('click', startGame);
    resetBtn.addEventListener('click', resetGame);
    fullscreenBtn.addEventListener('click', toggleFullscreen);
    closeModal.addEventListener('click', closeResultModal);
    clearHistoryBtn.addEventListener('click', clearHistory);
    difficultySelect.addEventListener('change', onDifficultyChange);
    
    // 提交按钮事件
    if (submitBtn) {
        submitBtn.addEventListener('click', submitAnswer);
    }
    
    // 键盘事件（PC端）
    answerInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && gameState.isPlaying) {
            e.preventDefault();
            submitAnswer();
        }
    });
    
    // iPad/移动端：监听输入完成（当用户点击键盘的"完成"或"Go"按钮时）
    answerInput.addEventListener('keydown', (e) => {
        if ((e.key === 'Enter' || e.keyCode === 13) && gameState.isPlaying) {
            e.preventDefault();
            submitAnswer();
        }
    });
    
    // 输入验证
    answerInput.addEventListener('input', (e) => {
        // 只允许数字和负号
        e.target.value = e.target.value.replace(/[^0-9\-]/g, '');
    });
    
    // 当输入框失去焦点时，如果游戏正在进行且有输入，自动提交（可选）
    // answerInput.addEventListener('blur', () => {
    //     if (gameState.isPlaying && answerInput.value.trim() !== '') {
    //         setTimeout(() => submitAnswer(), 100);
    //     }
    // });
    
    // 监听全屏状态
    document.addEventListener('fullscreenchange', updateFullscreenButton);
    document.addEventListener('webkitfullscreenchange', updateFullscreenButton);
    document.addEventListener('mozfullscreenchange', updateFullscreenButton);
    document.addEventListener('MSFullscreenChange', updateFullscreenButton);
    
    updateDifficultySelector();
}

// 初始化难度按钮组
function initDifficultyButtons() {
    if (!difficultyButtons) return;
    
    difficultyBtnElements.forEach(btn => {
        btn.addEventListener('click', () => {
            const value = btn.dataset.value;
            difficultySelect.value = value;
            difficultyBtnElements.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            onDifficultyChange();
        });
    });
    
    updateDifficultySelector();
    document.addEventListener('fullscreenchange', updateDifficultySelector);
    document.addEventListener('webkitfullscreenchange', updateDifficultySelector);
    
    if (window.matchMedia('(display-mode: standalone)').matches) {
        updateDifficultySelector();
    }
    window.matchMedia('(display-mode: standalone)').addEventListener('change', updateDifficultySelector);
}

// 更新难度选择器显示
function updateDifficultySelector() {
    const isFullscreenMode = window.matchMedia('(display-mode: standalone)').matches || 
                            isFullscreen() ||
                            document.body.classList.contains('fullscreen-mode');
    
    if (isFullscreenMode) {
        if (difficultySelect) {
            difficultySelect.style.display = 'none';
            difficultySelect.disabled = true;
        }
        if (difficultyButtons) {
            difficultyButtons.style.display = 'flex';
        }
    } else {
        if (difficultySelect) {
            difficultySelect.style.display = 'block';
            difficultySelect.disabled = false;
        }
        if (difficultyButtons) {
            difficultyButtons.style.display = 'none';
        }
    }
    
    if (difficultySelect && difficultyBtnElements.length > 0) {
        const currentValue = difficultySelect.value;
        difficultyBtnElements.forEach(btn => {
            if (btn.dataset.value === currentValue) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }
}

// 开始游戏
function startGame() {
    if (gameState.isPlaying) return;
    
    gameState.isPlaying = true;
    gameState.difficulty = difficultySelect.value;
    gameState.startTime = Date.now();
    gameState.score = 0;
    gameState.totalQuestions = 0;
    gameState.correctAnswers = 0;
    gameState.consecutiveCorrect = 0;
    gameState.phase = 'playing';
    
    startTimer();
    startGameTimer();
    generateQuestion();
    
    waitingPhase.style.display = 'none';
    playingPhase.style.display = 'block';
    
    startBtn.disabled = true;
    resetBtn.disabled = false;
    difficultySelect.disabled = true;
    
    if (submitBtn) {
        submitBtn.disabled = false;
    }
    
    // 延迟聚焦，避免在移动设备上立即弹出键盘
    setTimeout(() => {
        if (gameState.isPlaying) {
            answerInput.focus();
        }
    }, 100);
    
    updateScore();
    updateAccuracy();
}

// 重置游戏
function resetGame() {
    stopTimer();
    stopGameTimer();
    gameState.isPlaying = false;
    gameState.startTime = null;
    gameState.score = 0;
    gameState.totalQuestions = 0;
    gameState.correctAnswers = 0;
    gameState.consecutiveCorrect = 0;
    gameState.currentQuestion = null;
    gameState.phase = 'waiting';
    
    waitingPhase.style.display = 'block';
    playingPhase.style.display = 'none';
    timerDisplay.textContent = '00:00';
    scoreDisplay.textContent = '0';
    accuracyDisplay.textContent = '--';
    feedback.textContent = '';
    answerInput.value = '';
    
    if (submitBtn) {
        submitBtn.disabled = true;
    }
    
    startBtn.disabled = false;
    resetBtn.disabled = true;
    difficultySelect.disabled = false;
}

// 生成题目
function generateQuestion() {
    const difficulty = gameState.difficulty;
    let question;
    
    switch (difficulty) {
        case 'easy':
            question = generateEasyQuestion();
            break;
        case 'medium':
            question = generateMediumQuestion();
            break;
        case 'multiply':
            question = generateMultiplyQuestion();
            break;
        case 'multiply2':
            question = generateMultiply2Question();
            break;
        case 'divide':
            question = generateDivideQuestion();
            break;
        case 'mixed':
            question = generateMixedQuestion();
            break;
        default:
            question = generateEasyQuestion();
    }
    
    gameState.currentQuestion = question;
    questionDisplay.textContent = `${question.num1} ${question.operator} ${question.num2} = ?`;
    answerInput.value = '';
    feedback.textContent = '';
    
    // 启用提交按钮
    if (submitBtn) {
        submitBtn.disabled = false;
    }
    
    // 延迟聚焦，避免在移动设备上立即弹出键盘
    setTimeout(() => {
        if (gameState.isPlaying) {
            answerInput.focus();
        }
    }, 100);
}

// 生成简单题目（2位数加减，无进位借位）
function generateEasyQuestion() {
    const operations = ['+', '-'];
    const op = operations[Math.floor(Math.random() * operations.length)];
    
    let num1, num2, answer;
    if (op === '+') {
        // 确保各位相加不超过9，避免进位
        const ones1 = Math.floor(Math.random() * 5) + 1;
        const ones2 = Math.floor(Math.random() * (9 - ones1)) + 1;
        const tens1 = Math.floor(Math.random() * 4) + 1; // 10-49
        const tens2 = Math.floor(Math.random() * (9 - tens1));
        
        num1 = tens1 * 10 + ones1;
        num2 = tens2 * 10 + ones2;
        answer = num1 + num2;
    } else {
        // 确保各位相减不需要借位
        const ones1 = Math.floor(Math.random() * 5) + 5;
        const ones2 = Math.floor(Math.random() * ones1);
        const tens1 = Math.floor(Math.random() * 5) + 5; // 50-99
        const tens2 = Math.floor(Math.random() * tens1);
        
        num1 = tens1 * 10 + ones1;
        num2 = tens2 * 10 + ones2;
        answer = num1 - num2;
    }
    
    return { num1, num2, operator: op, answer };
}

// 生成中等题目（2位数加减，带进位借位）
function generateMediumQuestion() {
    const operations = ['+', '-'];
    const op = operations[Math.floor(Math.random() * operations.length)];
    
    let num1, num2, answer;
    if (op === '+') {
        // 允许进位，2位数加法
        num1 = Math.floor(Math.random() * 50) + 10; // 10-59
        num2 = Math.floor(Math.random() * (99 - num1)) + 1;
        answer = num1 + num2;
    } else {
        // 允许借位，2位数减法
        num1 = Math.floor(Math.random() * 50) + 50; // 50-99
        num2 = Math.floor(Math.random() * (num1 - 10)) + 10;
        answer = num1 - num2;
    }
    
    return { num1, num2, operator: op, answer };
}

// 生成乘法题目（九九乘法表）
function generateMultiplyQuestion() {
    const num1 = Math.floor(Math.random() * 9) + 1; // 1-9
    const num2 = Math.floor(Math.random() * 9) + 1; // 1-9
    const answer = num1 * num2;
    
    return { num1, num2, operator: '×', answer };
}

// 生成乘法题目（2位数×1位数）
function generateMultiply2Question() {
    const num1 = Math.floor(Math.random() * 90) + 10; // 10-99
    const num2 = Math.floor(Math.random() * 9) + 1;  // 1-9
    const answer = num1 * num2;
    
    return { num1, num2, operator: '×', answer };
}

// 生成除法题目（2位数÷1位数，能整除）
function generateDivideQuestion() {
    const divisor = Math.floor(Math.random() * 8) + 2; // 2-9
    const quotient = Math.floor(Math.random() * 10) + 1; // 1-10
    const dividend = divisor * quotient; // 确保能整除
    
    // 如果商是两位数，确保被除数也是两位数
    if (dividend < 10) {
        const newQuotient = Math.floor(Math.random() * 9) + 2; // 2-10
        const newDividend = divisor * newQuotient;
        if (newDividend >= 10 && newDividend < 100) {
            return { num1: newDividend, num2: divisor, operator: '÷', answer: newQuotient };
        }
    }
    
    // 确保被除数是两位数
    if (dividend >= 10 && dividend < 100) {
        return { num1: dividend, num2: divisor, operator: '÷', answer: quotient };
    } else {
        // 重新生成
        const newDivisor = Math.floor(Math.random() * 8) + 2;
        const newQuotient = Math.floor(Math.random() * 9) + 2;
        const newDividend = newDivisor * newQuotient;
        if (newDividend >= 10 && newDividend < 100) {
            return { num1: newDividend, num2: newDivisor, operator: '÷', answer: newQuotient };
        }
        // 如果还是不行，使用简单的
        return { num1: 20, num2: 4, operator: '÷', answer: 5 };
    }
}

// 生成混合题目
function generateMixedQuestion() {
    const operations = ['+', '-', '×'];
    const op = operations[Math.floor(Math.random() * operations.length)];
    
    let num1, num2, answer;
    if (op === '×') {
        // 九九乘法表
        num1 = Math.floor(Math.random() * 9) + 1;
        num2 = Math.floor(Math.random() * 9) + 1;
        answer = num1 * num2;
    } else if (op === '+') {
        // 2位数加法（可能带进位）
        num1 = Math.floor(Math.random() * 50) + 10; // 10-59
        num2 = Math.floor(Math.random() * (99 - num1)) + 1;
        answer = num1 + num2;
    } else {
        // 2位数减法（可能带借位）
        num1 = Math.floor(Math.random() * 50) + 50; // 50-99
        num2 = Math.floor(Math.random() * (num1 - 10)) + 10;
        answer = num1 - num2;
    }
    
    return { num1, num2, operator: op, answer };
}

// 提交答案
function submitAnswer() {
    if (!gameState.isPlaying || !gameState.currentQuestion) return;
    
    const inputValue = answerInput.value.trim();
    if (inputValue === '') {
        feedback.textContent = '请输入答案';
        feedback.className = 'feedback incorrect';
        return;
    }
    
    const userAnswer = parseInt(inputValue);
    if (isNaN(userAnswer)) {
        feedback.textContent = '请输入有效的数字';
        feedback.className = 'feedback incorrect';
        return;
    }
    
    const correctAnswer = gameState.currentQuestion.answer;
    
    gameState.totalQuestions++;
    
    if (userAnswer === correctAnswer) {
        gameState.correctAnswers++;
        gameState.consecutiveCorrect++;
        
        // 计算得分：基础分 + 连续正确奖励
        const baseScore = 10;
        const bonus = Math.min(gameState.consecutiveCorrect - 1, 5) * 2;
        gameState.score += baseScore + bonus;
        
        feedback.textContent = '✓ 正确！';
        feedback.className = 'feedback correct';
    } else {
        gameState.consecutiveCorrect = 0;
        feedback.textContent = `✗ 错误！正确答案是 ${correctAnswer}`;
        feedback.className = 'feedback incorrect';
    }
    
    updateScore();
    updateAccuracy();
    
    // 禁用提交按钮，防止重复提交
    if (submitBtn) {
        submitBtn.disabled = true;
    }
    
    // 延迟后生成下一题
    setTimeout(() => {
        if (gameState.isPlaying) {
            generateQuestion();
        }
    }, 1000);
}

// 更新得分
function updateScore() {
    scoreDisplay.textContent = gameState.score;
}

// 更新正确率
function updateAccuracy() {
    if (gameState.totalQuestions === 0) {
        accuracyDisplay.textContent = '--';
        return;
    }
    
    const accuracy = Math.round((gameState.correctAnswers / gameState.totalQuestions) * 100);
    accuracyDisplay.textContent = accuracy + '%';
}

// 开始计时
function startTimer() {
    gameState.timerInterval = setInterval(() => {
        if (gameState.startTime) {
            const elapsed = Date.now() - gameState.startTime;
            timerDisplay.textContent = formatTime(elapsed);
        }
    }, 10);
}

// 开始游戏计时（2分钟限制）
function startGameTimer() {
    gameState.gameTimerInterval = setInterval(() => {
        if (gameState.startTime) {
            const elapsed = Date.now() - gameState.startTime;
            if (elapsed >= gameState.timeLimit) {
                finishGame();
            }
        }
    }, 100);
}

// 停止计时
function stopTimer() {
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
        gameState.timerInterval = null;
    }
}

// 停止游戏计时
function stopGameTimer() {
    if (gameState.gameTimerInterval) {
        clearInterval(gameState.gameTimerInterval);
        gameState.gameTimerInterval = null;
    }
}

// 格式化时间
function formatTime(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const ms = Math.floor((milliseconds % 1000) / 10);
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
}

// 完成游戏
function finishGame() {
    stopTimer();
    stopGameTimer();
    gameState.isPlaying = false;
    
    const elapsedTime = Date.now() - gameState.startTime;
    const timeString = formatTime(elapsedTime);
    const accuracy = gameState.totalQuestions > 0 
        ? Math.round((gameState.correctAnswers / gameState.totalQuestions) * 100) 
        : 0;
    
    // 保存最佳成绩
    const difficulty = gameState.difficulty;
    const bestScore = gameState.bestScores[difficulty] || 0;
    if (gameState.score > bestScore) {
        gameState.bestScores[difficulty] = gameState.score;
        saveBestScores();
        updateBestScoreDisplay();
    }
    
    // 保存历史记录
    saveHistory(difficulty, gameState.score, gameState.totalQuestions, gameState.correctAnswers, elapsedTime);
    
    // 显示结果
    resultTitle.textContent = '🎉 训练完成！';
    resultTotal.textContent = gameState.totalQuestions;
    resultCorrect.textContent = gameState.correctAnswers;
    resultAccuracy.textContent = accuracy + '%';
    resultTime.textContent = timeString;
    resultScore.textContent = gameState.score;
    
    let message = '';
    if (accuracy >= 90) {
        message = '🌟 太棒了！继续保持！';
    } else if (accuracy >= 70) {
        message = '👍 不错！继续努力！';
    } else {
        message = '💪 加油！多练习会更好！';
    }
    resultMessage.textContent = message;
    resultModal.classList.add('show');
    
    startBtn.disabled = false;
    resetBtn.disabled = true;
    difficultySelect.disabled = false;
}

// 关闭结果模态框
function closeResultModal() {
    resultModal.classList.remove('show');
}

// 难度改变
function onDifficultyChange() {
    if (!gameState.isPlaying) {
        updateBestScoreDisplay();
    }
}

// 更新最佳成绩显示
function updateBestScoreDisplay() {
    const difficulty = difficultySelect.value;
    const bestScore = gameState.bestScores[difficulty];
    
    if (bestScore) {
        bestScoreDisplay.textContent = bestScore;
    } else {
        bestScoreDisplay.textContent = '--';
    }
}

// 保存最佳成绩
function saveBestScores() {
    localStorage.setItem('mathPracticeBestScores', JSON.stringify(gameState.bestScores));
}

// 加载最佳成绩
function loadBestScores() {
    const saved = localStorage.getItem('mathPracticeBestScores');
    if (saved) {
        gameState.bestScores = JSON.parse(saved);
    }
}

// 保存历史记录
function saveHistory(difficulty, score, total, correct, time) {
    let history = JSON.parse(localStorage.getItem('mathPracticeHistory') || '[]');
    history.unshift({
        difficulty: difficulty,
        score: score,
        total: total,
        correct: correct,
        accuracy: Math.round((correct / total) * 100),
        time: time,
        date: new Date().toISOString()
    });
    
    if (history.length > 50) {
        history = history.slice(0, 50);
    }
    
    localStorage.setItem('mathPracticeHistory', JSON.stringify(history));
    loadHistory();
}

// 加载历史记录
function loadHistory() {
    const history = JSON.parse(localStorage.getItem('mathPracticeHistory') || '[]');
    
    if (history.length === 0) {
        historyList.innerHTML = '<p class="no-history">暂无训练记录</p>';
        return;
    }
    
    historyList.innerHTML = history.map(item => {
        const date = new Date(item.date);
        const dateStr = date.toLocaleDateString('zh-CN') + ' ' + 
                       date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
        const itemId = item.date;
        return `
            <div class="history-item">
                <div>
                    <span class="score">${item.score} 分</span>
                    <span class="accuracy"> (${item.accuracy}%)</span>
                    <span class="time"> - ${formatTime(item.time)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                    <div style="color: #999; font-size: 0.9em;">${dateStr}</div>
                    <button class="delete-btn" data-date="${itemId}" title="删除这条记录">🗑️</button>
                </div>
            </div>
        `;
    }).join('');
    
    // 为所有删除按钮添加事件监听
    historyList.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const itemDate = this.getAttribute('data-date');
            deleteHistoryItem(itemDate);
        });
    });
}

// 删除单条历史记录
function deleteHistoryItem(itemDate) {
    if (!confirm('确定要删除这条记录吗？')) {
        return;
    }
    
    let history = JSON.parse(localStorage.getItem('mathPracticeHistory') || '[]');
    history = history.filter(item => item.date !== itemDate);
    localStorage.setItem('mathPracticeHistory', JSON.stringify(history));
    loadHistory();
}

// 清空历史记录
function clearHistory() {
    if (confirm('确定要清空所有训练记录吗？')) {
        localStorage.removeItem('mathPracticeHistory');
        loadHistory();
    }
}

// 全屏功能
function isFullscreen() {
    return !!(document.fullscreenElement || 
             document.webkitFullscreenElement || 
             document.mozFullScreenElement || 
             document.msFullscreenElement);
}

function enterFullscreen() {
    const element = document.documentElement;
    if (element.requestFullscreen) {
        element.requestFullscreen();
    } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen();
    } else if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen();
    } else if (element.msRequestFullscreen) {
        element.msRequestFullscreen();
    }
}

function exitFullscreen() {
    if (document.exitFullscreen) {
        document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
    } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
    } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
    }
}

function toggleFullscreen() {
    if (isFullscreen()) {
        exitFullscreen();
    } else {
        enterFullscreen();
    }
}

function updateFullscreenButton() {
    if (isFullscreen()) {
        fullscreenIcon.textContent = '⛶';
        fullscreenText.textContent = '退出全屏';
        fullscreenBtn.title = '退出全屏模式';
        document.body.classList.add('fullscreen-mode');
    } else {
        fullscreenIcon.textContent = '⛶';
        fullscreenText.textContent = '全屏';
        fullscreenBtn.title = '全屏模式';
        document.body.classList.remove('fullscreen-mode');
    }
    updateDifficultySelector();
}

function initFullscreenButton() {
    if (window.matchMedia('(display-mode: standalone)').matches) {
        fullscreenBtn.style.display = 'none';
        return;
    }
    
    const isFullscreenSupported = !!(document.fullscreenEnabled || 
                                     document.webkitFullscreenEnabled || 
                                     document.mozFullScreenEnabled || 
                                     document.msFullscreenEnabled);
    
    if (!isFullscreenSupported) {
        fullscreenBtn.style.display = 'none';
    } else {
        updateFullscreenButton();
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    init();
    initFullscreenButton();
});


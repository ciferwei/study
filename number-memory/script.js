// 游戏状态
let gameState = {
    isPlaying: false,
    currentRound: 1,
    difficulty: 4,
    startTime: null,
    timerInterval: null,
    displayTime: 3000, // 显示时间（毫秒）
    currentSequence: [],
    userInput: [],
    bestTimes: {},
    phase: 'waiting' // waiting, displaying, inputting
};

// DOM元素
const gameArea = document.getElementById('gameArea');
const displayPhase = document.getElementById('displayPhase');
const inputPhase = document.getElementById('inputPhase');
const numberDisplay = document.getElementById('numberDisplay');
const numberPad = document.getElementById('numberPad');
const inputDisplay = document.getElementById('inputDisplay');
const inputNumbers = document.getElementById('inputNumbers');
const keyboardInput = document.getElementById('keyboardInput');
const submitBtn = document.getElementById('submitBtn');
const countdown = document.getElementById('countdown');
const deleteBtn = document.getElementById('deleteBtn');
const clearBtn = document.getElementById('clearBtn');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const fullscreenBtn = document.getElementById('fullscreenBtn');
const fullscreenIcon = document.getElementById('fullscreenIcon');
const fullscreenText = document.getElementById('fullscreenText');
const difficultySelect = document.getElementById('difficulty');
const difficultyButtons = document.getElementById('difficultyButtons');
const difficultyBtnElements = difficultyButtons ? difficultyButtons.querySelectorAll('.difficulty-btn') : [];
const timerDisplay = document.getElementById('timer');
const roundNumDisplay = document.getElementById('roundNum');
const bestTimeDisplay = document.getElementById('bestTime');
const resultModal = document.getElementById('resultModal');
const resultTitle = document.getElementById('resultTitle');
const resultTime = document.getElementById('resultTime');
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
    
    loadBestTimes();
    loadHistory();
    updateBestTimeDisplay();
    initNumberPad();
    initDifficultyButtons();
    
    // 初始化按钮状态
    if (deleteBtn) deleteBtn.disabled = true;
    if (clearBtn) clearBtn.disabled = true;
    if (submitBtn) submitBtn.disabled = true;
    
    startBtn.addEventListener('click', startGame);
    resetBtn.addEventListener('click', resetGame);
    fullscreenBtn.addEventListener('click', toggleFullscreen);
    if (deleteBtn) deleteBtn.addEventListener('click', deleteLastInput);
    if (clearBtn) clearBtn.addEventListener('click', clearAllInput);
    closeModal.addEventListener('click', closeResultModal);
    clearHistoryBtn.addEventListener('click', clearHistory);
    difficultySelect.addEventListener('change', onDifficultyChange);
    
    // 键盘输入事件
    if (keyboardInput) {
        keyboardInput.addEventListener('keypress', (e) => {
            // 只允许数字
            if (!/[0-9]/.test(e.key) && e.key !== 'Enter') {
                e.preventDefault();
                return;
            }
            
            if (e.key === 'Enter' && gameState.isPlaying && gameState.phase === 'inputting') {
                e.preventDefault();
                submitAnswer();
            }
        });
        
        keyboardInput.addEventListener('input', (e) => {
            // 只允许数字
            e.target.value = e.target.value.replace(/[^0-9]/g, '');
            
            // 限制输入长度
            const maxLength = gameState.currentSequence ? gameState.currentSequence.length : 10;
            if (e.target.value.length > maxLength) {
                e.target.value = e.target.value.substring(0, maxLength);
            }
            
            // 同步到userInput
            const inputValue = e.target.value;
            gameState.userInput = inputValue.split('').map(Number);
            updateInputDisplay();
        });
        
        keyboardInput.addEventListener('paste', (e) => {
            e.preventDefault();
            const paste = (e.clipboardData || window.clipboardData).getData('text');
            const numbers = paste.replace(/[^0-9]/g, '');
            const maxLength = gameState.currentSequence ? gameState.currentSequence.length : 10;
            e.target.value = numbers.substring(0, maxLength);
            gameState.userInput = numbers.substring(0, maxLength).split('').map(Number);
            updateInputDisplay();
        });
    }
    
    // 提交按钮
    if (submitBtn) {
        submitBtn.addEventListener('click', submitAnswer);
    }
    
    // 监听全屏状态
    document.addEventListener('fullscreenchange', updateFullscreenButton);
    document.addEventListener('webkitfullscreenchange', updateFullscreenButton);
    document.addEventListener('mozfullscreenchange', updateFullscreenButton);
    document.addEventListener('MSFullscreenChange', updateFullscreenButton);
    
    // 优化触摸体验
    let lastTouchEnd = 0;
    document.addEventListener('touchend', (event) => {
        const now = Date.now();
        if (now - lastTouchEnd <= 300) {
            event.preventDefault();
        }
        lastTouchEnd = now;
    }, false);
    
    updateDifficultySelector();
}

// 初始化数字键盘
function initNumberPad() {
    numberPad.innerHTML = '';
    for (let i = 0; i <= 9; i++) {
        const btn = document.createElement('button');
        btn.className = 'num-btn';
        btn.textContent = i;
        btn.dataset.number = i;
        btn.addEventListener('click', () => handleNumberClick(i));
        numberPad.appendChild(btn);
    }
}

// 初始化难度按钮组
function initDifficultyButtons() {
    if (!difficultyButtons) return;
    
    difficultyBtnElements.forEach(btn => {
        btn.addEventListener('click', () => {
            const value = parseInt(btn.dataset.value);
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
    gameState.currentRound = 1;
    gameState.difficulty = parseInt(difficultySelect.value);
    gameState.startTime = Date.now();
    gameState.userInput = [];
    gameState.phase = 'displaying';
    
    startTimer();
    generateSequence();
    showDisplayPhase();
    
    startBtn.disabled = true;
    resetBtn.disabled = false;
    difficultySelect.disabled = true;
    roundNumDisplay.textContent = gameState.currentRound;
}

// 重置游戏
function resetGame() {
    stopTimer();
    gameState.isPlaying = false;
    gameState.currentRound = 1;
    gameState.startTime = null;
    gameState.userInput = [];
    gameState.currentSequence = [];
    gameState.phase = 'waiting';
    
    displayPhase.style.display = 'block';
    inputPhase.style.display = 'none';
    numberDisplay.textContent = '';
    gameState.userInput = [];
    updateInputDisplay();
    timerDisplay.textContent = '00:00';
    roundNumDisplay.textContent = '-';
    
    startBtn.disabled = false;
    resetBtn.disabled = true;
    difficultySelect.disabled = false;
}

// 生成数字序列
function generateSequence() {
    const length = gameState.difficulty;
    gameState.currentSequence = [];
    for (let i = 0; i < length; i++) {
        gameState.currentSequence.push(Math.floor(Math.random() * 10));
    }
}

// 显示数字序列
function showDisplayPhase() {
    displayPhase.style.display = 'block';
    inputPhase.style.display = 'none';
    gameState.phase = 'displaying';
    
    // 显示数字序列
    numberDisplay.textContent = gameState.currentSequence.join(' ');
    numberDisplay.classList.add('show');
    
    // 倒计时
    let timeLeft = gameState.displayTime / 1000;
    countdown.textContent = `还有 ${timeLeft} 秒`;
    
    const countdownInterval = setInterval(() => {
        timeLeft--;
        if (timeLeft > 0) {
            countdown.textContent = `还有 ${timeLeft} 秒`;
        } else {
            countdown.textContent = '';
            clearInterval(countdownInterval);
        }
    }, 1000);
    
    // 隐藏数字，进入输入阶段
    setTimeout(() => {
        numberDisplay.classList.remove('show');
        numberDisplay.textContent = '';
        showInputPhase();
    }, gameState.displayTime);
}

// 显示输入阶段
function showInputPhase() {
    displayPhase.style.display = 'none';
    inputPhase.style.display = 'block';
    gameState.phase = 'inputting';
    gameState.userInput = [];
    
    // 清空键盘输入框
    if (keyboardInput) {
        keyboardInput.value = '';
        // PC端自动聚焦到键盘输入框
        if (window.innerWidth > 768) {
            setTimeout(() => {
                keyboardInput.focus();
            }, 100);
        }
    }
    
    updateInputDisplay();
}

// 处理数字点击
function handleNumberClick(number) {
    if (gameState.phase !== 'inputting' || !gameState.isPlaying) return;
    
    gameState.userInput.push(number);
    
    // 同步到键盘输入框
    if (keyboardInput) {
        keyboardInput.value = gameState.userInput.join('');
    }
    
    updateInputDisplay();
    
    // 检查是否完成输入
    if (gameState.userInput.length === gameState.currentSequence.length) {
        checkAnswer();
    }
}

// 更新输入显示
function updateInputDisplay() {
    inputNumbers.textContent = gameState.userInput.join(' ');
    // 更新删除、清空和提交按钮状态
    if (deleteBtn) {
        deleteBtn.disabled = gameState.userInput.length === 0;
    }
    if (clearBtn) {
        clearBtn.disabled = gameState.userInput.length === 0;
    }
    if (submitBtn) {
        const expectedLength = gameState.currentSequence ? gameState.currentSequence.length : 0;
        submitBtn.disabled = gameState.userInput.length === 0 || 
                            gameState.userInput.length !== expectedLength;
    }
}

// 删除最后一个输入
function deleteLastInput() {
    if (gameState.phase !== 'inputting' || !gameState.isPlaying) return;
    if (gameState.userInput.length === 0) return;
    
    gameState.userInput.pop();
    
    // 同步到键盘输入框
    if (keyboardInput) {
        keyboardInput.value = gameState.userInput.join('');
    }
    
    updateInputDisplay();
}

// 清空所有输入
function clearAllInput() {
    if (gameState.phase !== 'inputting' || !gameState.isPlaying) return;
    if (gameState.userInput.length === 0) return;
    
    if (confirm('确定要清空所有输入吗？')) {
        gameState.userInput = [];
        
        // 同步到键盘输入框
        if (keyboardInput) {
            keyboardInput.value = '';
        }
        
        updateInputDisplay();
    }
}

// 提交答案
function submitAnswer() {
    if (gameState.phase !== 'inputting' || !gameState.isPlaying) return;
    if (gameState.userInput.length === 0) {
        alert('请输入数字序列');
        return;
    }
    
    if (gameState.userInput.length !== gameState.currentSequence.length) {
        alert(`请输入 ${gameState.currentSequence.length} 位数字`);
        return;
    }
    
    checkAnswer();
}

// 检查答案
function checkAnswer() {
    const isCorrect = JSON.stringify(gameState.userInput) === JSON.stringify(gameState.currentSequence);
    
    if (isCorrect) {
        // 正确，进入下一轮
        gameState.currentRound++;
        roundNumDisplay.textContent = gameState.currentRound;
        
        // 生成新序列
        generateSequence();
        showDisplayPhase();
    } else {
        // 错误，结束游戏
        finishGame(false);
    }
}

// 完成游戏
function finishGame(success = true) {
    stopTimer();
    gameState.isPlaying = false;
    
    const elapsedTime = Date.now() - gameState.startTime;
    const timeString = formatTime(elapsedTime);
    const rounds = gameState.currentRound - 1;
    
    // 保存最佳成绩
    const difficulty = gameState.difficulty;
    const bestRounds = gameState.bestTimes[difficulty] || 0;
    if (rounds > bestRounds) {
        gameState.bestTimes[difficulty] = rounds;
        saveBestTimes();
        updateBestTimeDisplay();
    }
    
    // 保存历史记录
    saveHistory(difficulty, rounds, elapsedTime);
    
    // 显示结果
    if (success) {
        resultTitle.textContent = '🎉 完成！';
    } else {
        resultTitle.textContent = '❌ 答错了';
    }
    resultTime.textContent = timeString;
    resultMessage.textContent = `完成了 ${rounds} 轮，难度：${difficulty}位数字`;
    resultModal.classList.add('show');
    
    startBtn.disabled = false;
    resetBtn.disabled = true;
    difficultySelect.disabled = false;
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

// 停止计时
function stopTimer() {
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
        gameState.timerInterval = null;
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

// 关闭结果模态框
function closeResultModal() {
    resultModal.classList.remove('show');
}

// 难度改变
function onDifficultyChange() {
    if (!gameState.isPlaying) {
        updateBestTimeDisplay();
    }
}

// 更新最佳成绩显示
function updateBestTimeDisplay() {
    const difficulty = parseInt(difficultySelect.value);
    const bestRounds = gameState.bestTimes[difficulty];
    
    if (bestRounds) {
        bestTimeDisplay.textContent = `${bestRounds} 轮`;
    } else {
        bestTimeDisplay.textContent = '--';
    }
}

// 保存最佳成绩
function saveBestTimes() {
    localStorage.setItem('numberMemoryBestTimes', JSON.stringify(gameState.bestTimes));
}

// 加载最佳成绩
function loadBestTimes() {
    const saved = localStorage.getItem('numberMemoryBestTimes');
    if (saved) {
        gameState.bestTimes = JSON.parse(saved);
    }
}

// 保存历史记录
function saveHistory(difficulty, rounds, time) {
    let history = JSON.parse(localStorage.getItem('numberMemoryHistory') || '[]');
    history.unshift({
        difficulty: difficulty,
        rounds: rounds,
        time: time,
        date: new Date().toISOString()
    });
    
    if (history.length > 50) {
        history = history.slice(0, 50);
    }
    
    localStorage.setItem('numberMemoryHistory', JSON.stringify(history));
    loadHistory();
}

// 加载历史记录
function loadHistory() {
    const history = JSON.parse(localStorage.getItem('numberMemoryHistory') || '[]');
    
    if (history.length === 0) {
        historyList.innerHTML = '<p class="no-history">暂无训练记录</p>';
        return;
    }
    
    historyList.innerHTML = history.map((item) => {
        const date = new Date(item.date);
        const dateStr = date.toLocaleDateString('zh-CN') + ' ' + 
                       date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
        // 使用日期时间戳作为唯一标识
        const itemId = item.date;
        return `
            <div class="history-item">
                <div>
                    <span class="rounds">${item.rounds} 轮</span>
                    <span class="difficulty"> (${item.difficulty}位)</span>
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
    
    let history = JSON.parse(localStorage.getItem('numberMemoryHistory') || '[]');
    history = history.filter(item => item.date !== itemDate);
    localStorage.setItem('numberMemoryHistory', JSON.stringify(history));
    loadHistory();
}

// 清空历史记录
function clearHistory() {
    if (confirm('确定要清空所有训练记录吗？')) {
        localStorage.removeItem('numberMemoryHistory');
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


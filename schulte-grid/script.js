// 游戏状态
let gameState = {
    isPlaying: false,
    currentNumber: 1,
    startTime: null,
    timerInterval: null,
    difficulty: 5,
    numbers: [],
    bestTimes: {}
};

// DOM元素
const gameBoard = document.getElementById('gameBoard');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const printBtn = document.getElementById('printBtn');
const difficultySelect = document.getElementById('difficulty');
const timerDisplay = document.getElementById('timer');
const currentNumDisplay = document.getElementById('currentNum');
const bestTimeDisplay = document.getElementById('bestTime');
const resultModal = document.getElementById('resultModal');
const resultTime = document.getElementById('resultTime');
const resultMessage = document.getElementById('resultMessage');
const closeModal = document.getElementById('closeModal');
const historyList = document.getElementById('historyList');
const clearHistoryBtn = document.getElementById('clearHistory');
const fullscreenBtn = document.getElementById('fullscreenBtn');
const fullscreenIcon = document.getElementById('fullscreenIcon');
const fullscreenText = document.getElementById('fullscreenText');

// 注册Service Worker (PWA支持)
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
    // 注册Service Worker
    registerServiceWorker();
    
    loadBestTimes();
    loadHistory();
    updateBestTimeDisplay();
    
    startBtn.addEventListener('click', startGame);
    resetBtn.addEventListener('click', resetGame);
    printBtn.addEventListener('click', printGame);
    fullscreenBtn.addEventListener('click', toggleFullscreen);
    closeModal.addEventListener('click', closeResultModal);
    clearHistoryBtn.addEventListener('click', clearHistory);
    difficultySelect.addEventListener('change', onDifficultyChange);
    
    // 监听全屏状态变化
    document.addEventListener('fullscreenchange', updateFullscreenButton);
    document.addEventListener('webkitfullscreenchange', updateFullscreenButton);
    document.addEventListener('mozfullscreenchange', updateFullscreenButton);
    document.addEventListener('MSFullscreenChange', updateFullscreenButton);
    
    // 点击模态框外部关闭
    resultModal.addEventListener('click', (e) => {
        if (e.target === resultModal) {
            closeResultModal();
        }
    });
    
    // 优化触摸体验（防止双击缩放）
    let lastTouchEnd = 0;
    document.addEventListener('touchend', (event) => {
        const now = Date.now();
        if (now - lastTouchEnd <= 300) {
            event.preventDefault();
        }
        lastTouchEnd = now;
    }, false);
}

// 开始游戏
function startGame() {
    if (gameState.isPlaying) return;
    
    gameState.isPlaying = true;
    gameState.currentNumber = 1;
    gameState.difficulty = parseInt(difficultySelect.value);
    gameState.startTime = Date.now();
    
    generateBoard();
    startTimer();
    
    startBtn.disabled = true;
    resetBtn.disabled = false;
    difficultySelect.disabled = true;
    currentNumDisplay.textContent = gameState.currentNumber;
}

// 重置游戏
function resetGame() {
    stopTimer();
    gameState.isPlaying = false;
    gameState.currentNumber = 1;
    gameState.startTime = null;
    
    gameBoard.innerHTML = '';
    timerDisplay.textContent = '00:00';
    currentNumDisplay.textContent = '-';
    
    startBtn.disabled = false;
    resetBtn.disabled = true;
    difficultySelect.disabled = false;
}

// 生成游戏板
function generateBoard() {
    const size = gameState.difficulty;
    const totalCells = size * size;
    gameState.numbers = [];
    
    // 生成1到totalCells的随机数组
    const numbers = Array.from({ length: totalCells }, (_, i) => i + 1);
    shuffleArray(numbers);
    gameState.numbers = numbers;
    
    // 清空游戏板
    gameBoard.innerHTML = '';
    gameBoard.className = `game-board cell-${size}`;
    
    // 创建单元格
    numbers.forEach((num, index) => {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.textContent = num;
        cell.dataset.number = num;
        cell.dataset.index = index;
        
        // 不自动高亮，让用户自己寻找
        // 这样更符合舒尔特方格的训练目的
        
        cell.addEventListener('click', () => handleCellClick(cell, num));
        gameBoard.appendChild(cell);
    });
}

// 打乱数组（Fisher-Yates算法）
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// 处理单元格点击
function handleCellClick(cell, clickedNumber) {
    if (!gameState.isPlaying) return;
    
    const expectedNumber = gameState.currentNumber;
    
    if (clickedNumber === expectedNumber) {
        // 正确
        cell.classList.add('clicked');
        
        gameState.currentNumber++;
        
        // 检查是否完成
        if (gameState.currentNumber > gameState.difficulty * gameState.difficulty) {
            finishGame();
            return;
        }
        
        // 不自动高亮下一个数字，让用户自己寻找
        // 只更新提示文字，保持训练效果
        currentNumDisplay.textContent = gameState.currentNumber;
    } else {
        // 错误
        cell.classList.add('wrong');
        setTimeout(() => {
            cell.classList.remove('wrong');
        }, 500);
    }
}

// 完成游戏
function finishGame() {
    stopTimer();
    gameState.isPlaying = false;
    
    const elapsedTime = Date.now() - gameState.startTime;
    const seconds = (elapsedTime / 1000).toFixed(2);
    const timeString = formatTime(elapsedTime);
    
    // 保存最佳成绩
    const difficulty = gameState.difficulty;
    const bestTime = gameState.bestTimes[difficulty] || Infinity;
    if (elapsedTime < bestTime) {
        gameState.bestTimes[difficulty] = elapsedTime;
        saveBestTimes();
        updateBestTimeDisplay();
    }
    
    // 保存历史记录
    saveHistory(difficulty, elapsedTime);
    
    // 显示结果
    resultTime.textContent = timeString;
    resultMessage.textContent = getResultMessage(parseFloat(seconds), difficulty);
    resultModal.classList.add('show');
    
    startBtn.disabled = false;
    resetBtn.disabled = true;
    difficultySelect.disabled = false;
}

// 获取评价消息
function getResultMessage(seconds, difficulty) {
    const size = difficulty;
    let message = '';
    
    if (size === 3) {
        if (seconds < 10) message = '🌟 太棒了！你是注意力小达人！';
        else if (seconds < 15) message = '👍 很好！继续保持！';
        else message = '💪 不错！继续努力！';
    } else if (size === 4) {
        if (seconds < 20) message = '🌟 太棒了！你是注意力小达人！';
        else if (seconds < 30) message = '👍 很好！继续保持！';
        else message = '💪 不错！继续努力！';
    } else if (size === 5) {
        if (seconds < 30) message = '🌟 太棒了！你是注意力小达人！';
        else if (seconds < 50) message = '👍 很好！继续保持！';
        else if (seconds < 70) message = '💪 不错！继续努力！';
        else message = '🎯 加油！多练习会更好！';
    } else if (size === 6) {
        if (seconds < 50) message = '🌟 太棒了！你是注意力小达人！';
        else if (seconds < 80) message = '👍 很好！继续保持！';
        else message = '💪 不错！继续努力！';
    } else {
        if (seconds < 80) message = '🌟 太棒了！你是注意力小达人！';
        else if (seconds < 120) message = '👍 很好！继续保持！';
        else message = '💪 不错！继续努力！';
    }
    
    return message;
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
    const bestTime = gameState.bestTimes[difficulty];
    
    if (bestTime) {
        bestTimeDisplay.textContent = formatTime(bestTime);
    } else {
        bestTimeDisplay.textContent = '--';
    }
}

// 保存最佳成绩到本地存储
function saveBestTimes() {
    localStorage.setItem('schulteBestTimes', JSON.stringify(gameState.bestTimes));
}

// 加载最佳成绩
function loadBestTimes() {
    const saved = localStorage.getItem('schulteBestTimes');
    if (saved) {
        gameState.bestTimes = JSON.parse(saved);
    }
}

// 保存历史记录
function saveHistory(difficulty, time) {
    let history = JSON.parse(localStorage.getItem('schulteHistory') || '[]');
    history.unshift({
        difficulty: difficulty,
        time: time,
        date: new Date().toISOString()
    });
    
    // 只保留最近50条记录
    if (history.length > 50) {
        history = history.slice(0, 50);
    }
    
    localStorage.setItem('schulteHistory', JSON.stringify(history));
    loadHistory();
}

// 加载历史记录
function loadHistory() {
    const history = JSON.parse(localStorage.getItem('schulteHistory') || '[]');
    
    if (history.length === 0) {
        historyList.innerHTML = '<p class="no-history">暂无训练记录</p>';
        return;
    }
    
    historyList.innerHTML = history.map(item => {
        const date = new Date(item.date);
        const dateStr = date.toLocaleDateString('zh-CN') + ' ' + 
                       date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
        return `
            <div class="history-item">
                <div>
                    <span class="time">${formatTime(item.time)}</span>
                    <span class="difficulty"> (${item.difficulty}×${item.difficulty})</span>
                </div>
                <div style="color: #999; font-size: 0.9em;">${dateStr}</div>
            </div>
        `;
    }).join('');
}

// 清空历史记录
function clearHistory() {
    if (confirm('确定要清空所有训练记录吗？')) {
        localStorage.removeItem('schulteHistory');
        loadHistory();
    }
}

// 打印游戏
function printGame() {
    if (!gameState.isPlaying && gameState.numbers.length === 0) {
        // 生成一个打印用的游戏板
        const size = parseInt(difficultySelect.value);
        const totalCells = size * size;
        const numbers = Array.from({ length: totalCells }, (_, i) => i + 1);
        shuffleArray(numbers);
        
        // 创建临时打印内容
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>舒尔特方格练习</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        padding: 20px;
                        text-align: center;
                    }
                    .print-board {
                        display: grid;
                        grid-template-columns: repeat(${size}, 1fr);
                        gap: 10px;
                        max-width: 600px;
                        margin: 30px auto;
                    }
                    .print-cell {
                        aspect-ratio: 1;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        border: 2px solid #333;
                        font-size: 1.5em;
                        font-weight: bold;
                    }
                    h1 {
                        color: #333;
                    }
                    .info {
                        margin: 20px 0;
                        color: #666;
                    }
                </style>
            </head>
            <body>
                <h1>舒尔特方格练习</h1>
                <div class="info">难度：${size}×${size} | 按照1-${totalCells}的顺序快速找到数字</div>
                <div class="print-board">
                    ${numbers.map(num => `<div class="print-cell">${num}</div>`).join('')}
                </div>
                <div class="info" style="margin-top: 30px;">开始时间：______  完成时间：______  用时：______</div>
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    } else {
        window.print();
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
}

// 初始化全屏按钮状态
function initFullscreenButton() {
    // PWA模式下自动全屏，不需要全屏按钮
    if (window.matchMedia('(display-mode: standalone)').matches) {
        fullscreenBtn.style.display = 'none';
        return;
    }
    
    // 检查是否支持全屏API
    const isFullscreenSupported = !!(document.fullscreenEnabled || 
                                     document.webkitFullscreenEnabled || 
                                     document.mozFullScreenEnabled || 
                                     document.msFullscreenEnabled);
    
    if (!isFullscreenSupported) {
        // 不支持全屏API，隐藏按钮
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


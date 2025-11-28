// 游戏状态
let gameState = {
    isPlaying: false,
    difficulty: 4,
    startTime: null,
    timerInterval: null,
    differences: [],
    foundDifferences: [],
    hintsUsed: 0,
    bestTimes: {},
    phase: 'waiting'
};

// DOM元素
const gameArea = document.getElementById('gameArea');
const waitingPhase = document.getElementById('waitingPhase');
const playingPhase = document.getElementById('playingPhase');
const imageLeft = document.getElementById('imageLeft');
const imageRight = document.getElementById('imageRight');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const hintBtn = document.getElementById('hintBtn');
const fullscreenBtn = document.getElementById('fullscreenBtn');
const fullscreenIcon = document.getElementById('fullscreenIcon');
const fullscreenText = document.getElementById('fullscreenText');
const difficultySelect = document.getElementById('difficulty');
const difficultyButtons = document.getElementById('difficultyButtons');
const difficultyBtnElements = difficultyButtons ? difficultyButtons.querySelectorAll('.difficulty-btn') : [];
const timerDisplay = document.getElementById('timer');
const foundCountDisplay = document.getElementById('foundCount');
const totalCountDisplay = document.getElementById('totalCount');
const bestTimeDisplay = document.getElementById('bestTime');
const hintInfo = document.getElementById('hintInfo');
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
    initDifficultyButtons();
    
    startBtn.addEventListener('click', startGame);
    resetBtn.addEventListener('click', resetGame);
    hintBtn.addEventListener('click', showHint);
    fullscreenBtn.addEventListener('click', toggleFullscreen);
    closeModal.addEventListener('click', closeResultModal);
    clearHistoryBtn.addEventListener('click', clearHistory);
    difficultySelect.addEventListener('change', onDifficultyChange);
    
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
    gameState.difficulty = parseInt(difficultySelect.value);
    gameState.startTime = Date.now();
    gameState.foundDifferences = [];
    gameState.hintsUsed = 0;
    gameState.phase = 'playing';
    
    generateGame();
    startTimer();
    
    waitingPhase.style.display = 'none';
    playingPhase.style.display = 'block';
    
    startBtn.disabled = true;
    resetBtn.disabled = false;
    hintBtn.disabled = false;
    difficultySelect.disabled = true;
    hintInfo.textContent = '';
}

// 重置游戏
function resetGame() {
    stopTimer();
    gameState.isPlaying = false;
    gameState.startTime = null;
    gameState.foundDifferences = [];
    gameState.differences = [];
    gameState.hintsUsed = 0;
    gameState.phase = 'waiting';
    
    waitingPhase.style.display = 'block';
    playingPhase.style.display = 'none';
    timerDisplay.textContent = '00:00';
    foundCountDisplay.textContent = '0';
    totalCountDisplay.textContent = '-';
    hintInfo.textContent = '';
    
    startBtn.disabled = false;
    resetBtn.disabled = true;
    hintBtn.disabled = true;
    difficultySelect.disabled = false;
}

// 生成游戏
function generateGame() {
    const numDifferences = gameState.difficulty;
    gameState.differences = [];
    gameState.foundDifferences = [];
    
    // 清空图片
    imageLeft.innerHTML = '';
    imageRight.innerHTML = '';
    
    // 创建基础图形（使用SVG）
    const baseSVG = createBaseImage();
    imageLeft.innerHTML = '';
    imageLeft.appendChild(baseSVG);
    
    // 克隆左侧图片并应用差异
    const rightSVG = createBaseImageWithDifferences(numDifferences);
    imageRight.innerHTML = '';
    imageRight.appendChild(rightSVG);
    
    // 为可点击区域添加事件（在DOM插入后）
    setTimeout(() => {
        const clickAreas = imageRight.querySelectorAll('[data-diff-id]');
        clickAreas.forEach(area => {
            // 点击事件
            area.addEventListener('click', function(e) {
                e.stopPropagation();
                e.preventDefault();
                const diffId = parseInt(this.getAttribute('data-diff-id'));
                if (!isNaN(diffId)) {
                    handleDifferenceClick(diffId);
                }
            });
            // 触摸事件支持（移动设备）
            area.addEventListener('touchend', function(e) {
                e.preventDefault();
                e.stopPropagation();
                const diffId = parseInt(this.getAttribute('data-diff-id'));
                if (!isNaN(diffId)) {
                    handleDifferenceClick(diffId);
                }
            }, { passive: false });
        });
    }, 100);
    
    totalCountDisplay.textContent = numDifferences;
    foundCountDisplay.textContent = '0';
}

// 创建基础图片（SVG）
function createBaseImage() {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '400');
    svg.setAttribute('height', '300');
    svg.setAttribute('viewBox', '0 0 400 300');
    svg.style.width = '100%';
    svg.style.height = '100%';
    
    // 背景渐变
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
    gradient.setAttribute('id', 'bgGradient');
    gradient.setAttribute('x1', '0%');
    gradient.setAttribute('y1', '0%');
    gradient.setAttribute('x2', '100%');
    gradient.setAttribute('y2', '100%');
    const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop1.setAttribute('offset', '0%');
    stop1.setAttribute('stop-color', '#e3f2fd');
    const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop2.setAttribute('offset', '100%');
    stop2.setAttribute('stop-color', '#bbdefb');
    gradient.appendChild(stop1);
    gradient.appendChild(stop2);
    defs.appendChild(gradient);
    svg.appendChild(defs);
    
    // 背景
    const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    bg.setAttribute('width', '400');
    bg.setAttribute('height', '300');
    bg.setAttribute('fill', 'url(#bgGradient)');
    svg.appendChild(bg);
    
    // 添加更多复杂的基础图形
    const shapes = [
        { type: 'circle', cx: 100, cy: 80, r: 30, fill: '#ff6b6b', id: 'shape1' },
        { type: 'rect', x: 250, y: 50, width: 60, height: 60, fill: '#4ecdc4', id: 'shape2' },
        { type: 'circle', cx: 150, cy: 200, r: 25, fill: '#ffe66d', id: 'shape3' },
        { type: 'rect', x: 280, y: 180, width: 50, height: 50, fill: '#95e1d3', id: 'shape4' },
        { type: 'circle', cx: 80, cy: 150, r: 20, fill: '#ff8b94', id: 'shape5' },
        { type: 'rect', x: 200, y: 120, width: 40, height: 40, fill: '#a8e6cf', id: 'shape6' },
        { type: 'circle', cx: 320, cy: 100, r: 18, fill: '#ffa07a', id: 'shape7' },
        { type: 'rect', x: 50, y: 220, width: 35, height: 35, fill: '#98d8c8', id: 'shape8' },
        { type: 'circle', cx: 180, cy: 50, r: 15, fill: '#f7dc6f', id: 'shape9' },
        { type: 'rect', x: 300, y: 240, width: 45, height: 45, fill: '#d2b4de', id: 'shape10' }
    ];
    
    shapes.forEach(shape => {
        let element;
        if (shape.type === 'circle') {
            element = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            element.setAttribute('cx', shape.cx);
            element.setAttribute('cy', shape.cy);
            element.setAttribute('r', shape.r);
        } else {
            element = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            element.setAttribute('x', shape.x);
            element.setAttribute('y', shape.y);
            element.setAttribute('width', shape.width);
            element.setAttribute('height', shape.height);
        }
        element.setAttribute('fill', shape.fill);
        element.setAttribute('data-shape-id', shape.id);
        svg.appendChild(element);
    });
    
    return svg;
}

// 创建带差异的图片
function createBaseImageWithDifferences(numDifferences) {
    const svg = createBaseImage();
    const shapes = svg.querySelectorAll('[data-shape-id]');
    const availableShapes = Array.from(shapes);
    
    // 随机选择要修改的图形
    const selectedShapes = [];
    while (selectedShapes.length < numDifferences && availableShapes.length > 0) {
        const randomIndex = Math.floor(Math.random() * availableShapes.length);
        selectedShapes.push(availableShapes.splice(randomIndex, 1)[0]);
    }
    
    // 为每个选中的图形创建差异
    selectedShapes.forEach((shape, index) => {
        // 获取图形位置信息（用于提示）
        let x, y;
        if (shape.tagName === 'circle') {
            x = parseFloat(shape.getAttribute('cx'));
            y = parseFloat(shape.getAttribute('cy'));
        } else {
            x = parseFloat(shape.getAttribute('x')) + parseFloat(shape.getAttribute('width')) / 2;
            y = parseFloat(shape.getAttribute('y')) + parseFloat(shape.getAttribute('height')) / 2;
        }
        
        const diff = {
            id: index,
            shapeId: shape.getAttribute('data-shape-id'),
            type: shape.tagName.toLowerCase(),
            changeType: ['color', 'size', 'position', 'missing'][Math.floor(Math.random() * 4)],
            x: x,
            y: y
        };
        
        gameState.differences.push(diff);
        
        // 应用差异
        if (diff.changeType === 'color') {
            // 改变颜色
            const colors = ['#ff4757', '#2ed573', '#ffa502', '#5f27cd', '#00d2d3', '#ff6348'];
            const currentColor = shape.getAttribute('fill');
            let newColor = colors[Math.floor(Math.random() * colors.length)];
            while (newColor === currentColor) {
                newColor = colors[Math.floor(Math.random() * colors.length)];
            }
            shape.setAttribute('fill', newColor);
        } else if (diff.changeType === 'size') {
            // 改变大小
            if (diff.type === 'circle') {
                const r = parseFloat(shape.getAttribute('r'));
                shape.setAttribute('r', r * (Math.random() > 0.5 ? 1.3 : 0.7));
            } else {
                const w = parseFloat(shape.getAttribute('width'));
                const h = parseFloat(shape.getAttribute('height'));
                const factor = Math.random() > 0.5 ? 1.3 : 0.7;
                shape.setAttribute('width', w * factor);
                shape.setAttribute('height', h * factor);
            }
        } else if (diff.changeType === 'position') {
            // 改变位置
            if (diff.type === 'circle') {
                const cx = parseFloat(shape.getAttribute('cx'));
                const cy = parseFloat(shape.getAttribute('cy'));
                shape.setAttribute('cx', cx + (Math.random() > 0.5 ? 15 : -15));
                shape.setAttribute('cy', cy + (Math.random() > 0.5 ? 15 : -15));
            } else {
                const x = parseFloat(shape.getAttribute('x'));
                const y = parseFloat(shape.getAttribute('y'));
                shape.setAttribute('x', x + (Math.random() > 0.5 ? 15 : -15));
                shape.setAttribute('y', y + (Math.random() > 0.5 ? 15 : -15));
            }
        } else if (diff.changeType === 'missing') {
            // 移除图形（在右侧图片中）
            shape.style.opacity = '0';
        }
        
        // 添加可点击区域
        const clickArea = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        if (diff.type === 'circle') {
            const cx = parseFloat(shape.getAttribute('cx'));
            const cy = parseFloat(shape.getAttribute('cy'));
            const r = parseFloat(shape.getAttribute('r'));
            clickArea.setAttribute('cx', cx);
            clickArea.setAttribute('cy', cy);
            clickArea.setAttribute('r', r + 10);
        } else {
            const x = parseFloat(shape.getAttribute('x'));
            const y = parseFloat(shape.getAttribute('y'));
            const w = parseFloat(shape.getAttribute('width'));
            const h = parseFloat(shape.getAttribute('height'));
            clickArea.setAttribute('cx', x + w / 2);
            clickArea.setAttribute('cy', y + h / 2);
            clickArea.setAttribute('r', Math.max(w, h) / 2 + 10);
        }
        clickArea.setAttribute('fill', 'transparent');
        clickArea.setAttribute('stroke', 'transparent');
        clickArea.setAttribute('data-diff-id', index);
        clickArea.style.cursor = 'pointer';
        svg.appendChild(clickArea);
    });
    
    // 直接返回SVG对象，保持事件监听器
    return svg;
}

// 处理不同点点击
function handleDifferenceClick(diffId) {
    if (!gameState.isPlaying || gameState.foundDifferences.includes(diffId)) {
        return;
    }
    
    gameState.foundDifferences.push(diffId);
    foundCountDisplay.textContent = gameState.foundDifferences.length;
    
    // 标记为已找到 - 在右侧图片上添加标记
    const rightSvg = imageRight.querySelector('svg');
    if (rightSvg) {
        const clickArea = rightSvg.querySelector(`[data-diff-id="${diffId}"]`);
        if (clickArea && !clickArea.hasAttribute('data-found')) {
            // 添加高亮标记
            const marker = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            marker.setAttribute('cx', clickArea.getAttribute('cx'));
            marker.setAttribute('cy', clickArea.getAttribute('cy'));
            marker.setAttribute('r', clickArea.getAttribute('r'));
            marker.setAttribute('fill', 'rgba(40, 167, 69, 0.3)');
            marker.setAttribute('stroke', '#28a745');
            marker.setAttribute('stroke-width', '3');
            marker.setAttribute('data-found', 'true');
            rightSvg.appendChild(marker);
            clickArea.setAttribute('data-found', 'true');
        }
    }
    
    // 在左侧图片也标记
    const leftSvg = imageLeft.querySelector('svg');
    if (leftSvg) {
        const diff = gameState.differences.find(d => d.id === diffId);
        if (diff) {
            const shape = leftSvg.querySelector(`[data-shape-id="${diff.shapeId}"]`);
            if (shape && !shape.hasAttribute('data-found')) {
                let cx, cy, r;
                if (shape.tagName === 'circle') {
                    cx = parseFloat(shape.getAttribute('cx'));
                    cy = parseFloat(shape.getAttribute('cy'));
                    r = parseFloat(shape.getAttribute('r'));
                } else {
                    const x = parseFloat(shape.getAttribute('x'));
                    const y = parseFloat(shape.getAttribute('y'));
                    const w = parseFloat(shape.getAttribute('width'));
                    const h = parseFloat(shape.getAttribute('height'));
                    cx = x + w / 2;
                    cy = y + h / 2;
                    r = Math.max(w, h) / 2 + 10;
                }
                const marker = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                marker.setAttribute('cx', cx);
                marker.setAttribute('cy', cy);
                marker.setAttribute('r', r);
                marker.setAttribute('fill', 'rgba(40, 167, 69, 0.3)');
                marker.setAttribute('stroke', '#28a745');
                marker.setAttribute('stroke-width', '3');
                leftSvg.appendChild(marker);
                shape.setAttribute('data-found', 'true');
            }
        }
    }
    
    // 检查是否完成
    if (gameState.foundDifferences.length === gameState.differences.length) {
        finishGame();
    }
}

// 显示提示
function showHint() {
    if (!gameState.isPlaying) return;
    
    const unfound = gameState.differences.filter(d => !gameState.foundDifferences.includes(d.id));
    if (unfound.length === 0) return;
    
    gameState.hintsUsed++;
    const hint = unfound[Math.floor(Math.random() * unfound.length)];
    
    // 高亮提示 - 在SVG上添加高亮标记
    const rightSvg = imageRight.querySelector('svg');
    if (rightSvg) {
        const clickArea = rightSvg.querySelector(`[data-diff-id="${hint.id}"]`);
        if (clickArea) {
            // 添加高亮圆圈
            const highlight = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            highlight.setAttribute('cx', clickArea.getAttribute('cx'));
            highlight.setAttribute('cy', clickArea.getAttribute('cy'));
            highlight.setAttribute('r', clickArea.getAttribute('r'));
            highlight.setAttribute('fill', 'rgba(255, 193, 7, 0.5)');
            highlight.setAttribute('stroke', '#ffc107');
            highlight.setAttribute('stroke-width', '4');
            highlight.setAttribute('data-hint', 'true');
            highlight.style.animation = 'pulse 1s infinite';
            rightSvg.appendChild(highlight);
            
            // 2秒后移除高亮
            setTimeout(() => {
                if (highlight.parentNode) {
                    highlight.parentNode.removeChild(highlight);
                }
            }, 2000);
        }
    }
    
    // 显示提示信息
    if (hint.x !== undefined && hint.y !== undefined) {
        hintInfo.textContent = `💡 提示：注意图片B的 (${Math.round(hint.x)}, ${Math.round(hint.y)}) 附近区域`;
    } else {
        hintInfo.textContent = `💡 提示：仔细对比两张图片，找出不同之处`;
    }
    setTimeout(() => {
        hintInfo.textContent = '';
    }, 3000);
}

// 完成游戏
function finishGame() {
    stopTimer();
    gameState.isPlaying = false;
    
    const elapsedTime = Date.now() - gameState.startTime;
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
    saveHistory(difficulty, elapsedTime, gameState.hintsUsed);
    
    // 显示结果
    resultTitle.textContent = '🎉 完成！';
    resultTime.textContent = timeString;
    const hintText = gameState.hintsUsed > 0 ? `，使用了 ${gameState.hintsUsed} 次提示` : '';
    resultMessage.textContent = `找到了所有 ${difficulty} 处不同${hintText}`;
    resultModal.classList.add('show');
    
    startBtn.disabled = false;
    resetBtn.disabled = true;
    hintBtn.disabled = true;
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
    const bestTime = gameState.bestTimes[difficulty];
    
    if (bestTime && bestTime !== Infinity) {
        bestTimeDisplay.textContent = formatTime(bestTime);
    } else {
        bestTimeDisplay.textContent = '--';
    }
}

// 保存最佳成绩
function saveBestTimes() {
    localStorage.setItem('spotDifferenceBestTimes', JSON.stringify(gameState.bestTimes));
}

// 加载最佳成绩
function loadBestTimes() {
    const saved = localStorage.getItem('spotDifferenceBestTimes');
    if (saved) {
        gameState.bestTimes = JSON.parse(saved);
    }
}

// 保存历史记录
function saveHistory(difficulty, time, hintsUsed) {
    let history = JSON.parse(localStorage.getItem('spotDifferenceHistory') || '[]');
    history.unshift({
        difficulty: difficulty,
        time: time,
        hintsUsed: hintsUsed,
        date: new Date().toISOString()
    });
    
    if (history.length > 50) {
        history = history.slice(0, 50);
    }
    
    localStorage.setItem('spotDifferenceHistory', JSON.stringify(history));
    loadHistory();
}

// 加载历史记录
function loadHistory() {
    const history = JSON.parse(localStorage.getItem('spotDifferenceHistory') || '[]');
    
    if (history.length === 0) {
        historyList.innerHTML = '<p class="no-history">暂无游戏记录</p>';
        return;
    }
    
    historyList.innerHTML = history.map(item => {
        const date = new Date(item.date);
        const dateStr = date.toLocaleDateString('zh-CN') + ' ' + 
                       date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
        const hintText = item.hintsUsed > 0 ? ` (${item.hintsUsed}次提示)` : '';
        const itemId = item.date;
        return `
            <div class="history-item">
                <div>
                    <span class="difficulty">${item.difficulty}处不同</span>
                    <span class="time"> - ${formatTime(item.time)}</span>
                    <span class="hints">${hintText}</span>
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
    
    let history = JSON.parse(localStorage.getItem('spotDifferenceHistory') || '[]');
    history = history.filter(item => item.date !== itemDate);
    localStorage.setItem('spotDifferenceHistory', JSON.stringify(history));
    loadHistory();
}

// 清空历史记录
function clearHistory() {
    if (confirm('确定要清空所有游戏记录吗？')) {
        localStorage.removeItem('spotDifferenceHistory');
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


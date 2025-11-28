# 学习训练游戏集合

这是一个专为小学生设计的浏览器端学习训练游戏集合，聚焦注意力、记忆力与计算力等核心学习能力，可直接本地运行或通过 GitHub Pages 等静态托管平台发布。

## 📁 项目结构

```
study/
├── index.html                # 游戏聚合主页
├── README.md                 # 项目说明（本文件）
├── generate_all_icons.html   # 图标批量生成工具
│
├── schulte-grid/             # 舒尔特方格训练
├── number-memory/            # 数字记忆训练
├── spot-difference/          # 找不同训练
└── math-practice/            # 数字计算训练
```

> 每个子目录均包含 `index.html + style.css + script.js + manifest.json + service-worker.js`，可独立作为 PWA 运行。

## 🎮 游戏清单

### 舒尔特方格训练（`schulte-grid/`）
- 支持 3×3~7×7 多难度网格
- 计时、最佳成绩与历史记录持久化
- PWA + 离线 + 全屏模式，适配 PC / 平板 / 手机
- 详细玩法见 `schulte-grid/README.md`

### 数字记忆训练（`number-memory/`）
- 记忆 3~7 位数字序列，锻炼工作记忆与听觉注意力
- 键盘输入 + 触控数字键盘双操作模式
- 训练记录、最佳时间统计、全屏与 PWA 支持

### 找不同训练（`spot-difference/`）
- 可配置 3~7 处差异，支持提示、计时和成绩记录
- 双图同步标记反馈，强化视觉注意力与观察顺序
- 全屏、历史记录与离线访问

### 数字计算训练（`math-practice/`）
- 加减乘除多难度阶梯，含混合运算与计分系统
- 计时、正确率、连对奖励及训练历史
- 全屏模式、PWA 和离线缓存，提高练习灵活性

## 🚀 运行 & 部署

### 本地运行
```bash
# 方式1：直接双击任何游戏目录下的 index.html

# 方式2：使用本地静态服务器（推荐）
cd math-practice          # 进入任意游戏目录
python3 -m http.server 8000
# 浏览器访问 http://localhost:8000
```

### GitHub Pages 发布
1. 仓库设置为 Public。
2. 打开仓库 `Settings → Pages`，在 “Build and deployment / Source” 选择 `Deploy from a branch`。
3. 指定 `Branch = main`（或保存网页的分支），`Folder = /(root)`，保存后等待构建完成。
4. 几分钟后即可通过 `https://用户名.github.io/仓库名/` 访问聚合页，子游戏以子路径方式访问。

> 也可部署到 Netlify、Vercel、Cloudflare Pages 等任意静态托管服务，步骤与普通静态站点相同。

## 🧱 开发新游戏

```bash
cd study
mkdir my-new-game
cd my-new-game
# 复制现有目录结构或使用 generate_all_icons.html 生成图标后开始开发
```

建议沿用现有 PWA 结构与 UI 规范，确保统一的离线、全屏、历史记录等体验。

## 📚 文档

- `README.md`（本文件）—— 项目概览与部署说明
- `schulte-grid/README.md` —— 舒尔特方格玩法说明

## 🎯 训练目标

这些游戏旨在帮助小学生：
- 提升注意力集中度与视觉/听觉专注
- 培养数学思维与心算速度
- 增强工作记忆与观察力
- 降低粗心错误、提升学习效率

## 📄 许可证

本项目为开源项目，可自由使用、修改和部署。

---

**持续更新中，敬请期待更多训练游戏！** 🎮✨


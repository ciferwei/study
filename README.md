# 学习训练游戏集合

这是一个专为小学生设计的学习训练游戏集合，帮助提升各种学习能力。

## 📁 项目结构

```
study/
├── index.html              # 游戏列表入口页面
├── docker-compose.yml      # Docker统一部署配置
├── Dockerfile              # Docker镜像构建
├── nginx.conf              # Nginx配置文件
├── README.md               # 项目说明（本文件）
├── 部署到极空间NAS.md       # 完整部署指南
│
├── schulte-grid/           # 舒尔特方格训练游戏
│   ├── index.html          # 主应用文件
│   ├── style.css           # 样式文件
│   ├── script.js           # 核心功能
│   ├── manifest.json       # PWA配置
│   ├── service-worker.js   # 离线支持
│   ├── icon-*.png          # 应用图标
│   ├── generate_icons.html # 图标生成工具
│   ├── README.md           # 游戏说明
│   └── ...                 # 其他文档
│
└── [其他游戏]/             # 后续开发的训练游戏
    └── ...
```

## 🎮 已包含的游戏

### 1. 舒尔特方格训练 (`schulte-grid/`)

**功能：**
- 🎯 多种难度选择（3×3 到 7×7）
- ⏱️ 精确计时和成绩记录
- 🏆 最佳成绩和历史记录
- 📱 支持PWA，可安装到iPad
- 🔌 离线使用
- 📱 全屏模式，兼容PC、手机、iPad

**快速开始：**
```bash
cd schulte-grid
# 直接用浏览器打开 index.html
# 或使用本地服务器
python3 -m http.server 8000
```

详细说明请查看 [schulte-grid/README.md](schulte-grid/README.md)

## 🚀 快速开始

### 运行单个游戏

每个游戏都是独立的，可以直接运行：

```bash
# 进入游戏目录
cd schulte-grid

# 方法1：直接打开
# 在浏览器中打开 index.html

# 方法2：使用本地服务器（推荐）
python3 -m http.server 8000
# 然后访问 http://localhost:8000
```

### 部署到极空间NAS

#### 方法一：超简单部署（推荐新手）

**直接上传文件，通过极空间文件服务访问：**

1. **上传整个study文件夹到NAS的web目录**
2. **通过极空间客户端或Web界面打开 `index.html`**
3. **完成！**

详细步骤请查看 [极空间简单部署.md](极空间简单部署.md)

#### 方法二：Docker部署（支持完整PWA功能）

**一键部署整个项目，支持HTTPS和PWA：**

1. **上传整个study文件夹到NAS**
2. **使用Docker Compose部署**：
   ```bash
   cd study
   docker-compose up -d
   ```
3. **访问游戏列表**：`http://NAS-IP:8080/`

详细部署步骤请查看 [部署到极空间NAS.md](部署到极空间NAS.md)

#### 方法三：虚拟机部署（最专业，推荐）

**在极空间虚拟机中运行Web服务器，提供最佳性能和完整功能：**

1. **创建虚拟机**（Ubuntu/Debian推荐）
2. **安装Nginx或Apache**
3. **上传文件并配置**
4. **配置HTTPS和域名**

详细部署步骤请查看 [极空间虚拟机部署.md](极空间虚拟机部署.md)

### 独立部署单个游戏

每个游戏也可以独立部署，查看各游戏目录下的部署文档。

## 📝 开发新游戏

在 `study` 目录下创建新的游戏文件夹：

```bash
mkdir my-new-game
cd my-new-game
# 开始开发...
```

## 📚 文档

每个游戏都有独立的文档：
- `schulte-grid/README.md` - 游戏说明
- `schulte-grid/README_IPAD.md` - iPad安装指南
- `schulte-grid/安装到iPad.md` - 中文安装指南

## 🎯 训练目标

这些游戏旨在帮助小学生：
- 提升注意力集中度
- 培养数学思维
- 减少粗心错误
- 提高学习效率

## 📄 许可证

本项目为开源项目，可自由使用和修改。

---

**持续更新中，敬请期待更多训练游戏！** 🎮✨


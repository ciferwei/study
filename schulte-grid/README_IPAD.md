# iPad版本使用说明

## 🚀 快速开始

### 1. 生成图标（首次使用）

应用需要图标文件才能正确显示在iPad主屏幕上。

#### 方法一：使用HTML工具（最简单，无需安装）⭐推荐

1. 在浏览器中打开 `generate_icons.html`
2. 上传一张图片或点击"创建默认图标"
3. 点击"生成所有图标"
4. 右键点击每个图标，选择"图片另存为"保存

#### 方法二：使用Python脚本

```bash
# 安装Pillow库
sudo apt install python3-pip
pip3 install Pillow

# 运行脚本
python3 generate_icons.py
```

#### 方法三：使用ImageMagick

```bash
# 安装ImageMagick
sudo apt install imagemagick

# 运行脚本
./generate_icons.sh
```

#### 方法四：在线工具

访问 https://www.pwabuilder.com/imageGenerator 上传图片生成

**详细说明请查看 [INSTALL_GUIDE.md](INSTALL_GUIDE.md)**

### 2. 安装到iPad

#### 方法一：通过Safari（推荐）

1. 将应用文件夹传输到iPad（通过iCloud、AirDrop、USB等）
2. 在iPad上打开Safari浏览器
3. 通过文件应用打开 `index.html`，或访问部署的网址
4. 点击Safari底部的"分享"按钮（方框带向上箭头）
5. 选择"添加到主屏幕"
6. 自定义名称（可选），点击"添加"

#### 方法二：通过文件应用

1. 在文件应用中打开应用文件夹
2. 长按 `index.html`
3. 选择"共享" → "在Safari中打开"
4. 然后按照方法一的步骤4-6操作

### 3. 开始使用

- 在主屏幕找到"舒尔特方格"图标
- 点击图标启动应用
- 应用会以全屏模式运行，体验类似原生应用

## ✨ PWA功能特点

- ✅ **离线使用**：首次访问后可以完全离线使用
- ✅ **全屏体验**：无浏览器地址栏和工具栏
- ✅ **快速启动**：从主屏幕直接启动
- ✅ **自动缓存**：自动缓存资源，加载更快
- ✅ **数据持久化**：训练记录保存在本地

## 📋 文件清单

确保以下文件都在同一目录：

```
study/
├── index.html              # 主页面（已更新PWA支持）
├── style.css               # 样式文件（已优化iPad）
├── script.js               # 核心功能（已添加Service Worker）
├── manifest.json           # PWA配置文件
├── service-worker.js       # Service Worker（离线支持）
├── icon-*.png              # 图标文件（需要生成）
├── generate_icons.py       # 图标生成脚本
├── README.md               # 通用说明
├── README_IPAD.md          # iPad安装说明（本文件）
└── IPAD_INSTALL.md         # 详细安装指南
```

## 🎯 优化特性

### iPad特定优化

- **触摸优化**：更大的触摸目标，适合手指操作
- **屏幕适配**：自动适配iPad屏幕尺寸
- **横竖屏支持**：自动调整布局
- **安全区域**：适配带刘海的iPad Pro

### 性能优化

- **离线缓存**：首次访问后完全离线可用
- **快速响应**：优化的触摸反馈
- **流畅动画**：60fps动画效果

## 🔧 部署选项

### 本地使用
- 直接打开 `index.html`（功能受限，Service Worker可能不工作）
- 使用本地服务器（推荐）

### 服务器部署
- GitHub Pages（免费）
- Netlify（免费）
- Vercel（免费）
- 自己的Web服务器

## ⚠️ 注意事项

1. **HTTPS要求**：PWA需要HTTPS才能完全工作（localhost除外）
2. **Safari浏览器**：iOS只支持Safari添加PWA到主屏幕
3. **iOS版本**：需要iOS 11.3或更高版本
4. **首次访问**：首次访问需要联网，之后可离线使用

## 🐛 故障排除

### 图标不显示
- 检查所有 `icon-*.png` 文件是否存在
- 确保图标文件在正确位置
- 清除Safari缓存后重试

### 无法离线使用
- 检查Service Worker是否注册成功（打开Safari开发者工具）
- 确保首次访问时联网
- 检查 `service-worker.js` 文件是否存在

### 无法添加到主屏幕
- 确保使用Safari浏览器
- 检查iOS版本是否支持
- 尝试清除Safari缓存

## 📱 使用建议

1. **首次使用**：确保联网，让Service Worker完成注册
2. **定期更新**：删除并重新添加以获取更新
3. **数据备份**：训练记录保存在本地，注意备份
4. **最佳体验**：使用全屏模式，减少干扰

## 📞 技术支持

如有问题，请检查：
- 浏览器控制台错误信息
- Service Worker注册状态
- manifest.json配置
- 文件完整性

---

**享受训练，提升专注力！** 🎯


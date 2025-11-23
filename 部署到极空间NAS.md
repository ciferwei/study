# 部署到极空间NAS完整指南

本指南说明如何将整个study文件夹（包含所有训练游戏）部署到极空间NAS。

## 📋 部署前准备

### 1. 确认文件结构

确保您的study文件夹结构如下：

```
study/
├── index.html              # 游戏列表入口页面
├── nginx.conf              # Nginx配置文件
├── docker-compose.yml      # Docker Compose配置
├── Dockerfile              # Docker镜像构建文件
├── README.md               # 项目说明
├── schulte-grid/           # 舒尔特方格游戏
│   ├── index.html
│   ├── style.css
│   ├── script.js
│   └── ...
└── [其他游戏]/            # 后续添加的游戏
```

### 2. 确认极空间NAS功能

- ✅ 已开启Docker功能
- ✅ 已安装Docker应用
- ✅ 可以访问极空间管理界面

---

## 🚀 部署方法

### 方法一：使用Docker Compose（推荐）

#### 步骤1：上传文件到NAS

1. **通过极空间客户端上传**
   - 打开极空间客户端
   - 将整个 `study` 文件夹上传到NAS的共享文件夹
   - 建议上传到 `/docker` 或 `/apps` 目录

2. **通过SMB/FTP上传**
   - 在文件资源管理器中访问：`\\极空间IP地址`
   - 将 `study` 文件夹复制到NAS

#### 步骤2：在极空间Docker中部署

1. **打开极空间管理界面**
   - 登录极空间Web界面或客户端
   - 进入"应用中心" → "Docker"

2. **创建容器**
   - 点击"创建容器"或"新建"
   - 选择"使用docker-compose.yml"

3. **配置容器**
   - 容器名称：`study-games`
   - 工作目录：选择 `study` 文件夹所在路径
   - 使用 `docker-compose.yml` 文件

4. **启动容器**
   - 点击"启动"或"运行"
   - 等待容器启动完成

#### 步骤3：访问应用

- **内网访问**：`http://极空间IP地址:8080`
- **游戏列表**：`http://极空间IP地址:8080/`
- **舒尔特方格**：`http://极空间IP地址:8080/schulte-grid/`

---

### 方法二：使用Dockerfile构建（手动部署）

#### 步骤1：构建镜像

```bash
# 通过SSH连接到NAS（如果支持）
cd /你的共享目录/study
docker build -t study-games:latest .
```

#### 步骤2：运行容器

```bash
docker run -d \
  --name study-games \
  -p 8080:80 \
  -v /你的共享目录/study:/usr/share/nginx/html:ro \
  --restart unless-stopped \
  study-games:latest
```

---

## ⚙️ 配置说明

### 端口配置

在 `docker-compose.yml` 中：

```yaml
ports:
  - "8080:80"   # 左边是NAS端口，右边是容器端口
```

可以根据需要修改左边端口号（如 `8081:80`），避免与其他服务冲突。

### 游戏路径

- **游戏列表**：`http://NAS-IP:8080/`
- **舒尔特方格**：`http://NAS-IP:8080/schulte-grid/`
- **新游戏**：`http://NAS-IP:8080/新游戏目录名/`

### Nginx配置

`nginx.conf` 已配置为：
- 自动支持所有游戏目录
- 每个游戏独立路径
- Service Worker支持
- 静态资源缓存优化

---

## 🔒 配置HTTPS（重要）

### 为什么需要HTTPS？

- ✅ PWA的Service Worker需要HTTPS
- ✅ 添加到主屏幕功能需要HTTPS
- ✅ 离线功能需要HTTPS

### 配置方法

#### 方法1：使用极空间内置SSL

1. 在极空间管理界面找到"SSL"或"安全"设置
2. 启用HTTPS
3. 配置证书（Let's Encrypt或自签名）

#### 方法2：在Nginx中配置SSL

1. **准备SSL证书**
   - 如果有域名，使用Let's Encrypt获取证书
   - 或使用自签名证书

2. **修改nginx.conf**
   - 取消HTTPS server块的注释
   - 配置证书路径
   - 更新 `docker-compose.yml` 中的证书卷映射

3. **重新构建容器**
   ```bash
   docker-compose down
   docker-compose up -d
   ```

#### 方法3：使用Cloudflare Tunnel（推荐，免费）

1. **在极空间安装Cloudflare Tunnel**
   - 在Docker中运行cloudflared容器

2. **配置隧道**
   - 指向本地服务：`http://localhost:8080`
   - 获得HTTPS访问地址

3. **访问应用**
   - 通过Cloudflare提供的HTTPS地址访问

---

## 📱 在iPad上安装

### 步骤1：访问应用

1. 在iPad Safari中打开：
   - 游戏列表：`https://极空间IP地址:8443/`
   - 或直接访问游戏：`https://极空间IP地址:8443/schulte-grid/`

2. **确认HTTPS有效**
   - 地址栏显示🔒锁图标
   - 如果显示"不安全"，Service Worker无法工作

### 步骤2：添加到主屏幕

1. 点击Safari底部的"分享"按钮
2. 选择"添加到主屏幕"
3. 完成安装

---

## ➕ 添加新游戏

### 步骤1：创建游戏目录

```bash
cd study
mkdir my-new-game
# 在新目录中开发游戏
```

### 步骤2：更新游戏列表

编辑 `study/index.html`，在 `games` 数组中添加新游戏：

```javascript
const games = [
    {
        id: 'schulte-grid',
        name: '舒尔特方格训练',
        icon: '🎯',
        description: '提升注意力集中度',
        features: ['多种难度', '成绩记录'],
        path: '/schulte-grid/'
    },
    {
        id: 'my-new-game',
        name: '我的新游戏',
        icon: '🎮',
        description: '游戏描述',
        features: ['功能1', '功能2'],
        path: '/my-new-game/'
    }
];
```

### 步骤3：重启容器

```bash
# 在极空间Docker中重启容器
# 或使用docker-compose
docker-compose restart
```

新游戏会自动出现在游戏列表中！

---

## 🔧 常见问题

### Q1: 容器无法启动？

**检查：**
- 端口是否被占用（修改docker-compose.yml中的端口）
- 文件路径是否正确
- 查看容器日志：`docker logs study-games`

### Q2: 无法访问游戏？

**检查：**
- 容器是否运行：`docker ps`
- 端口是否正确映射
- 防火墙是否开放端口
- 访问路径是否正确：`/游戏目录名/`

### Q3: Service Worker无法注册？

**解决：**
- 必须使用HTTPS
- 检查nginx.conf中的service-worker.js配置
- 查看浏览器控制台错误

### Q4: 如何更新游戏？

**方法：**
1. 更新游戏文件
2. 重启容器：`docker-compose restart`
3. 清除浏览器缓存

---

## 📊 访问方式

### 内网访问

- 游戏列表：`http://极空间IP:8080/`
- 舒尔特方格：`http://极空间IP:8080/schulte-grid/`

### 外网访问

1. **配置DDNS**（如果有公网IP）
2. **使用Cloudflare Tunnel**（推荐，免费）
3. **使用极空间远程访问功能**

---

## 🎯 快速部署检查清单

部署前确认：

- [ ] 所有文件已上传到NAS
- [ ] docker-compose.yml配置正确
- [ ] nginx.conf配置正确
- [ ] 容器已启动（`docker ps` 可以看到）
- [ ] 可以通过浏览器访问游戏列表
- [ ] HTTPS已配置（PWA必需）
- [ ] 在iPad上可以正常使用

---

## 💡 提示

1. **首次部署**：确保使用HTTPS，让PWA功能正常工作
2. **添加新游戏**：只需创建目录和更新index.html，无需修改nginx配置
3. **备份数据**：定期备份study文件夹
4. **性能优化**：Nginx已配置gzip压缩和静态资源缓存

---

**部署完成后，就可以在iPad上安装使用了！** 🎯

如有问题，请检查容器日志或联系技术支持。


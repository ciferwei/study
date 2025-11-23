# 极空间NAS Docker部署详细步骤

## 📋 前置条件

- ✅ 极空间NAS已开启Docker功能
- ✅ 已安装Docker应用（在极空间应用中心安装）
- ✅ 所有文件已准备好

---

## 🚀 方法一：使用Docker Compose（推荐）

### 步骤1：准备文件

确保以下文件在NAS上：

```
/你的共享目录/
├── study/              # 应用文件夹
│   ├── index.html
│   ├── style.css
│   ├── script.js
│   ├── manifest.json
│   ├── service-worker.js
│   └── icon-*.png
├── docker-compose.yml   # Docker Compose配置
└── nginx.conf          # Nginx配置（可选）
```

### 步骤2：在极空间Docker中部署

1. **打开极空间管理界面**
   - 登录极空间客户端或Web界面

2. **进入Docker应用**
   - 找到"Docker"应用
   - 点击进入

3. **创建新容器**
   - 点击"创建容器"或"新建"
   - 选择"使用docker-compose.yml"

4. **上传配置文件**
   - 将 `docker-compose.yml` 上传到NAS
   - 将 `nginx.conf` 上传到同一目录（可选）

5. **配置容器**
   - 容器名称：`schulte-grid`
   - 端口映射：`8080:80`（可以根据需要修改）
   - 卷映射：将 `study` 文件夹映射到容器

6. **启动容器**
   - 点击"启动"或"运行"
   - 等待容器启动完成

### 步骤3：访问应用

- 内网访问：`http://极空间IP地址:8080/study/index.html`
- 如果配置了HTTPS：`https://极空间IP地址:8443/study/index.html`

---

## 🐳 方法二：使用Dockerfile构建镜像

### 步骤1：准备文件结构

```
/你的共享目录/
├── study/              # 应用文件夹
├── Dockerfile          # Docker构建文件
└── nginx.conf         # Nginx配置
```

### 步骤2：构建镜像

1. **通过SSH连接NAS**（如果支持）
   ```bash
   ssh 用户名@极空间IP地址
   ```

2. **进入项目目录**
   ```bash
   cd /你的共享目录/
   ```

3. **构建Docker镜像**
   ```bash
   docker build -t schulte-grid:latest .
   ```

### 步骤3：运行容器

```bash
docker run -d \
  --name schulte-grid \
  -p 8080:80 \
  -v /你的共享目录/study:/usr/share/nginx/html/study:ro \
  --restart unless-stopped \
  schulte-grid:latest
```

### 步骤4：验证

```bash
# 查看容器状态
docker ps

# 查看容器日志
docker logs schulte-grid
```

---

## 🔒 配置HTTPS（重要）

### 方法1：使用极空间内置SSL

1. 在极空间管理界面找到"SSL"或"安全"设置
2. 启用HTTPS
3. 配置证书（Let's Encrypt或自签名）

### 方法2：在Nginx中配置SSL

1. **准备SSL证书**
   - 如果有域名，使用Let's Encrypt获取证书
   - 或使用自签名证书

2. **修改nginx.conf**
   - 取消HTTPS server块的注释
   - 配置证书路径

3. **重新构建容器**
   ```bash
   docker-compose down
   docker-compose up -d
   ```

### 方法3：使用Cloudflare Tunnel（推荐，免费）

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
   - `https://极空间IP地址:8443/study/index.html`
   - 或 `https://您的域名/study/index.html`

2. **确认HTTPS有效**
   - 地址栏显示🔒锁图标
   - 如果显示"不安全"，Service Worker无法工作

### 步骤2：添加到主屏幕

1. 点击Safari底部的"分享"按钮
2. 选择"添加到主屏幕"
3. 完成安装

---

## 🔧 常见问题

### Q1: 容器无法启动？

**检查：**
- 端口是否被占用（修改docker-compose.yml中的端口）
- 文件路径是否正确
- 查看容器日志：`docker logs schulte-grid`

### Q2: 无法访问应用？

**检查：**
- 容器是否运行：`docker ps`
- 端口是否正确映射
- 防火墙是否开放端口
- 访问路径是否正确：`/study/index.html`

### Q3: Service Worker无法注册？

**解决：**
- 必须使用HTTPS
- 检查nginx.conf中的service-worker.js配置
- 查看浏览器控制台错误

### Q4: 如何更新应用？

**方法：**
1. 更新 `study` 文件夹中的文件
2. 重启容器：`docker-compose restart`
3. 或重新构建：`docker-compose up -d --build`

---

## 📊 端口配置说明

在 `docker-compose.yml` 中：

```yaml
ports:
  - "8080:80"   # 左边是NAS端口，右边是容器端口
  - "8443:443"  # HTTPS端口
```

可以根据需要修改左边端口号，避免冲突。

---

## 💡 优化建议

1. **使用卷映射**
   - 方便更新文件，无需重建容器
   - 使用 `:ro` 只读模式保护文件

2. **配置自动重启**
   - `restart: unless-stopped` 确保容器自动重启

3. **使用Nginx缓存**
   - 提高访问速度
   - 减少服务器负载

4. **定期备份**
   - 备份 `study` 文件夹
   - 备份docker-compose.yml配置

---

## 🎯 快速部署检查清单

- [ ] Docker应用已安装并运行
- [ ] 所有文件已上传到NAS
- [ ] docker-compose.yml配置正确
- [ ] 容器已启动（`docker ps` 可以看到）
- [ ] 可以通过浏览器访问应用
- [ ] HTTPS已配置（PWA必需）
- [ ] 在iPad上可以正常使用

---

**部署完成后，就可以在iPad上安装使用了！** 🎯


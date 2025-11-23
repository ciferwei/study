# 极空间Docker命令行部署（最可靠方法）

如果极空间Docker界面找不到创建选项，使用SSH命令行方式，100%可靠！

## 🔧 前提条件

1. **启用SSH功能**
   - 登录极空间管理界面
   - 找到"系统设置" → "SSH"或"终端"
   - 启用SSH服务
   - 记录SSH端口（通常是22）

2. **准备SSH客户端**
   - Windows：PuTTY、Windows Terminal、或WSL
   - Mac：终端（Terminal）
   - 手机：JuiceSSH、Termius等

---

## 🚀 部署步骤

### 步骤1：SSH连接到极空间

```bash
ssh 用户名@极空间IP地址
# 例如：ssh admin@192.168.1.100
# 或：ssh root@192.168.1.100
```

**如果不知道用户名：**
- 通常是 `admin`、`root` 或您在极空间设置的用户名
- 密码是您的极空间登录密码

### 步骤2：找到study文件夹位置

```bash
# 查找study文件夹
find / -name "study" -type d 2>/dev/null

# 或查看常用目录
ls /docker/
ls /volume1/
ls /mnt/
```

**常见位置：**
- `/docker/study`
- `/volume1/web/study`
- `/mnt/nas/study`
- `/home/用户名/study`

### 步骤3：进入study目录

```bash
cd /docker/study
# 或您的实际路径
```

### 步骤4：检查docker-compose.yml

```bash
# 查看文件
cat docker-compose.yml
```

**确认volumes路径是否正确：**
```yaml
volumes:
  - /docker/study:/usr/share/nginx/html:ro
```

如果路径不对，修改它：
```bash
nano docker-compose.yml
# 或
vi docker-compose.yml
```

### 步骤5：启动容器

#### 方法A：使用docker-compose（推荐）

```bash
# 启动容器
docker-compose up -d

# 查看状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

#### 方法B：使用docker run（如果docker-compose不可用）

```bash
docker run -d \
  --name study-games \
  -p 8080:80 \
  -v /docker/study:/usr/share/nginx/html:ro \
  --restart unless-stopped \
  nginx:alpine
```

**请修改 `/docker/study` 为您的实际路径！**

### 步骤6：验证部署

```bash
# 查看容器是否运行
docker ps

# 查看容器日志
docker logs study-games

# 测试访问（如果NAS有curl）
curl http://localhost:8080
```

---

## 📝 完整命令示例

假设study文件夹在 `/volume1/web/study`：

```bash
# 1. SSH连接
ssh admin@192.168.1.100

# 2. 进入目录
cd /volume1/web/study

# 3. 修改docker-compose.yml（如果需要）
nano docker-compose.yml
# 修改为：- /volume1/web/study:/usr/share/nginx/html:ro

# 4. 启动容器
docker-compose up -d

# 5. 检查状态
docker ps | grep study-games
```

---

## 🔍 常见问题

### Q1: 找不到docker-compose命令？

**解决：**
```bash
# 检查是否安装
which docker-compose

# 如果没有，使用docker compose（新版本）
docker compose up -d
```

### Q2: 权限不足？

**解决：**
```bash
# 使用sudo
sudo docker-compose up -d

# 或添加用户到docker组
sudo usermod -aG docker $USER
# 然后重新登录
```

### Q3: 端口被占用？

**解决：**
```bash
# 查看端口占用
netstat -tulpn | grep 8080

# 或修改docker-compose.yml中的端口
# 改为：- "8081:80"
```

### Q4: 容器无法启动？

**检查：**
```bash
# 查看日志
docker logs study-games

# 检查路径是否正确
ls -la /docker/study

# 检查文件权限
ls -la /docker/study/index.html
```

---

## 🛠️ 管理命令

### 查看容器状态
```bash
docker ps -a | grep study-games
```

### 启动/停止容器
```bash
docker start study-games
docker stop study-games
docker restart study-games
```

### 删除容器
```bash
docker stop study-games
docker rm study-games
```

### 更新容器（修改配置后）
```bash
docker-compose down
docker-compose up -d
```

### 查看日志
```bash
docker logs study-games
docker logs -f study-games  # 实时查看
```

---

## 📱 访问应用

部署成功后：

- **游戏列表**：`http://极空间IP:8080/`
- **舒尔特方格**：`http://极空间IP:8080/schulte-grid/`

在iPad上：
1. Safari打开上述地址
2. 点击"分享" → "添加到主屏幕"

---

## 💡 提示

1. **首次运行**：会下载nginx:alpine镜像（约40MB），需要一些时间
2. **文件更新**：由于是只读挂载，更新NAS上的文件后立即生效
3. **自动重启**：设置了`unless-stopped`，NAS重启后容器自动启动
4. **查看帮助**：`docker --help` 或 `docker-compose --help`

---

## 🎯 快速检查清单

- [ ] SSH已启用并可以连接
- [ ] 找到了study文件夹位置
- [ ] docker-compose.yml路径已修改正确
- [ ] 容器已启动（`docker ps`可以看到）
- [ ] 可以通过浏览器访问
- [ ] 日志无错误（`docker logs study-games`）

---

**命令行方式最可靠，适用于所有极空间NAS！** 🚀


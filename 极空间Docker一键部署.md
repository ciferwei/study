# 极空间Docker一键部署（使用现成镜像）

使用官方Nginx镜像，直接挂载NAS目录，无需构建，开箱即用！

## 🎯 为什么选择这个方案？

- ✅ **无需构建镜像**：使用官方 `nginx:alpine` 镜像
- ✅ **直接挂载目录**：NAS上的文件直接映射到容器
- ✅ **配置简单**：只需修改路径和端口
- ✅ **开箱即用**：下载镜像后立即运行
- ✅ **易于更新**：更新文件后容器自动生效（只读挂载）

---

## ⚠️ 找不到创建容器选项？

如果极空间Docker界面找不到创建容器的选项，请使用：

**👉 [极空间Docker命令行部署.md](极空间Docker命令行部署.md) - SSH命令行方式，100%可靠！**

---

## 🚀 超简单部署步骤

### 步骤1：上传文件到NAS

1. **将整个study文件夹上传到NAS**
   - 建议放在：`/docker/study` 或 `/volume1/web/study`
   - 记住完整路径，后面要用

2. **确认文件结构**
   ```
   /docker/study/
   ├── index.html
   ├── schulte-grid/
   └── ...
   ```

### 步骤2：在极空间Docker中部署

#### 方法A：通过极空间Docker界面（如果支持）

极空间Docker界面可能不同，常见操作方式：

**方式1：通过"镜像"创建容器**
1. 打开极空间Docker应用
2. 进入"镜像"标签
3. 搜索并拉取 `nginx:alpine` 镜像
4. 点击"创建容器"或"运行"
5. 配置容器：
   - 容器名：`study-games`
   - 端口映射：`8080:80`
   - 卷挂载：`/docker/study:/usr/share/nginx/html:ro`
   - 重启策略：`unless-stopped`

**方式2：通过"容器"创建**
1. 打开极空间Docker应用
2. 进入"容器"标签
3. 点击"新建"或"创建"按钮
4. 选择镜像：`nginx:alpine`
5. 配置参数（同上）

**方式3：使用docker-compose（如果支持）**
1. 在极空间文件管理中上传 `docker-compose.yml`
2. 通过SSH登录NAS（如果支持）
3. 进入study目录执行：`docker-compose up -d`

#### 方法B：通过SSH命令行（推荐，最可靠）

如果极空间支持SSH访问：

1. **启用SSH功能**
   - 在极空间管理界面找到"SSH"或"终端"设置
   - 启用SSH服务
   - 记录SSH端口（通常是22）

2. **SSH连接到NAS**
   ```bash
   ssh 用户名@极空间IP地址
   # 例如：ssh admin@192.168.1.100
   ```

3. **进入study目录**
   ```bash
   cd /docker/study
   # 或您的实际路径
   ```

4. **修改docker-compose.yml路径**
   ```bash
   # 编辑文件
   nano docker-compose.yml
   # 或
   vi docker-compose.yml
   ```
   
   修改volumes路径为实际路径

5. **启动容器**
   ```bash
   docker-compose up -d
   ```

6. **检查状态**
   ```bash
   docker ps
   docker logs study-games
   ```

#### 方法C：使用docker run命令（最简单）

如果docker-compose不可用，直接用docker run：

```bash
docker run -d \
  --name study-games \
  -p 8080:80 \
  -v /docker/study:/usr/share/nginx/html:ro \
  --restart unless-stopped \
  nginx:alpine
```

**参数说明：**
- `-d`：后台运行
- `--name study-games`：容器名称
- `-p 8080:80`：端口映射（NAS端口:容器端口）
- `-v /docker/study:/usr/share/nginx/html:ro`：挂载目录（请修改为实际路径）
- `--restart unless-stopped`：自动重启
- `nginx:alpine`：使用的镜像

#### 方法D：使用极空间应用中心（如果有）

1. 查看极空间"应用中心"
2. 搜索"Docker"或"容器"
3. 安装Docker管理应用
4. 通过应用界面创建容器

#### 方法B：使用docker-compose.simple.yml（最简单）

如果不需要自定义nginx配置，使用这个更简单的版本：

1. **上传 `docker-compose.simple.yml` 到NAS**

2. **修改文件中的路径**
   ```yaml
   volumes:
     - /docker/study:/usr/share/nginx/html:ro
   ```

3. **在Docker中创建容器并启动**

---

## 📝 配置说明

### 端口配置

```yaml
ports:
  - "8080:80"   # 左边是NAS端口，右边是容器端口
```

可以根据需要修改左边端口（如 `8081:80`），避免冲突。

### 路径配置

**重要**：必须修改为您的实际路径！

```yaml
volumes:
  - /您的实际路径/study:/usr/share/nginx/html:ro
```

**如何找到NAS路径？**
- 在极空间文件管理中查看文件夹属性
- 或通过SSH登录查看
- 通常格式：`/volume1/共享文件夹名/study`

### 只读挂载（:ro）

使用 `:ro` 表示只读挂载：
- ✅ 保护NAS文件不被容器修改
- ✅ 更新文件后容器自动生效
- ✅ 更安全

---

## 🔍 验证部署

### 检查容器状态

在极空间Docker中：
- 查看容器是否运行
- 查看日志确认无错误

### 访问测试

1. **游戏列表**：`http://极空间IP:8080/`
2. **舒尔特方格**：`http://极空间IP:8080/schulte-grid/`

### 常见问题

**Q: 无法访问？**
- 检查端口是否正确
- 检查防火墙是否开放端口
- 检查容器是否运行

**Q: 404错误？**
- 检查路径是否正确
- 确认study文件夹中有index.html
- 查看容器日志

**Q: 如何查看容器日志？**
- 在极空间Docker中点击容器
- 查看"日志"标签

---

## 🔒 配置HTTPS（可选）

如果需要HTTPS支持（PWA必需）：

### 方法1：使用极空间内置SSL

1. 在极空间管理界面配置SSL
2. 设置反向代理到容器端口

### 方法2：在容器中配置SSL

需要挂载SSL证书，修改docker-compose.yml：

```yaml
volumes:
  - /docker/study:/usr/share/nginx/html:ro
  - /docker/ssl:/etc/nginx/ssl:ro  # SSL证书目录
  - ./nginx-ssl.conf:/etc/nginx/nginx.conf:ro
ports:
  - "8443:443"  # HTTPS端口
```

---

## 📱 在iPad上使用

### 步骤1：访问应用

1. 在iPad Safari中打开：`http://极空间IP:8080/`
2. 或配置HTTPS后：`https://极空间IP:8443/`

### 步骤2：添加到主屏幕

1. 点击Safari底部的"分享"按钮
2. 选择"添加到主屏幕"
3. 完成安装

**注意**：PWA功能需要HTTPS，如果只是HTTP，基本功能可用但无法离线。

---

## 🔄 更新应用

### 更新文件

1. **直接更新NAS上的文件**
   - 在NAS文件管理中修改文件
   - 或通过SMB/FTP上传新文件

2. **容器自动生效**
   - 由于是只读挂载，文件更新后立即生效
   - 无需重启容器

### 更新容器配置

如果需要修改端口或路径：

1. **停止容器**
2. **修改docker-compose.yml**
3. **重新启动容器**

---

## 💡 优势总结

### 使用现成镜像的优势

1. ✅ **快速部署**：无需构建，下载即用
2. ✅ **资源占用少**：nginx:alpine只有几十MB
3. ✅ **自动更新**：文件更新后立即生效
4. ✅ **易于维护**：配置简单，易于理解
5. ✅ **官方支持**：使用官方镜像，稳定可靠

### 与其他方案对比

| 方案 | 难度 | 速度 | 功能 | 推荐度 |
|------|------|------|------|--------|
| 简单部署 | ⭐ | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ |
| **Docker现成镜像** | ⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Docker构建镜像 | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| 虚拟机部署 | ⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |

---

## 🎯 快速检查清单

部署前确认：

- [ ] study文件夹已上传到NAS
- [ ] 知道study文件夹的完整路径
- [ ] docker-compose.yml中的路径已修改
- [ ] 端口号已确认（默认8080）
- [ ] 极空间Docker功能已启用
- [ ] 容器已启动并运行
- [ ] 可以通过浏览器访问

---

## 📚 相关文档

- `docker-compose.yml` - 完整配置（支持自定义nginx配置）
- `docker-compose.simple.yml` - 简化配置（使用默认配置）
- `nginx.conf` - Nginx自定义配置文件（可选）
- `部署到极空间NAS.md` - 详细部署指南

---

**最简单的Docker部署方案，推荐使用！** 🚀


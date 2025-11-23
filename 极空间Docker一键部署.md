# 极空间Docker一键部署（使用现成镜像）

使用官方Nginx镜像，直接挂载NAS目录，无需构建，开箱即用！

## 🎯 为什么选择这个方案？

- ✅ **无需构建镜像**：使用官方 `nginx:alpine` 镜像
- ✅ **直接挂载目录**：NAS上的文件直接映射到容器
- ✅ **配置简单**：只需修改路径和端口
- ✅ **开箱即用**：下载镜像后立即运行
- ✅ **易于更新**：更新文件后容器自动生效（只读挂载）

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

#### 方法A：使用docker-compose.yml（推荐）

1. **打开极空间Docker应用**

2. **创建新容器**
   - 选择"使用docker-compose.yml"
   - 工作目录：选择study文件夹所在位置
   - 或直接上传 `docker-compose.yml` 文件

3. **修改docker-compose.yml中的路径**
   
   编辑 `docker-compose.yml`，修改这一行：
   ```yaml
   volumes:
     - /docker/study:/usr/share/nginx/html:ro
   ```
   
   将 `/docker/study` 改为您实际的路径，例如：
   - `/volume1/web/study`
   - `/mnt/nas/study`
   - 或其他路径

4. **启动容器**
   - 点击"启动"或"运行"
   - 等待容器启动（首次会下载nginx镜像）

5. **完成！**
   - 访问：`http://极空间IP:8080/`

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


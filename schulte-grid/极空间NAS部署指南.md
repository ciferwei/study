# 极空间NAS部署指南

## 🎯 部署方案

极空间NAS通常支持Web服务功能，可以部署静态网站。以下是详细的部署步骤。

---

## 📋 部署前准备

### 1. 确认文件完整性

确保以下文件都在 `study` 文件夹中：

```
study/
├── index.html              # 主页面
├── style.css               # 样式文件
├── script.js               # 核心功能
├── manifest.json           # PWA配置
├── service-worker.js       # Service Worker
├── icon-72.png             # 图标文件
├── icon-96.png
├── icon-128.png
├── icon-144.png
├── icon-152.png
├── icon-192.png
├── icon-384.png
└── icon-512.png
```

### 2. 检查极空间NAS功能

- ✅ 确认NAS已开启Web服务功能
- ✅ 确认可以访问NAS的Web界面
- ✅ 确认是否有HTTPS支持（PWA需要）

---

## 🚀 部署方法

### 方法一：使用极空间的Web服务（最简单，推荐）

极空间NAS通常内置Web服务功能，可以直接部署静态网站。

#### 步骤1：上传文件

1. **通过极空间客户端上传**
   - 打开极空间客户端（手机App或电脑客户端）
   - 登录您的NAS账号
   - 进入"文件管理"
   - 找到或创建 `web` 文件夹（或查看极空间文档中的Web目录位置）
   - 将整个 `study` 文件夹上传到此目录

2. **通过SMB共享上传**
   - 在Windows文件资源管理器中输入：`\\极空间IP地址`
   - 或使用Mac的"连接服务器"：`smb://极空间IP地址`
   - 找到Web目录，上传 `study` 文件夹

#### 步骤2：配置Web服务

1. **登录极空间管理界面**
   - 在浏览器访问：`http://极空间IP地址` 或通过极空间客户端
   - 登录管理后台

2. **启用Web服务**
   - 进入"应用中心"或"服务"菜单
   - 查找"Web服务"、"静态网站"或"文件服务"
   - 如果未安装，先安装Web服务应用
   - 启用Web服务功能

3. **设置Web根目录**
   - 通常默认是 `/web` 或 `/www` 目录
   - 确认 `study` 文件夹在此目录下
   - 路径应该是：`/web/study/` 或 `/www/study/`

4. **配置访问端口**
   - 默认可能是 80 或 8080 端口
   - 记录下访问端口号

#### 步骤3：启用HTTPS（重要！）

1. **查找SSL/HTTPS设置**
   - 在Web服务设置中查找"SSL"或"HTTPS"选项
   - 极空间可能支持Let's Encrypt自动证书

2. **配置HTTPS**
   - 启用HTTPS功能
   - 如果有域名，配置域名和证书
   - 如果没有域名，使用自签名证书（可能浏览器会提示不安全）

3. **测试HTTPS访问**
   - 访问：`https://极空间IP地址:端口/study/index.html`
   - 确认可以正常打开

---

### 方法二：使用极空间的Docker（功能完整，推荐）

极空间NAS支持Docker，可以使用Nginx容器部署，功能更完整。

#### 步骤1：上传文件到NAS

1. **通过极空间客户端上传**
   - 打开极空间客户端（Windows/Mac/手机）
   - 登录您的NAS
   - 找到Web服务目录（通常是 `web` 或 `www` 文件夹）
   - 将整个 `study` 文件夹上传到此目录

2. **通过SMB/FTP上传**
   - 在文件资源管理器中访问：`\\极空间IP地址`
   - 或使用FTP客户端连接NAS
   - 上传 `study` 文件夹到Web目录

#### 步骤2：配置Web服务

1. **登录极空间管理界面**
   - 在浏览器访问：`http://极空间IP地址` 或 `https://极空间IP地址`
   - 登录管理后台

2. **找到Web服务设置**
   - 通常在"应用"或"服务"菜单中
   - 查找"Web服务"、"静态网站"或"文件服务"选项

3. **配置Web目录**
   - 设置Web根目录（如 `/web` 或 `/www`）
   - 确保 `study` 文件夹在此目录下

4. **启用HTTPS（重要！）**
   - PWA需要HTTPS才能完全工作
   - 在Web服务设置中启用HTTPS
   - 如果有SSL证书选项，配置证书
   - 极空间可能支持Let's Encrypt自动证书

#### 步骤3：访问应用

- **内网访问**：`https://极空间IP地址/study/index.html`
- **外网访问**：`https://您的域名/study/index.html`（如果配置了域名）

---

### 方法二：使用极空间的Docker（如果支持）

如果极空间支持Docker，可以使用Nginx容器：

#### 步骤1：准备Docker配置

创建 `docker-compose.yml`：

```yaml
version: '3'
services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./study:/usr/share/nginx/html/study
      - ./nginx.conf:/etc/nginx/nginx.conf
    restart: unless-stopped
```

创建 `nginx.conf`：

```nginx
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    server {
        listen 80;
        server_name _;
        root /usr/share/nginx/html;
        
        location /study/ {
            try_files $uri $uri/ /study/index.html;
        }
    }
}
```

#### 步骤2：部署

1. 在极空间Docker中创建新容器
2. 使用上述配置
3. 启动容器

---

### 方法三：使用极空间的WebDAV（如果支持）

1. **启用WebDAV服务**
   - 在极空间管理界面启用WebDAV
   - 设置访问路径

2. **通过WebDAV访问**
   - 在浏览器中访问WebDAV地址
   - 直接打开 `index.html`

**注意**：WebDAV可能不支持Service Worker，功能可能受限。

---

## ⚙️ 配置HTTPS（重要）

### 为什么需要HTTPS？

- ✅ PWA的Service Worker只能在HTTPS上工作
- ✅ 添加到主屏幕功能需要HTTPS
- ✅ 离线功能需要HTTPS

### 极空间HTTPS配置方法

#### 方法1：使用极空间内置SSL

1. 登录极空间管理界面
2. 找到"安全"或"SSL"设置
3. 启用HTTPS
4. 如果有Let's Encrypt，启用自动证书

#### 方法2：使用反向代理

如果极空间不支持直接HTTPS，可以使用：

1. **Cloudflare Tunnel**（免费）
   - 在极空间安装Cloudflare Tunnel
   - 配置隧道指向本地Web服务
   - 获得HTTPS访问

2. **frp内网穿透**（如果有公网IP）
   - 配置frp服务器
   - 设置HTTPS反向代理

---

## 📱 在iPad上安装

### 步骤1：访问应用

1. 在iPad Safari中打开：
   - 内网：`https://极空间IP地址/study/index.html`
   - 外网：`https://您的域名/study/index.html`

2. **首次访问必须使用HTTPS**
   - 确保地址栏显示🔒锁图标
   - 如果显示"不安全"，Service Worker无法工作

### 步骤2：添加到主屏幕

1. 点击Safari底部的"分享"按钮
2. 选择"添加到主屏幕"
3. 自定义名称（可选）
4. 点击"添加"

### 步骤3：验证功能

- ✅ 应用可以全屏打开
- ✅ 可以离线使用（关闭WiFi后仍可用）
- ✅ 训练记录正常保存

---

## 🔧 常见问题解决

### 问题1：Service Worker无法注册

**原因**：未使用HTTPS

**解决**：
1. 确保使用 `https://` 而不是 `http://`
2. 检查SSL证书是否有效
3. 查看浏览器控制台错误信息

### 问题2：无法访问NAS

**原因**：网络配置问题

**解决**：
1. 确认iPad和NAS在同一网络（内网访问）
2. 或配置外网访问（DDNS、端口转发等）
3. 检查防火墙设置

### 问题3：文件路径错误

**原因**：Web根目录配置不正确

**解决**：
1. 确认 `study` 文件夹在Web根目录下
2. 访问路径应该是：`/study/index.html`
3. 检查所有文件是否在同一目录

### 问题4：图标不显示

**原因**：图标文件路径错误或缺失

**解决**：
1. 确认所有 `icon-*.png` 文件都在 `study` 文件夹中
2. 检查 `manifest.json` 中的路径是否正确
3. 清除浏览器缓存后重试

---

## 🔒 安全建议

1. **使用HTTPS**
   - 保护数据传输
   - PWA功能必需

2. **设置访问权限**
   - 如果只在内网使用，限制外网访问
   - 使用强密码保护NAS

3. **定期备份**
   - 备份 `study` 文件夹
   - 备份训练数据（虽然保存在浏览器本地）

---

## 📊 访问方式对比

| 访问方式 | 内网访问 | 外网访问 | HTTPS支持 | PWA功能 |
|---------|---------|---------|-----------|---------|
| 极空间Web服务 | ✅ | ⚠️需配置 | ✅（需配置） | ✅ |
| Docker Nginx | ✅ | ⚠️需配置 | ✅（需配置） | ✅ |
| WebDAV | ✅ | ⚠️需配置 | ⚠️可能不支持 | ❌ |

---

## 🎯 推荐配置

### 最佳实践

1. **使用极空间内置Web服务**
   - 最简单，无需额外配置
   - 启用HTTPS

2. **配置内网访问**
   - 在iPad上通过 `https://极空间IP/study/index.html` 访问
   - 快速、稳定

3. **如需外网访问**
   - 配置DDNS或使用Cloudflare Tunnel
   - 确保HTTPS可用

---

## 📝 快速检查清单

部署前确认：

- [ ] 所有文件已上传到NAS的Web目录
- [ ] 文件路径正确（`/study/index.html` 可访问）
- [ ] HTTPS已启用并配置
- [ ] 可以通过浏览器访问应用
- [ ] 浏览器显示🔒锁图标（HTTPS有效）
- [ ] Service Worker可以注册（查看控制台）
- [ ] 图标文件都存在

---

## 🚀 开始部署

1. **上传文件**：将 `study` 文件夹上传到极空间Web目录
2. **配置HTTPS**：在极空间管理界面启用HTTPS
3. **访问测试**：在浏览器中访问 `https://极空间IP/study/index.html`
4. **安装到iPad**：在iPad Safari中打开并添加到主屏幕

---

## 💡 提示

- 如果极空间不支持HTTPS，可以考虑使用Cloudflare Tunnel
- 内网访问通常更快更稳定
- 定期检查SSL证书有效期
- 备份重要数据

---

**祝部署顺利！** 🎯

如有问题，请检查极空间NAS的文档或联系技术支持。


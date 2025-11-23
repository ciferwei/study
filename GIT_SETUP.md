# Git仓库设置说明

## 📦 仓库信息

- **仓库名**：`hs-study`
- **描述**：学习训练游戏集合

## 🚀 首次提交

代码已提交到本地仓库，提交信息：
```
初始提交：学习训练游戏集合

- 添加舒尔特方格训练游戏
- 支持PWA，可安装到iPad
- 支持全屏模式，兼容PC、手机、iPad
- 提供多种部署方案（简单部署、Docker、虚拟机）
- 统一的游戏列表入口
- 支持后续添加新游戏
```

## 📤 推送到远程仓库

### 方法一：GitHub（推荐）

1. **在GitHub上创建仓库**
   - 访问 https://github.com/new
   - 仓库名：`hs-study`
   - 选择"Public"或"Private"
   - **不要**初始化README、.gitignore或license（我们已经有了）

2. **添加远程仓库并推送**
   ```bash
   git remote add origin https://github.com/您的用户名/hs-study.git
   git branch -M main
   git push -u origin main
   ```

### 方法二：Gitee（国内）

1. **在Gitee上创建仓库**
   - 访问 https://gitee.com/projects/new
   - 仓库名：`hs-study`
   - 选择"公开"或"私有"

2. **添加远程仓库并推送**
   ```bash
   git remote add origin https://gitee.com/您的用户名/hs-study.git
   git branch -M main
   git push -u origin main
   ```

### 方法三：极空间Git（如果支持）

如果极空间NAS支持Git服务，可以：
```bash
git remote add origin http://极空间IP/git/hs-study.git
git push -u origin main
```

## 📝 后续更新

添加新游戏或更新代码后：

```bash
# 查看更改
git status

# 添加文件
git add .

# 提交
git commit -m "描述您的更改"

# 推送
git push
```

## 🔍 检查当前状态

```bash
# 查看提交历史
git log --oneline

# 查看远程仓库
git remote -v

# 查看当前分支
git branch
```

## ⚠️ 注意事项

1. **不要提交敏感信息**：如密码、API密钥等
2. **.gitignore已配置**：会自动忽略临时文件和系统文件
3. **大文件**：图标文件已包含，如果太大可以考虑使用Git LFS

---

**仓库已初始化，等待推送到远程！** 🎉


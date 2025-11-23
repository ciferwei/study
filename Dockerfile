# 使用Nginx Alpine镜像（轻量级）
FROM nginx:alpine

# 复制整个study目录到nginx的web目录
COPY . /usr/share/nginx/html/

# 复制nginx配置文件
COPY nginx.conf /etc/nginx/nginx.conf

# 暴露端口
EXPOSE 80

# 启动nginx
CMD ["nginx", "-g", "daemon off;"]


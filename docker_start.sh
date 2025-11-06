# 停止并删除现有的 Teamie 容器
docker-compose down

# 构建新的 Teamie 镜像
docker-compose build --no-cache

# 使用 Docker Compose 运行 Teamie
docker-compose up -d
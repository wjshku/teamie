#!/bin/bash

# ==========================================
# Teamie 项目启动脚本
# 用于本地开发和 Docker 容器
# ==========================================

set -e  # 遇到错误立即退出

echo "🚀 启动 Teamie 项目管理工具..."
echo "================================="

# 检查 Python
if ! command -v python3 &> /dev/null; then
    echo "❌ 错误: 未找到 Python 3"
    echo "请确保已安装 Python 3.8+"
    exit 1
fi

echo "✅ Python 3 已找到"

# 检查是否在正确的目录
if [ ! -f "backend/main.py" ]; then
    echo "❌ 错误: 请在项目根目录下运行此脚本"
    echo "当前目录应包含 backend/ 和 frontend/ 文件夹"
    exit 1
fi

echo "✅ 项目结构正确"

# 进入后端目录
cd backend

# 创建数据目录
echo "📁 创建数据目录..."
mkdir -p data/html

# 检查 .env 文件
if [ ! -f ".env" ]; then
    echo "⚠️  未找到 .env 文件，正在创建配置文件..."
    cat > .env << EOF
# OpenAI API 配置
# 获取你的 API Key: https://platform.openai.com/api-keys
OPENAI_API_KEY=your_openai_api_key_here

# 服务器配置
HOST=0.0.0.0
PORT=8000

# 数据存储配置
DATA_DIR=data
EOF
    echo "📝 已创建 .env 文件"
    echo "⚠️  请编辑 .env 文件并设置你的 OpenAI API Key"
    echo "   OPENAI_API_KEY=sk-your-actual-key-here"
    echo ""
fi

# 创建虚拟环境
if [ ! -d "venv" ]; then
    echo "🔧 创建 Python 虚拟环境..."
    python3 -m venv venv
fi

# 激活虚拟环境
echo "⚡ 激活虚拟环境..."
source venv/bin/activate

# 升级 pip
pip install --upgrade pip > /dev/null 2>&1

# 安装依赖
echo "📦 安装 Python 依赖..."
pip install -r requirements.txt

# 检查 OpenAI API Key
if grep -q "your_openai_api_key_here" .env; then
    echo ""
    echo "⚠️  重要提醒："
    echo "   OpenAI API Key 未设置，文档分析功能将无法使用"
    echo "   请编辑 .env 文件设置你的 API Key:"
    echo "   OPENAI_API_KEY=sk-your-actual-key-here"
    echo ""
    echo "   获取 API Key: https://platform.openai.com/api-keys"
    echo ""
    echo "   应用仍将继续启动，但分析功能会报错"
    echo ""
fi

# 启动服务器
echo "🌐 启动 Teamie 服务器..."
echo "   访问地址: http://localhost:8000"
echo ""
echo "按 Ctrl+C 停止服务器"
echo "================================="

# 启动应用
python main.py
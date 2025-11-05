from fastapi import FastAPI, UploadFile, File, HTTPException, Form, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, JSONResponse, Response
from starlette.staticfiles import StaticFiles as StarletteStaticFiles
import os
import json
import logging
import traceback
from typing import Optional, List
from datetime import datetime, timedelta
from dotenv import load_dotenv
import tiktoken

from models import *
from data_manager import DataManager
from ai_analyzer import AIAnalyzer

# 加载环境变量
load_dotenv('.env')

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),  # 输出到控制台
        logging.FileHandler('app.log', encoding='utf-8')  # 输出到文件
    ]
)
logger = logging.getLogger(__name__)

app = FastAPI(title="Teamie API", version="1.0.0")

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 在生产环境中应该设置具体的域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 初始化组件
data_dir = os.getenv("DATA_DIR", "data")
data_manager = DataManager(data_dir)
ai_analyzer = AIAnalyzer()

# 模型配置表（tokens/秒）
MODEL_CONFIG = {
    "gpt-4o-mini": {
        "tokens_per_second": 1000,
        "encoding_model": "gpt-4"
    },
    "gpt-5-nano": {
        "tokens_per_second": 600,
        "encoding_model": "gpt-4" 
    }
}

# 当前使用的模型（可通过环境变量配置）
CURRENT_MODEL = os.getenv("AI_MODEL", "gpt-5-nano")

def get_model_config(model_name: str = None) -> dict:
    """获取模型配置"""
    if model_name is None:
        model_name = CURRENT_MODEL
    
    if model_name not in MODEL_CONFIG:
        logger.warning(f"模型 {model_name} 不在配置表中，使用默认模型 gpt-5-nano")
        model_name = "gpt-5-nano"
    
    return MODEL_CONFIG[model_name]

def get_tokens_per_second(model_name: str = None) -> float:
    """获取模型的处理速度（tokens/秒）"""
    config = get_model_config(model_name)
    return config["tokens_per_second"]

# 初始化 tiktoken 编码器（用于计算 token 数量）
def get_token_count(text: str, model_name: str = None) -> int:
    """计算文本的 token 数量"""
    try:
        config = get_model_config(model_name)
        encoding_model = config.get("encoding_model", "gpt-4")
        # 使用指定模型的编码器
        encoding = tiktoken.encoding_for_model(encoding_model)
        return len(encoding.encode(text))
    except Exception as e:
        logger.warning(f"Token 计算失败，使用字符数估算: {str(e)}")
        # 如果 tiktoken 失败，使用简单估算：1 token ≈ 4 字符（英文）或 1.5 字符（中文）
        # 这里使用保守估算：1 token = 2 字符
        return len(text) // 2

@app.get("/api/")
async def api_root():
    """API健康检查"""
    return {"message": "Teamie API is running", "version": "1.0.0"}

async def process_files_in_background(project_id: str, file_contents: list, week_start_date: str):
    """后台处理文件保存和AI分析"""
    try:
        logger.info(f"后台任务开始: 项目 {project_id}")
        
        # 保存原始文件内容到data目录（保持原格式和文件夹结构）
        logger.info("正在保存原始文件...")
        for file_item in file_contents:
            filename = file_item['filename']
            content = file_item['content']
            relative_path = file_item.get('relative_path')  # 获取相对路径
            data_manager.save_file_content(project_id, content, filename, week=1, relative_path=relative_path)
            logger.info(f"文件 {filename} 保存成功 (路径: {relative_path or '根目录'})")
        logger.info("所有原始文件保存完成")

        # 分析文件内容生成报告
        logger.info("正在分析文件内容...")
        week_data = ai_analyzer.analyze_html_contents(project_id, file_contents)
        logger.info("文件内容分析完成")

        # 设置周期间隔（基于用户选择的日期）
        if week_start_date:
            start_date = datetime.fromisoformat(week_start_date)
            end_date = start_date + timedelta(days=6)  # 周一到周日
            week_data.week_period = f"{start_date.strftime('%Y-%m-%d')} 至 {end_date.strftime('%Y-%m-%d')}"
            logger.info(f"设置周期间隔: {week_data.week_period}")

        # 保存第一周数据
        logger.info("正在保存第一周数据...")
        data_manager.update_week_data(project_id, 1, week_data)
        logger.info("第一周数据保存成功")

        logger.info(f"后台任务完成: 项目 {project_id} 分析完成")
    except Exception as e:
        logger.error(f"后台任务失败: 项目 {project_id}, 错误: {str(e)}")
        logger.error(f"错误详情: {traceback.format_exc()}")

@app.post("/api/upload", response_model=UploadResponse)
async def upload_files(
    background_tasks: BackgroundTasks,
    files: List[UploadFile] = File(...),
    project_name: str = Form(...),
    week_start_date: str = Form(...),
    file_paths: List[str] = Form(None)  # 可选的路径信息列表
):
    """上传并分析文件（支持 html/txt/md 格式，支持多文件和文件夹）"""
    logger.info(f"开始上传 {len(files)} 个文件, 项目名称: {project_name}")

    try:
        # 过滤并读取支持的文件内容（html/txt/md）
        file_contents = []
        processed_files = []
        supported_extensions = ('.html', '.htm', '.txt', '.md')

        def get_file_extension(filename: str) -> str:
            """获取文件扩展名（不包含点）"""
            if not filename:
                return ''
            # 处理路径分隔符
            filename = filename.replace('\\', '/')
            # 获取文件名部分
            basename = filename.split('/')[-1]
            # 获取扩展名
            if '.' in basename:
                return '.' + basename.split('.')[-1].lower()
            return ''

        # 处理文件路径信息（如果有）
        path_map = {}
        if file_paths:
            for i, path in enumerate(file_paths):
                if path:
                    path_map[i] = path
        
        file_index = 0
        for file in files:
            logger.info(f"检查文件: filename={file.filename}, content_type={file.content_type}")
            file_ext = get_file_extension(file.filename)
            
            if file.filename and file_ext in supported_extensions:
                logger.info(f"正在读取文件: {file.filename} (扩展名: {file_ext})")
                try:
                    content = await file.read()
                    file_content = content.decode('utf-8')

                    # 清理文件名
                    cleaned_filename = data_manager._clean_filename(file.filename)
                    
                    # 获取相对路径（如果有）
                    relative_path = path_map.get(file_index)

                    file_contents.append({
                        'filename': cleaned_filename,
                        'content': file_content,
                        'relative_path': relative_path
                    })
                    processed_files.append(cleaned_filename)
                    logger.info(f"文件 {cleaned_filename} 读取成功，大小: {len(file_content)} 字符 (路径: {relative_path or '根目录'})")
                    file_index += 1
                except UnicodeDecodeError as e:
                    logger.warning(f"文件 {file.filename} 解码失败，跳过: {str(e)}")
            else:
                logger.warning(f"跳过文件: {file.filename} (扩展名: {file_ext}, 不支持的文件格式或文件名为空)")
                if file.filename:
                    file_index += 1

        if not file_contents:
            raise HTTPException(status_code=400, detail="未找到有效的文件（支持 html/txt/md 格式）")

        # 获取当前模型的配置
        tokens_per_second = get_tokens_per_second()
        logger.info(f"使用模型: {CURRENT_MODEL}, 处理速度: {tokens_per_second} tokens/秒")

        # 计算 token 数量
        total_token_count = 0
        for file_item in file_contents:
            content = file_item['content']
            token_count = get_token_count(content, CURRENT_MODEL)
            total_token_count += token_count
            logger.debug(f"文件 {file_item['filename']} token 数量: {token_count}")

        # 计算预计处理时间（秒）
        estimated_time = total_token_count / tokens_per_second

        # 文件数量
        file_count = len(file_contents)

        logger.info(f"上传文件总数: {len(files)}, 符合要求的文件数量: {file_count}, 总 token 数量: {total_token_count}，预计处理时间: {estimated_time:.2f} 秒")

        # 创建项目（需要立即创建，以便返回 project_id）
        logger.info(f"正在创建项目: {project_name}")
        project_id = data_manager.create_project(project_name)
        logger.info(f"项目创建成功，ID: {project_id}")

        # 立即返回响应，让前端显示 token 和预计时间
        logger.info(f"立即返回响应，项目ID: {project_id}, 文件数量: {file_count}, Token: {total_token_count}, 预计时间: {estimated_time:.2f}秒")
        
        # 添加后台任务：保存文件、AI分析、保存数据
        background_tasks.add_task(
            process_files_in_background,
            project_id=project_id,
            file_contents=file_contents,
            week_start_date=week_start_date
        )

        return UploadResponse(
            success=True,
            message=f"成功上传 {file_count} 个文件，正在后台分析中...",
            project_id=project_id,
            file_count=file_count,
            token_count=total_token_count,
            estimated_time_seconds=estimated_time
        )

    except Exception as e:
        logger.error(f"上传失败: {str(e)}")
        logger.error(f"错误详情: {traceback.format_exc()}")
        logger.error(f"文件信息: {[f.filename for f in files]}, 项目名称: {project_name}")
        raise HTTPException(status_code=500, detail=f"上传失败: {str(e)}")

@app.get("/api/projects", response_model=List[ProjectSummary])
async def get_projects():
    """获取所有项目列表"""
    logger.info("正在获取所有项目列表")
    try:
        projects = data_manager.get_all_projects()
        logger.info(f"成功获取 {len(projects)} 个项目")
        return projects
    except Exception as e:
        logger.error(f"获取项目列表失败: {str(e)}")
        logger.error(f"错误详情: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"获取项目列表失败: {str(e)}")

@app.get("/api/projects/{project_id}/week/{week}")
async def get_week_report(project_id: str, week: int):
    """获取指定项目的周报"""
    logger.info(f"正在获取项目 {project_id} 的第 {week} 周周报")
    try:
        week_data = data_manager.get_week_data(project_id, week)
        if not week_data:
            logger.warning(f"项目 {project_id} 的第 {week} 周周报不存在")
            raise HTTPException(status_code=404, detail="周报不存在")

        logger.info(f"成功获取项目 {project_id} 的第 {week} 周周报")
        return week_data.dict()
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"获取周报失败: {str(e)}")
        logger.error(f"错误详情: {traceback.format_exc()}")
        logger.error(f"项目ID: {project_id}, 周数: {week}")
        raise HTTPException(status_code=500, detail=f"获取周报失败: {str(e)}")

@app.post("/api/projects/{project_id}/week/{week}/update-plan")
async def update_week_plan(project_id: str, week: int, plan_data: Dict[str, Any]):
    """更新周报的下周计划"""
    logger.info(f"正在更新项目 {project_id} 第 {week} 周的下周计划")
    logger.debug(f"计划数据: {plan_data}")

    try:
        # 获取现有周数据
        week_data = data_manager.get_week_data(project_id, week)
        if not week_data:
            logger.info(f"项目 {project_id} 第 {week} 周数据不存在，创建新的WeekData")
            week_data = WeekData()

        # 更新下周计划
        if "next_week_plan" in plan_data:
            logger.info("正在使用AI分析器更新下周计划")
            week_data = ai_analyzer.update_week_data_with_plan(week_data, plan_data["next_week_plan"])
            logger.info("下周计划更新完成")

        # 保存更新
        logger.info("正在保存更新后的周数据")
        success = data_manager.update_week_data(project_id, week, week_data)

        if not success:
            logger.error(f"项目 {project_id} 不存在，无法保存数据")
            raise HTTPException(status_code=404, detail="项目不存在")

        logger.info(f"项目 {project_id} 第 {week} 周的下周计划更新成功")
        return {"success": True, "message": "下周计划更新成功"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"更新下周计划失败: {str(e)}")
        logger.error(f"错误详情: {traceback.format_exc()}")
        logger.error(f"项目ID: {project_id}, 周数: {week}, 计划数据: {plan_data}")
        raise HTTPException(status_code=500, detail=f"更新失败: {str(e)}")

@app.put("/api/projects/{project_id}/week/{week}")
async def update_week_report(project_id: str, week: int, week_data: WeekData):
    """更新完整周报数据"""
    logger.info(f"正在更新项目 {project_id} 第 {week} 周的完整周报数据")
    logger.debug(f"周报数据类型: {type(week_data)}, 字段: {week_data.__dict__.keys() if hasattr(week_data, '__dict__') else 'N/A'}")

    try:
        logger.info("正在保存周报数据")
        success = data_manager.update_week_data(project_id, week, week_data)

        if not success:
            logger.error(f"项目 {project_id} 不存在，无法更新周报")
            raise HTTPException(status_code=404, detail="项目不存在")

        logger.info(f"项目 {project_id} 第 {week} 周的周报更新成功")
        return {"success": True, "message": "周报更新成功"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"更新周报失败: {str(e)}")
        logger.error(f"错误详情: {traceback.format_exc()}")
        logger.error(f"项目ID: {project_id}, 周数: {week}")
        raise HTTPException(status_code=500, detail=f"更新失败: {str(e)}")

@app.get("/api/projects/{project_id}")
async def get_project_info(project_id: str):
    """获取项目信息"""
    logger.info(f"正在获取项目 {project_id} 的信息")
    try:
        project = data_manager.get_project(project_id)
        if not project:
            logger.warning(f"项目 {project_id} 不存在")
            raise HTTPException(status_code=404, detail="项目不存在")

        result = {
            "id": project.id,
            "name": project.name,
            "created_at": project.created_at,
            "updated_at": project.updated_at,
            "total_weeks": len(project.weeks),
            "current_week": max(project.weeks.keys()) if project.weeks else 1
        }
        logger.info(f"成功获取项目 {project_id} 信息: {len(project.weeks)} 周数据")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"获取项目信息失败: {str(e)}")
        logger.error(f"错误详情: {traceback.format_exc()}")
        logger.error(f"项目ID: {project_id}")
        raise HTTPException(status_code=500, detail=f"获取项目信息失败: {str(e)}")

@app.put("/api/projects/{project_id}/status")
async def update_project_status(project_id: str, request: dict):
    """更新项目状态"""
    status = request.get("status", "").strip()
    if not status:
        raise HTTPException(status_code=400, detail="状态不能为空")

    logger.info(f"正在更新项目 {project_id} 的状态为: {status}")
    try:
        success = data_manager.update_project_status(project_id, status)
        if not success:
            logger.warning(f"项目 {project_id} 不存在，无法更新状态")
            raise HTTPException(status_code=404, detail="项目不存在")

        logger.info(f"项目 {project_id} 状态更新成功")
        return {"success": True, "message": "状态更新成功"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"更新项目状态失败: {str(e)}")
        logger.error(f"错误详情: {traceback.format_exc()}")
        logger.error(f"项目ID: {project_id}, 新状态: {status}")
        raise HTTPException(status_code=500, detail=f"更新状态失败: {str(e)}")

@app.delete("/api/projects/{project_id}")
async def delete_project(project_id: str):
    """删除项目"""
    logger.info(f"正在删除项目 {project_id}")
    try:
        success = data_manager.delete_project(project_id)
        if not success:
            logger.warning(f"项目 {project_id} 不存在，无法删除")
            raise HTTPException(status_code=404, detail="项目不存在")

        logger.info(f"项目 {project_id} 删除成功")
        return {"success": True, "message": "项目删除成功"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"删除项目失败: {str(e)}")
        logger.error(f"错误详情: {traceback.format_exc()}")
        logger.error(f"项目ID: {project_id}")
        raise HTTPException(status_code=500, detail=f"删除项目失败: {str(e)}")

@app.get("/api/projects/{project_id}/week/{week}/files")
def get_project_week_files(project_id: str, week: int):
    """获取项目指定周的所有文件列表"""
    logger.info(f"获取项目 {project_id} 第 {week} 周的文件列表")

    try:
        # 检查项目是否存在
        project = data_manager.get_project(project_id)
        if not project:
            logger.warning(f"项目 {project_id} 不存在")
            raise HTTPException(status_code=404, detail="项目不存在")

        # 获取文件列表
        files = data_manager.get_files(project_id, week)
        logger.info(f"项目 {project_id} 第 {week} 周有 {len(files)} 个文件")

        return {"files": files}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"获取文件列表失败: {str(e)}")
        logger.error(f"错误详情: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"获取文件列表失败: {str(e)}")

@app.get("/api/projects/{project_id}/week/{week}/files/{filename}")
def get_project_week_file_content(project_id: str, week: int, filename: str):
    """获取项目指定周的单个文件内容"""
    logger.info(f"获取项目 {project_id} 第 {week} 周的文件 {filename} 内容")

    try:
        # 检查项目是否存在
        project = data_manager.get_project(project_id)
        if not project:
            logger.warning(f"项目 {project_id} 不存在")
            raise HTTPException(status_code=404, detail="项目不存在")

        # 获取文件内容
        content = data_manager.get_file_content_by_name(project_id, week, filename)
        if content is None:
            logger.warning(f"文件 {filename} 不存在")
            raise HTTPException(status_code=404, detail="文件不存在")

        # 根据文件扩展名设置 media_type
        filename_lower = filename.lower()
        if filename_lower.endswith(('.html', '.htm')):
            media_type = "text/html"
        elif filename_lower.endswith('.md'):
            media_type = "text/markdown"
        elif filename_lower.endswith('.txt'):
            media_type = "text/plain"
        else:
            media_type = "text/plain"

        logger.info(f"成功获取文件 {filename} 内容，长度: {len(content)}")
        return Response(content=content, media_type=media_type)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"获取文件内容失败: {str(e)}")
        logger.error(f"错误详情: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"获取文件内容失败: {str(e)}")

@app.post("/api/projects/{project_id}/analyze-next-week")
async def analyze_next_week(
    project_id: str, 
    html_content: str = None, 
    files: List[UploadFile] = File(None),
    file_paths: List[str] = Form(None)  # 文件路径信息列表
):
    """分析新一周的进展（支持多文件，保持文件夹结构）"""
    logger.info(f"开始分析项目 {project_id} 的新一周进展")

    try:
        # 获取上一周的数据（用于上下文）
        logger.info(f"正在获取项目 {project_id} 的信息")
        project = data_manager.get_project(project_id)
        if not project:
            logger.warning(f"项目 {project_id} 不存在")
            raise HTTPException(status_code=404, detail="项目不存在")

        current_week = max(project.weeks.keys()) if project.weeks else 0
        previous_week_plan = None

        if current_week > 0 and project.weeks.get(current_week):
            previous_week_plan = project.weeks[current_week].next_week_plan
            logger.info(f"找到上一周({current_week})的计划数据")

        # 处理文件路径信息（如果有）
        path_map = {}
        if file_paths:
            for i, path in enumerate(file_paths):
                if path:
                    path_map[i] = path

        # 处理输入：支持单文件字符串或多文件上传
        file_contents = []
        new_week = current_week + 1
        supported_extensions = ('.html', '.htm', '.txt', '.md')

        file_index = 0
        if files and len(files) > 0:
            # 多文件模式
            logger.info(f"处理多文件输入: {len(files)} 个文件")
            for file in files:
                if file.filename and any(file.filename.lower().endswith(ext) for ext in supported_extensions):
                    logger.info(f"正在读取文件: {file.filename}")
                    content = await file.read()
                    file_content_data = content.decode('utf-8')
                    
                    # 清理文件名
                    cleaned_filename = data_manager._clean_filename(file.filename)
                    
                    # 获取相对路径（如果有）
                    relative_path = path_map.get(file_index)
                    
                    file_contents.append({
                        'filename': cleaned_filename,
                        'content': file_content_data,
                        'relative_path': relative_path
                    })
                    logger.info(f"文件 {cleaned_filename} 读取成功，大小: {len(file_content_data)} 字符 (路径: {relative_path or '根目录'})")

                    # 保存到新一周的目录（保持文件夹结构）
                    data_manager.save_file_content(project_id, file_content_data, cleaned_filename, week=new_week, relative_path=relative_path)
                    file_index += 1
        elif html_content:
            # 单文件模式（向后兼容）
            logger.info("处理单文件字符串输入")
            logger.debug(f"文件内容长度: {len(html_content)} 字符")
            file_contents.append({
                'filename': 'content.html',
                'content': html_content,
                'relative_path': None
            })
            # 保存到新一周的目录
            data_manager.save_file_content(project_id, html_content, 'content.html', week=new_week)
        else:
            raise HTTPException(status_code=400, detail="未提供有效的文件内容")

        if not file_contents:
            raise HTTPException(status_code=400, detail="未找到有效的文件（支持 html/txt/md 格式）")

        logger.info(f"共处理 {len(file_contents)} 个文件")

        # 分析新一周数据
        logger.info(f"正在分析第 {new_week} 周的数据")
        week_data = ai_analyzer.analyze_html_contents(project_id, file_contents, previous_week_plan)
        logger.info("新一周数据分析完成")

        # 保存数据
        logger.info(f"正在保存第 {new_week} 周的数据")
        data_manager.update_week_data(project_id, new_week, week_data)
        logger.info(f"第 {new_week} 周数据保存成功")

        result = {
            "success": True,
            "message": f"第{new_week}周分析完成",
            "week": new_week,
            "data": week_data.dict()
        }
        logger.info(f"项目 {project_id} 第 {new_week} 周分析完成")
        return result

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"分析新一周进展失败: {str(e)}")
        logger.error(f"错误详情: {traceback.format_exc()}")
        logger.error(f"项目ID: {project_id}")
        raise HTTPException(status_code=500, detail=f"分析失败: {str(e)}")

@app.delete("/api/projects/{project_id}/week/{week}")
async def delete_week_data(project_id: str, week: int):
    """删除指定项目的指定周数据"""
    logger.info(f"开始删除项目 {project_id} 的第 {week} 周数据")

    try:
        # 检查项目是否存在
        project = data_manager.get_project(project_id)
        if not project:
            logger.warning(f"项目 {project_id} 不存在")
            raise HTTPException(status_code=404, detail="项目不存在")

        # 检查周数据是否存在
        if week not in project.weeks:
            logger.warning(f"项目 {project_id} 的第 {week} 周数据不存在")
            raise HTTPException(status_code=404, detail=f"第{week}周数据不存在")

        # 删除周数据
        success = data_manager.delete_week_data(project_id, week)
        if not success:
            raise HTTPException(status_code=500, detail="删除失败")

        logger.info(f"项目 {project_id} 的第 {week} 周数据删除成功")
        return {
            "success": True,
            "message": f"第{week}周数据已删除"
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"删除周数据失败: {str(e)}")
        logger.error(f"错误详情: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"删除失败: {str(e)}")

# 挂载前端文件（必须在所有API路由之后）
# 在开发环境中禁用缓存，确保每次都获取最新内容
class NoCacheStaticFiles(StarletteStaticFiles):
    async def get_response(self, path, scope):
        response = await super().get_response(path, scope)
        # 开发环境禁用缓存
        response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
        response.headers["Pragma"] = "no-cache"
        response.headers["Expires"] = "0"
        return response

# 自动检测前端目录路径（支持本地开发和Docker部署）
import os
frontend_paths = ["../frontend", "./frontend", "/app/frontend"]
frontend_dir = None

for path in frontend_paths:
    if os.path.exists(path):
        frontend_dir = path
        break

if not frontend_dir:
    raise RuntimeError("Frontend directory not found. Checked paths: " + ", ".join(frontend_paths))

app.mount("/", NoCacheStaticFiles(directory=frontend_dir, html=True), name="frontend")

if __name__ == "__main__":
    import uvicorn
    import os
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))
    uvicorn.run(app, host=host, port=port)

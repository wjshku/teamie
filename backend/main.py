from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, JSONResponse
from starlette.staticfiles import StaticFiles as StarletteStaticFiles
import os
import json
import logging
import traceback
from typing import Optional, List
from datetime import datetime
from dotenv import load_dotenv

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
data_manager = DataManager()
ai_analyzer = AIAnalyzer()

@app.get("/api/")
async def api_root():
    """API健康检查"""
    return {"message": "Teamie API is running", "version": "1.0.0"}

@app.post("/api/upload", response_model=UploadResponse)
async def upload_file(
    file: UploadFile = File(...),
    project_name: str = Form(...),
    week_start_date: str = Form(...)
):
    """上传并分析Notion HTML文件"""
    logger.info(f"开始上传文件: {file.filename}, 项目名称: {project_name}")

    try:
        # 读取文件内容
        logger.info("正在读取文件内容...")
        content = await file.read()
        html_content = content.decode('utf-8')
        logger.info(f"文件内容读取成功，大小: {len(html_content)} 字符")

        # 创建项目
        logger.info(f"正在创建项目: {project_name}")
        project_id = data_manager.create_project(project_name)
        logger.info(f"项目创建成功，ID: {project_id}")

        # 分析HTML内容生成报告
        logger.info("正在分析HTML内容...")
        week_data = ai_analyzer.analyze_html_content(project_id, html_content)
        logger.info("HTML内容分析完成")

        # 设置周期间隔（基于用户选择的日期）
        if week_start_date:
            from datetime import datetime, timedelta
            start_date = datetime.fromisoformat(week_start_date)
            end_date = start_date + timedelta(days=6)  # 周一到周日
            week_data.week_period = f"{start_date.strftime('%Y-%m-%d')} 至 {end_date.strftime('%Y-%m-%d')}"
            logger.info(f"设置周期间隔: {week_data.week_period}")

        # 保存第一周数据
        logger.info("正在保存第一周数据...")
        data_manager.update_week_data(project_id, 1, week_data)
        logger.info("第一周数据保存成功")

        logger.info(f"文件上传并分析成功，项目ID: {project_id}")
        return UploadResponse(
            success=True,
            message="文件上传并分析成功",
            project_id=project_id
        )

    except Exception as e:
        logger.error(f"上传失败: {str(e)}")
        logger.error(f"错误详情: {traceback.format_exc()}")
        logger.error(f"文件信息: {file.filename}, 项目名称: {project_name}")
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

@app.post("/api/projects/{project_id}/analyze-next-week")
async def analyze_next_week(project_id: str, html_content: str):
    """分析新一周的进展"""
    logger.info(f"开始分析项目 {project_id} 的新一周进展")
    logger.debug(f"HTML内容长度: {len(html_content)} 字符")

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

        # 分析新一周数据
        new_week = current_week + 1
        logger.info(f"正在分析第 {new_week} 周的数据")
        week_data = ai_analyzer.analyze_html_content(project_id, html_content, previous_week_plan)
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
        logger.error(f"项目ID: {project_id}, HTML内容长度: {len(html_content)}")
        raise HTTPException(status_code=500, detail=f"分析失败: {str(e)}")

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

app.mount("/", NoCacheStaticFiles(directory="../frontend", html=True), name="frontend")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

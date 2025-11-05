import json
import os
import logging
from typing import Dict, List, Optional
from datetime import datetime
from models import Project, WeekData, ProjectSummary

logger = logging.getLogger(__name__)

class DataManager:
    def __init__(self, data_dir: str = "data"):
        self.data_dir = data_dir
        os.makedirs(data_dir, exist_ok=True)
        self.projects_file = os.path.join(data_dir, "projects.json")

    def _load_projects(self) -> Dict[str, Project]:
        """加载所有项目数据"""
        if not os.path.exists(self.projects_file):
            return {}

        try:
            with open(self.projects_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
                projects = {}
                for project_id, project_data in data.items():
                    projects[project_id] = Project(**project_data)
                return projects
        except Exception as e:
            print(f"Error loading projects: {e}")
            return {}

    def _save_projects(self, projects: Dict[str, Project]):
        """保存所有项目数据"""
        try:
            data = {}
            for project_id, project in projects.items():
                data[project_id] = project.dict()

            with open(self.projects_file, 'w', encoding='utf-8') as f:
                json.dump(data, f, ensure_ascii=False, indent=2, default=str)
        except Exception as e:
            print(f"Error saving projects: {e}")

    def create_project(self, name: str, initial_data: Optional[WeekData] = None) -> str:
        """创建新项目"""
        projects = self._load_projects()
        project_id = f"project_{len(projects) + 1}"
        project = Project(
            id=project_id,
            name=name,
            weeks={1: initial_data or WeekData()}
        )
        projects[project_id] = project
        self._save_projects(projects)
        return project_id

    def get_project(self, project_id: str) -> Optional[Project]:
        """获取项目"""
        projects = self._load_projects()
        return projects.get(project_id)

    def update_week_data(self, project_id: str, week: int, data: WeekData):
        """更新周数据"""
        projects = self._load_projects()
        if project_id not in projects:
            return False

        projects[project_id].weeks[week] = data
        projects[project_id].updated_at = datetime.now()
        self._save_projects(projects)
        return True

    def get_week_data(self, project_id: str, week: int) -> Optional[WeekData]:
        """获取周数据"""
        project = self.get_project(project_id)
        if not project:
            return None
        return project.weeks.get(week)

    def get_all_projects(self) -> List[ProjectSummary]:
        """获取所有项目摘要"""
        projects = self._load_projects()
        summaries = []

        for project in projects.values():
            current_week = max(project.weeks.keys()) if project.weeks else 1

            summaries.append(ProjectSummary(
                id=project.id,
                name=project.name,
                current_week=current_week,
                status=project.status,
                total_weeks=len(project.weeks)
            ))

        return summaries

    def update_project_status(self, project_id: str, status: str) -> bool:
        """更新项目状态"""
        projects = self._load_projects()
        if project_id not in projects:
            return False

        projects[project_id].status = status
        projects[project_id].updated_at = datetime.now()
        self._save_projects(projects)
        return True

    def delete_week_data(self, project_id: str, week: int) -> bool:
        """删除指定项目的指定周数据"""
        projects = self._load_projects()
        if project_id not in projects:
            return False

        project = projects[project_id]
        
        # 删除周数据
        if week in project.weeks:
            del project.weeks[week]
            
            # 更新更新时间
            project.updated_at = datetime.now()
            
            # 保存更新后的项目数据
            self._save_projects(projects)
            
            # 删除该周的文件目录
            import shutil
            week_dir = os.path.join(self.data_dir, project_id, f"week_{week}")
            if os.path.exists(week_dir):
                shutil.rmtree(week_dir)
            
            return True
        
        return False

    def delete_project(self, project_id: str) -> bool:
        """删除项目"""
        projects = self._load_projects()
        if project_id not in projects:
            return False

        # 删除项目
        del projects[project_id]

        # 保存更新后的项目数据
        self._save_projects(projects)

        # 删除相关的项目目录（包含所有文件）
        import shutil
        project_dir = os.path.join(self.data_dir, project_id)
        if os.path.exists(project_dir):
            shutil.rmtree(project_dir)

        return True

    def _clean_filename(self, filename: str) -> str:
        """清理Notion文件名，去掉ID部分，支持 html/txt/md 格式"""
        if not filename:
            return "content.html"

        # 获取文件扩展名
        import re
        ext_match = re.search(r'\.(html?|txt|md)$', filename.lower())
        file_ext = ext_match.group(1) if ext_match else 'html'
        
        # 去掉扩展名
        name = re.sub(r'\.(html?|txt|md)$', '', filename, flags=re.IGNORECASE)

        # Notion文件名通常包含32位十六进制ID，我们需要去掉这些ID
        id_pattern = r'[a-f0-9]{32}'  # 匹配32位十六进制ID
        name = re.sub(id_pattern, '', name, flags=re.IGNORECASE).strip()

        # 清理多余的空格
        name = re.sub(r'\s+', ' ', name).strip()

        # 如果清理后文件名太短，使用默认名称
        if not name or len(name) < 2:
            name = "未命名文档"

        # 重新添加原扩展名
        if file_ext == 'htm':
            file_ext = 'html'
        name = name + f'.{file_ext}'

        return name

    def save_file_content(self, project_id: str, content: str, filename: str = None, week: int = 1, relative_path: str = None):
        """保存文件内容（支持 html/txt/md）用于后续分析，支持文件夹结构"""
        # 创建分层目录结构: data/project_id/week/
        project_dir = os.path.join(self.data_dir, project_id)
        week_dir = os.path.join(project_dir, f"week_{week}")
        os.makedirs(week_dir, exist_ok=True)

        if filename:
            # 清理文件名，去掉ID部分
            cleaned_filename = self._clean_filename(filename)

            # 确保文件名是文件系统安全的
            safe_filename = "".join(c for c in cleaned_filename if c.isalnum() or c in (' ', '-', '_', '.')).rstrip()
            
            # 如果有相对路径，构建文件夹结构
            if relative_path:
                # 处理相对路径，去掉文件名部分，只保留文件夹路径
                path_parts = relative_path.replace('\\', '/').split('/')
                if len(path_parts) > 1:
                    # 有文件夹路径，去掉最后的文件名
                    folder_parts = path_parts[:-1]
                    # 清理文件夹名称，确保是文件系统安全的
                    safe_folders = []
                    for folder in folder_parts:
                        if folder and folder != '.' and folder != '..':
                            safe_folder = "".join(c for c in folder if c.isalnum() or c in (' ', '-', '_')).rstrip()
                            if safe_folder:
                                safe_folders.append(safe_folder)
                    
                    if safe_folders:
                        # 创建文件夹路径
                        folder_path = os.path.join(week_dir, *safe_folders)
                        os.makedirs(folder_path, exist_ok=True)
                        filepath = os.path.join(folder_path, safe_filename)
                    else:
                        filepath = os.path.join(week_dir, safe_filename)
                else:
                    filepath = os.path.join(week_dir, safe_filename)
            else:
                filepath = os.path.join(week_dir, safe_filename)
        else:
            # 单文件模式：使用默认文件名
            final_filename = "content.html"
            filepath = os.path.join(week_dir, final_filename)

        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)

    def get_file_content(self, project_id: str, week: int = 1) -> Optional[str]:
        """获取指定项目和周的所有文件内容（支持 html/txt/md）"""
        week_dir = os.path.join(self.data_dir, project_id, f"week_{week}")

        if not os.path.exists(week_dir):
            return None

        # 获取所有支持格式的文件
        supported_extensions = ('.html', '.htm', '.txt', '.md')
        files = [f for f in os.listdir(week_dir) 
                 if any(f.lower().endswith(ext) for ext in supported_extensions)]
        
        if not files:
            return None

        merged_content = ""
        for filename in sorted(files):  # 按文件名排序确保一致性
            filepath = os.path.join(week_dir, filename)
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                    merged_content += f"\n\n=== 文件: {filename} ===\n{content}"
            except Exception as e:
                logger.warning(f"读取文件 {filename} 失败: {str(e)}")

        return merged_content.strip()

    def get_files(self, project_id: str, week: int = 1) -> list:
        """获取指定项目和周的所有文件列表（支持 html/txt/md），返回文件夹结构"""
        week_dir = os.path.join(self.data_dir, project_id, f"week_{week}")

        if not os.path.exists(week_dir):
            return []

        supported_extensions = ('.html', '.htm', '.txt', '.md')
        
        def get_files_recursive(directory, base_path=""):
            """递归获取文件列表，保持文件夹结构"""
            files = []
            try:
                items = os.listdir(directory)
            except PermissionError:
                return files
            
            for item in sorted(items):
                item_path = os.path.join(directory, item)
                relative_path = os.path.join(base_path, item) if base_path else item
                
                if os.path.isdir(item_path):
                    # 递归处理子文件夹
                    sub_files = get_files_recursive(item_path, relative_path)
                    files.extend(sub_files)
                elif os.path.isfile(item_path):
                    # 检查文件扩展名
                    if any(item.lower().endswith(ext) for ext in supported_extensions):
                        # 统一使用 / 作为路径分隔符
                        files.append(relative_path.replace('\\', '/'))
            
            return files
        
        files = get_files_recursive(week_dir)
        return files

    def get_file_content_by_name(self, project_id: str, week: int, filename: str) -> Optional[str]:
        """获取指定项目、周和文件名的文件内容（支持 html/txt/md），支持文件夹路径"""
        week_dir = os.path.join(self.data_dir, project_id, f"week_{week}")
        # filename 可能包含文件夹路径，如 "其他文档/file.html"
        filepath = os.path.join(week_dir, filename.replace('/', os.sep))

        if not os.path.exists(filepath):
            return None

        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                return f.read()
        except Exception as e:
            logger.error(f"读取文件 {filepath} 失败: {str(e)}")
            return None

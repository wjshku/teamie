import json
import os
from typing import Dict, List, Optional
from datetime import datetime
from models import Project, WeekData, ProjectSummary

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

    def delete_project(self, project_id: str) -> bool:
        """删除项目"""
        projects = self._load_projects()
        if project_id not in projects:
            return False

        # 删除项目
        del projects[project_id]

        # 保存更新后的项目数据
        self._save_projects(projects)

        # 删除相关的HTML文件
        html_dir = os.path.join(self.data_dir, "html")
        html_file = os.path.join(html_dir, f"{project_id}_latest.html")
        if os.path.exists(html_file):
            os.remove(html_file)

        return True

    def save_html_content(self, project_id: str, html_content: str):
        """保存HTML内容用于后续分析"""
        html_dir = os.path.join(self.data_dir, "html")
        os.makedirs(html_dir, exist_ok=True)

        filename = f"{project_id}_latest.html"
        filepath = os.path.join(html_dir, filename)

        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(html_content)

    def get_html_content(self, project_id: str) -> Optional[str]:
        """获取HTML内容"""
        html_dir = os.path.join(self.data_dir, "html")
        filename = f"{project_id}_latest.html"
        filepath = os.path.join(html_dir, filename)

        if os.path.exists(filepath):
            with open(filepath, 'r', encoding='utf-8') as f:
                return f.read()
        return None

from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime

class CompletedTask(BaseModel):
    task: str
    description: str

class IncompleteTask(BaseModel):
    task: str
    expected: str
    reason: str

class ExternalFeedback(BaseModel):
    source: str
    content: str

class NextWeekPlan(BaseModel):
    task: str
    priority: str  # P0, P1, P2
    goal: str

class WeekData(BaseModel):
    week_period: Optional[str] = None
    completed_tasks: List[CompletedTask] = []
    incomplete_tasks: List[IncompleteTask] = []
    motivation_direction: List[str] = []
    internal_reflection: List[str] = []
    external_feedback: List[ExternalFeedback] = []
    next_week_plan: List[NextWeekPlan] = []

class Project(BaseModel):
    id: str
    name: str
    status: str = "进行中"
    created_at: datetime = datetime.now()
    updated_at: datetime = datetime.now()
    weeks: Dict[int, WeekData] = {}

class ProjectSummary(BaseModel):
    id: str
    name: str
    current_week: int
    status: str
    total_weeks: int

class UploadResponse(BaseModel):
    success: bool
    message: str
    project_id: Optional[str] = None
    file_count: Optional[int] = None
    token_count: Optional[int] = None
    estimated_time_seconds: Optional[float] = None

class ReportResponse(BaseModel):
    success: bool
    message: str
    data: Optional[WeekData] = None

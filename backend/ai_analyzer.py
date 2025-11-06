import os
import json
import logging
import re
from typing import Optional, Dict, Any
import openai
from dotenv import load_dotenv
from models import WeekData, NextWeekPlan
from data_manager import DataManager
from config import get_current_model

logger = logging.getLogger(__name__)

class AIAnalyzer:
    def __init__(self):
        self.data_manager = DataManager()
        self._initialized = False

    def _ensure_initialized(self):
        """确保OpenAI API key已配置"""
        if not self._initialized:
            logger.info("正在初始化OpenAI配置")
            # 加载环境变量
            load_dotenv()

            api_key = os.getenv("OPENAI_API_KEY")
            logger.debug(f"API Key环境变量状态: {'设置' if api_key else '未设置'}")

            if not api_key or api_key == "your_openai_api_key_here":
                logger.error("OpenAI API key未正确配置")
                logger.error("请在.env文件中设置OPENAI_API_KEY")
                logger.error("从 https://platform.openai.com/api-keys 获取API key")
                raise ValueError(
                    "OpenAI API key is not configured. "
                    "Please set OPENAI_API_KEY in your .env file. "
                    "Get your API key from: https://platform.openai.com/api-keys"
                )

            openai.api_key = api_key
            logger.info("OpenAI配置初始化成功")
            self._initialized = True

    def _load_prompt(self) -> str:
        """加载分析prompt"""
        prompt_path = os.path.join(os.path.dirname(__file__), "prompt.txt")
        with open(prompt_path, 'r', encoding='utf-8') as f:
            return f.read()

    def _extract_text_from_html(self, html_content: str) -> str:
        """从HTML中提取文本内容（简化版）"""
        from bs4 import BeautifulSoup

        try:
            soup = BeautifulSoup(html_content, 'html.parser')

            # 移除script和style标签
            for script in soup(["script", "style"]):
                script.decompose()

            # 获取文本内容
            text = soup.get_text()

            # 清理空白字符
            lines = (line.strip() for line in text.splitlines())
            chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
            text = ' '.join(chunk for chunk in chunks if chunk)

            return text
        except Exception as e:
            logger.error(f"从HTML提取文本时发生错误: {str(e)}")
            logger.warning("返回原始HTML内容作为后备")
            return html_content

    def _extract_text_from_file(self, content: str, filename: str) -> str:
        """根据文件扩展名提取文本内容（支持 html/txt/md）"""
        filename_lower = filename.lower()
        
        if filename_lower.endswith(('.html', '.htm')):
            # HTML文件：使用BeautifulSoup提取文本
            return self._extract_text_from_html(content)
        elif filename_lower.endswith(('.txt', '.md')):
            # TXT和MD文件：直接使用原始内容
            return content
        else:
            # 未知格式：尝试作为HTML处理，如果失败则返回原始内容
            logger.warning(f"未知文件格式: {filename}，尝试作为HTML处理")
            try:
                return self._extract_text_from_html(content)
            except:
                return content

    def _extract_json_from_text(self, text: str) -> str:
        """从AI响应文本中智能提取JSON内容"""
        logger.debug(f"开始提取JSON，原始文本长度: {len(text)}")

        try:
            # 方法1: 查找```json代码块
            json_pattern = r'```json\s*(\{.*?\})\s*```'
            match = re.search(json_pattern, text, re.DOTALL)
            if match:
                logger.debug("使用方法1提取JSON（```json代码块）")
                return match.group(1).strip()

            # 方法2: 查找独立的JSON对象（从第一个{到最后一个}）
            start_idx = text.find('{')
            if start_idx != -1:
                logger.debug(f"使用方法2提取JSON（大括号匹配），起始位置: {start_idx}")
                brace_count = 0
                end_idx = start_idx

                for i, char in enumerate(text[start_idx:], start_idx):
                    if char == '{':
                        brace_count += 1
                    elif char == '}':
                        brace_count -= 1
                        if brace_count == 0:
                            end_idx = i
                            break

                if brace_count == 0 and end_idx > start_idx:
                    json_str = text[start_idx:end_idx + 1]
                    logger.debug(f"提取的JSON字符串长度: {len(json_str)}")
                    # 验证是否是有效的JSON
                    try:
                        json.loads(json_str)
                        logger.debug("JSON验证成功")
                        return json_str
                    except json.JSONDecodeError as e:
                        logger.debug(f"JSON验证失败: {e}")

            # 方法3: 如果以上都不行，尝试清理文本并查找JSON
            logger.debug("使用方法3提取JSON（文本清理）")
            # 移除常见的说明文字
            cleaned_text = re.sub(r'^[^\{]*', '', text, flags=re.MULTILINE)
            cleaned_text = re.sub(r'[^\}]*$', '', cleaned_text, flags=re.MULTILINE)

            if cleaned_text.strip():
                logger.debug(f"清理后的文本长度: {len(cleaned_text)}")
                try:
                    json.loads(cleaned_text)
                    logger.debug("清理后的JSON验证成功")
                    return cleaned_text
                except json.JSONDecodeError as e:
                    logger.debug(f"清理后的JSON验证失败: {e}")

            # 如果都失败了，返回原始文本
            logger.warning("无法从AI响应中提取有效的JSON，返回原始文本")
            logger.debug(f"返回原始文本前200字符: {text[:200]}")
            return text

        except Exception as e:
            logger.error(f"JSON提取过程中发生错误: {str(e)}")
            return text

    def analyze_html_contents(self, project_id: str, file_contents: list, previous_week_plan: Optional[list] = None) -> Dict[str, Any]:
        """分析多个文件内容生成周报（支持 html/txt/md），返回包含WeekData和统计信息的字典"""
        logger.info(f"开始分析项目 {project_id} 的 {len(file_contents)} 个文件")

        # 提取所有文件的文本内容并合并
        merged_text_content = ""
        file_summaries = []

        for i, file_item in enumerate(file_contents):
            filename = file_item['filename']
            content = file_item['content']
            file_summaries.append(f"文件 {i+1}: {filename} ({len(content)} 字符)")

            # 根据文件格式提取文本
            text_content = self._extract_text_from_file(content, filename)
            merged_text_content += f"\n\n=== 文件: {filename} ===\n{text_content}"

        logger.info(f"文件摘要: {', '.join(file_summaries)}")
        logger.debug(f"合并后总文本内容长度: {len(merged_text_content)} 字符")

        # 使用原有的单文件分析逻辑
        return self.analyze_html_content(project_id, merged_text_content, previous_week_plan)

    def analyze_html_content(self, project_id: str, text_content: str, previous_week_plan: Optional[list] = None) -> Dict[str, Any]:
        """分析文本内容生成周报（text_content 应该是已提取的纯文本），返回包含WeekData和统计信息的字典"""
        logger.info(f"开始分析项目 {project_id} 的文本内容")
        logger.debug(f"文本内容长度: {len(text_content)} 字符")

        # 加载prompt
        logger.info("正在加载系统提示词")
        system_prompt = self._load_prompt()
        logger.debug(f"系统提示词长度: {len(system_prompt)} 字符")

        # 构建用户prompt
        user_prompt = f"本周文档内容：\n{text_content}\n\n"

        if previous_week_plan:
            logger.info("检测到上一周计划数据，正在添加到提示词")
            # 将上周的next_week_plan转换为JSON格式
            previous_data = {
                "next_week_plan": [
                    {
                        "task": plan.task,
                        "priority": plan.priority,
                        "goal": plan.goal
                    } for plan in previous_week_plan
                ]
            }
            user_prompt += f"上周进展汇报（JSON 格式）：\n{json.dumps(previous_data, ensure_ascii=False, indent=2)}\n"
        else:
            logger.info("这是首次汇报，没有上一周数据")
            user_prompt += "这是首次汇报，没有上周数据。\n"

        # 计算prompt的总长度（字符数）
        total_prompt_length = len(system_prompt) + len(user_prompt)
        logger.info(f"发送给AI的总prompt长度: {total_prompt_length} 字符")

        try:
            logger.info("正在调用OpenAI API进行分析")
            self._ensure_initialized()

            # 从配置文件获取当前使用的模型
            current_model = get_current_model()
            logger.info(f"使用模型: {current_model}")

            if current_model == "gpt-5-nano":
                response = openai.ChatCompletion.create(
                    model=current_model,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt}
                    ],
                    max_completion_tokens=6000
                )
            else:
                response = openai.ChatCompletion.create(
                    model=current_model,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt}
                    ],
                    max_tokens=6000
                )

            result_text = response.choices[0].message.content.strip()
            logger.info("OpenAI API调用成功")
            logger.debug(f"API响应长度: {len(result_text)} 字符")

            # 获取token使用统计
            usage = response.get('usage', {})
            prompt_tokens = usage.get('prompt_tokens', 0)
            completion_tokens = usage.get('completion_tokens', 0)
            total_tokens = usage.get('total_tokens', 0)

            logger.info(f"OpenAI API token使用统计: prompt={prompt_tokens}, completion={completion_tokens}, total={total_tokens}")

            # 尝试解析JSON
            try:
                # 清理可能的前后缀和说明文字
                cleaned_text = self._extract_json_from_text(result_text)
                result_data = json.loads(cleaned_text)
                logger.info("JSON解析成功")

                # 转换为WeekData对象
                week_data = WeekData(**result_data)
                logger.info("WeekData对象创建成功")

                # 返回包含WeekData和统计信息的字典
                return {
                    'week_data': week_data,
                    'prompt_length': total_prompt_length,
                    'prompt_tokens': prompt_tokens,
                    'completion_tokens': completion_tokens,
                    'total_tokens': total_tokens
                }

            except json.JSONDecodeError as e:
                logger.error(f"JSON解析错误: {e}")
                logger.error(f"清理后的内容: {cleaned_text[:500]}...")
                logger.error(f"原始响应内容前200字符: {result_text[:200]}...")
                logger.error(f"原始响应内容后200字符: {result_text[-200:]}...")
                # 返回默认数据
                logger.warning("JSON解析失败，返回默认的WeekData对象")
                return {
                    'week_data': WeekData(),
                    'prompt_length': total_prompt_length,
                    'prompt_tokens': prompt_tokens,
                    'completion_tokens': completion_tokens,
                    'total_tokens': total_tokens
                }

        except Exception as e:
            logger.error(f"调用OpenAI API时发生错误: {str(e)}")
            logger.error(f"错误详情: {type(e).__name__}")
            import traceback
            logger.error(f"完整堆栈跟踪: {traceback.format_exc()}")
            logger.warning("返回默认的WeekData对象")
            return {
                'week_data': WeekData(),
                'prompt_length': 0,
                'prompt_tokens': 0,
                'completion_tokens': 0,
                'total_tokens': 0
            }

    def update_week_data_with_plan(self, week_data: WeekData, next_week_plan: list) -> WeekData:
        """用用户输入的next_week_plan更新周数据"""
        try:
            plans = []
            for plan in next_week_plan:
                if isinstance(plan, dict):
                    plans.append(NextWeekPlan(**plan))
                elif isinstance(plan, str):
                    # 如果是字符串，尝试解析为JSON
                    plan_dict = json.loads(plan)
                    plans.append(NextWeekPlan(**plan_dict))

            week_data.next_week_plan = plans
            return week_data

        except Exception as e:
            print(f"Error updating week data with plan: {e}")
            return week_data

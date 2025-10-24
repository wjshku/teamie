"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateMeetingCapsule = generateMeetingCapsule;
exports.generateMeetingSuggestions = generateMeetingSuggestions;
exports.generateCapsuleFromTranscript = generateCapsuleFromTranscript;
const openai_1 = __importDefault(require("openai"));
const openai = new openai_1.default({
    apiKey: process.env.OPENAI_API_KEY || '',
});
async function generateMeetingCapsule(request) {
    const { meetingTitle, objective, questions, notes, summary, feedbacks, actionItems } = request;
    if (!process.env.OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY is not configured');
    }
    // Build context from meeting data
    let contextText = `Meeting Title: ${meetingTitle}\n\n`;
    if (objective) {
        contextText += `Objective: ${objective}\n\n`;
    }
    if (questions && questions.length > 0) {
        contextText += `Questions Discussed:\n${questions.map(q => `- ${q.content} (${q.author})`).join('\n')}\n\n`;
    }
    if (notes && notes.length > 0) {
        contextText += `Meeting Notes:\n${notes.map(n => `- ${n.content} (${n.author})`).join('\n')}\n\n`;
    }
    if (summary) {
        contextText += `Post-Meeting Summary: ${summary}\n\n`;
    }
    if (feedbacks && feedbacks.length > 0) {
        contextText += `Feedback:\n${feedbacks.map(f => `- ${f.content} (${f.author})`).join('\n')}\n\n`;
    }
    if (actionItems && actionItems.length > 0) {
        contextText += `Action Items:\n${actionItems.map(a => `- ${a.content} (${a.responsible}, due: ${a.deadline})`).join('\n')}\n\n`;
    }
    const prompt = `You are a helpful assistant that creates concise meeting capsules. Based on the following meeting information, create a concise capsule that captures the essence of the meeting.

${contextText}

Provide a comprehensive summary (2-4 sentences) that captures the main outcomes and decisions, and 3-7 key points that highlight the most important takeaways, decisions, or action items.

Format your response as JSON with this structure:
{
  "summary": "your summary here",
  "keyPoints": ["point 1", "point 2", "point 3", ...]
}`;
    try {
        const response = await openai.responses.create({
            model: 'gpt-5-nano',
            input: prompt,
            text: { format: { type: 'text' } },
        });
        // Extract text from GPT-5 response structure
        let outputText = '';
        if (response.output) {
            for (const item of response.output) {
                if (item.content) {
                    for (const content of item.content) {
                        if (content.text) {
                            outputText += content.text;
                        }
                    }
                }
            }
        }
        const parsed = JSON.parse(outputText);
        return {
            summary: parsed.summary || 'Meeting summary unavailable',
            keyPoints: parsed.keyPoints || [],
        };
    }
    catch (error) {
        console.error('OpenAI API error:', error);
        throw new Error('Failed to generate capsule using AI');
    }
}
async function generateMeetingSuggestions(request) {
    const { capsules, currentObjective } = request;
    if (!process.env.OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY is not configured');
    }
    // Build context from capsules
    const contextText = capsules.map((capsule, index) => `
Meeting ${index + 1}: ${capsule.title}
Summary: ${capsule.summary}
Key Points:
${capsule.keyPoints.map(p => `- ${p}`).join('\n')}
  `).join('\n\n');
    const currentObjectiveText = currentObjective
        ? `\n\nCurrent Meeting Objective (to be optimized):\n${currentObjective}\n`
        : '';
    const prompt = `You are a helpful assistant. Based on the following past meeting summaries${currentObjective ? ' and the current meeting objective' : ''}, ${currentObjective ? 'optimize and improve the meeting objective and suggest' : 'suggest a meeting objective and'} 3-5 relevant questions for this meeting.

${contextText}${currentObjectiveText}

Provide:
1. ${currentObjective ? 'An improved and more specific meeting objective that builds on the current one' : 'A clear, concise meeting objective'} (1-2 sentences)
2. 3-5 specific, actionable questions that should be addressed in the meeting${currentObjective ? ', taking into account the objective' : ''}

Format your response as JSON:
{
  "objective": "your ${currentObjective ? 'optimized' : 'suggested'} objective here",
  "questions": ["question 1", "question 2", "question 3", ...]
}`;
    try {
        const response = await openai.responses.create({
            model: 'gpt-5-nano',
            input: prompt,
            text: { format: { type: 'text' } },
        });
        // Extract text from GPT-5 response structure
        let outputText = '';
        if (response.output) {
            for (const item of response.output) {
                if (item.content) {
                    for (const content of item.content) {
                        if (content.text) {
                            outputText += content.text;
                        }
                    }
                }
            }
        }
        const parsed = JSON.parse(outputText);
        return {
            objective: parsed.objective || 'Follow-up meeting to discuss previous topics',
            questions: parsed.questions || [],
        };
    }
    catch (error) {
        console.error('OpenAI API error:', error);
        throw new Error('Failed to generate suggestions using AI');
    }
}
async function generateCapsuleFromTranscript(request) {
    const { title, content } = request;
    if (!process.env.OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY is not configured');
    }
    const prompt = `You are a helpful assistant that creates meeting capsules from meeting transcripts.

Meeting Title: ${title}

Transcript:
${content}

Analyze this meeting transcript and create a capsule with:
1. A comprehensive summary (2-4 sentences) capturing the main discussion points and outcomes
2. 3-7 key points highlighting the most important topics, decisions, or action items

Format your response as JSON:
{
  "summary": "your summary here",
  "keyPoints": ["point 1", "point 2", "point 3", ...]
}`;
    try {
        const response = await openai.responses.create({
            model: 'gpt-5-nano',
            input: prompt,
            text: { format: { type: 'text' } },
        });
        // Extract text from GPT-5 response structure
        let outputText = '';
        if (response.output) {
            for (const item of response.output) {
                if (item.content) {
                    for (const content of item.content) {
                        if (content.text) {
                            outputText += content.text;
                        }
                    }
                }
            }
        }
        const parsed = JSON.parse(outputText);
        return {
            summary: parsed.summary || 'Imported meeting summary',
            keyPoints: parsed.keyPoints || [],
        };
    }
    catch (error) {
        console.error('OpenAI API error:', error);
        throw new Error('Failed to generate capsule from transcript using AI');
    }
}
//# sourceMappingURL=aiService.js.map
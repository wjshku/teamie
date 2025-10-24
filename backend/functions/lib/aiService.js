"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateMeetingSuggestions = generateMeetingSuggestions;
const openai_1 = __importDefault(require("openai"));
const openai = new openai_1.default({
    apiKey: process.env.OPENAI_API_KEY || '',
});
async function generateMeetingSuggestions(request) {
    var _a, _b;
    const { capsules } = request;
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
    const prompt = `Based on the following past meeting summaries, suggest a meeting objective and 3-5 relevant questions for a follow-up meeting.

${contextText}

Please provide:
1. A clear, concise meeting objective (1-2 sentences)
2. 3-5 specific questions that should be addressed in the follow-up meeting

Format your response as JSON:
{
  "objective": "your suggested objective here",
  "questions": ["question 1", "question 2", "question 3", ...]
}`;
    try {
        const completion = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                {
                    role: 'system',
                    content: 'You are a helpful assistant that suggests meeting objectives and questions based on previous meeting context.',
                },
                {
                    role: 'user',
                    content: prompt,
                },
            ],
            temperature: 0.7,
            max_tokens: 500,
            response_format: { type: 'json_object' },
        });
        const responseText = ((_b = (_a = completion.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content) || '{}';
        const parsed = JSON.parse(responseText);
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
//# sourceMappingURL=aiService.js.map
export interface GenerateSuggestionsRequest {
    capsules: Array<{
        title: string;
        summary: string;
        keyPoints: string[];
    }>;
    currentObjective?: string;
}
export interface GenerateSuggestionsResponse {
    objective: string;
    questions: string[];
}
export interface GenerateCapsuleRequest {
    meetingTitle: string;
    objective?: string;
    questions?: Array<{
        content: string;
        author: string;
    }>;
    notes?: Array<{
        content: string;
        author: string;
    }>;
    summary?: string;
    feedbacks?: Array<{
        content: string;
        author: string;
    }>;
    actionItems?: Array<{
        content: string;
        responsible: string;
        deadline: string;
    }>;
}
export interface GenerateCapsuleResponse {
    summary: string;
    keyPoints: string[];
}
export declare function generateMeetingCapsule(request: GenerateCapsuleRequest): Promise<GenerateCapsuleResponse>;
export declare function generateMeetingSuggestions(request: GenerateSuggestionsRequest): Promise<GenerateSuggestionsResponse>;
export interface ImportTranscriptRequest {
    title: string;
    content: string;
}
export declare function generateCapsuleFromTranscript(request: ImportTranscriptRequest): Promise<GenerateCapsuleResponse>;
//# sourceMappingURL=aiService.d.ts.map
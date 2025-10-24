export interface GenerateSuggestionsRequest {
    capsules: Array<{
        title: string;
        summary: string;
        keyPoints: string[];
    }>;
}
export interface GenerateSuggestionsResponse {
    objective: string;
    questions: string[];
}
export declare function generateMeetingSuggestions(request: GenerateSuggestionsRequest): Promise<GenerateSuggestionsResponse>;
//# sourceMappingURL=aiService.d.ts.map
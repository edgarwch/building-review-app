export interface AIService {
  summarize(submission: {
    templateName: string;
    items: { tool: string; details: string }[];
  }): Promise<string>;
}

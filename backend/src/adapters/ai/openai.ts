import { AIService } from './interface.js';
import { config } from '../../config.js';

export class OpenAIService implements AIService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = config.openaiApiKey;
    this.baseUrl = 'https://api.openai.com/v1';
  }

  async summarize(submission: { templateName: string; items: { tool: string; details: string }[] }): Promise<string> {
    const itemsText = submission.items
      .map(i => `- ${i.tool}: ${i.details}`)
      .join('\n');

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a construction safety inspector. Summarize inspection findings concisely. Focus on safety issues and compliance. Keep it under 150 words.',
          },
          {
            role: 'user',
            content: `Summarize this "${submission.templateName}" inspection:\n\n${itemsText}`,
          },
        ],
        max_tokens: 200,
        temperature: 0.5,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json() as { choices: Array<{ message: { content: string } }> };
    return data.choices[0].message.content.trim();
  }
}

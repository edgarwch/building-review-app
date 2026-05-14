import { config } from '../../config.js';
import { AIService } from './interface.js';
import { OpenAIService } from './openai.js';

let aiService: AIService | null = null;

export function getAIService(): AIService | null {
  if (!config.openaiApiKey) return null;
  if (!aiService) aiService = new OpenAIService();
  return aiService;
}

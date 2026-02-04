import { ChatOpenAI } from '@langchain/openai';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class LlmFactory {
  constructor(private readonly config: ConfigService) {}

  getLLM(options?: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  }) {
    return new ChatOpenAI({
      model: options?.model ?? 'nvidia/llama-3.3-nemotron-super-49b-v1.5',
      temperature: options?.temperature ?? 0.2,
      maxTokens: options?.maxTokens ?? 4096,
      apiKey: this.config.get('NIM_API_KEY'),
      configuration: {
        baseURL: 'https://integrate.api.nvidia.com/v1',
      },
    });
  }
}

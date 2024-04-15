import OpenAI from 'openai';
import { Config } from 'sst/node/config';

enum Models {
  GPT4 = 'gpt-4-1106-preview',
  GPT3 = 'gpt-3.5-turbo',
  GPT3_16k = 'gpt-3.5-turbo-0613',
}

const DEFAULT_MODEL = Models.GPT3_16k;

export class OpenAiAdapter {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({ apiKey: Config.OPENAI_API_KEY });
  }

  async listModels() {
    const models = await this.client.models.list();
    return models;
  }

  async submitPrompt(prompt: string, model = DEFAULT_MODEL): Promise<string> {
    console.info(`Submitting prompt: ${prompt.substring(0, 50)}...`);
    const chatCompletion = await this.client.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model,
      stream: false,
    });
    const result = chatCompletion.choices[0].message.content;
    console.info(`Result received: ${result?.substring(0, 50)}...`);
    return result!;
  }
}

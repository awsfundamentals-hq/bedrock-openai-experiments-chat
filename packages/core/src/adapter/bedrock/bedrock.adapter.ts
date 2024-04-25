import { BedrockClient, ListFoundationModelsCommand } from '@aws-sdk/client-bedrock';
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { Exception } from '../../utils/exception';
import { ChatsEntity } from '../database/model/chats';

const client = new BedrockClient({ region: 'us-east-1' });
const runtimeClient = new BedrockRuntimeClient({ region: 'us-east-1' });

enum Models {
  TITAN_EXPRESS_V1 = 'amazon.titan-text-express-v1',
}

const DEFAULT_MODEL = Models.TITAN_EXPRESS_V1;

export class BedrockAdapter {
  async listModels() {
    const command = new ListFoundationModelsCommand({});
    const response = await client.send(command);
    const models = response.modelSummaries ?? [];
    return (
      models
        // only include active models
        .filter((m) => m.modelLifecycle?.status === 'ACTIVE')
        // only include models that have the input modality TEXT
        .filter((m) => m.inputModalities?.includes('TEXT'))
        // only include models that have the output modality TEXT
        .filter((m) => m.outputModalities?.includes('TEXT'))
        .map(({ modelArn, modelId: id, modelName }) => ({
          modelArn,
          id,
          modelName,
        }))
    );
  }

  async submitPrompt(content: string, previousMessages: ChatsEntity[], model = DEFAULT_MODEL): Promise<string> {
    console.info(`Submitting prompt: ${content.substring(0, 50)}...`);
    const { body, responseExtract } = this.buildRequest(model, content, previousMessages);
    try {
      const { body: res } = await runtimeClient.send(
        new InvokeModelCommand({
          modelId: model,
          contentType: 'application/json',
          accept: 'application/json',
          body,
        }),
      );
      const response = JSON.parse(new TextDecoder().decode(res));
      console.info(`Results received:\n\n${JSON.stringify(response, null, 2)}`);
      return responseExtract(response);
    } catch (e) {
      console.error(`Error submitting prompt: ${e}`);
      throw new Exception('Error from Bedrock', 500, e);
    }
  }

  private buildRequest(
    model: string,
    content: string,
    previousMessages: ChatsEntity[],
  ): {
    body: string;
    responseExtract: (data: any) => string;
  } {
    // other models have different inputs
    // => https://docs.aws.amazon.com/bedrock/latest/userguide/model-parameters.html
    if (model.startsWith('amazon')) {
      const inputText = [
        ...previousMessages.map(({ content, role }) => {
          const prefix = role === 'user' ? 'User: ' : 'Assistant: ';
          return `\n\n${prefix}${content}`;
        }),
        `User: ${content}\n\nAssistant: `,
      ].join('\n\n');
      console.info(`-------------------------`);
      console.info(`Prompt:\n${inputText}`);
      console.info(`-------------------------`);
      return {
        responseExtract: (data) => data.results?.[0]?.outputText,
        body: JSON.stringify({
          inputText,
          textGenerationConfig: {
            temperature: 0.5,
            topP: 1,
            maxTokenCount: 300,
            stopSequences: ['User:'],
          },
        }),
      };
    } else if (model.startsWith('anthropic')) {
      const prompt = [
        ...previousMessages.map(({ content, role }) => {
          const prefix = role === 'user' ? 'Human: ' : 'Assistant: ';
          return `\n\n${prefix}${content}`;
        }),
        `Human: ${content}\n\nAssistant: `,
      ].join('\n\n');
      console.info(`-------------------------`);
      console.info(`Prompt:\n${prompt}`);
      console.info(`-------------------------`);
      return {
        responseExtract: (data) => data.completion,
        body: JSON.stringify({
          prompt,
          temperature: 0.5,
          top_p: 1,
          top_k: 250,
          max_tokens_to_sample: 300,
        }),
      };
    } else if (model.startsWith('mistral')) {
      const prompt = [
        ...previousMessages.map(({ content, role }) => {
          if (role === 'user') {
            return `<s>[INST] ${content} [/INST]`;
          } else {
            return `${content}</s>`;
          }
        }),
        `<s>[INST] ${content} [/INST]`,
      ].join('\n\n');
      console.info(`-------------------------`);
      console.info(`Prompt:\n${prompt}`);
      console.info(`-------------------------`);
      return {
        responseExtract: (data) => data.outputs?.[0]?.text,
        body: JSON.stringify({
          prompt,
          temperature: 0.5,
          max_tokens: 300,
        }),
      };
    }
    throw new Error(`Unsupported model: ${model}`);
  }
}

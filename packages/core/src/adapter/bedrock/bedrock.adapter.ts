import { BedrockClient, ListFoundationModelsCommand } from '@aws-sdk/client-bedrock';

const client = new BedrockClient({ region: 'us-east-1' });

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
        .map(({ modelArn, modelId, modelName }) => ({
          modelArn,
          modelId,
          modelName,
        }))
    );
  }
}

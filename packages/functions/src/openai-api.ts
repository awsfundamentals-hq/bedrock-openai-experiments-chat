import { OpenAiAdapter } from '@bedrock-rag/core/adapter/openai/openai.adapter';
import { checkApiKey } from '@bedrock-rag/core/utils/core';
import { ApiHandler } from 'sst/node/api';

const openAiAdapter = new OpenAiAdapter();

export const listModels = ApiHandler(async (_evt) => {
  checkApiKey(_evt);
  const response = await openAiAdapter.listModels();
  const models = response.data;
  return {
    statusCode: 200,
    body: JSON.stringify(models),
  };
});

export const submit = ApiHandler(async (evt) => {
  checkApiKey(evt);
  const { model, text: prompt } = JSON.parse(evt.body!);
  const text = await openAiAdapter.submitPrompt(prompt, model);
  return {
    statusCode: 200,
    body: JSON.stringify({ text, model }),
  };
});

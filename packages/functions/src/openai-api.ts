import { DynamoDbAdapter } from '@bedrock-rag/core/adapter/database/dynamodb.adapter';
import { OpenAiAdapter } from '@bedrock-rag/core/adapter/openai/openai.adapter';
import { checkApiKey } from '@bedrock-rag/core/utils/core';
import { ApiHandler } from 'sst/node/api';

const openAiAdapter = new OpenAiAdapter();
const dynamoDbAdapter = new DynamoDbAdapter();

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
  const { model, content: prompt } = JSON.parse(evt.body!);
  const previousMessages = await dynamoDbAdapter.listMessages();
  await dynamoDbAdapter.createMessage({ content: prompt, role: 'user' });
  const content = await openAiAdapter.submitPrompt(prompt, previousMessages, model);
  await dynamoDbAdapter.createMessage({ content: content, role: 'assistant' });
  return {
    statusCode: 200,
    body: JSON.stringify({ content, model }),
  };
});

export const getMessages = ApiHandler(async (_evt) => {
  checkApiKey(_evt);
  const messages = await dynamoDbAdapter.listMessages();
  return {
    statusCode: 200,
    body: JSON.stringify(messages),
  };
});

export const clearMessages = ApiHandler(async (evt) => {
  checkApiKey(evt);
  await dynamoDbAdapter.clearMessages();
  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'Messages cleared' }),
  };
});

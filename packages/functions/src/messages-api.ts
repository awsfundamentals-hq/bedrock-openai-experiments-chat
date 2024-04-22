import { DynamoDbAdapter } from '@bedrock-openai-experiments-chat/core/adapter/database/dynamodb.adapter';
import { toResponse } from '@bedrock-openai-experiments-chat/core/utils/core';
import { buildHandler } from '@bedrock-openai-experiments-chat/core/utils/middlewares';

const dynamoDbAdapter = new DynamoDbAdapter();

export const getMessages = buildHandler(async () => {
  const messages = await dynamoDbAdapter.listMessages();
  return toResponse({
    body: messages,
  });
});

export const clearMessages = buildHandler(async () => {
  await dynamoDbAdapter.clearMessages();
  return toResponse({
    body: { message: 'Messages cleared' },
  });
});

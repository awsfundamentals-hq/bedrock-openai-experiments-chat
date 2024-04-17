import { BedrockAdapter } from '@bedrock-rag/core/adapter/bedrock/bedrock.adapter';
import { checkApiKey, headers } from '@bedrock-rag/core/utils/core';
import { ApiHandler } from 'sst/node/api';

const bedrock = new BedrockAdapter();

export const listModels = ApiHandler(async (evt) => {
  checkApiKey(evt);

  const response = await bedrock.listModels();
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(response),
  };
});

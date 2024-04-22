import { DynamoDbAdapter } from '@bedrock-openai-experiments-chat/core/adapter/database/dynamodb.adapter';
import { ChatsEntity } from '@bedrock-openai-experiments-chat/core/adapter/database/model/chats';
import { OpenAiAdapter } from '@bedrock-openai-experiments-chat/core/adapter/openai/openai.adapter';
import { notesPrompt, toResponse } from '@bedrock-openai-experiments-chat/core/utils/core';
import { buildHandler } from '@bedrock-openai-experiments-chat/core/utils/middlewares';

const openAiAdapter = new OpenAiAdapter();
const dynamoDbAdapter = new DynamoDbAdapter();

export const listModels = buildHandler(async (_evt) => {
  const response = await openAiAdapter.listModels();
  const models = response.data;
  return toResponse({
    body: JSON.stringify(models),
  });
});

export const submit = buildHandler(async (evt) => {
  const parsedBody = JSON.parse(evt.body!);
  const { model } = parsedBody;
  let { content: prompt } = parsedBody;
  const previousMessages: ChatsEntity[] = await dynamoDbAdapter.listMessages();
  await dynamoDbAdapter.createMessage({ content: prompt, role: 'user' });
  // the oldest message always includes the notes
  const notes = await dynamoDbAdapter.list();
  console.info(`Adding ${notes.length} notes to the prompt`);
  if (previousMessages.length) {
    const oldestMessage = previousMessages[0];
    oldestMessage.content = `${notesPrompt(notes)}\n${oldestMessage.content}`;
  } else {
    prompt = `${notesPrompt(notes)}\n${prompt}`;
  }
  const content = await openAiAdapter.submitPrompt(prompt, previousMessages, model);
  await dynamoDbAdapter.createMessage({ content: content, role: 'assistant' });
  return toResponse({
    body: JSON.stringify({ content, model }),
  });
});

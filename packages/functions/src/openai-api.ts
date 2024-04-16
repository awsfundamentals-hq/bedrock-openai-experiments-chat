import { DynamoDbAdapter } from '@bedrock-rag/core/adapter/database/dynamodb.adapter';
import { ChatsEntity } from '@bedrock-rag/core/adapter/database/model/chats';
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
  const parsedBody = JSON.parse(evt.body!);
  const { model } = parsedBody;
  let { content: prompt } = parsedBody;
  const previousMessages: ChatsEntity[] = await dynamoDbAdapter.listMessages();
  await dynamoDbAdapter.createMessage({ content: prompt, role: 'user' });
  // the oldest message always includes the notes
  const notes = await dynamoDbAdapter.list();
  console.info(`Adding ${notes.length} notes to the prompt`);
  const joinedNotes =
    `These are some relevant notes I have taken. ` +
    `Please only consider using this information if it ` +
    `seems useful for the questions that I ask you.` +
    `DO NOT CONFIRM THAT you understood this. ` +
    `Continue with our chat as if ` +
    `I never provided any additional information ` +
    `in the first place: \n${notes.map(({ description, text }) => `* ${description}: ${text}`).join('\n')}`;
  if (previousMessages.length) {
    const oldestMessage = previousMessages[0];
    oldestMessage.content = `${joinedNotes}\n${oldestMessage.content}`;
  } else {
    prompt = `${joinedNotes}\n${prompt}`;
  }
  console.info(JSON.stringify(previousMessages, null, 2));
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

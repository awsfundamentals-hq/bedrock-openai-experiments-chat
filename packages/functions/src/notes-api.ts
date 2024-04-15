import { DynamoDbAdapter } from '@bedrock-rag/core/adapter/database/dynamodb-notes.adapter';
import { NotesEntity } from '@bedrock-rag/core/adapter/database/model/notes';
import { checkApiKey } from '@bedrock-rag/core/utils/core';
import { ApiHandler } from 'sst/node/api';

const notesAdapter = new DynamoDbAdapter();

export const create = ApiHandler(async (_evt) => {
  checkApiKey(_evt);
  const body = JSON.parse(_evt.body!);
  const note = await notesAdapter.create({
    description: body.description,
    text: body.text,
  });
  return {
    statusCode: 200,
    body: JSON.stringify(note),
  };
});

export const del = ApiHandler(async (_evt) => {
  checkApiKey(_evt);
  const id = _evt.pathParameters!.id;
  await notesAdapter.delete(id!);
  return {
    statusCode: 204,
    body: JSON.stringify({}),
  };
});

export const update = ApiHandler(async (_evt) => {
  checkApiKey(_evt);
  const id = _evt.pathParameters!.id;
  const entity: NotesEntity = JSON.parse(_evt.body!);
  entity.id = id!;
  const updated = await notesAdapter.update(entity);
  return {
    statusCode: 200,
    body: JSON.stringify(updated),
  };
});

export const list = ApiHandler(async (_evt) => {
  checkApiKey(_evt);
  const notes = await notesAdapter.list();
  return {
    statusCode: 200,
    body: JSON.stringify(notes),
  };
});

export const get = ApiHandler(async (_evt) => {
  checkApiKey(_evt);
  const id = _evt.pathParameters!.id!;
  const note = await notesAdapter.get(id);
  return {
    statusCode: 200,
    body: JSON.stringify(note),
  };
});

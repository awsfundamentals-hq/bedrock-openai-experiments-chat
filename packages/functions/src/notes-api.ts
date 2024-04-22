import { DynamoDbAdapter } from '@bedrock-openai-experiments-chat/core/adapter/database/dynamodb.adapter';
import { NotesEntity } from '@bedrock-openai-experiments-chat/core/adapter/database/model/notes';
import { toResponse } from '@bedrock-openai-experiments-chat/core/utils/core';
import { buildHandler } from '@bedrock-openai-experiments-chat/core/utils/middlewares';

const notesAdapter = new DynamoDbAdapter();

export const create = buildHandler(async (_evt) => {
  const body = JSON.parse(_evt.body!);
  const note = await notesAdapter.create({
    description: body.description,
    text: body.text,
  });
  return toResponse({
    body: note,
  });
});

export const del = buildHandler(async (_evt) => {
  const id = _evt.pathParameters!.id;
  await notesAdapter.delete(id!);
  return toResponse();
});

export const update = buildHandler(async (_evt) => {
  const id = _evt.pathParameters!.id;
  const entity: NotesEntity = JSON.parse(_evt.body!);
  entity.id = id!;
  const updated = await notesAdapter.update(entity);
  return toResponse({
    body: updated,
  });
});

export const list = buildHandler(async (_evt) => {
  const notes = await notesAdapter.list();
  return toResponse({
    body: notes,
  });
});

export const get = buildHandler(async (_evt) => {
  const id = _evt.pathParameters!.id!;
  const note = await notesAdapter.get(id);
  return toResponse({
    body: note,
  });
});

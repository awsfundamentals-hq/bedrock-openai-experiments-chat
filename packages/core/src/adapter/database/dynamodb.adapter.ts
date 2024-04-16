import { DateTime } from 'luxon';
import { generateUUID } from '../../utils/core';
import { ChatsEntity, ChatsModel } from './model/chats';
import { NotesEntity, NotesModel } from './model/notes';

export class DynamoDbAdapter {
  async list(): Promise<NotesEntity[]> {
    return NotesModel.scan().exec();
  }

  // ---------------------------------------------
  // NOTES ---------------------------------------

  async create(note: { description: string; text: string }): Promise<NotesEntity> {
    return NotesModel.create({ id: generateUUID(), ...note });
  }

  async update(note: NotesEntity): Promise<NotesEntity> {
    return NotesModel.update(note);
  }

  async delete(noteId: string): Promise<void> {
    return NotesModel.delete(noteId);
  }

  async get(noteId: string): Promise<NotesEntity> {
    return NotesModel.get(noteId);
  }

  // ---------------------------------------------
  // CHATS ---------------------------------------

  async createNewChat(): Promise<ChatsEntity> {
    return ChatsModel.create({ id: generateUUID() });
  }

  async listMessages(): Promise<ChatsEntity[]> {
    const messages = await ChatsModel.scan().exec();
    // sort by timestamp ascending
    messages.sort((a, b) => a.timestamp - b.timestamp);
    return messages;
  }

  async getChatMessages(chatId: string): Promise<ChatsEntity> {
    return ChatsModel.get(chatId);
  }

  async createMessage(params: { content: string; role: 'user' | 'assistant' }): Promise<ChatsEntity> {
    const message = { id: generateUUID(), ...params, timestamp: DateTime.utc().toMillis() };
    return ChatsModel.create(message);
  }

  async clearMessages(): Promise<void> {
    const allIds = await ChatsModel.scan().attributes(['id']).exec();
    await ChatsModel.batchDelete(allIds.map(({ id }) => id));
  }
}

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
    return ChatsModel.scan().exec();
  }

  async getChatMessages(chatId: string): Promise<ChatsEntity> {
    return ChatsModel.get(chatId);
  }
}

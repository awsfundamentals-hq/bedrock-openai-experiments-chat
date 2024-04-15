import { generateUUID } from '../../utils/core';
import { NotesEntity, NotesModel } from './model/notes';

export class DynamoDbNotesAdapter {
  async list(): Promise<NotesEntity[]> {
    return NotesModel.scan().exec();
  }

  async create(note: {
    description: string;
    text: string;
  }): Promise<NotesEntity> {
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
}

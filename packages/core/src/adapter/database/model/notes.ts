import * as dynamoose from 'dynamoose';
import { Schema } from 'dynamoose';
import { Item } from 'dynamoose/dist/Item';
import { Table } from 'sst/node/table';

export interface NotesEntity extends Item {
  id: string;
  description: string;
  text: string;
}

const schema = new Schema(
  {
    id: {
      type: String,
      hashKey: true,
    },
    description: String,
    text: String,
  },
  {
    saveUnknown: false,
  },
);

export const NotesModel = dynamoose.model<NotesEntity>('Notes', schema, {
  tableName: Table.notes.tableName,
});

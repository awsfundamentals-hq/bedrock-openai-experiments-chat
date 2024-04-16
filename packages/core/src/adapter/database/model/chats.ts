import * as dynamoose from 'dynamoose';
import { Schema } from 'dynamoose';
import { Item } from 'dynamoose/dist/Item';
import { Table } from 'sst/node/table';

export interface ChatsEntity extends Item {
  id: string;
  timestamp: number;
  content: string;
  role: 'user' | 'system' | 'assistant';
}

const schema = new Schema(
  {
    id: {
      type: String,
      hashKey: true,
    },
    timestamp: Number,
    content: String,
    role: String,
  },
  {
    saveUnknown: false,
  },
);

export const ChatsModel = dynamoose.model<ChatsEntity>('Chats', schema, {
  tableName: Table.chats.tableName,
});

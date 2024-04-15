import * as dynamoose from 'dynamoose';
import { Schema } from 'dynamoose';
import { Item } from 'dynamoose/dist/Item';
import { Table } from 'sst/node/table';

export interface ChatsEntity extends Item {
  id: string;
  timestamp: number;
  text: string;
  from: string;
}

const schema = new Schema(
  {
    id: {
      type: String,
      hashKey: true,
    },
    timestamp: Number,
    text: String,
    from: String,
  },
  {
    saveUnknown: false,
  },
);

export const ChatsModel = dynamoose.model<ChatsEntity>('Chats', schema, {
  tableName: Table.chats.tableName,
});
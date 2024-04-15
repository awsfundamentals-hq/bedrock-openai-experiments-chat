import { Api, Bucket, Stack, StackContext, Table } from 'sst/constructs';

export function Backend({ stack }: StackContext) {
  const table = createTables(stack);
  const bucket = createS3Bucket(stack);
  const api = createApi(stack, table, bucket);
  stack.addOutputs({});
  return { apiUrl: api.url };
}

function createApi(stack: Stack, table: Table, bucket: Bucket): Api {
  const api = new Api(stack, 'api', {
    defaults: {
      function: {
        bind: [table, bucket],
        environment: {},
        timeout: 600,
        memorySize: 2048,
        diskSize: 512,
        permissions: [],
      },
    },
    cors: true,
    routes: {
      'GET /api/v1/notes': 'packages/functions/src/notes-api.list',
      'POST /api/v1/notes': 'packages/functions/src/notes-api.create',
      'DELETE /api/v1/notes/{id}': 'packages/functions/src/notes-api.del',
      'PUT /api/v1/notes/{id}': 'packages/functions/src/notes-api.update',
      'GET /api/v1/notes/{id}': 'packages/functions/src/notes-api.get',
    },
  });
  return api;
}

function createTables(stack: Stack): Table {
  const notes: Table = new Table(stack, 'notes', {
    fields: {
      id: 'string',
      description: 'string',
      text: 'string',
    },
    primaryIndex: { partitionKey: 'id' },
  });
  return notes;
}

function createS3Bucket(stack: Stack): Bucket {
  const bucket = new Bucket(stack, 'rag-data', {
    name: `${stack.stackName.toLocaleLowerCase()}-data`,
  });
  return bucket;
}

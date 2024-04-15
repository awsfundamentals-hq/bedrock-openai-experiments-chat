import { Api, Bucket, Config, Stack, StackContext, Table } from 'sst/constructs';

export function Backend({ stack }: StackContext, apiKey: string) {
  const table = createTables(stack);
  const bucket = createS3Bucket(stack);
  const api = createApi(stack, table, bucket, apiKey);
  stack.addOutputs({});
  return { apiUrl: api.url };
}

function createApi(stack: Stack, table: Table, bucket: Bucket, apiKey: string): Api {
  const openAiApiKey = new Config.Secret(stack, 'OPENAI_API_KEY');

  const api = new Api(stack, 'api', {
    defaults: {
      function: {
        bind: [table, bucket, openAiApiKey],
        environment: {
          API_KEY: apiKey,
        },
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
      'GET /api/v1/openai/models': 'packages/functions/src/openai-api.listModels',
      'POST /api/v1/openai/submit': 'packages/functions/src/openai-api.submit',
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
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Api, Config, Stack, StackContext, Table } from 'sst/constructs';

export function Backend({ stack }: StackContext, apiKey: string) {
  const tables = createTables(stack);
  const api = createApi(stack, tables, apiKey);
  return { apiUrl: api.url };
}

function createApi(stack: Stack, tables: Table[], apiKey: string): Api {
  // Our OpenAI API Key
  // this needs to be provided to SST once per stage via the following command:
  // 'npx sst secrets set OPENAI_API_KEY sk-Y....BcZ'
  const openAiApiKey = new Config.Secret(stack, 'OPENAI_API_KEY');

  const api = new Api(stack, 'api', {
    defaults: {
      function: {
        bind: [...tables, openAiApiKey],
        environment: {
          API_KEY: apiKey,
        },
        timeout: 600,
        memorySize: 2048,
        diskSize: 512,
        permissions: [
          new PolicyStatement({
            actions: ['bedrock:ListFoundationModels', 'bedrock:InvokeModel'],
            effect: Effect.ALLOW,
            resources: [`*`],
          }),
        ],
      },
    },
    cors: true,
    routes: {
      'GET /api/v1/notes': 'packages/functions/src/notes-api.list',
      'POST /api/v1/notes': 'packages/functions/src/notes-api.create',
      'DELETE /api/v1/notes/{id}': 'packages/functions/src/notes-api.del',
      'PUT /api/v1/notes/{id}': 'packages/functions/src/notes-api.update',
      'GET /api/v1/notes/{id}': 'packages/functions/src/notes-api.get',
      // General Chat
      'DELETE /api/v1/chat/messages': 'packages/functions/src/messages-api.clearMessages',
      'GET /api/v1/chat/messages': 'packages/functions/src/messages-api.getMessages',
      // OpenAI API
      'GET /api/v1/chat/openai/models': 'packages/functions/src/openai-api.listModels',
      'POST /api/v1/chat/openai/submit': 'packages/functions/src/openai-api.submit',
      // BedRock API
      'GET /api/v1/chat/bedrock/models': 'packages/functions/src/bedrock-api.listModels',
      'POST /api/v1/chat/bedrock/submit': 'packages/functions/src/bedrock-api.submit',
    },
  });
  return api;
}

function createTables(stack: Stack): Table[] {
  const notes: Table = new Table(stack, 'notes', {
    fields: {
      id: 'string',
      description: 'string',
      text: 'string',
    },
    primaryIndex: { partitionKey: 'id' },
  });

  const chats: Table = new Table(stack, 'chats', {
    fields: {
      id: 'string',
    },
    primaryIndex: { partitionKey: 'id' },
  });
  return [notes, chats];
}

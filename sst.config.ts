import { SSTConfig } from 'sst';
import { Stack } from './stacks/index';

export default {
  config(_input) {
    return {
      name: 'bedrock-openai-experiments-chat',
      region: 'us-east-1',
    };
  },
  stacks(app) {
    app.stack(Stack);
  },
} satisfies SSTConfig;

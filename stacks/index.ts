import { appendFileSync, existsSync, readFileSync } from 'fs';
import path from 'path';
import { StackContext } from 'sst/constructs';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import { Backend } from './backend';
import { Frontend } from './frontend';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../.env');

export function Stack(stack: StackContext) {
  let apiKey: string | undefined = undefined;

  if (existsSync(envPath)) {
    const envFileContent = readFileSync(envPath, 'utf8');
    const matches = envFileContent.match(/^API_KEY=(.*)$/m);
    apiKey = matches ? matches[1] : undefined;
  }

  if (!apiKey) {
    apiKey = uuidv4();
    appendFileSync(envPath, `API_KEY=${apiKey}\n`);
  }

  const { apiUrl } = Backend(stack, apiKey!);
  const { appUrl } = Frontend(stack, apiUrl, apiKey!);

  stack.stack.addOutputs({
    ApiUrl: apiUrl,
    ApiKey: apiKey,
    AppUrl: appUrl,
  });
}

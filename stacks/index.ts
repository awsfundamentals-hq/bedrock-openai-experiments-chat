import { StackContext } from 'sst/constructs';
import { Backend } from './backend';
import { Frontend } from './frontend';

export function Stack(stack: StackContext) {
  const apiKey = 'a85ea5a9-69d2-a68a-247d-55020396252c';

  const { apiUrl } = Backend(stack, apiKey);
  Frontend(stack, apiUrl, apiKey);
}

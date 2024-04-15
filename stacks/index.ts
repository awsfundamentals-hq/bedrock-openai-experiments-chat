import { StackContext } from 'sst/constructs';
import { Backend } from './backend';
import { Frontend } from './frontend';

export function Stack(stack: StackContext) {
  const { apiUrl } = Backend(stack);
  Frontend(stack, apiUrl);
}

import {
  AllowedMethods,
  ViewerProtocolPolicy,
} from 'aws-cdk-lib/aws-cloudfront';
import { NextjsSite, Stack, StackContext } from 'sst/constructs';

export function Frontend({ stack }: StackContext, apiUrl: string) {
  const app = createApp(stack, apiUrl);

  return stack.addOutputs({
    appUrl: app.url,
  });
}

function createApp(stack: Stack, apiUrl: string) {
  return new NextjsSite(stack, 'app', {
    path: 'packages/app',
    environment: {
      NEXT_PUBLIC_API_URL: apiUrl,
    },
    cdk: {
      bucket: {
        bucketName: `${stack.stackName.toLocaleLowerCase()}-app`,
      },
      distribution: {
        defaultBehavior: {
          viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          allowedMethods: AllowedMethods.ALLOW_ALL,
        },
      },
    },
  });
}

import { AllowedMethods, ViewerProtocolPolicy } from 'aws-cdk-lib/aws-cloudfront';
import { NextjsSite, Stack, StackContext } from 'sst/constructs';

export function Frontend({ stack }: StackContext, apiUrl: string, apiKey: string) {
  const app = createApp(stack, apiUrl, apiKey);

  return {
    appUrl: app.url,
  };
}

function createApp(stack: Stack, apiUrl: string, apiKey: string) {
  return new NextjsSite(stack, 'app', {
    path: 'packages/app',
    bind: [],
    environment: {
      NEXT_PUBLIC_API_URL: apiUrl,
      NEXT_PUBLIC_API_KEY: apiKey,
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

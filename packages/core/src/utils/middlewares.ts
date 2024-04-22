import middy, { Request } from '@middy/core';
import errorLogger from '@middy/error-logger';
import httpContentNegotiation from '@middy/http-content-negotiation';
import cors from '@middy/http-cors';
import httpErrorHandler from '@middy/http-error-handler';
import httpResponseSerializer from '@middy/http-response-serializer';
import { normalizeHttpResponse } from '@middy/util';
import { APIGatewayProxyEventV2, Context } from 'aws-lambda';
import { ApiHandler } from 'sst/node/api';
import { checkApiKey, toResponse } from './core';
import { Exception } from './exception';

const errorHandler = () => ({
  onError: async (request: Request) => {
    request.response = normalizeHttpResponse(request);
    const error = request.error as Exception;
    let statusCode = 500;
    if (error instanceof Exception) {
      console.log(`Expected Error: ${error.details}`);
      statusCode = error.statusCode;
      request.response.body = JSON.stringify(error.details ?? {});
    } else if (`${(error as any).statusCode}`?.startsWith('4')) {
      console.log(`HTTP 4xx Error: ${error}`);
      statusCode = (error as any).statusCode;
      request.response.body = `${error}`;
    } else if (typeof (error as string)?.startsWith === 'function' && (error as string).startsWith('RequestTimeout')) {
      console.log(`RequestTimeout Error: ${error}`);
      request.response.body = `RequestTimeout Error: ${error}`;
    } else {
      console.log(`Unexpected Error: ${error}`);
      console.log(error);
      request.response.body = `Internal Server Error: ${error}`;
    }
    request.response.statusCode = statusCode;
    return request.response;
  },
});

export const buildHandler = (handler: (_evt: APIGatewayProxyEventV2, _context: Context) => any) =>
  middy()
    .use(httpErrorHandler())
    .use(errorLogger())
    .use(cors())
    .use(httpContentNegotiation())
    .use(
      httpResponseSerializer({
        serializers: [
          {
            regex: /^application\/json$/,
            serializer: ({ body }) => JSON.stringify(body),
          },
          {
            regex: /^text\/plain$/,
            serializer: ({ body }) => body,
          },
          {
            regex: /^text\/csv$/,
            serializer: ({ body }) => body,
          },
        ],
        defaultContentType: 'application/json',
      }),
    )
    .use(errorHandler())
    .handler(
      ApiHandler(async (_evt: APIGatewayProxyEventV2, _context: Context) => {
        checkApiKey(_evt);
        // immediately return if OPTIONS request is detected
        const method = _evt.requestContext.http.method as string;
        if (method === 'OPTIONS') {
          return toResponse({
            headers: {
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Headers': '*',
              'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            },
          });
        }
        return handler(_evt, _context);
      }),
    );

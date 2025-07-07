import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import express, { Request, Response, Router } from 'express';

import { createApiRequestBody } from '@/api-docs/openAPIRequestBuilders';
import { createApiResponse } from '@/api-docs/openAPIResponseBuilders';

import { MarkdownGeneratorRequestBodySchema, MarkdownGeneratorResponseSchema } from './markdownGeneratorModel';

export const markdownGeneratorRegistry = new OpenAPIRegistry();
markdownGeneratorRegistry.register('MarkdownGenerator', MarkdownGeneratorResponseSchema);
markdownGeneratorRegistry.registerPath({
  method: 'post',
  path: '/markdown-generator/generate',
  tags: ['Markdown Generator'],
  request: {
    body: createApiRequestBody(MarkdownGeneratorRequestBodySchema, 'application/json'),
  },
  responses: createApiResponse(MarkdownGeneratorResponseSchema, 'Success'),
});

// Minimal test function
const generateMarkdown = (req: Request, res: Response) => {
  console.log('Minimal test endpoint hit');
  res.status(200).json({
    success: true,
    message: 'Minimal test works!',
    statusCode: 200,
    responseObject: {
      downloadUrl: 'https://test.com/test.md',
      filename: 'test.md',
    },
  });
};

export const markdownGeneratorRouter: Router = (() => {
  const router = express.Router();
  router.post('/generate', generateMarkdown);
  return router;
})();

import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import express, { Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';

import { createApiRequestBody } from '@/api-docs/openAPIRequestBuilders';
import { createApiResponse } from '@/api-docs/openAPIResponseBuilders';
import { ServiceResponse } from '@/common/models/serviceResponse';
import { handleServiceResponse } from '@/common/utils/httpHandlers';

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

// Simple test function
const generateMarkdown = async (req: Request, res: Response) => {
  console.log('Markdown test function started');

  try {
    console.log('Request body:', req.body);

    // Simple test response
    const responseObject = {
      downloadUrl: 'https://test.com/test.md',
      filename: 'test.md',
      fileSize: 100,
      wordCount: 10,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    };

    console.log('Sending test response');
    const serviceResponse = ServiceResponse.success('Test response - markdown generator is working!', responseObject);
    return handleServiceResponse(serviceResponse, res);
  } catch (error) {
    console.error('Error in test markdown generator:', error);
    const serviceResponse = ServiceResponse.failure(
      'Test failed',
      error instanceof Error ? error.message : 'Unknown error',
      StatusCodes.INTERNAL_SERVER_ERROR
    );
    return handleServiceResponse(serviceResponse, res);
  }
};

export const markdownGeneratorRouter: Router = (() => {
  const router = express.Router();
  router.post('/generate', generateMarkdown);
  return router;
})();

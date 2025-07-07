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

// Minimal test function
const generateMarkdown = async (req: Request, res: Response) => {
  try {
    console.log('Markdown generator called');

    const responseObject = {
      markdownContent: '# Test\n\nThis is a minimal test response.',
      wordCount: 7,
      message: 'This is a test response',
    };

    console.log('Sending response');

    const serviceResponse = ServiceResponse.success('Test successful!', responseObject);
    return handleServiceResponse(serviceResponse, res);
  } catch (error) {
    console.error('Error in markdown generator:', error);
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

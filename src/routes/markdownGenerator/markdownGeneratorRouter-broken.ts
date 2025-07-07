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

// Simple markdown generation function - no file creation
const generateMarkdown = async (req: Request, res: Response) => {
  try {
    const { title = 'Generated Document', content = '', includeMetadata = true, markdownStyle = 'standard' } = req.body;

    console.log('Generating markdown for:', title);

    // Build markdown content
    let markdownContent = '';

    // Add metadata if requested
    if (includeMetadata) {
      const now = new Date();
      markdownContent += `---\n`;
      markdownContent += `title: ${title}\n`;
      markdownContent += `created: ${now.toISOString()}\n`;
      markdownContent += `generated_by: TypingMind Markdown Generator\n`;
      markdownContent += `---\n\n`;
    }

    // Add title and content
    markdownContent += `# ${title}\n\n`;
    markdownContent += content + '\n\n';

    // Apply style
    if (markdownStyle === 'github') {
      markdownContent += '\n---\n*Generated with TypingMind*\n';
    }

    // Return markdown content directly instead of file
    const responseObject = {
      markdownContent,
      wordCount: markdownContent.split(/\s+/).filter((word) => word.length > 0).length,
      message: 'Copy the markdown content below and save it as a .md file',
    };

    console.log('Markdown generated successfully');

    const serviceResponse = ServiceResponse.success('Markdown generated successfully!', responseObject);
    return handleServiceResponse(serviceResponse, res);
  } catch (error) {
    console.error('Error generating markdown:', error);
    const serviceResponse = ServiceResponse.failure(
      'Failed to generate markdown',
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

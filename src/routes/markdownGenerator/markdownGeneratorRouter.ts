import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { randomUUID } from 'crypto';
import express, { Request, Response, Router } from 'express';
import fs from 'fs';
import { StatusCodes } from 'http-status-codes';
import path from 'path';

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

// Create exports directory path
const exportsDir = path.join(process.cwd(), 'markdown-exports');

// Ensure directory exists
const ensureExportsDir = async () => {
  try {
    await fs.promises.mkdir(exportsDir, { recursive: true });
  } catch (error) {
    console.error('Error creating exports directory:', error);
  }
};

// Initialize directory on startup
ensureExportsDir();

// Markdown generation function
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

    // Generate unique filename
    const fileId = randomUUID();
    const timestamp = new Date()
      .toISOString()
      .slice(0, 19)
      .replace(/[^0-9]/g, '');
    const filename = `${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${timestamp}.md`;
    const filePath = path.join(exportsDir, `${fileId}.md`);

    // Write file
    await fs.promises.writeFile(filePath, markdownContent, 'utf8');

    // Get file stats
    const stats = await fs.promises.stat(filePath);
    const wordCount = markdownContent.split(/\s+/).filter((word) => word.length > 0).length;

    // Generate download URL
    const downloadUrl = `${req.protocol}://${req.get('host')}/markdown-generator/downloads/${fileId}.md`;

    console.log('Markdown file generated successfully:', filename);

    const responseObject = {
      downloadUrl,
      filename,
      fileSize: stats.size,
      wordCount,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    };

    const serviceResponse = ServiceResponse.success('Markdown file generated successfully!', responseObject);
    return handleServiceResponse(serviceResponse, res);
  } catch (error) {
    console.error('Error generating markdown:', error);
    const serviceResponse = ServiceResponse.failure(
      'Failed to generate markdown file',
      error instanceof Error ? error.message : 'Unknown error',
      StatusCodes.INTERNAL_SERVER_ERROR
    );
    return handleServiceResponse(serviceResponse, res);
  }
};

export const markdownGeneratorRouter: Router = (() => {
  const router = express.Router();

  // Static route for file downloads
  router.use('/downloads', express.static(exportsDir));

  router.post('/generate', generateMarkdown);
  return router;
})();

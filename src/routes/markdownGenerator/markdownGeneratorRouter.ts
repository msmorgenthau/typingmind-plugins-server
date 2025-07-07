import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { randomUUID } from 'crypto';
import express, { Request, Response, Router } from 'express';
import fs from 'fs';
import { StatusCodes } from 'http-status-codes';
import cron from 'node-cron';
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

// Create folder to contain generated files
const exportsDir = path.join(__dirname, '../../..', 'markdown-exports');

// Ensure the exports directory exists
const ensureExportsDir = async () => {
  try {
    await fs.promises.access(exportsDir);
  } catch {
    await fs.promises.mkdir(exportsDir, { recursive: true });
  }
};

// Clean up old files every hour
cron.schedule('0 * * * *', () => {
  const now = Date.now();
  const oneHourAgo = now - 60 * 60 * 1000;

  fs.readdir(exportsDir, (err, files) => {
    if (err) {
      console.error('Error reading exports directory:', err);
      return;
    }

    files.forEach((file) => {
      const filePath = path.join(exportsDir, file);
      fs.stat(filePath, (statErr, stats) => {
        if (statErr) {
          console.error('Error getting file stats:', statErr);
          return;
        }

        if (stats.birthtimeMs < oneHourAgo) {
          fs.unlink(filePath, (unlinkErr) => {
            if (unlinkErr) {
              console.error('Error deleting old file:', unlinkErr);
            } else {
              console.log(`Deleted old markdown file: ${file}`);
            }
          });
        }
      });
    });
  });
});

// Main markdown generation function
const generateMarkdown = async (req: Request, res: Response) => {
  try {
    const { title, content, filename, includeMetadata = true, markdownStyle = 'standard', sections = [] } = req.body;

    // Validation
    if (!title || !content) {
      const serviceResponse = ServiceResponse.failure(
        '[Validation Error] Title and content are required!',
        'Please make sure you have provided both title and content.',
        StatusCodes.BAD_REQUEST
      );
      return handleServiceResponse(serviceResponse, res);
    }

    // Build markdown content
    let markdownContent = '';

    // Add metadata if requested
    if (includeMetadata) {
      const now = new Date();
      markdownContent += `---\n`;
      markdownContent += `title: ${title}\n`;
      markdownContent += `created: ${now.toISOString()}\n`;
      markdownContent += `generated_by: TypingMind Markdown Generator\n`;
      markdownContent += `generator_version: 1.0.0\n`;
      markdownContent += `---\n\n`;
    }

    // Add main title
    markdownContent += `# ${title}\n\n`;

    // Add main content
    markdownContent += content + '\n\n';

    // Add structured sections if provided
    if (sections && sections.length > 0) {
      sections.forEach((section: any) => {
        const level = Math.max(1, Math.min(6, section.level || 2));
        const headingPrefix = '#'.repeat(level);
        markdownContent += `${headingPrefix} ${section.heading}\n\n`;
        markdownContent += section.content + '\n\n';
      });
    }

    // Apply style formatting
    switch (markdownStyle) {
      case 'github':
        markdownContent += '\n---\n\n';
        markdownContent += '*Generated with TypingMind Markdown Generator*\n';
        break;
      case 'minimal':
        // Clean up extra spacing for minimal style
        markdownContent = markdownContent.replace(/\n\n\n+/g, '\n\n');
        break;
      default:
        // Standard style - no additional formatting
        break;
    }

    // Generate filename
    let finalFilename = filename || title.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'generated-document';

    // Add timestamp to ensure uniqueness
    const timestamp = new Date()
      .toISOString()
      .slice(0, 19)
      .replace(/[^0-9]/g, '');
    finalFilename += `-${timestamp}.md`;

    // Generate unique file ID and write file
    const fileId = randomUUID();
    const filePath = path.join(exportsDir, `${fileId}.md`);

    // Ensure directory exists before writing
    await ensureExportsDir();

    // Write markdown file
    await fs.promises.writeFile(filePath, markdownContent, 'utf8');

    // Calculate stats
    const stats = await fs.promises.stat(filePath);
    const wordCount = markdownContent.split(/\s+/).filter((word) => word.length > 0).length;

    // Generate download URL
    const downloadUrl = `${req.protocol}://${req.get('host')}/markdown-generator/downloads/${fileId}.md`;

    // Create response object
    const responseObject = {
      downloadUrl,
      filename: finalFilename,
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

  // Static route for downloading files
  router.use('/downloads', express.static(exportsDir));

  router.post('/generate', generateMarkdown);
  return router;
})();

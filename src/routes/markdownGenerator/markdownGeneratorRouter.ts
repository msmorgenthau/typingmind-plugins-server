import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import express, { Request, Response, Router } from 'express';

// Ultra-simple test function - no OpenAPI registration, no complex logic
const generateMarkdown = (req: Request, res: Response) => {
  console.log('Ultra-simple markdown generator POST called - this should work!');

  res.json({
    success: true,
    message: 'Ultra-simple test successful!',
    responseObject: {
      markdownContent: '# Test\n\nThis works!',
      wordCount: 3,
      message: 'Copy this content and save as .md file',
    },
    statusCode: 200,
  });
};

export const markdownGeneratorRouter: Router = (() => {
  console.log('Creating markdown generator router...');
  const router = express.Router();

  // Simple GET test endpoint
  router.get('/test', (req: Request, res: Response) => {
    console.log('GET test endpoint called - this should work!');
    res.json({ success: true, message: 'GET test works!' });
  });

  router.post('/generate', generateMarkdown);

  console.log('Markdown generator router created successfully');
  return router;
})();

// Proper registry for compatibility - create actual registry but don't register anything
export const markdownGeneratorRegistry = new OpenAPIRegistry();

import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import express, { Request, Response, Router } from 'express';

// Process actual markdown generation from request
const generateMarkdown = (req: Request, res: Response) => {
  console.log('Markdown generator called with body:', req.body);

  const { content, title } = req.body;

  if (!content || !title) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields: content and title',
      statusCode: 400,
    });
  }

  // Create the markdown content
  const markdownContent = `# ${title}\n\n${content}`;

  // Calculate word count
  const wordCount = markdownContent.split(/\s+/).filter((word) => word.length > 0).length;

  // Generate suggested filename
  const filename = `${title
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')}.md`;

  res.json({
    success: true,
    message: 'Markdown file generated successfully!',
    responseObject: {
      markdownContent,
      wordCount,
      filename,
      message: `Copy the content above and save as "${filename}"`,
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

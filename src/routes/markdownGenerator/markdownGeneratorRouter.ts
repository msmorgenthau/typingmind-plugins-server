import express, { Request, Response, Router } from 'express';

// Ultra-simple test function - no OpenAPI, no complex logic
const generateMarkdown = (req: Request, res: Response) => {
  console.log('Ultra-simple markdown generator called');

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
  const router = express.Router();
  router.post('/generate', generateMarkdown);
  return router;
})();

// Empty registry for compatibility
export const markdownGeneratorRegistry = { register: () => {}, registerPath: () => {} };

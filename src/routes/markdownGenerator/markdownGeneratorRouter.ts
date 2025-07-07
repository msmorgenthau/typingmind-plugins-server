import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { randomUUID } from 'crypto';
import express, { Request, Response, Router } from 'express';
import fs from 'fs';
import path from 'path';

// Create folder to contain generated files
const exportsDir = path.join(__dirname, '../../..', 'markdown-exports');
if (!fs.existsSync(exportsDir)) {
  fs.mkdirSync(exportsDir, { recursive: true });
}

// Clean up files older than 1 hour (same as other generators)
const cleanupOldFiles = () => {
  if (fs.existsSync(exportsDir)) {
    const files = fs.readdirSync(exportsDir);
    const now = Date.now();
    files.forEach((file) => {
      const filePath = path.join(exportsDir, file);
      const stats = fs.statSync(filePath);
      if (now - stats.mtimeMs > 60 * 60 * 1000) {
        // 1 hour
        fs.unlinkSync(filePath);
      }
    });
  }
};

// Process actual markdown generation from request
const generateMarkdown = async (req: Request, res: Response) => {
  console.log('Markdown generator called with body:', req.body);

  const { content, title } = req.body;

  if (!content || !title) {
    return res.status(400).json({
      success: false,
      message: 'Missing required fields: content and title',
      statusCode: 400,
    });
  }

  try {
    // Create the markdown content
    const markdownContent = `# ${title}\n\n${content}`;

    // Calculate word count
    const wordCount = markdownContent.split(/\s+/).filter((word) => word.length > 0).length;

    // Generate unique filename
    const uuid = randomUUID();
    const cleanTitle = title
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    const timestamp = new Date().toISOString().slice(0, 10);
    const fileName = `${cleanTitle}-${timestamp}-${uuid.slice(0, 8)}.md`;
    const filePath = path.join(exportsDir, fileName);

    // Write the markdown file
    await fs.promises.writeFile(filePath, markdownContent, 'utf8');

    // Get server URL from request
    const protocol = req.protocol;
    const host = req.get('host');
    const serverUrl = `${protocol}://${host}`;

    // Clean up old files
    cleanupOldFiles();

    res.json({
      success: true,
      message: 'Markdown file generated successfully!',
      responseObject: {
        downloadUrl: `${serverUrl}/markdown-generator/downloads/${fileName}`,
        filename: fileName,
        wordCount: wordCount,
        fileSize: Buffer.byteLength(markdownContent, 'utf8'),
      },
      statusCode: 200,
    });
  } catch (error) {
    console.error('Error generating markdown file:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate markdown file',
      statusCode: 500,
    });
  }
};

export const markdownGeneratorRouter: Router = (() => {
  console.log('Creating markdown generator router...');
  const router = express.Router();

  // Static route for downloading files (same pattern as Excel/Word generators)
  router.use('/downloads', express.static(exportsDir));

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

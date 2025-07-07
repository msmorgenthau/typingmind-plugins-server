import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';

extendZodWithOpenApi(z);

export type MarkdownGeneratorRequestBody = z.infer<typeof MarkdownGeneratorRequestBodySchema>;
export type MarkdownGeneratorResponse = z.infer<typeof MarkdownGeneratorResponseSchema>;

export const MarkdownSectionSchema = z.object({
  heading: z.string().describe('Section heading'),
  content: z.string().describe('Section content'),
  level: z.number().min(1).max(6).default(2).describe('Heading level (1-6)'),
});

export const MarkdownGeneratorRequestBodySchema = z.object({
  title: z.string().describe('Document title (used as H1 header)'),
  content: z.string().describe('Main content to be converted to markdown'),
  filename: z.string().optional().describe('Custom filename (optional, without .md extension)'),
  includeMetadata: z.boolean().default(true).describe('Include YAML frontmatter metadata'),
  markdownStyle: z.enum(['standard', 'github', 'minimal']).default('standard').describe('Markdown formatting style'),
  sections: z.array(MarkdownSectionSchema).default([]).describe('Optional structured sections for the document'),
});

export const MarkdownGeneratorResponseSchema = z.object({
  markdownContent: z.string().describe('The generated markdown content'),
  wordCount: z.number().describe('Number of words in the document'),
  message: z.string().describe('Instructions for the user'),
});

import { OpenApiGeneratorV3, OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';

import { excelGeneratorRegistry } from '@/routes/excelGenerator/excelGeneratorRouter';
import { healthCheckRegistry } from '@/routes/healthCheck/healthCheckRouter';
import { markdownGeneratorRegistry } from '@/routes/markdownGenerator/markdownGeneratorRouter';
import { notionDatabaseRegistry } from '@/routes/notionDatabase/notionDatabaseRouter';
import { powerpointGeneratorRegistry } from '@/routes/powerpointGenerator/powerpointGeneratorRouter';
import { articleReaderRegistry } from '@/routes/webPageReader/webPageReaderRouter';
import { wordGeneratorRegistry } from '@/routes/wordGenerator/wordGeneratorRouter';
import { youtubeTranscriptRegistry } from '@/routes/youtubeTranscript/youtubeTranscriptRouter';

export function generateOpenAPIDocument() {
  const registry = new OpenAPIRegistry([
    healthCheckRegistry,
    youtubeTranscriptRegistry,
    articleReaderRegistry,
    powerpointGeneratorRegistry,
    wordGeneratorRegistry,
    excelGeneratorRegistry,
    markdownGeneratorRegistry,
    notionDatabaseRegistry,
  ]);
  const generator = new OpenApiGeneratorV3(registry.definitions);

  return generator.generateDocument({
    openapi: '3.0.0',
    info: {
      version: '1.0.0',
      title: 'Swagger API',
    },
    externalDocs: {
      description: 'View the raw OpenAPI Specification in JSON format',
      url: '/swagger.json',
    },
  });
}

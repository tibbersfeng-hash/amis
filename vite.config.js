import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Load the components guide document.
 */
function loadComponentsGuide() {
  try {
    return fs.readFileSync(
      path.resolve(__dirname, 'docs', 'amis-components-guide.md'),
      'utf-8'
    );
  } catch {
    return '# Amis 组件介绍文档\n\n(文档未找到)';
  }
}

/**
 * Parse Claude output to extract schema and data JSON.
 */
function parseClaudeOutput(output) {
  const schemaMatch = output.match(/\/\/ SCHEMA_START\s*\n([\s\S]*?)\n\s*\/\/ SCHEMA_END/);
  const dataMatch = output.match(/\/\/ DATA_START\s*\n([\s\S]*?)\n\s*\/\/ DATA_END/);

  if (!schemaMatch && !dataMatch) {
    const codeBlocks = output.match(/```(?:json)?\s*\n([\s\S]*?)\n```/g);
    if (codeBlocks && codeBlocks.length >= 1) {
      const cleanBlock = (block) => block.replace(/```(?:json)?\s*\n/, '').replace(/\n```$/, '');
      return {
        schema: cleanBlock(codeBlocks[0]),
        data: codeBlocks.length >= 2 ? cleanBlock(codeBlocks[1]) : null,
      };
    }
    return { schema: null, data: null, error: '无法解析生成结果：未找到 SCHEMA_START/SCHEMA_END 或 DATA_START/DATA_END 标记' };
  }

  return {
    schema: schemaMatch ? schemaMatch[1].trim() : null,
    data: dataMatch ? dataMatch[1].trim() : null,
  };
}

/**
 * Call Claude CLI to generate schema and data.
 */
function callClaude(userPrompt, currentSchema, currentData) {
  return new Promise((resolve) => {
    const guide = loadComponentsGuide();
    const prompt = `You are an Amis (百度 amis v3.6.0) schema configuration expert.

## Reference: Amis Components Guide
${guide}

## Current Schema JSON
\`\`\`json
${currentSchema}
\`\`\`

## Current Data JSON
\`\`\`json
${currentData}
\`\`\`

## User Request
${userPrompt}

## Instructions
1. Based on the user's request, modify the above schema and data.
2. You MUST output the COMPLETE schema JSON and data JSON, not just the changes.
3. Preserve ALL existing details that the user did not mention changing.
4. Output format: use the markers below to wrap each JSON:

\`\`\`json
// SCHEMA_START
{complete schema JSON here}
// SCHEMA_END
\`\`\`

\`\`\`json
// DATA_START
{complete data JSON here}
// DATA_END
\`\`\`

5. Do NOT output anything before or after the code blocks.
6. The schema must be valid JSON. Do not use trailing commas or comments inside the JSON.`;

    const TIMEOUT_MS = 120_000;
    let output = '';
    let stderr = '';

    const proc = spawn('claude', [
      '-p', prompt,
      '--output-format', 'text',
      '--max-turns', '1',
    ], {
      timeout: TIMEOUT_MS,
      shell: false,
    });

    proc.stdout.on('data', (chunk) => { output += chunk.toString(); });
    proc.stderr.on('data', (chunk) => { stderr += chunk.toString(); });

    proc.on('close', (code) => {
      if (code !== 0 && output.length === 0) {
        resolve({ schema: null, data: null, error: `Claude CLI 退出码 ${code}\n${stderr.slice(0, 500)}` });
        return;
      }
      resolve(parseClaudeOutput(output));
    });

    proc.on('error', (err) => {
      resolve({ schema: null, data: null, error: `Claude CLI 启动失败: ${err.message}` });
    });

    proc.on('timeout', () => {
      proc.kill();
      resolve({ schema: null, data: null, error: 'Claude CLI 超时（120s）' });
    });
  });
}

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'api-middleware',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          // Only handle POST /api/ai/generate
          if (req.method !== 'POST' || req.url !== '/api/ai/generate') {
            return next();
          }

          let body = '';
          req.on('data', (chunk) => { body += chunk; });
          req.on('end', async () => {
            try {
              const { prompt, currentSchema, currentData } = JSON.parse(body);

              if (!prompt) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'prompt is required' }));
                return;
              }

              const result = await callClaude(prompt, currentSchema || '', currentData || '');

              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify(result));
            } catch (err) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({
                error: err instanceof Error ? err.message : 'Unknown error',
              }));
            }
          });
        });
      },
    },
  ],
  css: {
    lightningcss: {
      errorRecovery: true,
    },
  },
  server: {
    port: 5173,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
  },
});

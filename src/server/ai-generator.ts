import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

const COMPONENTS_GUIDE_PATH = path.resolve(__dirname, '..', 'docs', 'amis-components-guide.md');

/**
 * Read the components guide document.
 */
function loadComponentsGuide(): string {
  try {
    return fs.readFileSync(COMPONENTS_GUIDE_PATH, 'utf-8');
  } catch {
    return '# Amis 组件介绍文档\n\n(文档未找到，请确认 docs/amis-components-guide.md 存在)';
  }
}

/**
 * Build the Claude CLI prompt for AI schema/data generation.
 */
function buildPrompt(
  componentsGuide: string,
  currentSchema: string,
  currentData: string,
  userPrompt: string
): string {
  return `You are an Amis (百度 amis v3.6.0) schema configuration expert.

## Reference: Amis Components Guide
${componentsGuide}

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
2. **You MUST output the COMPLETE schema JSON and data JSON**, not just the changes.
3. Preserve ALL existing details that the user did not mention changing (fields, validations, styles, nested structures, etc.).
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
6. The schema must be valid JSON. Do not use trailing commas or comments inside the JSON.
7. Ensure all "required" fields have corresponding default values in the data JSON.`;
}

/**
 * Parse Claude CLI output to extract schema and data JSON.
 * Handles markdown code blocks with // SCHEMA_START/END markers.
 */
export function parseClaudeOutput(output: string): { schema: string | null; data: string | null; error?: string } {
  // Try to extract between markers
  const schemaMatch = output.match(/\/\/ SCHEMA_START\s*\n([\s\S]*?)\n\s*\/\/ SCHEMA_END/);
  const dataMatch = output.match(/\/\/ DATA_START\s*\n([\s\S]*?)\n\s*\/\/ DATA_END/);

  if (!schemaMatch && !dataMatch) {
    // Fallback: try to extract from ```json blocks
    const codeBlocks = output.match(/```(?:json)?\s*\n([\s\S]*?)\n```/g);
    if (codeBlocks && codeBlocks.length >= 1) {
      const cleanBlock = (block: string) => block.replace(/```(?:json)?\s*\n/, '').replace(/\n```$/, '');
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
 * Returns { schema, data } as JSON strings.
 */
export function callClaude(userPrompt: string, currentSchema: string, currentData: string): Promise<{ schema: string | null; data: string | null; error?: string }> {
  return new Promise((resolve) => {
    const guide = loadComponentsGuide();
    const prompt = buildPrompt(guide, currentSchema, currentData, userPrompt);

    const TIMEOUT_MS = 120_000; // 2 minutes
    let output = '';
    let stderr = '';

    // Use claude --print to get output via stdout
    const proc = spawn('claude', [
      '-p', prompt,
      '--output-format', 'text',
      '--max-turns', '1',
    ], {
      timeout: TIMEOUT_MS,
      shell: false,
    });

    proc.stdout.on('data', (chunk: Buffer) => {
      output += chunk.toString();
    });

    proc.stderr.on('data', (chunk: Buffer) => {
      stderr += chunk.toString();
    });

    proc.on('close', (code) => {
      if (code !== 0 && output.length === 0) {
        resolve({ schema: null, data: null, error: `Claude CLI 退出码 ${code}\n${stderr.slice(0, 500)}` });
        return;
      }
      resolve(parseClaudeOutput(output));
    });

    proc.on('error', (err: Error) => {
      resolve({ schema: null, data: null, error: `Claude CLI 启动失败: ${err.message}` });
    });

    proc.on('timeout', () => {
      proc.kill();
      resolve({ schema: null, data: null, error: 'Claude CLI 超时（120s）' });
    });
  });
}

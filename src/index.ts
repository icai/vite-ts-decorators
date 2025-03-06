import { Plugin } from 'vite';
import { join, dirname, resolve, relative } from 'path';
import {
  ParsedCommandLine,
  transpileModule,
  findConfigFile,
  sys,
  parseConfigFileTextToJson,
  parseJsonConfigFileContent,
} from 'typescript';
import { inspect } from 'util';
import { strip } from './strip-it';
import { minimatch } from 'minimatch';

export interface ViteDecoratorsOptions {
  tsconfig?: string;
  cwd?: string;
  force?: boolean;
  srcDir?: string;  // Optional src directory path
}

const theFinder = new RegExp(
  /((?<![(\s]\s*['"])@\w[.[\]\w\d]*\s*(?![;])[((?=\s)])/
);

const findDecorators = (fileContent) => theFinder.test(strip(fileContent));

export function viteDecorators(options: ViteDecoratorsOptions = {}): Plugin {
  const cwd = options.cwd || process.cwd();
  const tsconfigPath = options.tsconfig || join(cwd, './tsconfig.json');
  const forceTsc = options.force ?? false;
  const srcDir = options.srcDir || 'src/**/*.ts?(x)';

  let parsedTsConfig: ParsedCommandLine | null = null;
  const processedFiles = new Set<string>();

  function isFileMatchingSrcDir(filePath: string): boolean {
    const relativePath = relative(cwd, filePath);
    return minimatch(relativePath, srcDir);
  }

  return {
    name: 'vite-ts-decorators',
    enforce: 'pre',

    async transform(code: string, id: string) {
      // 只处理 .ts 和 .tsx 文件
      if (!/\.tsx?$/.test(id)) {
        return null;
      }

      const normalizedId = resolve(id);
      if (!isFileMatchingSrcDir(normalizedId)) {
        return null;
      }

      try {
        // 初始化 TypeScript 配置
        if (!parsedTsConfig) {
          parsedTsConfig = parseTsConfig(tsconfigPath, cwd);
          if (parsedTsConfig.options.sourceMap) {
            parsedTsConfig.options.sourceMap = false;
            parsedTsConfig.options.inlineSources = true;
            parsedTsConfig.options.inlineSourceMap = true;
          }
        }

        // 检查装饰器配置
        if (!forceTsc && (!parsedTsConfig?.options?.emitDecoratorMetadata)) {
          return null;
        }

        // 检查是否包含装饰器
        const hasDecorator = findDecorators(code);
        if (!hasDecorator) {
          return null;
        }

        // 转换代码
        const program = transpileModule(code, {
          fileName: id,
          compilerOptions: parsedTsConfig.options,
        });

        processedFiles.add(normalizedId);
        console.debug(`[vite-ts-decorators] Processed file: ${normalizedId}`);

        return {
          code: program.outputText,
          map: null,
        };
      } catch (error) {
        console.error(`[vite-ts-decorators] Error processing ${normalizedId}:`, error);
        return null;
      }
    },

    // 可选：添加模块变更监听
    handleHotUpdate({ file }) {
      if (processedFiles.has(file)) {
        console.debug(`[vite-ts-decorators] File changed: ${file}`);
      }
    }
  };
}

function parseTsConfig(tsconfig, cwd = process.cwd()): ParsedCommandLine {
  const fileName = findConfigFile(cwd, sys.fileExists, tsconfig);

  // if the value was provided, but no file, fail hard
  if (tsconfig !== undefined && !fileName)
    throw new Error(`failed to open '${fileName}'`);

  let loadedConfig = {};
  let baseDir = cwd;
  if (fileName) {
    const text = sys.readFile(fileName);
    if (text === undefined) throw new Error(`failed to read '${fileName}'`);

    const result = parseConfigFileTextToJson(fileName, text);

    if (result.error !== undefined) {
      printDiagnostics(result.error);
      throw new Error(`failed to parse '${fileName}'`);
    }

    loadedConfig = result.config;
    baseDir = dirname(fileName);
  }

  const parsedTsConfig = parseJsonConfigFileContent(loadedConfig, sys, baseDir);

  if (parsedTsConfig.errors[0]) printDiagnostics(parsedTsConfig.errors);

  return parsedTsConfig;
}

function printDiagnostics(...args) {
  console.log(inspect(args, false, 10, true));
}

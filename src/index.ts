import { Plugin } from 'vite';
import { join, dirname } from 'path';
import { globSync } from 'tinyglobby';  // Import tinyglobby
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
  const tsconfigPath =
    options.tsconfig ||
    join(cwd, './tsconfig.json');
  const forceTsc = options.force ?? false;
  const srcDir = options.srcDir || 'src/**/*.ts?(x)';  // Default glob pattern

  let parsedTsConfig = null;
  // Use tinyglobby to match files based on the srcDir glob pattern
  const matchedFiles = globSync(srcDir, { cwd });

  return {
    name: 'vite-ts-decorators',
    enforce: 'pre', // Ensure this plugin runs before Vite's default handling of TypeScript files.
    async transform(src, id) {
      // Only process .ts and .tsx files that match the glob pattern
      if (!/\.tsx?$/.test(id) || !matchedFiles.includes(id)) {
        return null;
      }

      if (!parsedTsConfig) {
        parsedTsConfig = parseTsConfig(tsconfigPath, cwd);
        if (parsedTsConfig.options.sourceMap) {
          parsedTsConfig.options.sourceMap = false;
          parsedTsConfig.options.inlineSources = true;
          parsedTsConfig.options.inlineSourceMap = true;
        }
      }

      // Skip transformation if decorator metadata isn't enabled
      if (
        !forceTsc &&
        (!parsedTsConfig ||
          !parsedTsConfig.options ||
          !parsedTsConfig.options.emitDecoratorMetadata)
      ) {
        return null;
      }

      const hasDecorator = findDecorators(src);
      if (!hasDecorator) {
        return null;
      }

      // Transpile the TypeScript code
      const program = transpileModule(src, {
        fileName: id,
        compilerOptions: parsedTsConfig.options,
      });

      return {
        code: program.outputText,
        map: null, // Add source map if needed
      };
    },
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

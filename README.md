# Vite TypeScript Decorators

[![npm version](https://img.shields.io/npm/v/vite-ts-decorators.svg)](https://www.npmjs.com/package/vite-ts-decorators)
[![npm downloads](https://img.shields.io/npm/dm/vite-ts-decorators.svg)](https://www.npmjs.com/package/vite-ts-decorators)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-Plugin-646CFF.svg)](https://vitejs.dev/)

A Vite plugin that enables TypeScript decorator metadata emission for modern JavaScript projects.

## Features

- 🚀 **Fast**: Optimized for Vite's development and build process
- 🎯 **Smart**: Only processes files with decorators
- 🔄 **Hot Reload**: Supports Vite's hot module replacement
- 📁 **Flexible**: Configurable file patterns and source directories
- 🛠️ **TypeScript**: Full TypeScript configuration support
- ⚡ **Zero Config**: Works out of the box with sensible defaults

## Installation

```bash
npm install vite-ts-decorators --save-dev
```

```bash
yarn add vite-ts-decorators --dev
```

```bash
pnpm add vite-ts-decorators --save-dev
```

## Usage

### Basic Setup

Add the plugin to your `vite.config.ts`:

```typescript
import { defineConfig } from 'vite'
import { viteDecorators } from 'vite-ts-decorators'

export default defineConfig({
  plugins: [
    viteDecorators(),
    // ... other plugins
  ],
})
```

### With Options

```typescript
import { defineConfig } from 'vite'
import { viteDecorators } from 'vite-ts-decorators'

export default defineConfig({
  plugins: [
    viteDecorators({
      tsconfig: './tsconfig.json',
      srcDir: 'src/**/*.ts?(x)',
      force: false,
      cwd: process.cwd()
    }),
  ],
})
```

## Configuration

### Plugin Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `tsconfig` | `string` | `./tsconfig.json` | Path to TypeScript configuration file |
| `srcDir` | `string` | `src/**/*.ts?(x)` | Glob pattern for source files |
| `force` | `boolean` | `false` | Force processing even without `emitDecoratorMetadata` |
| `cwd` | `string` | `process.cwd()` | Current working directory |

### TypeScript Configuration

Ensure your `tsconfig.json` has decorator support enabled:

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "target": "ES2020",
    "module": "ESNext"
  }
}
```

## Examples

### Class Decorators

```typescript
function Component(target: any) {
  // Decorator logic
}

@Component
class MyComponent {
  // Component implementation
}
```

### Property Decorators

```typescript
function Inject(token: string) {
  return function (target: any, propertyKey: string) {
    // Injection logic
  }
}

class Service {
  @Inject('HTTP_CLIENT')
  private httpClient: any;
}
```

### Method Decorators

```typescript
function Log(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  // Logging logic
}

class ApiService {
  @Log
  async fetchData() {
    // Method implementation
  }
}
```

## How It Works

1. **File Detection**: The plugin scans files matching the `srcDir` pattern
2. **Decorator Analysis**: Only processes files containing decorator syntax
3. **TypeScript Compilation**: Uses TypeScript compiler with decorator metadata
4. **Hot Reload**: Supports real-time updates during development

## Compatibility

- **Vite**: 3.0+
- **TypeScript**: 4.0+
- **Node.js**: 16+

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.


## Support

- 🐛 [Report Issues](https://github.com/your-username/vite-ts-decorators/issues)
- 💬 [Discussions](https://github.com/your-username/vite-ts-decorators/discussions)

---

Made with ❤️ for the TypeScript and Vite community

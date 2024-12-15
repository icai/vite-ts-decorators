# Vite TypeScript Decorators

This is a Vite plugin for transforming TypeScript files that use decorators.

## Installation

```bash
pnpm add vite-ts-decorators
```


## Usage
  
  ```ts 
  // vite.config.ts
  import { defineConfig } from 'vite';
  import tsDecorators from 'vite-ts-decorators';

  export default defineConfig({
    plugins: [
      tsDecorators()
    ]
  });
  ```


```ts
export interface ViteDecoratorsOptions {
    tsconfig?: string;
    cwd?: string;
    force?: boolean;
    srcDir?: string;
}
```


## **Contributing**

We welcome contributions to improve this SDK! To get started:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature-name`).
3. Commit your changes (`git commit -m "Add feature X"`).
4. Push to the branch (`git push origin feature-name`).
5. Open a pull request.

---


## **Credits**

This project was bootstrapped with [esbuild-decorators](https://github.com/anatine/esbuildnx/tree/main/packages/esbuild-decorators) by anatine



## **License**

This SDK is released under the **MIT License**. You’re free to use, modify, and distribute this project. See the `LICENSE` file for more details.

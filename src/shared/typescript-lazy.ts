import { createRequire } from "node:module";

// `typescript` の実体 import は約 217ms かかる（実測、#93）。compiler を使わない command の
// 起動時にその費用を払わないため、値としての `ts` は最初の property access まで load しない。
// lint と requirements の両 owner から使う leaf utility とし、owner 固有 module へ逆依存させない。
//
// 型としての `ts.SourceFile` はこの proxy 経由では書けないため、型位置は
// `import type * as TS from "typescript"` を使う（proxy は値専用）。
const requireFromHere = createRequire(import.meta.url);

let loaded: typeof import("typescript") | undefined;

function loadTypescript(): typeof import("typescript") {
  loaded ??= requireFromHere("typescript") as typeof import("typescript");
  return loaded;
}

/**
 * `typescript` の lazy proxy。property access 時に実体を load する。
 * top-level で分割代入すると lazy 性が失われるため、必ず `ts.X` の形で使う。
 */
const lazyTypescript = new Proxy({} as typeof import("typescript"), {
  get(_target, property) {
    return Reflect.get(loadTypescript(), property);
  },
  has(_target, property) {
    return Reflect.has(loadTypescript(), property);
  },
  ownKeys() {
    return Reflect.ownKeys(loadTypescript());
  },
  getOwnPropertyDescriptor(_target, property) {
    return Reflect.getOwnPropertyDescriptor(loadTypescript(), property);
  },
});

export default lazyTypescript;

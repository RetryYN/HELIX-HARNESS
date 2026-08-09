import { createRequire } from "node:module";

// `typescript` の実体 import は約 217ms かかる（実測、#93）。lint module が top-level で
// `import ts from "typescript"` していたため、`helix --version` のような compiler を一切使わない
// command でも CLI 起動のたびに全額を払っていた（起動 336ms のうち 217ms）。spawn を多用する
// test suite では 1 spawn ごとに再計上され、cli-surface だけで 221 spawn 分が積み上がる。
//
// ここでは値としての `ts` を lazy proxy にし、**最初に property へ触れた時点で初めて実体を
// load** する。call site（`ts.createSourceFile` 等）は書き換えない。
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

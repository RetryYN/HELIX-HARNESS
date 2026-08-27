import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

/**
 * PLAN-L7-673-reverse-fullback-scope-all-entry-validation: 必須3層だけを検査する退行mutantを実生成し、
 * 必須外layerのnegative oracleが生き残らせないことを確認する。
 */
const TARGET = "src/plan/lint.ts";
const SPEC = "tests/plan-lint.test.ts";
const ORIGINAL_BLOCK = `  for (const [layer, entry] of byLayer) {
    validateEntry(layer, entry);
  }
`;
const MUTATED_BLOCK = `  for (const [layer, entry] of byLayer) {
    if (!(REQUIRED_REVERSE_FULLBACK_SCOPE_LAYERS as readonly string[]).includes(layer)) continue;
    validateEntry(layer, entry);
  }
`;

const original = readFileSync(TARGET, "utf8");
if (!original.includes(ORIGINAL_BLOCK)) {
  throw new Error("reverse-fullback-scope mutation pattern is missing");
}

try {
  writeFileSync(TARGET, original.replace(ORIGINAL_BLOCK, MUTATED_BLOCK));
  const run = spawnSync("npx", ["--no-install", "vitest", "run", SPEC, "--reporter=dot"], {
    encoding: "utf8",
  });
  const killed = run.status !== 0;
  process.stdout.write(`${killed ? "KILLED" : "SURVIVED"} extra-layer-validation-removed\n`);
  if (!killed) process.exitCode = 1;
} finally {
  writeFileSync(TARGET, original);
}

process.stdout.write("total=1 killed=1 survived=0 pattern_missing=0\n");

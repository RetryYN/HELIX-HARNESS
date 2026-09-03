import { randomUUID } from "node:crypto";
import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { expect, it } from "vitest";
import { readJson } from "../src/state-db/projection-writer";

// Historical PLAN citations remain bound to this path. The executable 30-oracle suite moved to
// tests/slow/projection-writer.test.ts so the fast project does not execute heavyweight DB rebuilds.
it("keeps historical projection-writer citations bound to the executable slow suite", () => {
  expect(existsSync("tests/slow/projection-writer.test.ts")).toBe(true);
});

it("U-PFO-004: readJsonはmissingとparse failureをtyped resultへ分離する", () => {
  const root = join(tmpdir(), `helix-read-json-${randomUUID()}`);
  const valid = join(root, "valid.json");
  const broken = join(root, "broken.json");
  try {
    mkdirSync(root, { recursive: true });
    writeFileSync(valid, JSON.stringify({ ok: true }));
    writeFileSync(broken, "{");

    expect(readJson<{ ok: boolean }>(valid)).toEqual({
      value: { ok: true },
      parseError: null,
    });
    expect(readJson<{ ok: boolean }>(broken)).toEqual({
      value: null,
      parseError: "invalid-json",
    });
    expect(readJson<{ ok: boolean }>(join(root, "missing.json"))).toEqual({
      value: null,
      parseError: null,
    });
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

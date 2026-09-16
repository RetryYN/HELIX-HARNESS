import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, it, vi } from "vitest";

vi.mock("esbuild", () => ({
  buildSync: vi.fn(() => ({
    outputFiles: [{ contents: new TextEncoder().encode("#!/usr/bin/env node\n") }],
    metafile: {
      inputs: {
        "src/setup/distribution-consumer-cli.ts": { bytes: 1, imports: [] },
        "node_modules/example-runtime/index.js": { bytes: 1, imports: [] },
      },
      outputs: {},
    },
  })),
}));

import { buildLiteDistributionPackage } from "../src/setup/distribution-lite-package";

// PLAN-L7-660-lite-document-rule-oracles
const roots: string[] = [];

afterAll(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});

function cleanSourceRoot(): string {
  const fixture = mkdtempSync(join(tmpdir(), "helix-lite-runtime-input-"));
  roots.push(fixture);
  const sourceRoot = join(fixture, "repo");
  const clone = spawnSync("git", ["clone", "--shared", process.cwd(), sourceRoot], {
    encoding: "utf8",
  });
  if (clone.status !== 0) throw new Error(`runtime input source clone failed: ${clone.stderr}`);
  const remote = spawnSync(
    "git",
    ["remote", "set-url", "origin", "https://github.com/RetryYN/HELIX-HARNESS"],
    { cwd: sourceRoot, encoding: "utf8" },
  );
  if (remote.status !== 0) throw new Error(`runtime input source remote failed: ${remote.stderr}`);
  return sourceRoot;
}

describe("PLAN-L7-660: Lite document rule oracles", () => {
  it("U-DISTDOC-010: runtime third-party input検出時はartifact candidateを拒否する", () => {
    const out = mkdtempSync(join(tmpdir(), "helix-lite-runtime-input-out-"));
    roots.push(out);
    expect(
      buildLiteDistributionPackage({
        repo_root: cleanSourceRoot(),
        out_dir: out,
        profile_id: "consumer_core_v1",
      }),
    ).toEqual({ ok: false, failures: ["distribution_documents_invalid"] });
  });
});

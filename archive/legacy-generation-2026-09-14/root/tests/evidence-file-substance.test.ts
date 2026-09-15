import { createHash } from "node:crypto";
import { linkSync, mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { inspectEvidenceFile, observeEvidenceFiles } from "../src/lint/evidence-file-substance";
import {
  type GateEvidenceManifest,
  validateGateEvidenceManifest,
} from "../src/lint/gn-evidence-manifest";

// PLAN-RECOVERY-1430-evidence-substance
let root: string;
beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), "helix-evidence-substance-"));
});
afterEach(() => {
  rmSync(root, { recursive: true, force: true });
});
const hash = (bytes: Buffer) => `sha256:${createHash("sha256").update(bytes).digest("hex")}`;

describe("証跡ファイルの実体", () => {
  it("U-GES-007: 採取済み観測はファイル変更で書き換わらず再採取で更新される", () => {
    writeFileSync(join(root, "output"), "before");
    const observed = observeEvidenceFiles(root, ["output", "missing", "output"]);
    expect(Object.keys(observed)).toEqual(["missing", "output"]);
    expect(Object.isFrozen(observed)).toBe(true);
    expect(Object.isFrozen(observed.output)).toBe(true);
    expect(observed.missing.ok).toBe(false);
    writeFileSync(join(root, "output"), "after");
    expect(observed.output).toEqual({
      ok: true,
      digest: hash(Buffer.from("before")),
      sizeBytes: 6,
      content: { kind: "opaque" },
    });
    expect(observeEvidenceFiles(root, ["output"]).output).toEqual({
      ok: true,
      digest: hash(Buffer.from("after")),
      sizeBytes: 5,
      content: { kind: "opaque" },
    });
  });
  it("U-GES-005: gateは形式だけ正しい偽digestと保存後改変を拒否する", () => {
    mkdirSync(join(root, "tests"));
    const evidencePath = "tests/output.vitest.log";
    const bytes = Buffer.from(
      JSON.stringify({
        success: true,
        numPassedTests: 1,
        numFailedTests: 0,
        testResults: [{ name: "repo://tests/evidence-file-substance.test.ts" }],
      }),
    );
    writeFileSync(join(root, evidencePath), bytes);
    // validator用の合成fixture。実コマンド実行・実案件coverageの証跡ではない。
    const manifest: GateEvidenceManifest = {
      manifest_path: "fixture.json",
      schema_version: "fixture-v1",
      gate: "G9",
      profile: "fixture",
      plan_id: "fixture",
      selected_item_ids: ["ST-001"],
      mandatory_item_ids: ["ST-001"],
      deferred_item_ids: [],
      commands: [
        {
          command_id: "fixture",
          command: `vitest run tests/evidence-file-substance.test.ts --reporter=json --outputFile=${evidencePath}`,
          runner: "node",
          scope: "fixture",
          exit_code: 0,
          evidence_path: evidencePath,
          output_digest: hash(bytes),
          item_ids: ["ST-001"],
        },
      ],
      coverage: [
        {
          item_id: "ST-001",
          status: "passed",
          evidence_paths: [evidencePath],
          command_ids: ["fixture"],
        },
      ],
      exit_criteria: {
        all_mandatory_passed: true,
        failed_mandatory_count: 0,
        stale_defer_count: 0,
        doctor_check: "fixture",
      },
    };
    const config = {
      gate: "G9",
      schemaVersion: "fixture-v1",
      evidenceDir: "tests",
      itemPrefix: "ST-",
      doctorCheck: "fixture",
    };
    expect(
      validateGateEvidenceManifest(
        { ...manifest, mandatory_item_ids: [] },
        observeEvidenceFiles(root, [evidencePath]),
        config,
      ),
    ).toContain("fixture.json: mandatory_item_ids must not be empty");
    expect(
      validateGateEvidenceManifest(manifest, observeEvidenceFiles(root, [evidencePath]), config),
    ).toEqual([]);
    for (const [invalidCommand, reason] of [
      [
        `node fake-runner.js tests/evidence-file-substance.test.ts --reporter=json --outputFile=${evidencePath}`,
        "fixture.json: command fixture must execute vitest run",
      ],
      [
        `vitest run tests/evidence-file-substance.test.ts --outputFile=${evidencePath}`,
        "fixture.json: command fixture must request the Vitest JSON reporter",
      ],
      [
        `vitest run --reporter=json --outputFile=${evidencePath}`,
        "fixture.json: command fixture must declare at least one test path",
      ],
    ] as const) {
      const invalid = structuredClone(manifest);
      invalid.commands[0].command = invalidCommand;
      expect(
        validateGateEvidenceManifest(invalid, observeEvidenceFiles(root, [evidencePath]), config),
      ).toContain(reason);
    }
    const sourcePath = "tests/source.test.ts";
    writeFileSync(join(root, sourcePath), "export const passed = true;\n");
    const sourceBytes = Buffer.from("export const passed = true;\n");
    const sourceAsReceipt = structuredClone(manifest);
    sourceAsReceipt.commands[0].evidence_path = sourcePath;
    sourceAsReceipt.commands[0].output_digest = hash(sourceBytes);
    sourceAsReceipt.commands[0].command = `vitest run ${sourcePath} --reporter=json --outputFile=${sourcePath}`;
    expect(
      validateGateEvidenceManifest(
        sourceAsReceipt,
        observeEvidenceFiles(root, [sourcePath]),
        config,
      ),
    ).toContain("fixture.json: command fixture evidence_path must be a .vitest.log receipt");
    manifest.coverage[0].status = "failed";
    expect(
      validateGateEvidenceManifest(manifest, observeEvidenceFiles(root, [evidencePath]), config),
    ).toContain("fixture.json: exit_criteria.failed_mandatory_count disagrees with coverage");
    manifest.coverage[0].status = "passed";
    manifest.coverage.unshift({ ...manifest.coverage[0], status: "failed" });
    expect(
      validateGateEvidenceManifest(manifest, observeEvidenceFiles(root, [evidencePath]), config),
    ).toContain("fixture.json: duplicate coverage item_id");
    manifest.coverage.shift();
    manifest.commands.push({ ...manifest.commands[0], item_ids: ["ST-OTHER"] });
    expect(
      validateGateEvidenceManifest(manifest, observeEvidenceFiles(root, [evidencePath]), config),
    ).toEqual(["fixture.json: duplicate command_id"]);
    manifest.commands.pop();
    manifest.commands[0].item_ids = ["ST-OTHER"];
    expect(
      validateGateEvidenceManifest(manifest, observeEvidenceFiles(root, [evidencePath]), config),
    ).toEqual(["fixture.json: coverage ST-001 references command fixture without matching item"]);
    manifest.commands[0].item_ids = ["ST-001"];
    manifest.commands[0].output_digest = `sha256:${"0".repeat(64)}`;
    expect(
      validateGateEvidenceManifest(manifest, observeEvidenceFiles(root, [evidencePath]), config),
    ).toContain("fixture.json: command fixture output_digest does not match evidence bytes");
    manifest.commands[0].output_digest = hash(bytes);
    writeFileSync(join(root, evidencePath), "tampered");
    expect(
      validateGateEvidenceManifest(manifest, observeEvidenceFiles(root, [evidencePath]), config),
    ).toContain("fixture.json: command fixture output_digest does not match evidence bytes");
  });
  it("U-GES-001: 実bytesのhashとsizeを返す", () => {
    const bytes = Buffer.from([0, 255, 13, 10]);
    writeFileSync(join(root, "evidence"), bytes);
    expect(inspectEvidenceFile(root, "evidence")).toEqual({
      ok: true,
      digest: hash(bytes),
      sizeBytes: 4,
      content: { kind: "opaque" },
    });
    writeFileSync(join(root, "evidence"), "changed");
    expect(inspectEvidenceFile(root, "evidence")).not.toEqual({
      ok: true,
      digest: hash(bytes),
      sizeBytes: 4,
      content: { kind: "opaque" },
    });
  });
  it("U-GES-002: 実際の空出力は空bytesのhashとして扱う", () => {
    writeFileSync(join(root, "empty"), "");
    expect(inspectEvidenceFile(root, "empty")).toEqual({
      ok: true,
      digest: hash(Buffer.alloc(0)),
      sizeBytes: 0,
      content: { kind: "opaque" },
    });
  });
  it("U-GES-003: 不在とdirectoryを拒否する", () => {
    mkdirSync(join(root, "directory"));
    expect(inspectEvidenceFile(root, "missing").ok).toBe(false);
    expect(inspectEvidenceFile(root, "directory").ok).toBe(false);
  });
  it("U-GES-004: 絶対path・親参照・外向きsymlink・hardlinkを拒否する", () => {
    expect(inspectEvidenceFile(root, root).ok).toBe(false);
    expect(inspectEvidenceFile(root, "../outside").ok).toBe(false);
    const nested = join(root, "nested");
    mkdirSync(nested);
    writeFileSync(join(root, "outside"), "outside");
    if (process.platform !== "win32") {
      symlinkSync(join(root, "outside"), join(nested, "link"));
      expect(inspectEvidenceFile(nested, "link").ok).toBe(false);
      linkSync(join(root, "outside"), join(root, "hardlink"));
      expect(inspectEvidenceFile(root, "hardlink")).toEqual({
        ok: false,
        reason: "changed_during_read",
      });
    }
  });
});

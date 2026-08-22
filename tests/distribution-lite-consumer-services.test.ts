import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { runLiteConsumerHook } from "../src/setup/distribution-consumer-hook-adapter";
import { createLiteConsumerServices } from "../src/setup/distribution-consumer-services";

// PLAN-L7-657-distribution-lite-consumer-canary — U-DISTCANARY-001..004

const roots: string[] = [];
afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});

function consumerRoot(): string {
  const root = mkdtempSync(join(tmpdir(), "helix-lite-consumer-service-"));
  roots.push(root);
  return root;
}

describe("PLAN-L7-657: Lite clean consumer services", () => {
  it("U-DISTCANARY-001: setup dry-runはwrite 0、apply後の再実行はidempotent", () => {
    const root = consumerRoot();
    const services = createLiteConsumerServices({
      consumer_root: root,
      package_root: process.cwd(),
    });
    const dryRun = services.setup_project({ dry_run: true });
    expect(dryRun).toMatchObject({ exit_code: 0, payload: { ok: true, dry_run: true } });
    expect(existsSync(join(root, "AGENTS.md"))).toBe(false);
    const applied = services.setup_project({ dry_run: false });
    expect(applied).toMatchObject({ exit_code: 0, payload: { ok: true, dry_run: false } });
    expect(existsSync(join(root, "AGENTS.md"))).toBe(true);
    const repeated = services.setup_project({ dry_run: false });
    expect(repeated).toMatchObject({ exit_code: 0, payload: { writes: [] } });
  });

  it("U-DISTCANARY-002: consumer所有bytesを上書きせず全writeを停止する", () => {
    const root = consumerRoot();
    writeFileSync(join(root, "AGENTS.md"), "consumer-owned\n", "utf8");
    const services = createLiteConsumerServices({
      consumer_root: root,
      package_root: process.cwd(),
    });
    const applied = services.setup_project({ dry_run: false });
    expect(applied).toMatchObject({
      exit_code: 1,
      payload: { ok: false, conflicts: ["AGENTS.md"], writes: [] },
    });
    expect(readFileSync(join(root, "AGENTS.md"), "utf8")).toBe("consumer-owned\n");
    expect(existsSync(join(root, "CLAUDE.md"))).toBe(false);
  });

  it("U-DISTCANARY-003: statusとcompletion evidenceを同じmanaged stateへ束縛する", () => {
    const root = consumerRoot();
    const services = createLiteConsumerServices({
      consumer_root: root,
      package_root: process.cwd(),
    });
    services.setup_project({ dry_run: false });
    expect(services.status()).toMatchObject({ exit_code: 0, payload: { ok: true } });
    expect(services.completion_decision_packet()).toMatchObject({
      exit_code: 0,
      payload: { ok: true, evidence_digest: expect.stringMatching(/^sha256:/) },
    });
    expect(services.completion_review_bundle()).toMatchObject({
      exit_code: 0,
      payload: { ok: true, evidence_digest: expect.stringMatching(/^sha256:/) },
    });
  });

  it("U-DISTCANARY-004: Lite hook adapterが再帰削除をfail-closeする", () => {
    const root = consumerRoot();
    const outcome = runLiteConsumerHook({
      hook_id: "machine-safety-guard",
      repo_root: root,
      raw_input: JSON.stringify({ tool_input: { command: "rm -rf ." } }),
    });
    expect(outcome).toMatchObject({ exit_code: 2, payload: { decision: "block" } });
  });

  it("U-DISTCANARY-005: rollback rehearsalはconsumer bytesを変更しないplan-only", () => {
    const root = consumerRoot();
    const services = createLiteConsumerServices({
      consumer_root: root,
      package_root: process.cwd(),
    });
    expect(services.lifecycle_rehearsal({ operation: "rollback" })).toMatchObject({
      exit_code: 0,
      payload: {
        ok: true,
        operation: "rollback",
        apply: false,
        preserves: ["consumer_owned_files", "completion_evidence"],
      },
    });
    expect(existsSync(join(root, ".helix"))).toBe(false);
  });
});

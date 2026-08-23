import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { createLiteConsumerServices } from "../src/setup/distribution-lite-consumer-services";

// PLAN-L7-657-distribution-lite-consumer-canary
const roots: string[] = [];
afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});

function fixture(): string {
  const root = mkdtempSync(join(tmpdir(), "helix-lite-services-"));
  roots.push(root);
  writeFileSync(join(root, "package.json"), '{"name":"consumer","private":true}\n');
  return root;
}

describe("PLAN-L7-657: Lite consumer services", () => {
  it("U-DISTCAN-006a: setup dry-run／apply／再実行を決定的に処理する", () => {
    const root = fixture();
    const services = createLiteConsumerServices(root);
    expect(services.setup_project({ dry_run: true })).toMatchObject({
      exit_code: 0,
      payload: { ok: true, dry_run: true },
    });
    expect(services.status().exit_code).toBe(1);
    expect(services.setup_project({ dry_run: false })).toMatchObject({
      exit_code: 0,
      payload: { ok: true },
    });
    expect(services.setup_project({ dry_run: false })).toMatchObject({
      payload: { idempotent: true },
    });
    expect(services.status().exit_code).toBe(0);
    expect(services.consumer_doctor()).toMatchObject({
      exit_code: 0,
      payload: { ok: true, failures: [] },
    });
  });

  it("U-DISTCAN-007a: consumer所有CIを上書きしない", () => {
    const root = fixture();
    mkdirSync(join(root, ".github", "workflows"), { recursive: true });
    const owned = "name: consumer-owned\n";
    writeFileSync(join(root, ".github", "workflows", "helix-consumer.yml"), owned);
    const result = createLiteConsumerServices(root).setup_project({ dry_run: false });
    expect(result).toMatchObject({
      exit_code: 1,
      payload: { reason: "consumer_owned_file_conflict" },
    });
    expect(readFileSync(join(root, ".github", "workflows", "helix-consumer.yml"), "utf8")).toBe(
      owned,
    );
  });

  it("U-DISTCAN-006b: delegationは実行せずproviderとtask digestだけをreceipt化する", () => {
    const result = createLiteConsumerServices(fixture()).minimal_delegated_workflow({
      provider: "codex",
      role: "se",
      task: "consumer task",
      plan_id: null,
      execute: false,
    });
    expect(result).toMatchObject({
      exit_code: 0,
      payload: { ok: true, execute: false, provider: "codex", role: "se" },
    });
    expect(result.payload).not.toHaveProperty("task");
  });
});

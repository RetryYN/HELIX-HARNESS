import { mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
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
      payload: {
        ok: true,
        dry_run: true,
        changes: [".github/workflows/helix-consumer.yml", ".helix/consumer-lite.json"],
      },
    });
    expect(services.status().exit_code).toBe(1);
    expect(services.setup_project({ dry_run: false })).toMatchObject({
      exit_code: 0,
      payload: {
        ok: true,
        changes: [".github/workflows/helix-consumer.yml", ".helix/consumer-lite.json"],
      },
    });
    expect(services.setup_project({ dry_run: false })).toMatchObject({
      payload: { idempotent: true },
    });
    expect(services.status().exit_code).toBe(0);
    expect(services.consumer_doctor()).toMatchObject({
      exit_code: 0,
      payload: { ok: true, failures: [] },
    });
    const workflow = readFileSync(join(root, ".github", "workflows", "helix-consumer.yml"), "utf8");
    expect(workflow).toContain("npm ci --ignore-scripts");
    expect(workflow).toContain("npx --no-install helix doctor --profile consumer --json");
    expect(workflow).not.toContain("npm install");
    writeFileSync(join(root, ".github", "workflows", "helix-consumer.yml"), "tampered\n");
    expect(services.consumer_doctor()).toMatchObject({
      exit_code: 1,
      payload: { ok: false, failures: ["consumer_ci_missing_or_invalid"] },
    });
    expect(services.completion_decision_packet()).toMatchObject({
      exit_code: 1,
      payload: { ok: false, failures: ["consumer_ci_missing_or_invalid"] },
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

    const linkedRoot = fixture();
    const canonicalRoot = fixture();
    createLiteConsumerServices(canonicalRoot).setup_project({ dry_run: false });
    mkdirSync(join(linkedRoot, ".github", "workflows"), { recursive: true });
    symlinkSync(
      join(canonicalRoot, ".github", "workflows", "helix-consumer.yml"),
      join(linkedRoot, ".github", "workflows", "helix-consumer.yml"),
    );
    expect(createLiteConsumerServices(linkedRoot).setup_project({ dry_run: false })).toMatchObject({
      exit_code: 1,
      payload: { reason: "consumer_owned_file_conflict" },
    });

    const danglingRoot = fixture();
    mkdirSync(join(danglingRoot, ".github", "workflows"), { recursive: true });
    symlinkSync(
      join(danglingRoot, "outside-missing.yml"),
      join(danglingRoot, ".github", "workflows", "helix-consumer.yml"),
    );
    expect(
      createLiteConsumerServices(danglingRoot).setup_project({ dry_run: false }),
    ).toMatchObject({
      exit_code: 1,
      payload: { reason: "consumer_owned_file_conflict" },
    });
    expect(() => readFileSync(join(danglingRoot, "outside-missing.yml"))).toThrow();

    const ancestorRoot = fixture();
    const outsideRoot = fixture();
    symlinkSync(outsideRoot, join(ancestorRoot, ".github"));
    expect(
      createLiteConsumerServices(ancestorRoot).setup_project({ dry_run: false }),
    ).toMatchObject({
      exit_code: 1,
      payload: { reason: "consumer_owned_file_conflict" },
    });
    expect(() => readFileSync(join(outsideRoot, "workflows", "helix-consumer.yml"))).toThrow();
  });

  it("U-DISTCAN-007: setup前後で既存consumer所有bytesを保全する", () => {
    const root = fixture();
    const consumerPath = join(root, "consumer-owned.txt");
    writeFileSync(consumerPath, "consumer-owned\n");
    const before = readFileSync(consumerPath, "utf8");
    expect(createLiteConsumerServices(root).setup_project({ dry_run: false }).exit_code).toBe(0);
    expect(readFileSync(consumerPath, "utf8")).toBe(before);
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

import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { rehearseLiteConsumerLifecycle } from "../src/setup/distribution-lite-consumer-lifecycle";

// PLAN-L7-657-distribution-lite-consumer-canary
const roots: string[] = [];
afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});

function fixture(): string {
  const root = mkdtempSync(join(tmpdir(), "helix-lite-lifecycle-"));
  roots.push(root);
  mkdirSync(join(root, ".helix", "evidence"), { recursive: true });
  writeFileSync(join(root, "consumer.txt"), "consumer-owned\n");
  writeFileSync(join(root, ".helix", "evidence", "completion.json"), '{"green":true}\n');
  writeFileSync(
    join(root, ".helix", "engine-pin.json"),
    `${JSON.stringify({ schema_version: "helix-lite-engine-pin.v1", immutable_tag: "v0.1.0" }, null, 2)}\n`,
  );
  return root;
}

function rehearse(root: string, previous = "v0.1.0") {
  return rehearseLiteConsumerLifecycle({
    consumer_root: root,
    previous_pin: previous,
    target_pin: "v0.1.1",
    expected_previous_pin: "v0.1.0",
    consumer_owned_paths: ["consumer.txt"],
    evidence_paths: [".helix/evidence/completion.json"],
  });
}

describe("PLAN-L7-657: Lite consumer lifecycle", () => {
  it("U-DISTCAN-009: upgrade／rollback／uninstallでconsumer成果とevidenceを保全する", () => {
    const root = fixture();
    const result = rehearse(root);
    expect(result).toMatchObject({
      ok: true,
      previous_pin: "v0.1.0",
      target_pin: "v0.1.1",
      rollback_pin: "v0.1.0",
      uninstall_preserved_evidence: true,
    });
    expect(readFileSync(join(root, "consumer.txt"), "utf8")).toBe("consumer-owned\n");
    expect(readFileSync(join(root, ".helix", "evidence", "completion.json"), "utf8")).toBe(
      '{"green":true}\n',
    );
    expect(readFileSync(join(root, ".helix", "engine-pin.json"), "utf8")).toContain("v0.1.0");
  });

  it("U-DISTCAN-009a: 直前pin以外とsymlink pinを拒否する", () => {
    expect(rehearse(fixture(), "v0.0.9")).toEqual({
      ok: false,
      failures: ["pin_not_direct_predecessor"],
    });
    const root = fixture();
    writeFileSync(join(root, "outside-pin.json"), "{}\n");
    unlinkSync(join(root, ".helix", "engine-pin.json"));
    symlinkSync(join(root, "outside-pin.json"), join(root, ".helix", "engine-pin.json"));
    expect(rehearse(root)).toEqual({ ok: false, failures: ["consumer_path_unsafe"] });

    const drifted = fixture();
    writeFileSync(join(drifted, ".helix", "engine-pin.json"), '{"immutable_tag":"v0.0.9"}\n');
    expect(rehearse(drifted)).toEqual({ ok: false, failures: ["pin_identity_mismatch"] });

    const ancestorRoot = mkdtempSync(join(tmpdir(), "helix-lite-lifecycle-ancestor-"));
    const outsideRoot = fixture();
    roots.push(ancestorRoot);
    writeFileSync(join(ancestorRoot, "consumer.txt"), "consumer-owned\n");
    symlinkSync(join(outsideRoot, ".helix"), join(ancestorRoot, ".helix"));
    expect(rehearse(ancestorRoot)).toEqual({ ok: false, failures: ["consumer_path_unsafe"] });
  });
});

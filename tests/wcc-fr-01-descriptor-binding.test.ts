import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { canonicalJson, sha256Digest } from "../src/runtime/digest";
import { parseWorkerDescriptor } from "../src/runtime/worker-descriptor-admission";

// Issue #194 close 準備 — WCC-FR-01 completion binding。
// WCC-FR-01（委譲面: versioned descriptor）は L3 worker-common-contract.md §1 で
// 「全workerは versioned descriptor（agent_id/contract_version/capability_class）を持つ」と
// 規定する。この要件（L3 doc）が runtime 実装（worker-descriptor-admission）で実際に強制されて
// いることを requirement→implementation で束縛し、descriptor schema が3フィールドを落とす退行を
// fail-close する。既存 U-WDA-001（parse 正常系）と重複せず、L3 要件文言との対応を固定する。

const L3_PATH = "docs/design/helix/L3-requirements/worker-common-contract.md";

function wccFr01Row(): string {
  const doc = readFileSync(L3_PATH, "utf-8");
  const row = doc.split("\n").find((line) => /^\|\s*`WCC-FR-01`\s*\|/.test(line));
  if (!row) throw new Error("WCC-FR-01 row not found in L3 worker-common-contract.md");
  return row;
}

function validDescriptor(): Record<string, unknown> {
  const payload = {
    schema_version: "helix-worker-descriptor.v1" as const,
    agent_id: "kimi-worker",
    contract_version: "1.0.0",
    provider: "kimi",
    capability_class: "implementation" as const,
    input_schema_digest: sha256Digest("input"),
    output_schema_digest: sha256Digest("output"),
  };
  return { ...payload, descriptor_digest: sha256Digest(canonicalJson(payload)) };
}

describe("WCC-FR-01 versioned descriptor: L3 requirement bound to runtime admission (Issue #194)", () => {
  it("U-WCC-FR01-001: L3 §1 が versioned descriptor の3フィールドを mandate している", () => {
    const row = wccFr01Row();
    expect(row).toContain("versioned descriptor");
    expect(row).toContain("agent_id");
    expect(row).toContain("contract_version");
    expect(row).toContain("capability_class");
  });

  it("U-WCC-FR01-001: runtime admission が完全な versioned descriptor を受理する", () => {
    expect(parseWorkerDescriptor(validDescriptor()).ok).toBe(true);
  });

  it("U-WCC-FR01-001: descriptor 版付け3フィールドの欠落を runtime が fail-close する", () => {
    for (const field of ["agent_id", "contract_version", "capability_class"]) {
      const broken = validDescriptor();
      delete broken.descriptor_digest;
      delete broken[field];
      // digest を欠落後の payload で再計算し、拒否理由を「必須フィールド欠落」に限定する。
      broken.descriptor_digest = sha256Digest(canonicalJson(broken));
      expect(parseWorkerDescriptor(broken).ok, `missing ${field} must be rejected`).toBe(false);
    }
  });
});

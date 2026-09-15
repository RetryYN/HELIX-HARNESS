import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const plan = readFileSync("docs/plans/PLAN-L4-60-worker-descriptor-admission.md", "utf8");
const design = readFileSync(
  "docs/design/helix/L4-basic-design/worker-descriptor-admission.md",
  "utf8",
);
const systemTest = readFileSync(
  "docs/test-design/helix/L9-worker-descriptor-admission-system-test-design.md",
  "utf8",
);

describe("worker descriptor admission L4/L9 pair", () => {
  it("WCC-FR-01と単一責務ownerへ原子的に束縛する", () => {
    for (const artifact of [plan, design, systemTest]) {
      expect(artifact).toContain("WCC-FR-01");
      expect(artifact).toContain("worker-descriptor-admission");
    }
    expect(plan).toContain("github_issue_id: 225");
    expect(plan).toContain("no_code_decision: modify");
  });

  it("descriptorのexact解決と起動前fail-closeを設計する", () => {
    for (const token of [
      "WorkerDescriptorV1",
      "WorkerRegistrySnapshotV1",
      "WorkerDescriptorAdmissionDecision",
      "WORKER_DESCRIPTOR_INVALID",
      "WORKER_DESCRIPTOR_NOT_FOUND",
      "WORKER_DESCRIPTOR_AMBIGUOUS",
      "WORKER_DESCRIPTOR_INACTIVE",
      "WORKER_DESCRIPTOR_CAPABILITY_MISMATCH",
      "WORKER_DESCRIPTOR_DIGEST_MISMATCH",
    ]) {
      expect(design).toContain(token);
    }
    expect(design).toContain("spawn 0");
  });

  it("正負oracleとstale再判定をL9へ渡す", () => {
    for (let index = 1; index <= 9; index += 1) {
      expect(systemTest).toContain(`ST-WDA-${String(index).padStart(3, "0")}`);
    }
    expect(systemTest).toContain("receiptをstale化");
    expect(systemTest).toContain("spawn 0");
  });

  it("実在source projectionを設計リファクタリングの選択結果にする", () => {
    expect(design).toContain("`AgentRegistryProjection`");
    expect(design).toContain("`PythonWorkerDescriptorProjection`");
    expect(design).toContain("new persistence surface");
    expect(design).toContain("source projection（採用）");
    expect(plan).toContain("新永続registry、DB table、detector、workflowを追加しない");
  });

  it("後続behaviorを本pairの完了claimへ混載しない", () => {
    expect(design).toContain("`WCC-FR-02`のwrapper");
    expect(design).toContain("`WCC-FR-03/04`のsandbox");
    expect(design).toContain("`WCC-FR-07/08`のblind admission");
    expect(design).toContain("`WCC-FR-09`のcontext packet");
  });
});

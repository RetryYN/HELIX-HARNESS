import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const plan = readFileSync("docs/plans/PLAN-L5-86-worker-descriptor-admission.md", "utf8");
const design = readFileSync("docs/design/helix/L5-detail/worker-descriptor-admission.md", "utf8");
const unit = readFileSync(
  "docs/test-design/helix/L8-worker-descriptor-admission-unit-test-design.md",
  "utf8",
);

describe("PLAN-L5-86 worker descriptor admission detail pair", () => {
  it("WCC-FR-01と単一責務ownerへ束縛する", () => {
    for (const artifact of [plan, design, unit]) {
      expect(artifact).toContain("WCC-FR-01");
      expect(artifact).toContain("worker-descriptor-admission");
    }
  });

  it("descriptor digestの自己参照除外とstrict型を固定する", () => {
    for (const token of [
      "WorkerDescriptorPayloadV1",
      "WorkerDescriptorV1",
      "`descriptor_digest` field自身を入力へ含めない",
      "unknown keyを拒否",
      "WorkerCapabilityClassV1",
    ]) {
      expect(design).toContain(token);
    }
  });

  it("requestをagent/version/capabilityのexact 3-tupleへ固定する", () => {
    expect(design).toContain("WorkerDescriptorRequestV1");
    expect(design).toContain("agent_id + contract_version + capability_class");
    expect(design).toContain("provider fallbackをしない");
  });

  it("failure、stale、spawn 0境界を区別する", () => {
    for (const code of [
      "WORKER_DESCRIPTOR_INVALID",
      "WORKER_DESCRIPTOR_NOT_FOUND",
      "WORKER_DESCRIPTOR_AMBIGUOUS",
      "WORKER_DESCRIPTOR_INACTIVE",
      "WORKER_DESCRIPTOR_CAPABILITY_MISMATCH",
      "WORKER_DESCRIPTOR_DIGEST_MISMATCH",
      "WORKER_ADMISSION_DECISION_STALE",
    ]) {
      expect(design).toContain(code);
    }
    expect(design).toContain("spawn 0");
  });

  it("WCC-FR-02以降を明示委譲して完了claimへ混載しない", () => {
    for (const token of [
      "WCC-FR-02",
      "WCC-FR-03/04",
      "WCC-FR-05/06",
      "WCC-FR-07/08",
      "WCC-FR-09",
    ]) {
      expect(design).toContain(token);
    }
    expect(unit).toContain("launch receipt欠落を本ownerの完了claimへ混入するmutationを拒否");
  });

  it("L8 oracle 13件とL9 trace exact setを固定する", () => {
    const ids = [...unit.matchAll(/`(U-WDA-\d{3})`/g)].map((match) => match[1]);
    expect(ids).toEqual(
      Array.from({ length: 13 }, (_, index) => `U-WDA-${String(index + 1).padStart(3, "0")}`),
    );
    expect(unit).toContain("`ST-WDA-001..009`");
  });

  it("新ownerを増やさない設計リファクタリングを固定する", () => {
    for (const token of [
      "new registry 0",
      "new DB table 0",
      "new workflow 0",
      "production code 0",
    ]) {
      expect(design).toContain(token);
    }
    expect(plan).toContain("no_code_decision: reuse");
  });
});

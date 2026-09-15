// PLAN-L7-513-screen-stage-closure-store / U-SAP-011（HST-CASE-024 系の stage closure gate）
import { describe, expect, it } from "vitest";
import { createInMemoryScreenApplicabilityStore } from "../src/design/screen-applicability-store";
import {
  NOW,
  registerScreenStoreContractSuite,
  seed,
  validCommit,
} from "./tools/screen-store-contract";

describe("U-SAP-011 commitStageClosureAndGate (in-memory)", () => {
  it("U-SAP-011: 唯一のgate write authorityがstage closureとpassed gateを同一operation・CASでatomic commitする", async () => {
    const store = createInMemoryScreenApplicabilityStore(seed(), NOW);
    const result = await store.commitStageClosureAndGate(validCommit());
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.status).toBe("committed");
      expect(result.value.before_stage_head).toBe("sha256:stage-head-1");
      expect(result.value.after_stage_head).not.toBe("sha256:stage-head-1");
      expect(result.value.before_gate_head).toBe("sha256:gate-head-1");
      expect(result.value.inserted_completion_count).toBe(2);
      expect(result.value.write_set_digest).toBe(validCommit().write_set_digest);
    }
    expect(store.committedGateReceiptCount()).toBe(1);
  });
});

registerScreenStoreContractSuite("in-memory", (world, trustedNow) =>
  createInMemoryScreenApplicabilityStore(world, trustedNow),
);

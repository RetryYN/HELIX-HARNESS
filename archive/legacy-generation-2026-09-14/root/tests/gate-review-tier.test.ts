// PLAN-RECOVERY-1411-review-checklist-validation — U-CHKREV-001
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  evaluateGateReview,
  judgmentReviewPlanForMode,
  loadReviewChecklist,
  REQUIRED_CHECKLIST_IDS,
  type ReviewChecklist,
} from "../src/gate/review-tier";
import { isNaiveSelfReviewKind, JUDGMENT_GATES } from "../src/gate/review-tier-policy";

const passingChecklist = (): ReviewChecklist => ({
  items: REQUIRED_CHECKLIST_IDS.map((id) => ({ id, status: "pass", evidence: `${id} checked` })),
});

describe("gate review tier", () => {
  it("F01: メタデータ付き旧skill templateを完成したchecklist証拠として読まない", () => {
    expect(() => loadReviewChecklist("docs/skills/review-checklist.yaml")).toThrow(
      "review checklist invalid",
    );
  });

  it("U-CHKREV-001: loaderと直接入力で不正checklistを拒否し、正常対照を維持する", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-checklist-"));
    const path = join(root, "checklist.yaml");
    try {
      const valid = passingChecklist();
      for (const invalid of [
        null,
        {},
        { items: [null] },
        { ...valid, unexpected: true },
        { items: valid.items.map((item) => ({ ...item, evidence: 3 })) },
        { items: valid.items.map((item) => ({ ...item, unexpected: true })) },
        { items: [...valid.items, valid.items[0]] },
        { items: [{ id: "DOC", status: "fail" }, ...valid.items] },
        { items: [...valid.items, { id: "UNKNOWN", status: "pass" }] },
        { items: valid.items.slice(1) },
        ...[undefined, "PASS", "skip", null, 1].map((status) => ({
          items: valid.items.map((item) => ({ ...item, status })),
        })),
      ]) {
        writeFileSync(path, JSON.stringify(invalid));
        expect(() => loadReviewChecklist(path)).toThrow("review checklist invalid");
        for (const mode of ["codex-only", "claude-only"] as const) {
          expect(
            evaluateGateReview({
              gate: "G4",
              mode,
              checklist: invalid as unknown as ReviewChecklist,
            }).passed,
          ).toBe(false);
        }
      }
      writeFileSync(path, JSON.stringify(valid));
      expect(loadReviewChecklist(path)).toEqual(valid);
      for (const mode of ["codex-only", "claude-only"] as const) {
        expect(evaluateGateReview({ gate: "G4", mode, checklist: valid }).passed).toBe(true);
        const notApplicable = passingChecklist();
        notApplicable.items[0] = { id: "DOC", status: "n-a", evidence: "文書変更なし" };
        expect(evaluateGateReview({ gate: "G4", mode, checklist: notApplicable }).passed).toBe(
          true,
        );
      }
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it.each([undefined, "PASS", "skip", null, 1])(
    "F01: 必須7項目が揃っても不正status %s を拒否する",
    (status) => {
      const checklist = {
        items: REQUIRED_CHECKLIST_IDS.map((id) => ({ id, status })),
      } as unknown as ReviewChecklist;
      for (const mode of ["codex-only", "claude-only"] as const) {
        expect(evaluateGateReview({ gate: "G4", mode, checklist }).passed).toBe(false);
      }
    },
  );

  it("F01: 重複IDの後勝ちでfailをpassへ上書きできない", () => {
    const checklist = passingChecklist();
    checklist.items.unshift({ id: "DOC", status: "fail" });
    expect(evaluateGateReview({ gate: "G4", mode: "codex-only", checklist }).passed).toBe(false);
  });

  it("F01: 必須項目以外のIDを拒否する", () => {
    const checklist = passingChecklist();
    checklist.items.push({ id: "UNKNOWN", status: "pass" });
    expect(evaluateGateReview({ gate: "G4", mode: "codex-only", checklist }).passed).toBe(false);
  });

  it("F01: 理由付きn-aは従来どおり受理する", () => {
    const checklist = passingChecklist();
    checklist.items[0] = { id: "DOC", status: "n-a", evidence: "文書変更なし" };
    expect(evaluateGateReview({ gate: "G4", mode: "codex-only", checklist }).passed).toBe(true);
  });

  it("loads judgment gate policy from the externalized policy module", () => {
    expect(JUDGMENT_GATES).toContain("G4");
    expect(REQUIRED_CHECKLIST_IDS).toContain("TST");
    expect(isNaiveSelfReviewKind("self-review")).toBe(true);
  });

  it("passes hybrid judgment gate only with cross-agent distinct models", () => {
    const ok = evaluateGateReview({
      gate: "G4",
      mode: "hybrid",
      reviewKind: "cross_agent",
      workerModel: "codex:gpt-5.4",
      reviewerModel: "claude:opus",
    });
    expect(ok.passed).toBe(true);
    expect(ok.cross_agent_review).toBe("available");

    const same = evaluateGateReview({
      gate: "G4",
      mode: "hybrid",
      reviewKind: "cross_agent",
      workerModel: "codex:gpt-5.4",
      reviewerModel: "codex:gpt-5.4",
    });
    expect(same.passed).toBe(false);
    expect(same.messages.join("\n")).toContain("same_model_approval");
  });

  it("rejects same-provider different-model cross-agent review in hybrid mode", () => {
    const result = evaluateGateReview({
      gate: "G4",
      mode: "hybrid",
      reviewKind: "cross_agent",
      workerModel: "claude-opus-4-8",
      reviewerModel: "claude-sonnet-4-6",
    });
    expect(result.passed).toBe(false);
    expect(result.messages.join("\n")).toContain("different providers");
  });

  it("fails single-runtime judgment gate without checklist evidence", () => {
    const result = evaluateGateReview({ gate: "G4", mode: "codex-only" });
    expect(result.passed).toBe(false);
    expect(result.review_kind).toBe("intra_runtime_subagent");
    expect(result.cross_agent_review).toBe("unavailable");
  });

  it("passes single-runtime judgment gate with complete checklist", () => {
    const result = evaluateGateReview({
      gate: "G4",
      mode: "claude-only",
      checklist: passingChecklist(),
    });
    expect(result.passed).toBe(true);
  });

  it("keeps claude-only and codex-only judgment gate parity for the same checklist evidence", () => {
    const checklist = passingChecklist();
    const claude = evaluateGateReview({ gate: "G4", mode: "claude-only", checklist });
    const codex = evaluateGateReview({ gate: "G4", mode: "codex-only", checklist });
    expect(claude.passed).toBe(codex.passed);
    expect(claude.cross_agent_review).toBe(codex.cross_agent_review);
    expect(claude.review_kind).toBe(codex.review_kind);
    expect(claude.messages).toEqual(codex.messages);
  });

  it("U-DETECT-006: exposes a machine-readable judgment review plan for every runtime mode", () => {
    expect(judgmentReviewPlanForMode("hybrid")).toMatchObject({
      mode: "hybrid",
      requiredReviewKind: "cross_agent",
      crossAgentReview: "available",
      gateCommandTemplate: expect.stringContaining("--review-kind cross_agent"),
      requiredEvidence: expect.arrayContaining([
        "worker_model recorded",
        "reviewer_model recorded",
      ]),
      requiredEvidenceJa: expect.arrayContaining([
        "worker_model を記録する",
        "reviewer_model を記録する",
      ]),
    });
    expect(judgmentReviewPlanForMode("codex-only")).toMatchObject({
      mode: "codex-only",
      requiredReviewKind: "intra_runtime_subagent",
      crossAgentReview: "unavailable",
      gateCommandTemplate: expect.stringContaining("--checklist <review-checklist.yaml>"),
      requiredEvidenceJa: expect.arrayContaining([
        "judgment checklist に全必須項目が含まれることを記録する",
      ]),
    });
    expect(judgmentReviewPlanForMode("standalone")).toMatchObject({
      mode: "standalone",
      requiredReviewKind: "human",
      crossAgentReview: "unavailable",
      gateCommandTemplate: expect.stringContaining("--human-approved"),
      requiredEvidenceJa: expect.arrayContaining(["human approval evidence を記録する"]),
    });
    for (const mode of ["hybrid", "codex-only", "standalone"] as const) {
      const plan = judgmentReviewPlanForMode(mode);
      expect(plan.requiredEvidenceJa).toHaveLength(plan.requiredEvidence.length);
    }
  });

  it("fails checklist item fail and n-a without evidence", () => {
    const checklist = passingChecklist();
    checklist.items[0] = { id: "DOC", status: "n-a" };
    checklist.items[1] = { id: "TST", status: "fail", evidence: "test gap" };
    const result = evaluateGateReview({ gate: "G4", mode: "codex-only", checklist });
    expect(result.passed).toBe(false);
    expect(result.messages).toContain("checklist item n-a requires evidence: DOC");
    expect(result.messages).toContain("checklist item failed: TST");
  });

  it("rejects naive self-review as judgment-gate evidence in every mode", () => {
    const hybrid = evaluateGateReview({
      gate: "G4",
      mode: "hybrid",
      reviewKind: "self_review",
      workerModel: "codex:gpt-5.4",
      reviewerModel: "claude:opus",
    });
    const single = evaluateGateReview({
      gate: "G4",
      mode: "codex-only",
      reviewKind: "self_review",
      checklist: passingChecklist(),
    });
    const standalone = evaluateGateReview({
      gate: "G4",
      mode: "standalone",
      reviewKind: "self_review",
      humanApproved: true,
    });
    expect(hybrid.passed).toBe(false);
    expect(single.passed).toBe(false);
    expect(standalone.passed).toBe(false);
    expect(single.messages.join("\n")).toContain("self-review");
  });

  it("non-judgment gate does not require review tier", () => {
    const result = evaluateGateReview({ gate: "G3", mode: "codex-only" });
    expect(result.passed).toBe(true);
    expect(result.cross_agent_review).toBe("not-required");
  });
});

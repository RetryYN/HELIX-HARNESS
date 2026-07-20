import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { describe, expect, it } from "vitest";
import { analyzeHandoverResurrectionShadowRepo } from "../src/audit/handover-resurrection-source";
import {
  buildHandoverCutoverApprovalEvidence,
  loadAndVerifyHandoverCutoverApproval,
} from "../src/lint/handover-cutover-approval";

const root = process.cwd();
const approvalPath = ".helix/approvals/session-handover-cutover.json";

describe("session handover cutover action-binding approval", () => {
  it("U-HRET-015: approvalをPO、approved HEAD、canonical manifest、tree、dry-runへ束縛する", () => {
    const currentEvidence = buildHandoverCutoverApprovalEvidence(root);
    const approval = loadAndVerifyHandoverCutoverApproval(root);
    expect(approval).toMatchObject({
      status: "approved_applied",
      actor: "PO",
      approvedHead: "d73d075479525081adf292b5ab48dfdf66dc5462",
      paramsDigest: "sha256:d8091478fce674dbac5c5c44953fde7abbea6631f134980c424ff5be9a5f9d39",
      targetTreeDigest: "sha256:e3e25f85a11f73342b73243889e940a9e2567236ca1e723394656b7d5399b76a",
      generatedBaselineDigest:
        "sha256:476779d67e3f7190c10dbe1dce5284fed3fee21de23cd94e22b32e7f3ff78b8e",
      dryRunEvidenceDigest:
        "sha256:b59752a0556ace0ade3c435a70cc6ee1c4097369596759ebbc23488d3c5fe689",
    });
    expect(approval.decisionId).toBe(
      `handover-retirement-cutover:${approval.paramsDigest.slice("sha256:".length)}`,
    );
    expect(currentEvidence.paramsDigest).not.toBe(approval.paramsDigest);
  });

  it("U-HRET-015: semantic target findings=0を実resurrection doctor oracleとANDする", () => {
    const approval = loadAndVerifyHandoverCutoverApproval(root);
    const resurrection = analyzeHandoverResurrectionShadowRepo(root);
    expect({ approval: approval.status, resurrection }).toMatchObject({
      approval: "approved_applied",
      resurrection: {
        ok: true,
        mode: "post_complete_enforce",
        findings: [],
        preconditionErrors: [],
      },
    });
  });

  it("U-HRET-015: approval recordのscope digest改ざんをfail-closeする", () => {
    const temp = mkdtempSync(join(tmpdir(), "helix-cutover-approval-"));
    for (const path of [approvalPath, "config/handover-generated-resurrection-baseline.json"]) {
      mkdirSync(dirname(join(temp, path)), { recursive: true });
      writeFileSync(join(temp, path), readFileSync(join(root, path)));
    }
    const raw = JSON.parse(readFileSync(join(temp, approvalPath), "utf8"));
    raw.targetTreeDigest = `sha256:${"0".repeat(64)}`;
    writeFileSync(join(temp, approvalPath), `${JSON.stringify(raw)}\n`);
    expect(() => loadAndVerifyHandoverCutoverApproval(temp)).toThrow("evidence-drifted");
  });

  it("U-HRET-015: approvalとterminal journalはruntime ignoreに埋没しない", () => {
    for (const path of [approvalPath, ".helix/audit/session-handover-retirement.jsonl"]) {
      expect(() =>
        execFileSync("git", ["check-ignore", "-q", path], { cwd: root, stdio: "ignore" }),
      ).toThrow();
    }
  });
});

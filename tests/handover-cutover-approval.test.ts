import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  buildHandoverCutoverApprovalEvidence,
  loadAndVerifyHandoverCutoverApproval,
} from "../src/lint/handover-cutover-approval";
import { analyzeHandoverResurrectionShadowRepo } from "../src/lint/handover-resurrection";

const root = process.cwd();
const approvalPath = ".helix/approvals/session-handover-cutover.json";

describe("session handover cutover action-binding approval", () => {
  it("U-HRET-015: approvalをPO、approved HEAD、canonical manifest、tree、dry-runへ束縛する", () => {
    const evidence = buildHandoverCutoverApprovalEvidence(root);
    const approval = loadAndVerifyHandoverCutoverApproval(root);
    expect(approval).toMatchObject({
      status: "approved_applied",
      actor: "PO",
      approvedHead: "d73d075479525081adf292b5ab48dfdf66dc5462",
      ...evidence,
    });
    expect(approval.decisionId).toBe(
      `handover-retirement-cutover:${evidence.paramsDigest.slice("sha256:".length)}`,
    );
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

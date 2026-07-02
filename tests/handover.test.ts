import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  GENERATED_BY as SIDECAR_GENERATED_BY,
  HANDOVER_NEXT_ACTION_MARKER as SIDECAR_HANDOVER_NEXT_ACTION_MARKER,
  HANDOVER_OUTSTANDING_MARKER as SIDECAR_HANDOVER_OUTSTANDING_MARKER,
  MAX_SAME_DAY_ENTRIES as SIDECAR_MAX_SAME_DAY_ENTRIES,
  MAX_SUMMARY_PLANS as SIDECAR_MAX_SUMMARY_PLANS,
} from "../src/handover/handover-constants";
import type { HandoverDoc as SidecarHandoverDoc } from "../src/handover/handover-types";
import {
  boundSameDayEntries,
  buildPointer,
  capWithBreadcrumb,
  checkHandoverBypass,
  checkHandoverCompletionDecisionPacket,
  checkHandoverDiscipline,
  checkHandoverNextActionAnchor,
  checkHandoverOutstandingAnchor,
  countHandoverEntries,
  dedupeDigests,
  GENERATED_BY,
  HANDOVER_NEXT_ACTION_MARKER,
  HANDOVER_OUTSTANDING_MARKER,
  type HandoverDeps,
  type HandoverPointer,
  type HandoverScope,
  handoverStale,
  inferPlanFromCommit,
  latestEntrySection,
  latestSessionId,
  MAX_SAME_DAY_ENTRIES,
  MAX_SUMMARY_PLANS,
  type PlanDigestRef,
  readPointer,
  relativizeDeliverableFiles,
  relativizeTouchedFile,
  renderHandoverScaffold,
  resolveHandoverScope,
  runHandover,
  sameFamilyPlan,
  scaffoldFromDigests,
  setActivePlan,
} from "../src/handover/index";
import {
  analyzeOutstandingWork,
  type CompletionDecisionPacket,
  completionDecisionPacketForOutstanding,
  type OutstandingWork,
} from "../src/lint/outstanding";
import { resolveActivePlan, type SessionLogDeps } from "../src/runtime/session-log";

const NOW = "2026-06-04T00:00:00.000Z";

/** in-memory file store の mock HandoverDeps (now 固定で決定論)。 */
function mockDeps(over: Partial<HandoverDeps> = {}): HandoverDeps & { files: Map<string, string> } {
  const files = new Map<string, string>();
  return {
    files,
    repoRoot: "/repo",
    now: () => NOW,
    readText: (p) => files.get(p) ?? null,
    writeText: (p, c) => files.set(p, c),
    listDir: (dir) =>
      [...files.keys()]
        .filter((k) => k.startsWith(`${dir}/`) || k.startsWith(`${dir}\\`))
        .map((k) => k.slice(dir.length + 1)),
    ...over,
  };
}

/** session-log の current-plan を共有 file store で扱う mock SessionLogDeps。 */
function mockSessionDeps(files: Map<string, string>): SessionLogDeps & { removed: string[] } {
  const removed: string[] = [];
  return {
    removed,
    repoRoot: "/repo",
    now: () => NOW,
    appendLine: () => {},
    readText: (p) => files.get(p) ?? null,
    writeText: (p, c) => files.set(p, c),
    currentBranch: () => null,
    listDir: () => [],
    removeFile: (p) => {
      files.delete(p);
      removed.push(p);
    },
  };
}

const digestDir = join("/repo", ".ut-tdd", "logs", "plan");
const currentPlanPath = join("/repo", ".ut-tdd", "state", "current-plan");
const pointerPath = join("/repo", ".ut-tdd", "handover", "CURRENT.json");

describe("PLAN-L7-173 handover sidecars", () => {
  it("re-exported constants and sidecar document type stay aligned", () => {
    expect(SIDECAR_GENERATED_BY).toBe(GENERATED_BY);
    expect(SIDECAR_HANDOVER_NEXT_ACTION_MARKER).toBe(HANDOVER_NEXT_ACTION_MARKER);
    expect(SIDECAR_HANDOVER_OUTSTANDING_MARKER).toBe(HANDOVER_OUTSTANDING_MARKER);
    expect(SIDECAR_MAX_SAME_DAY_ENTRIES).toBe(MAX_SAME_DAY_ENTRIES);
    expect(SIDECAR_MAX_SUMMARY_PLANS).toBe(MAX_SUMMARY_PLANS);

    const doc: SidecarHandoverDoc = scaffoldFromDigests([digest()], [], "2026-06-24");
    expect(doc.plans[0]?.plan_id).toBe("PLAN-L7-04-handover-mechanism");
  });
});

function digest(over: Partial<PlanDigestRef> = {}): PlanDigestRef {
  return {
    plan_id: "PLAN-L7-04-handover-mechanism",
    sessions: ["s1"],
    commits: ["a413d25"],
    files_touched: ["src/handover/index.ts"],
    failures: [],
    updated_at: NOW,
    ...over,
  };
}

describe("PLAN-L7-145 handover #1: relativizeTouchedFile (absolute-path leak fix)", () => {
  const WINROOT = "C:\\Users\\micro\\OneDrive\\Desktop\\UT-TDD-agent-harness";

  it("relativizes a Windows abs path whose casing MISMATCHES repoRoot (lowercase entry vs uppercase cwd)", () => {
    // process.cwd() returns uppercase 'C:\\...'; on-disk digests store lowercase 'c:\\...'.
    // A case-sensitive compare would leave the leak intact — this is the regression that matters.
    const entry = "Write c:\\Users\\micro\\OneDrive\\Desktop\\UT-TDD-agent-harness\\src\\a.ts";
    expect(relativizeTouchedFile(entry, WINROOT)).toBe("Write src/a.ts");
  });

  it("relativizes when casing mismatches the other direction (uppercase entry vs lowercase root)", () => {
    const entry = "Edit C:\\Users\\micro\\OneDrive\\Desktop\\UT-TDD-agent-harness\\src\\b.ts";
    const lowerRoot = "c:\\Users\\micro\\OneDrive\\Desktop\\UT-TDD-agent-harness";
    expect(relativizeTouchedFile(entry, lowerRoot)).toBe("Edit src/b.ts");
  });

  it("relativizes a POSIX abs path with verb, and a bare path without verb", () => {
    expect(relativizeTouchedFile("Edit /repo/src/cli.ts", "/repo")).toBe("Edit src/cli.ts");
    expect(relativizeTouchedFile("/repo/src/cli.ts", "/repo")).toBe("src/cli.ts");
  });

  it("leaves already-relative / sibling-prefix / empty-root / non-home-abs entries untouched", () => {
    expect(relativizeTouchedFile("Edit src/cli.ts", "/repo")).toBe("Edit src/cli.ts");
    // sibling-prefix false match guarded by the trailing "/"
    expect(relativizeTouchedFile("/repo-other/x.ts", "/repo")).toBe("/repo-other/x.ts");
    expect(relativizeTouchedFile("Edit /repo/src/a.ts", "")).toBe("Edit /repo/src/a.ts");
    // an absolute path NOT under a user home and NOT under repo stays as-is
    expect(relativizeTouchedFile("/opt/tool/x.ts", "/repo")).toBe("/opt/tool/x.ts");
  });

  it("masks the user-home prefix of out-of-repo personal paths (no username leak)", () => {
    // outside repo but under the user home (Temp scratch, ~/.codex) -> home prefix masked to ~
    expect(relativizeTouchedFile("Write c:\\Users\\micro\\.codex\\config.toml", WINROOT)).toBe(
      "Write ~/.codex/config.toml",
    );
    expect(
      relativizeTouchedFile("Write c:\\Users\\micro\\AppData\\Local\\Temp\\dbq.ts", WINROOT),
    ).toBe("Write ~/AppData/Local/Temp/dbq.ts");
    expect(relativizeTouchedFile("Edit /Users/micro/scratch/y.ts", "/repo")).toBe(
      "Edit ~/scratch/y.ts",
    );
    expect(relativizeTouchedFile("/home/micro/scratch/z.ts", "/repo")).toBe("~/scratch/z.ts");
  });

  it("is fail-open on odd input (never throws)", () => {
    expect(relativizeTouchedFile("", "/repo")).toBe("");
    expect(relativizeTouchedFile("   ", "/repo")).toBe("   ");
  });

  it("relativizeDeliverableFiles renders NO drive-letter home-dir path and dedupes mixed casing (negative assertion)", () => {
    const doc = scaffoldFromDigests(
      [
        digest({
          plan_id: "PLAN-X",
          files_touched: [
            "Write c:\\Users\\micro\\OneDrive\\Desktop\\UT-TDD-agent-harness\\src\\a.ts",
            "Write C:\\Users\\micro\\OneDrive\\Desktop\\UT-TDD-agent-harness\\src\\a.ts",
            "Write c:\\Users\\micro\\.codex\\config.toml",
          ],
        }),
      ],
      [],
      "2026-06-24",
    );
    relativizeDeliverableFiles(doc, WINROOT);
    const serialized = JSON.stringify(doc);
    // NO username-bearing personal path (drive-letter home or /Users|/home) survives anywhere
    expect(/[A-Za-z]:[\\/]Users[\\/]micro/.test(serialized)).toBe(false);
    expect(serialized.includes("Users/micro")).toBe(false);
    const files = doc.deliverables[0]?.files ?? [];
    // both casings of src/a.ts collapse to one relativized entry (dedup)
    expect(files.filter((f) => f === "Write src/a.ts").length).toBe(1);
    // out-of-repo path keeps its shape but the home prefix is masked
    expect(files).toContain("Write ~/.codex/config.toml");
  });
});

describe("U-HOVER-001 resolveHandoverScope", () => {
  it("current-plan 有 → active_plan 解決 / digest 群を集約", () => {
    const deps = mockDeps();
    deps.files.set(currentPlanPath, "PLAN-L7-04-handover-mechanism");
    deps.files.set(
      join(digestDir, "PLAN-L7-04-handover-mechanism.digest.json"),
      JSON.stringify(digest()),
    );
    const scope = resolveHandoverScope(deps);
    expect(scope.active_plan).toBe("PLAN-L7-04-handover-mechanism");
    expect(scope.digests).toHaveLength(1);
  });

  it("壊れ JSON は skip / 何も無ければ {null, []} (never throw)", () => {
    const deps = mockDeps();
    deps.files.set(join(digestDir, "broken.digest.json"), "{not json");
    expect(() => resolveHandoverScope(deps)).not.toThrow();
    const scope = resolveHandoverScope(deps);
    expect(scope.active_plan).toBeNull();
    expect(scope.digests).toEqual([]);
  });
});

describe("U-HOVER-002 buildPointer", () => {
  it("digests 非空 → 件数集計 / updated_at=now", () => {
    const scope: HandoverScope = {
      active_plan: "P",
      digests: [
        digest({
          commits: ["c1", "c2"],
          files_touched: ["f1"],
          failures: [{ ts: NOW, summary: "x" }],
        }),
      ],
    };
    const p = buildPointer({
      scope,
      latestDoc: "docs/handover/x.md",
      status: "in_progress",
      now: NOW,
    });
    expect(p.digest_summary).toEqual({ commits: 2, files: 1, failures: 1 });
    expect(p.updated_at).toBe(NOW);
  });

  it("edge: active_plan=null だが digests 非空 → digest_summary は集計値 (null にしない)", () => {
    const scope: HandoverScope = { active_plan: null, digests: [digest()] };
    const p = buildPointer({ scope, latestDoc: null, status: "in_progress", now: NOW });
    expect(p.active_plan).toBeNull();
    expect(p.digest_summary).toEqual({ commits: 1, files: 1, failures: 0 });
  });

  it("digests 空 → digest_summary=null", () => {
    const p = buildPointer({
      scope: { active_plan: "P", digests: [] },
      latestDoc: null,
      status: "in_progress",
      now: NOW,
    });
    expect(p.digest_summary).toBeNull();
  });
});

describe("U-HOVER-003 scaffoldFromDigests", () => {
  it("digest→deliverables / planMeta→summary / ③-⑥ は空配列", () => {
    const doc = scaffoldFromDigests(
      [digest()],
      [{ plan_id: "PLAN-L7-04-handover-mechanism", kind: "add-impl", title: "handover 実装" }],
      "2026-06-04",
    );
    expect(doc.deliverables[0].commits).toEqual(["a413d25"]);
    expect(doc.plans[0].summary).toBe("handover 実装");
    expect(doc.next_actions).toEqual([]);
    expect(doc.carry).toEqual([]);
    expect(doc.po_decisions).toEqual([]);
    expect(doc.do_not_break).toEqual([]);
  });
});

describe("U-HOVER-004 renderHandoverScaffold", () => {
  it("6 セクション + ③-⑥ TODO placeholder", () => {
    const doc = scaffoldFromDigests([digest()], [], "2026-06-04");
    const md = renderHandoverScaffold(doc);
    for (const s of [
      "§1 PLAN サマリ",
      "§2 成果物",
      "§3 次アクション",
      "§4 carry",
      "§5 未了 PO 判断",
      "§6 壊さない",
    ]) {
      expect(md).toContain(s);
    }
    expect(md).toContain("TODO(human)");
  });

  it("sanitize defense-in-depth: summary の token=secret123 が出力に出ず ***", () => {
    const doc = scaffoldFromDigests(
      [digest()],
      [
        {
          plan_id: "PLAN-L7-04-handover-mechanism",
          kind: "add-impl",
          title: "token=secret123 を含む",
        },
      ],
      "2026-06-04",
    );
    const md = renderHandoverScaffold(doc);
    expect(md).not.toContain("secret123");
    expect(md).toContain("token=***");
  });

  // A-138 ITEM-4: slimSummary は §1/§2 を参照 stub に縮約 (同日累積の肥大抑制)。
  it("U-HOVER-013: slimSummary=true で §1/§2 は参照 stub・plan list 省略・§3-§6 全文・header 1 個", () => {
    const doc = scaffoldFromDigests(
      [digest()],
      [{ plan_id: "PLAN-L7-04-handover-mechanism", kind: "add-impl", title: "FULL TITLE TOKEN" }],
      "2026-06-04",
    );
    const full = renderHandoverScaffold(doc);
    const slim = renderHandoverScaffold(doc, { slimSummary: true });
    // full は plan サマリ本体を含むが slim は参照 stub に縮約 (title が出ない)。
    expect(full).toContain("FULL TITLE TOKEN");
    expect(slim).not.toContain("FULL TITLE TOKEN");
    expect(slim).toContain("同日 first entry 参照");
    // §1/§2 の見出しと §3-§6 は slim でも維持。
    for (const s of ["§1 PLAN サマリ", "§2 成果物", "§3 次アクション", "§6 壊さない"]) {
      expect(slim).toContain(s);
    }
    // bypass 検知契約: handover header は slim でも 1 個 (countHandoverEntries 不変)。
    expect(countHandoverEntries(slim)).toBe(1);
  });
});

// PLAN-L7-98 (Q1): §5 未了 PO 判断 を outstanding surface (機械事実) で seed + fail-close anchor。
describe("U-HOVER-017 §5 outstanding seed + anchor gate (PLAN-L7-98)", () => {
  const outstanding = {
    nonTerminalPlansByLayer: { L7: 2 },
    nonTerminalPlansTotal: 2,
    versionUpParked: 0,
    activeDraftTotal: 2,
    openDefers: 1,
    blockersByKind: { active_draft: 2 },
    items: [],
    completionReadiness: {
      ok: false,
      status: "blocked" as const,
      reason: "",
      blockers: [],
      authorityBoundary: "automation_work_required" as const,
      humanDecisionRequired: false,
      humanDecisionBlockers: [],
      workflowStateBlockers: [],
      autonomousWorkBlockers: [],
      nextAuthority: "automation" as const,
      requiredActions: [],
      requiredActionsJa: [],
    },
  };

  it("outstanding 指定で §5 に機械集計 marker + 件数を出力する", () => {
    const doc = scaffoldFromDigests([digest()], [], "2026-06-04");
    const md = renderHandoverScaffold(doc, { outstanding });
    expect(md).toContain(HANDOVER_OUTSTANDING_MARKER);
    expect(md).toContain("non-terminal PLANs=2");
    expect(md).toContain("open defers=1");
  });

  it("outstanding 未指定なら従来の §5 TODO (後方互換、marker なし)", () => {
    const md = renderHandoverScaffold(scaffoldFromDigests([digest()], [], "2026-06-04"));
    expect(md).not.toContain(HANDOVER_OUTSTANDING_MARKER);
    expect(md).toContain("§5 未了 PO 判断");
  });

  function withDoc(md: string | null): ReturnType<typeof mockDeps> {
    const deps = mockDeps();
    deps.files.set(pointerPath, JSON.stringify({ latest_doc: "docs/handover/h.md" }));
    if (md != null) deps.files.set(join("/repo", "docs", "handover", "h.md"), md);
    return deps;
  }

  it("pointer 不在は skip (ok)", () => {
    expect(checkHandoverOutstandingAnchor(mockDeps()).ok).toBe(true);
  });

  it("§5 に marker があれば ok", () => {
    const md = `# Session Handover — 2026-06-04\n\n## §5 未了 PO 判断\n\n> ${HANDOVER_OUTSTANDING_MARKER}: non-terminal PLANs=0; open defers=1\n\n## §6 x\n`;
    expect(checkHandoverOutstandingAnchor(withDoc(md)).ok).toBe(true);
  });

  it("§5 に marker が無ければ fail-close (前任 prose 転記の false-state 防止)", () => {
    const md = `# Session Handover — 2026-06-04\n\n## §5 未了 PO 判断\n\n- DISCOVERY-03 PO サインオフ待ち\n\n## §6 x\n`;
    const r = checkHandoverOutstandingAnchor(withDoc(md));
    expect(r.ok).toBe(false);
    expect(r.messages[0]).toContain("機械集計行");
  });

  it("複数 entry は最後の entry の §5 を見る (古い entry の marker では通さない)", () => {
    const md = `# Session Handover — 2026-06-04\n\n## §5 未了 PO 判断\n\n> ${HANDOVER_OUTSTANDING_MARKER}: x\n\n---\n\n# Session Handover — 2026-06-04\n\n## §5 未了 PO 判断\n\n- 待ち prose のみ\n\n## §6 x\n`;
    expect(checkHandoverOutstandingAnchor(withDoc(md)).ok).toBe(false);
  });
});

describe("U-HOVER-020 §3 workflow next action seed + anchor gate", () => {
  function blockedOutstanding(): OutstandingWork {
    return analyzeOutstandingWork(
      [
        {
          planId: "PLAN-DISCOVERY-10",
          layer: "cross",
          kind: "poc",
          status: "draft",
          workflowPhase: "S3",
          text: "S4 decision pending and requires human approval.",
        },
        {
          planId: "PLAN-L7-146",
          layer: "L7",
          kind: "impl",
          status: "draft",
          versionTarget: "future",
          text: "future activation requires action-binding approval.",
        },
      ],
      0,
    );
  }

  function withDoc(md: string | null): ReturnType<typeof mockDeps> {
    const deps = mockDeps();
    deps.files.set(pointerPath, JSON.stringify({ latest_doc: "docs/handover/h.md" }));
    if (md != null) deps.files.set(join("/repo", "docs", "handover", "h.md"), md);
    return deps;
  }

  it("outstanding 指定で §3 に workflowNextActions 由来の機械次手と packet 要約を出力する", () => {
    const md = renderHandoverScaffold(scaffoldFromDigests([digest()], [], "2026-06-04"), {
      outstanding: blockedOutstanding(),
    });

    const section = latestEntrySection(md, "§3") ?? "";
    expect(section).toContain(HANDOVER_NEXT_ACTION_MARKER);
    expect(section).toContain("PLAN-DISCOVERY-10");
    expect(section).toContain("PO/S4 判断を記録してから昇格・却下・Forward merge へ進める");
    expect(section).toContain("ut-tdd s4 decision-packet --json --plan PLAN-DISCOVERY-10");
    expect(section).toContain(
      "ut-tdd action-binding approval-packet --json --plan PLAN-DISCOVERY-10",
    );
    expect(section).toContain("base=`ut-tdd s4 decision-packet --json`");
    expect(section).toContain(
      "packet要約: `ut-tdd s4 decision-packet --json` schema=s4-decision-packet.v1 検証matrix=decisionVerificationCommandMatrix 件数=8",
    );
    expect(section).toContain("確認field=decisionRecord,decisionRecord.source_ledger_freshness");
    expect(section).toContain("decisionRecord.workflow_route_impact");
    expect(section).toContain("decisionEvidenceChecklist.verified_evidence");
    expect(section).toContain("decisionEvidenceChecklist.unresolved_risk");
    expect(section).toContain("decisionEvidenceChecklist.route_impact");
    expect(section).toContain(
      "matrix必須field=sourceCheckedAt,latestOfficialStatus,sourceStatusDelta,adoptionDecision,adoptionDecisionDelta,workflowRouteImpact",
    );
    expect(section).toContain(
      "packet要約: `ut-tdd action-binding approval-packet --json` schema=action-binding-approval-packet.v1 検証matrix=approvalVerificationCommandMatrix 件数=10",
    );
    expect(section).toContain(
      "S4 decision evidence / outcome route / verification command を確認する",
    );
    expect(section).toContain(
      "actor / tool / target / params binding、semantic frontier、related packet、verification command を確認する",
    );
    expect(section).not.toContain("record the PO/S4 decision before promotion");
    expect(section).not.toContain("review S4 decision evidence");
    expect(section).not.toContain("TODO(human): 順序付き次手");
  });

  it("§3 に marker と packet 要約があれば ok", () => {
    const md = `# Session Handover — 2026-06-04\n\n## §3 Next Action\n\n> ${HANDOVER_NEXT_ACTION_MARKER}: 1 item(s)\n\n- 1. \`PLAN-X\` (po_decision_pending): record\n  - packet要約: \`ut-tdd s4 decision-packet --json\` schema=s4-decision-packet.v1 検証matrix=decisionVerificationCommandMatrix 件数=8 確認field=decisionEvidenceChecklist,outcomeRouteMatrix,semanticFeatureFrontierRecord matrix必須field=sourceCheckedAt,latestOfficialStatus,sourceStatusDelta,adoptionDecision,adoptionDecisionDelta,workflowRouteImpact 確認観点=review S4 decision evidence\n\n## §4 x\n`;
    expect(checkHandoverNextActionAnchor(withDoc(md)).ok).toBe(true);
  });

  it("§3 の packet 要約に source-delta field が無ければ fail-close", () => {
    const md = `# Session Handover — 2026-06-04\n\n## §3 Next Action\n\n> ${HANDOVER_NEXT_ACTION_MARKER}: 1 item(s)\n\n- 1. \`PLAN-X\` (po_decision_pending): record\n  - packet要約: \`ut-tdd s4 decision-packet --json\` schema=s4-decision-packet.v1 検証matrix=decisionVerificationCommandMatrix 件数=8 確認観点=review S4 decision evidence\n\n## §4 x\n`;
    const r = checkHandoverNextActionAnchor(withDoc(md));

    expect(r.ok).toBe(false);
    expect(r.messages[0]).toContain("確認field/matrix必須field");
  });

  it("§3 に marker があっても packet 要約が無ければ fail-close", () => {
    const md = `# Session Handover — 2026-06-04\n\n## §3 Next Action\n\n> ${HANDOVER_NEXT_ACTION_MARKER}: 1 item(s)\n\n- 1. \`PLAN-X\` (po_decision_pending): record\n  - primary packet: \`ut-tdd s4 decision-packet --json\`\n\n## §4 x\n`;
    const r = checkHandoverNextActionAnchor(withDoc(md));

    expect(r.ok).toBe(false);
    expect(r.messages[0]).toContain("packet 要約");
  });

  it("§3 が TODO のままなら fail-close", () => {
    const md = `# Session Handover — 2026-06-04\n\n## §3 Next Action\n\n<!-- TODO(human): 順序付き次手 -->\n\n## §4 x\n`;
    const r = checkHandoverNextActionAnchor(withDoc(md));

    expect(r.ok).toBe(false);
    expect(r.messages[0]).toContain("機械次手");
  });
});

describe("U-HOVER-019 handover completion decision packet gate", () => {
  function blockedOutstanding(): OutstandingWork {
    return analyzeOutstandingWork(
      [
        {
          planId: "PLAN-S3",
          layer: "cross",
          kind: "poc",
          status: "draft",
          workflowPhase: "S3",
          text: "S4 decision pending.",
        },
      ],
      0,
    );
  }

  function writePointer(deps: ReturnType<typeof mockDeps>, pointer: Partial<HandoverPointer>) {
    deps.files.set(
      pointerPath,
      JSON.stringify({
        active_plan: null,
        status: "in_progress",
        latest_doc: null,
        digest_summary: null,
        updated_at: NOW,
        generated_by: GENERATED_BY,
        ...pointer,
      }),
    );
  }

  function seedDecisionSourceDocs(deps: ReturnType<typeof mockDeps>) {
    deps.files.set(
      join("/repo", "docs/process/modes/discovery.md"),
      "S4 decision source ledger (checked 2026-06-04):",
    );
    deps.files.set(
      join("/repo", "docs/process/modes/scrum.md"),
      "S4 decision source ledger (checked 2026-06-04):",
    );
  }

  it("pointer 不在は skip (ok)", () => {
    const r = checkHandoverCompletionDecisionPacket(mockDeps());

    expect(r.ok).toBe(true);
    expect(r.messages[0]).toContain("skipped");
  });

  it("blocked outstanding だが completionDecisionPacket が無い旧 pointer は fail-close", () => {
    const deps = mockDeps();
    writePointer(deps, { outstanding: blockedOutstanding() });
    const r = checkHandoverCompletionDecisionPacket(deps);

    expect(r.ok).toBe(false);
    expect(r.messages[0]).toContain("completionDecisionPacket");
  });

  it("blocked outstanding と同じ snapshot 由来の handover packet は ok", () => {
    const deps = mockDeps();
    seedDecisionSourceDocs(deps);
    const outstanding = blockedOutstanding();
    writePointer(deps, {
      outstanding,
      completionDecisionPacket: completionDecisionPacketForOutstanding(outstanding, {
        generatedAt: NOW,
        now: NOW,
        sourceCommand: "ut-tdd handover",
      }),
    });
    const r = checkHandoverCompletionDecisionPacket(deps);

    expect(r.ok).toBe(true);
    expect(r.messages[0]).toContain("decisions=1");
    const pointer = JSON.parse(deps.files.get(pointerPath) ?? "{}");
    expect(pointer.completionDecisionPacket.decisions[0]).toMatchObject({
      decisionPacketCommand: "ut-tdd s4 decision-packet --json",
      packetCommands: ["ut-tdd s4 decision-packet --json"],
    });
  });

  it("新 schema field が無い旧 handover packet は live outstanding から再構成して検査する", () => {
    const deps = mockDeps();
    seedDecisionSourceDocs(deps);
    const outstanding = blockedOutstanding();
    const packet = completionDecisionPacketForOutstanding(outstanding, {
      generatedAt: NOW,
      now: NOW,
      sourceCommand: "ut-tdd handover",
    });
    const {
      authorityBoundary: _authorityBoundary,
      humanDecisionRequired: _humanDecisionRequired,
      humanDecisionBlockers: _humanDecisionBlockers,
      workflowStateBlockers: _workflowStateBlockers,
      autonomousWorkBlockers: _autonomousWorkBlockers,
      nextAuthority: _nextAuthority,
      semanticMeaningSummary: _semanticMeaningSummary,
      semanticFeatureFrontierRecords: _semanticFeatureFrontierRecords,
      confirmedCurrentMeaningRecords: _confirmedCurrentMeaningRecords,
      ...packetWithoutSemanticSummary
    } = packet;
    writePointer(deps, {
      outstanding,
      completionDecisionPacket: {
        ...packetWithoutSemanticSummary,
        decisions: packet.decisions.map(({ supportingPacketSummaries: _omitted, ...decision }) => ({
          ...decision,
        })),
      } as unknown as CompletionDecisionPacket,
    });
    const r = checkHandoverCompletionDecisionPacket(deps);

    expect(r.ok).toBe(true);
    expect(r.messages[0]).toContain("decisions=1");
  });

  it("blocked outstanding の handover packet が stale source ledger を参照したら fail-close", () => {
    const deps = mockDeps();
    seedDecisionSourceDocs(deps);
    deps.files.set(
      join("/repo", "docs/process/modes/discovery.md"),
      "S4 decision source ledger (checked 2026-01-01):",
    );
    const outstanding = blockedOutstanding();
    writePointer(deps, {
      outstanding,
      completionDecisionPacket: completionDecisionPacketForOutstanding(outstanding, {
        generatedAt: NOW,
        now: NOW,
        sourceCommand: "ut-tdd handover",
      }),
    });
    const r = checkHandoverCompletionDecisionPacket(deps);

    expect(r.ok).toBe(false);
    expect(r.messages).toEqual(
      expect.arrayContaining([expect.stringContaining("invalid_required_record_source_ledger")]),
    );
  });

  it("standalone packet を handover pointer に転記しただけなら source mismatch で fail-close", () => {
    const deps = mockDeps();
    seedDecisionSourceDocs(deps);
    const outstanding = blockedOutstanding();
    writePointer(deps, {
      outstanding,
      completionDecisionPacket: completionDecisionPacketForOutstanding(outstanding, {
        generatedAt: NOW,
        now: NOW,
        sourceCommand: "ut-tdd completion decision-packet --json",
      }),
    });
    const r = checkHandoverCompletionDecisionPacket(deps);

    expect(r.ok).toBe(false);
    expect(r.messages.join("\n")).toContain("expected=ut-tdd handover");
  });

  it("packet の decision count が outstanding 明細とずれたら fail-close", () => {
    const deps = mockDeps();
    seedDecisionSourceDocs(deps);
    const outstanding = blockedOutstanding();
    const packet = completionDecisionPacketForOutstanding(outstanding, {
      generatedAt: NOW,
      now: NOW,
      sourceCommand: "ut-tdd handover",
    });
    writePointer(deps, {
      outstanding,
      completionDecisionPacket: { ...packet, decisions: [], decisionCount: 0 },
    });
    const r = checkHandoverCompletionDecisionPacket(deps);

    expect(r.ok).toBe(false);
    expect(r.messages.join("\n")).toContain("decision count mismatch");
  });

  it("packet の required record sourcePath が実在しなければ fail-close", () => {
    const deps = mockDeps();
    const outstanding = blockedOutstanding();
    const packet = completionDecisionPacketForOutstanding(outstanding, {
      generatedAt: NOW,
      now: NOW,
      sourceCommand: "ut-tdd handover",
    });
    writePointer(deps, { outstanding, completionDecisionPacket: packet });
    const r = checkHandoverCompletionDecisionPacket(deps);

    expect(r.ok).toBe(false);
    expect(r.messages.join("\n")).toContain("sourcePath missing");
  });
});

// PLAN-L7-88: 1 エントリの §1/§2 に載せる PLAN 件数の上限 (注入コントロール / 圧縮)。
describe("U-HOVER-016 capWithBreadcrumb + renderHandoverScaffold summary cap (PLAN-L7-88)", () => {
  const cb = {
    renderItem: (x: string) => [`- ${x}`],
    breadcrumb: (n: number) => `- (+ ${n} more)`,
  };

  it("capWithBreadcrumb: 上限超は先頭 N + breadcrumb 1 行 (no silent cap)、件数は残数を明示", () => {
    const out = capWithBreadcrumb(["a", "b", "c", "d", "e"], 2, cb);
    expect(out).toEqual(["- a", "- b", "- (+ 3 more)"]);
  });

  it("capWithBreadcrumb: 上限以下は全件・breadcrumb なし / max<=0 は無制限", () => {
    const items = ["a", "b"];
    expect(capWithBreadcrumb(items, 5, cb)).toEqual(["- a", "- b"]);
    expect(capWithBreadcrumb(items, 0, cb)).toEqual(["- a", "- b"]);
  });

  function bigDoc(planCount: number) {
    const digests: PlanDigestRef[] = [];
    const meta: { plan_id: string; kind: string; title: string }[] = [];
    for (let i = 0; i < planCount; i++) {
      const id = `PLAN-CAP-${String(i).padStart(2, "0")}-x`;
      digests.push(digest({ plan_id: id, commits: [`c${i}`], files_touched: [`src/f${i}.ts`] }));
      meta.push({ plan_id: id, kind: "impl", title: `title ${i}` });
    }
    return scaffoldFromDigests(digests, meta, "2026-06-22");
  }

  it("renderHandoverScaffold: PLAN 数が上限超 (= scope fallback で全 registry) なら §1/§2 が cap + breadcrumb", () => {
    const doc = bigDoc(MAX_SUMMARY_PLANS + 8);
    const md = renderHandoverScaffold(doc);
    // §1 breadcrumb に残数 8 が出る (full registry はダンプしない)。
    expect(md).toContain("+ 8 more PLAN");
    expect(md).toContain("ut-tdd status");
    // 末尾 (上限外) の PLAN id は本文に出ない = 肥大しない。
    const lastId = `PLAN-CAP-${String(MAX_SUMMARY_PLANS + 7).padStart(2, "0")}-x`;
    expect(md).not.toContain(lastId);
    // 先頭 PLAN は残る。
    expect(md).toContain("PLAN-CAP-00-x");
  });

  it("renderHandoverScaffold: session-scope が効いた通常時 (PLAN 少) は cap 不発・全件・breadcrumb なし", () => {
    const doc = bigDoc(3);
    const md = renderHandoverScaffold(doc);
    expect(md).not.toContain("more PLAN");
    for (let i = 0; i < 3; i++) expect(md).toContain(`PLAN-CAP-0${i}-x`);
  });

  it("renderHandoverScaffold: maxSummaryPlans=0 は cap 無効 (後方互換 escape hatch)", () => {
    const doc = bigDoc(MAX_SUMMARY_PLANS + 5);
    const md = renderHandoverScaffold(doc, { maxSummaryPlans: 0 });
    expect(md).not.toContain("more PLAN");
    const lastId = `PLAN-CAP-${String(MAX_SUMMARY_PLANS + 4).padStart(2, "0")}-x`;
    expect(md).toContain(lastId);
  });

  // reviewer I-1: slimSummary と cap の合成 — slim は §1/§2 を stub 化するので cap は不発
  // (plan list 自体を描かない)。branch 順が将来反転しても回帰で検知できるよう明示する。
  it("renderHandoverScaffold: slimSummary=true は plans > 上限でも stub・cap 不発・header 1 個", () => {
    const doc = bigDoc(MAX_SUMMARY_PLANS + 5);
    const md = renderHandoverScaffold(doc, { slimSummary: true });
    expect(md).toContain("同日 first entry 参照");
    expect(md).not.toContain("more PLAN");
    expect(md).not.toContain("PLAN-CAP-00-x");
    expect(countHandoverEntries(md)).toBe(1);
  });
});

describe("U-HOVER-005 handoverStale", () => {
  it("null → true / 24h 超 → true / 以内 → false / 境界(=24h) は stale でない", () => {
    expect(handoverStale(null, NOW)).toBe(true);
    expect(handoverStale("2026-06-02T00:00:00.000Z", NOW)).toBe(true); // 48h
    expect(handoverStale("2026-06-03T12:00:00.000Z", NOW)).toBe(false); // 12h
    expect(handoverStale("2026-06-03T00:00:00.000Z", NOW)).toBe(false); // ちょうど 24h → > 判定で false
    expect(handoverStale("not-a-date", NOW)).toBe(true); // parse 不能
  });
});

describe("U-HOVER-006 setActivePlan + inferPlanFromCommit", () => {
  it("setActivePlan → resolveActivePlan round-trip", () => {
    const files = new Map<string, string>();
    const sdeps = mockSessionDeps(files);
    setActivePlan("PLAN-L7-04-handover-mechanism", sdeps);
    expect(resolveActivePlan(sdeps)).toBe("PLAN-L7-04-handover-mechanism");
  });

  it("null + removeFile 有 → file 削除で clear", () => {
    const files = new Map<string, string>();
    const sdeps = mockSessionDeps(files);
    setActivePlan("PLAN-L7-04-handover-mechanism", sdeps);
    setActivePlan(null, sdeps);
    expect(sdeps.removed).toContain(currentPlanPath);
    expect(resolveActivePlan(sdeps)).toBeNull();
  });

  it("null + removeFile 無 → 空文字書込 → resolveActivePlan が null 相当に落とす", () => {
    const files = new Map<string, string>();
    const sdeps = mockSessionDeps(files);
    sdeps.removeFile = undefined;
    setActivePlan("PLAN-L7-04-handover-mechanism", sdeps);
    setActivePlan(null, sdeps);
    expect(files.get(currentPlanPath)).toBe("");
    expect(resolveActivePlan(sdeps)).toBeNull();
  });

  it("inferPlanFromCommit: 抽出 / 非該当→null / heredoc 様→null", () => {
    expect(inferPlanFromCommit("feat: 実装 (PLAN-L7-04-handover-mechanism)")).toBe(
      "PLAN-L7-04-handover-mechanism",
    );
    expect(inferPlanFromCommit("PLAN-DISCOVERY-01")).toBe("PLAN-DISCOVERY-01");
    expect(inferPlanFromCommit("docs: 修正のみ")).toBeNull();
    expect(inferPlanFromCommit("git commit -F -")).toBeNull(); // heredoc は本文が乗らない
  });
});

describe("U-HOVER-008 sameFamilyPlan / dedupeDigests (IMP-048)", () => {
  it("sameFamilyPlan: 同一 / bare ⊂ slug (- 境界) は true、無関係は false", () => {
    expect(sameFamilyPlan("PLAN-L7-04", "PLAN-L7-04")).toBe(true);
    expect(sameFamilyPlan("PLAN-L7-04", "PLAN-L7-04-handover-mechanism")).toBe(true);
    expect(sameFamilyPlan("PLAN-L7-04-handover-mechanism", "PLAN-L7-04")).toBe(true);
    expect(sameFamilyPlan("PLAN-L7-04", "PLAN-L7-05")).toBe(false);
    // prefix だが - 境界でない (誤マッチ防止)
    expect(sameFamilyPlan("PLAN-L7-0", "PLAN-L7-04")).toBe(false);
  });

  it("dedupeDigests: bare/slug ゴーストを最長 id へ union 集約", () => {
    const out = dedupeDigests([
      digest({ plan_id: "PLAN-L7-04", commits: ["c1"], files_touched: ["f1"], sessions: ["s1"] }),
      digest({
        plan_id: "PLAN-L7-04-handover-mechanism",
        commits: ["c2"],
        files_touched: ["f1", "f2"],
        sessions: ["s2"],
      }),
    ]);
    expect(out).toHaveLength(1);
    expect(out[0].plan_id).toBe("PLAN-L7-04-handover-mechanism");
    expect(out[0].commits).toEqual(["c1", "c2"]);
    expect(out[0].files_touched).toEqual(["f1", "f2"]); // 重複除去
    expect(out[0].sessions).toEqual(["s1", "s2"]);
  });

  it("dedupeDigests: 無関係な PLAN は別 group のまま残す", () => {
    const out = dedupeDigests([
      digest({ plan_id: "PLAN-L7-04-handover-mechanism" }),
      digest({ plan_id: "PLAN-L7-05-biome-debt" }),
    ]);
    expect(out).toHaveLength(2);
  });

  it("dedupeDigests: bare 無しで slug 2 種 + bare が来ても推移的に 1 group へ収束 (I-1, 順序非依存)", () => {
    const out = dedupeDigests([
      digest({ plan_id: "PLAN-L7-04-aaa", commits: ["a"] }),
      digest({ plan_id: "PLAN-L7-04-bbb", commits: ["b"] }),
      digest({ plan_id: "PLAN-L7-04", commits: ["bare"] }), // bare が最後でも全部畳む
    ]);
    expect(out).toHaveLength(1);
    expect(out[0].commits.sort()).toEqual(["a", "b", "bare"]);
  });
});

describe("U-HOVER-009 resolveHandoverScope scopeToActive (IMP-048)", () => {
  function seededMulti(): ReturnType<typeof mockDeps> {
    const deps = mockDeps();
    deps.files.set(currentPlanPath, "PLAN-L7-04-handover-mechanism");
    deps.files.set(
      join(digestDir, "PLAN-L7-04.digest.json"),
      JSON.stringify(digest({ plan_id: "PLAN-L7-04", commits: ["bare"] })),
    );
    deps.files.set(
      join(digestDir, "PLAN-L7-04-handover-mechanism.digest.json"),
      JSON.stringify(digest({ plan_id: "PLAN-L7-04-handover-mechanism", commits: ["slug"] })),
    );
    deps.files.set(
      join(digestDir, "PLAN-L7-05-biome-debt.digest.json"),
      JSON.stringify(digest({ plan_id: "PLAN-L7-05-biome-debt" })),
    );
    return deps;
  }

  it("既定 (scopeToActive 無し): dedup のみ → bare/slug は 1 件に畳まれ別 PLAN は残る", () => {
    const scope = resolveHandoverScope(seededMulti());
    expect(scope.digests).toHaveLength(2); // L7-04 family (1) + L7-05 (1)
  });

  it("scopeToActive: active family の digest のみへ絞る", () => {
    const scope = resolveHandoverScope(seededMulti(), { scopeToActive: true });
    expect(scope.digests).toHaveLength(1);
    expect(scope.digests[0].plan_id).toBe("PLAN-L7-04-handover-mechanism");
  });

  it("scopeToActive だが active family が digest に無い → 全件 fallback (空 handover 回避)", () => {
    const deps = mockDeps();
    deps.files.set(currentPlanPath, "PLAN-L9-99-nonexistent");
    deps.files.set(
      join(digestDir, "PLAN-L7-05-biome-debt.digest.json"),
      JSON.stringify(digest({ plan_id: "PLAN-L7-05-biome-debt" })),
    );
    const scope = resolveHandoverScope(deps, { scopeToActive: true });
    expect(scope.digests).toHaveLength(1);
  });
});

describe("U-HOVER-010 readPointer / checkHandoverDiscipline (IMP-047)", () => {
  function pointer(over: Partial<HandoverPointer> = {}): HandoverPointer {
    return {
      active_plan: "PLAN-L7-04-handover-mechanism",
      status: "in_progress",
      latest_doc: "docs/handover/x.md",
      digest_summary: { commits: 1, files: 1, failures: 0 },
      updated_at: NOW,
      ...over,
    };
  }
  function withActivity(): ReturnType<typeof mockDeps> {
    const deps = mockDeps();
    deps.files.set(currentPlanPath, "PLAN-L7-04-handover-mechanism");
    deps.files.set(
      join(digestDir, "PLAN-L7-04-handover-mechanism.digest.json"),
      JSON.stringify(digest()),
    );
    return deps;
  }

  it("readPointer: 不在→null / 壊れ→null / 正常→object", () => {
    const deps = mockDeps();
    expect(readPointer(deps)).toBeNull();
    deps.files.set(pointerPath, "{not json");
    expect(readPointer(deps)).toBeNull();
    deps.files.set(pointerPath, JSON.stringify(pointer()));
    expect(readPointer(deps)?.active_plan).toBe("PLAN-L7-04-handover-mechanism");
  });

  it("活動なし (digest 空) → 規律対象外で警告ゼロ", () => {
    expect(checkHandoverDiscipline(mockDeps())).toEqual([]);
  });

  it("活動あり + CURRENT.json 不在 → 未生成 warn", () => {
    const w = checkHandoverDiscipline(withActivity());
    expect(w).toHaveLength(1);
    expect(w[0]).toContain("handover 未生成");
  });

  it("活動あり + fresh pointer (同 family) → 警告ゼロ", () => {
    const deps = withActivity();
    deps.files.set(pointerPath, JSON.stringify(pointer()));
    expect(checkHandoverDiscipline(deps)).toEqual([]);
  });

  it("活動あり + stale pointer → stale warn", () => {
    const deps = withActivity();
    deps.files.set(
      pointerPath,
      JSON.stringify(pointer({ updated_at: "2026-06-01T00:00:00.000Z" })),
    );
    const w = checkHandoverDiscipline(deps);
    expect(w.some((m) => m.includes("stale"))).toBe(true);
  });

  it("活動あり + pointer が別 plan を指す → drift warn", () => {
    const deps = withActivity();
    deps.files.set(pointerPath, JSON.stringify(pointer({ active_plan: "PLAN-L7-05-biome-debt" })));
    const w = checkHandoverDiscipline(deps);
    expect(w.some((m) => m.includes("drift"))).toBe(true);
  });

  it("活動あり + fresh pointer だが active_plan=null (完了済正常形) → drift 無音 (I-2)", () => {
    const deps = withActivity();
    deps.files.set(pointerPath, JSON.stringify(pointer({ active_plan: null })));
    expect(checkHandoverDiscipline(deps)).toEqual([]);
  });
});

describe("U-HOVER-007 runHandover", () => {
  function seeded(): ReturnType<typeof mockDeps> {
    const deps = mockDeps();
    deps.files.set(currentPlanPath, "PLAN-L7-04-handover-mechanism");
    deps.files.set(
      join(digestDir, "PLAN-L7-04-handover-mechanism.digest.json"),
      JSON.stringify(digest()),
    );
    return deps;
  }

  it("dryRun → 何も書かず content を返す (written=[]、非破壊)", () => {
    const deps = seeded();
    const before = new Map(deps.files);
    const r = runHandover({ date: "2026-06-04", dryRun: true }, deps);
    expect(r.written).toEqual([]);
    expect(r.content).toContain("§1 PLAN サマリ");
    expect(deps.files).toEqual(before); // 非破壊
  });

  it("通常 → md 追記 (既存上書きしない) + CURRENT.json 更新", () => {
    const deps = seeded();
    const docRel = join("docs", "handover", "session-handover-2026-06-04.md");
    deps.files.set(join("/repo", docRel), "# 既存 entry\n");
    const r = runHandover({ date: "2026-06-04" }, deps);
    const md = deps.files.get(join("/repo", docRel)) ?? "";
    expect(md).toContain("# 既存 entry"); // 既存を残す
    expect(md).toContain("§3 次アクション"); // 追記される
    expect(r.written).toContain(join(".ut-tdd", "handover", "CURRENT.json"));
  });

  it("CURRENT.json に handover 生成時点の completionDecisionPacket を記録する", () => {
    const deps = seeded();
    const r = runHandover({ date: "2026-06-04" }, deps);
    expect(r.pointer.completionDecisionPacket).toMatchObject({
      ok: true,
      status: "ready",
      generatedFrom: "outstanding.completionReadiness",
      generatedAt: NOW,
      sourceCommand: "ut-tdd handover",
      freshness: {
        validForMinutes: 1440,
        expiresAt: "2026-06-05T00:00:00.000Z",
        stale: false,
        policy: "decision-packet-freshness.v1",
      },
      decisionCount: 0,
      blockers: [],
      decisions: [],
    });
    const pointer = JSON.parse(deps.files.get(pointerPath) ?? "{}");
    expect(pointer.completionDecisionPacket.sourceCommand).toBe("ut-tdd handover");
  });

  it("complete=true → CURRENT.json status=completed かつ active_plan=planId", () => {
    const deps = seeded();
    runHandover(
      { date: "2026-06-04", complete: true, planId: "PLAN-L7-04-handover-mechanism" },
      deps,
    );
    const pointer = JSON.parse(deps.files.get(pointerPath) ?? "{}");
    expect(pointer.status).toBe("completed");
    expect(pointer.active_plan).toBe("PLAN-L7-04-handover-mechanism");
  });

  // A-138 ITEM-4: 同日 2 件目 (existing 非 null) は slim 化、doc_entry_count は header 数と整合。
  it("U-HOVER-013: 同日 2 件目エントリは §1/§2 slim 化、doc_entry_count=2 (header 数一致)", () => {
    const deps = seeded();
    const docRel = join("docs", "handover", "session-handover-2026-06-04.md");
    // 1 件目を runHandover 自身で生成 (full)。
    const first = runHandover({ date: "2026-06-04" }, deps);
    expect(first.pointer.doc_entry_count).toBe(1);
    // 2 件目を追記 (slim)。
    const second = runHandover({ date: "2026-06-04" }, deps);
    const md = deps.files.get(join("/repo", docRel)) ?? "";
    expect(countHandoverEntries(md)).toBe(2); // header 2 個
    expect(second.pointer.doc_entry_count).toBe(2); // pointer も 2 (bypass 照合不変)
    expect(md).toContain("同日 first entry 参照"); // 2 件目は slim stub
    // 2 件目の content は plan サマリ本体 (kind 行) を持たない = 縮約済。
    expect(second.content).toContain("同日 first entry 参照");
    expect(second.content).toContain("§3 次アクション");
  });

  // IMP-078 gap①: runHandover は generated_by 署名 + doc_entry_count を刻む。
  it("gap①: runHandover が CURRENT.json に generated_by + doc_entry_count を刻む", () => {
    const deps = seeded();
    const r = runHandover({ date: "2026-06-08", complete: true }, deps);
    expect(r.pointer.generated_by).toBe(GENERATED_BY);
    expect(r.pointer.doc_entry_count).toBe(1); // 新規 md = entry 1
  });

  // IMP-078 gap⑤: bare plan_id digest でも slug PLAN file を family 解決し kind を埋める。
  it("gap⑤: bare plan_id の digest を slug PLAN file へ family 解決し kind を埋める (unknown 防止)", () => {
    const deps = mockDeps();
    deps.files.set(currentPlanPath, "PLAN-L7-16-module-drift");
    deps.files.set(
      join(digestDir, "PLAN-L7-16.digest.json"),
      JSON.stringify(digest({ plan_id: "PLAN-L7-16", sessions: ["s1"] })),
    );
    deps.files.set(
      join("/repo", "docs", "plans", "PLAN-L7-16-module-drift.md"),
      '---\nplan_id: PLAN-L7-16-module-drift\nkind: add-impl\ntitle: "X"\n---\n',
    );
    const r = runHandover({ date: "2026-06-08", dryRun: true }, deps);
    expect(r.content).toContain("(add-impl)"); // unknown でなく実 kind
  });
});

describe("U-HOVER-014 boundSameDayEntries / runHandover 累積上限 (PLAN-L7-83)", () => {
  /** n エントリの同日 md を組む (anchor=entry[0] に一意 marker)。 */
  function makeMd(n: number): string {
    const entries: string[] = [];
    for (let i = 0; i < n; i++) {
      entries.push(
        `# セッション引き継ぎ — 2026-06-04\n\n## §1 PLAN サマリ\n\nENTRY-${i}-BODY\n\n## §3 次アクション\n\n- e${i}`,
      );
    }
    return `${entries.join("\n\n---\n\n")}\n`;
  }

  it("entry 数 ≤ MAX-1 → 無変更 (剪定しない)", () => {
    const md = makeMd(MAX_SAME_DAY_ENTRIES - 1);
    expect(boundSameDayEntries(md, MAX_SAME_DAY_ENTRIES)).toBe(md);
  });

  it("handover header が無い md → 無変更", () => {
    const md = "# 既存 entry\n\n本文\n";
    expect(boundSameDayEntries(md, MAX_SAME_DAY_ENTRIES)).toBe(md);
  });

  it("超過 → anchor(entry[0]) + 直近(MAX-2) 保持・中間を breadcrumb へ畳む・header 数 = MAX-1", () => {
    const n = MAX_SAME_DAY_ENTRIES + 2; // 確実に超過
    const out = boundSameDayEntries(makeMd(n), MAX_SAME_DAY_ENTRIES);
    // 追記前に MAX-1 まで圧縮 (このあと runHandover が 1 件 append して MAX になる)。
    expect(countHandoverEntries(out)).toBe(MAX_SAME_DAY_ENTRIES - 1);
    expect(out).toContain("ENTRY-0-BODY"); // anchor 保持
    expect(out).toContain(`ENTRY-${n - 1}-BODY`); // 直近保持
    expect(out).toContain(`ENTRY-${n - 2}-BODY`); // 直近保持
    expect(out).not.toContain("ENTRY-1-BODY"); // 中間は剪定
    expect(out).toContain("累積抑制のため剪定"); // breadcrumb 明示 (silent cap でない)
  });

  it("breadcrumb は handover header に一致せず countHandoverEntries 契約を壊さない", () => {
    const out = boundSameDayEntries(makeMd(MAX_SAME_DAY_ENTRIES + 3), MAX_SAME_DAY_ENTRIES);
    // breadcrumb 行を含んでも header count は保持エントリ数のみ。
    expect(countHandoverEntries(out)).toBe(MAX_SAME_DAY_ENTRIES - 1);
  });

  // cross_agent review 指摘 (PLAN-L7-83): 既存 breadcrumb が anchor へ吸収され線形累積しないこと。
  it("idempotent: 既存 breadcrumb を含む md を再 prune しても breadcrumb は 1 個のまま", () => {
    const bc = /累積抑制のため剪定/g;
    // 1 回目の prune (breadcrumb 1 個挿入)。
    const once = boundSameDayEntries(makeMd(MAX_SAME_DAY_ENTRIES + 2), MAX_SAME_DAY_ENTRIES);
    expect((once.match(bc) ?? []).length).toBe(1);
    // once に新エントリを append して再び超過させ、2 回目の prune。
    const grown = `${once.replace(/\s*$/, "")}\n\n---\n\n# セッション引き継ぎ — 2026-06-04\n\n## §3 次アクション\n\n- new\n`;
    const twice = boundSameDayEntries(grown, MAX_SAME_DAY_ENTRIES);
    // 旧 breadcrumb は除去され新 breadcrumb 1 個のみ (累積しない)。
    expect((twice.match(bc) ?? []).length).toBe(1);
    expect(countHandoverEntries(twice)).toBe(MAX_SAME_DAY_ENTRIES - 1);
  });

  it("runHandover を反復しても同日 doc は MAX_SAME_DAY_ENTRIES を超えない", () => {
    const deps = mockDeps();
    deps.files.set(currentPlanPath, "PLAN-L7-04-handover-mechanism");
    deps.files.set(
      join(digestDir, "PLAN-L7-04-handover-mechanism.digest.json"),
      JSON.stringify(digest()),
    );
    const docRel = join("docs", "handover", "session-handover-2026-06-04.md");
    for (let i = 0; i < MAX_SAME_DAY_ENTRIES + 4; i++) {
      const r = runHandover({ date: "2026-06-04" }, deps);
      const md = deps.files.get(join("/repo", docRel)) ?? "";
      expect(countHandoverEntries(md)).toBeLessThanOrEqual(MAX_SAME_DAY_ENTRIES);
      // pointer.doc_entry_count は md の header 数と一致 (bypass 照合契約不変)。
      expect(r.pointer.doc_entry_count).toBe(countHandoverEntries(md));
    }
    const finalMd = deps.files.get(join("/repo", docRel)) ?? "";
    expect(countHandoverEntries(finalMd)).toBe(MAX_SAME_DAY_ENTRIES); // 定常 = 上限
    expect(finalMd).toContain("累積抑制のため剪定"); // 剪定が起きた証跡
    // breadcrumb は累積せず常に 1 個 (idempotent、cross_agent review 指摘)。
    expect((finalMd.match(/累積抑制のため剪定/g) ?? []).length).toBe(1);
  });
});

describe("U-HOVER-015 runHandover marker reconcile (drift 恒久解消、PLAN-L7-83)", () => {
  function seededMarker(plan = "PLAN-L7-04-handover-mechanism"): ReturnType<typeof mockDeps> {
    const deps = mockDeps();
    deps.files.set(currentPlanPath, plan);
    deps.files.set(
      join(digestDir, "PLAN-L7-04-handover-mechanism.digest.json"),
      JSON.stringify(digest()),
    );
    return deps;
  }

  it("complete=true → marker を clear し checkHandoverDiscipline が drift を出さない", () => {
    const deps = seededMarker();
    runHandover(
      { date: "2026-06-04", complete: true, planId: "PLAN-L7-04-handover-mechanism" },
      deps,
    );
    // marker は空 = clear (resolveActivePlan → null)。
    const sdeps: SessionLogDeps = {
      repoRoot: "/repo",
      now: () => NOW,
      appendLine: () => {},
      readText: (p) => deps.files.get(p) ?? null,
      writeText: () => {},
      currentBranch: () => null,
      listDir: () => [],
    };
    expect(resolveActivePlan(sdeps)).toBeNull();
    // 完了後は active plan 無し → discipline は drift を含む警告ゼロ。
    expect(checkHandoverDiscipline(deps).some((w) => w.includes("drift"))).toBe(false);
  });

  it("in_progress + --plan X → marker を X へ同期 (override drift 解消)", () => {
    const deps = seededMarker("PLAN-L7-04-handover-mechanism");
    runHandover({ date: "2026-06-04", planId: "PLAN-L7-99-other" }, deps);
    expect((deps.files.get(currentPlanPath) ?? "").split("\n")[0]).toBe("PLAN-L7-99-other");
  });

  it("plain in_progress (--plan 無し) → marker 無変更 (無駄書きしない)", () => {
    const deps = seededMarker("PLAN-L7-04-handover-mechanism");
    runHandover({ date: "2026-06-04" }, deps);
    expect(deps.files.get(currentPlanPath)).toBe("PLAN-L7-04-handover-mechanism");
  });

  it("dryRun → marker を書かない (非破壊不変)", () => {
    const deps = seededMarker("PLAN-L7-04-handover-mechanism");
    runHandover(
      { date: "2026-06-04", complete: true, planId: "PLAN-L7-04-handover-mechanism", dryRun: true },
      deps,
    );
    expect(deps.files.get(currentPlanPath)).toBe("PLAN-L7-04-handover-mechanism");
  });
});

describe("U-HOVER-011 checkHandoverBypass (IMP-078 gap①)", () => {
  const docRel = join("docs", "handover", "x.md");
  function pointerJson(over: Record<string, unknown> = {}): string {
    return JSON.stringify({
      active_plan: "P",
      status: "completed",
      latest_doc: docRel,
      digest_summary: null,
      updated_at: NOW,
      ...over,
    });
  }

  it("generated_by 無し pointer → 手書き bypass warn", () => {
    const deps = mockDeps();
    deps.files.set(pointerPath, pointerJson()); // generated_by 欠落
    const w = checkHandoverBypass(deps);
    expect(w.some((m) => m.includes("bypass"))).toBe(true);
  });

  it("generated_by 一致 + entry 数一致 → 警告ゼロ", () => {
    const deps = mockDeps();
    deps.files.set(join("/repo", docRel), "# Session Handover — 2026-06-08\n");
    deps.files.set(pointerPath, pointerJson({ generated_by: GENERATED_BY, doc_entry_count: 1 }));
    expect(checkHandoverBypass(deps)).toEqual([]);
  });

  it("entry 数 mismatch (手書き追記) → bypass warn", () => {
    const deps = mockDeps();
    deps.files.set(
      join("/repo", docRel),
      "# Session Handover — a\n\n---\n\n# Session Handover — b\n",
    );
    deps.files.set(pointerPath, pointerJson({ generated_by: GENERATED_BY, doc_entry_count: 1 }));
    const w = checkHandoverBypass(deps);
    expect(w.some((m) => m.includes("mismatch"))).toBe(true);
  });

  it("pointer 不在 → 警告ゼロ (discipline 担当)", () => {
    expect(checkHandoverBypass(mockDeps())).toEqual([]);
  });

  it("countHandoverEntries: handover 見出し数を数える / null→0 / 旧英語見出し互換", () => {
    expect(countHandoverEntries("# Session Handover — a\n# Session Handover — b")).toBe(2);
    expect(countHandoverEntries("# セッション引き継ぎ — a\n# セッション引き継ぎ — b")).toBe(2);
    expect(countHandoverEntries("# Session Handover — a\n# セッション引き継ぎ — b")).toBe(2);
    expect(countHandoverEntries(null)).toBe(0);
  });
});

describe("U-HOVER-012 session scope + latestSessionId (IMP-078 gap④)", () => {
  const sessionDir = join("/repo", ".ut-tdd", "logs", "session");

  it("scopeToSession: 指定 session が触れた digest のみへ絞る", () => {
    const deps = mockDeps();
    deps.files.set(
      join(digestDir, "PLAN-L7-16-module-drift.digest.json"),
      JSON.stringify(digest({ plan_id: "PLAN-L7-16-module-drift", sessions: ["s2"] })),
    );
    deps.files.set(
      join(digestDir, "PLAN-L7-05-biome-debt.digest.json"),
      JSON.stringify(digest({ plan_id: "PLAN-L7-05-biome-debt", sessions: ["s1"] })),
    );
    const scope = resolveHandoverScope(deps, { scopeToSession: "s2" });
    expect(scope.digests).toHaveLength(1);
    expect(scope.digests[0].plan_id).toBe("PLAN-L7-16-module-drift");
  });

  it("scopeToSession: 該当 digest 無し → 全件 fallback (空 handover 回避)", () => {
    const deps = mockDeps();
    deps.files.set(
      join(digestDir, "PLAN-L7-05-biome-debt.digest.json"),
      JSON.stringify(digest({ plan_id: "PLAN-L7-05-biome-debt", sessions: ["s1"] })),
    );
    expect(resolveHandoverScope(deps, { scopeToSession: "sX" }).digests).toHaveLength(1);
  });

  it("latestSessionId: 最新 event ts の session を返す / 不在→null", () => {
    const deps = mockDeps();
    expect(latestSessionId(deps)).toBeNull();
    deps.files.set(
      join(sessionDir, "s1.jsonl"),
      '{"ts":"2026-06-08T01:00:00Z","session_id":"s1"}\n',
    );
    deps.files.set(
      join(sessionDir, "s2.jsonl"),
      '{"ts":"2026-06-08T05:00:00Z","session_id":"s2"}\n',
    );
    expect(latestSessionId(deps)).toBe("s2");
  });
});

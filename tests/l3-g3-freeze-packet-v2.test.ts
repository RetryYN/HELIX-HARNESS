import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  assertL3G3BootstrapPolicyContract,
  type BootstrapPolicy,
  createL3G3LogicalDbReceipt,
} from "../src/doctor/l3-g3-logical-db-receipt";
import { SCHEMA_VERSION } from "../src/schema/harness-db";

const PACKET_PATH = "docs/governance/l3-rebaseline-g3-freeze-packet.md";
const PLAN_PATH = "docs/plans/PLAN-L3-20-infinity-loop-g3-freeze.md";
const packet = readFileSync(PACKET_PATH, "utf8");
const plan = readFileSync(PLAN_PATH, "utf8");

const requiredFreezeTargetPlans = [
  "PLAN-L3-15-requirements-authority-chain-remediation",
  "PLAN-L3-16-scrum-reverse-entity-requirements",
  "PLAN-L3-17-lifecycle-state-separation-requirements",
  "PLAN-L3-18-worker-contract-benchmark-promotion",
  "PLAN-L3-19-github-operations-projection",
  "PLAN-L3-21-contextual-pr-review-db-convergence",
  "PLAN-L3-22-github-ci-performance-recovery",
  "PLAN-L3-23-github-approval-recovery",
  "PLAN-L3-24-github-environment-promotion",
  "PLAN-L3-25-github-update-lifecycle",
  "PLAN-L3-26-github-plan-workflow-governance",
  "PLAN-L3-27-github-trace-authority-hygiene",
  "PLAN-L3-28-feedback-test-owner-closure-disposition",
  "PLAN-L3-29-feedback-test-owner-recognition-disposition",
  "PLAN-L3-30-feedback-test-owner-direct-disposition",
  "PLAN-L3-31-feedback-test-owner-residual-disposition",
  "PLAN-L3-32-feedback-refactor-disposition",
  "PLAN-L3-33-downstream-queue-numbering",
  "PLAN-L3-34-residual-responsibility-recount",
  "PLAN-L3-35-downstream-queue-correction",
  "PLAN-L3-36-atomic-development-contract",
  "PLAN-L3-37-atomic-downstream-queue",
  "PLAN-L3-38-freeze-issue-projection-sync",
  "PLAN-L3-39-po-decision-reflection",
  "PLAN-L3-40-delivery-route-selection",
  "PLAN-L3-42-delivery-route-downstream-queue",
] as const;

function freezeTargetPlanSet(document: string): {
  schema_version: string;
  plans: string[];
} {
  const match = document.match(
    /<!-- freeze-target-plan-set:start -->\s*```json\s*([\s\S]*?)\s*```\s*<!-- freeze-target-plan-set:end -->/,
  );
  expect(match, "freeze target PLAN manifest").not.toBeNull();
  return JSON.parse(match?.[1] ?? "{}") as {
    schema_version: string;
    plans: string[];
  };
}

function sha256(path: string): string {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

const pairedArtifacts = [
  [
    "docs/design/helix/L3-requirements/scrum-reverse-entity-model.md",
    "d6ac0ebe30737d0534ccb98943b3e277eb9a551236761baaae8e6b77b14b04ac",
  ],
  [
    "docs/test-design/helix/scrum-reverse-entity-model-acceptance.md",
    "bea0f4548fa223a4cceabed25a3bf8da0388d711c9be352122fb8d0b7ecccfe2",
  ],
  [
    "docs/design/helix/L3-requirements/lifecycle-state-separation.md",
    "a4077092ff5f268cfc58af2823573565f1144f3d88b696b9f59cf20112ff857b",
  ],
  [
    "docs/test-design/helix/lifecycle-state-separation-acceptance.md",
    "73a371eadd006c4f850cc0129f8c6cdf2b44c17d8356b94164cf253711c4f60c",
  ],
  [
    "docs/design/helix/L3-requirements/worker-common-contract.md",
    "20186dde0ca6abdc0d0d41bbf1c040ed2116d2fa01dc4c55119267175dd0be61",
  ],
  [
    "docs/test-design/helix/worker-common-contract-acceptance.md",
    "d3be187322ea9fdbda8dd703c9f32faaa62b33d3eeb8e8c0683febc4e938f631",
  ],
  [
    "docs/design/helix/L3-requirements/predecessor-harness-mechanism-hardening-requirements.md",
    "c0978eae37f6c7c8e113191404c0fd76328818e438b0ea5b3cf98ebd489a6639",
  ],
  [
    "docs/test-design/helix/predecessor-harness-mechanism-hardening-acceptance.md",
    "d352ba205db85aee1f5cb0f5bcf11fb86f1cb3e59b68b3aba3728b54bb6c416a",
  ],
  [
    "docs/design/helix/L3-requirements/github-operations-projection.md",
    "42fc7bdcc43c245a714902723f3a21dd367d7006a853713aa5389a61a279dd21",
  ],
  [
    "docs/test-design/helix/github-operations-projection-acceptance.md",
    "7638e322a28a3bb866704feb2fbf431c1d1afba8154883f6f679bb5e52bb9600",
  ],
  [
    "docs/design/helix/L3-requirements/github-autonomous-operations-requirements.md",
    "122ee3854f4af6a8d20592cd5ee99a40f0d6ed4b3e57b5d1705601b454c1218f",
  ],
  [
    "docs/test-design/helix/github-autonomous-operations-acceptance.md",
    "347a0de81fb6ce463ce965cb3b783c6ff8dcd0053d98a9f21b78fc0b9e5676bc",
  ],
  [
    "docs/design/helix/L3-requirements/l12-scrum-rebaseline-requirements.md",
    "f13c5d4afd04864e2d07150ebe82013c6df63383b68935dc5a112d3bae108370",
  ],
  [
    "docs/test-design/helix/l12-scrum-rebaseline-acceptance.md",
    "5b3c0cf68146900eb35d579aa84325de992f28570329f1cd26a5cdd3308dece9",
  ],
  [
    "docs/design/helix/L3-requirements/github-merge-admission-requirements.md",
    "fb82b7629275b49093d4e97fb09c7e1dddd6089e64620e304c937a8fdf5947f8",
  ],
  [
    "docs/test-design/helix/github-merge-admission-system-test-design.md",
    "f17b4477647ebe349d68b0cae92bedb7b16e898326b269968dac0b168707ded9",
  ],
  [
    "docs/design/helix/L3-requirements/github-approval-recovery-requirements.md",
    "ddd7159e9ece094ff7ac1320395dabe8c0f83ebb291c1983559d7b605cf42a0c",
  ],
  [
    "docs/test-design/helix/github-approval-recovery-system-test-design.md",
    "74792349b5b0a8669f4e4b1228c775a57e44e6d85cbd292b562d1dcb83b69e86",
  ],
  [
    "docs/design/helix/L3-requirements/github-ci-performance-requirements.md",
    "7a9b3534671516be8810e40a8c96119e885eb431a4753518b56fe2479b9263d1",
  ],
  [
    "docs/test-design/helix/github-ci-performance-system-test-design.md",
    "8014f6ceab95bcfe3bdb717f2d813de12fa09d8dee492ec221a8800ed799a232",
  ],
  [
    "docs/design/helix/L3-requirements/github-environment-promotion-requirements.md",
    "f5b13f4b1602eda78a9bd474f6a98050f089ad734fb90afc871fd15f75cb5410",
  ],
  [
    "docs/test-design/helix/github-environment-promotion-system-test-design.md",
    "2267f75d68599d2e3f5c559b4400174604836599d8c32a37ea2af4c418f3a691",
  ],
  [
    "docs/design/helix/L3-requirements/github-update-lifecycle-requirements.md",
    "c7179d279180203231784de1d04928cd9c68e0741cf7f9aa24d572edc18a1ae9",
  ],
  [
    "docs/test-design/helix/github-update-lifecycle-system-test-design.md",
    "117a856a0356da6c5ef7178d9efbe0e52377187b75d6a74d3ef2879b4e0d492d",
  ],
  [
    "docs/design/helix/L3-requirements/github-plan-workflow-governance-requirements.md",
    "3de67351ab91fb0626d3c9ad2974b12739f278343f061142f1a839b0a7c6a617",
  ],
  [
    "docs/test-design/helix/github-plan-workflow-governance-system-test-design.md",
    "4d28725768506a67fa119d8851aa010114ddcde5c1cd8f315a68c5a369e13202",
  ],
  [
    "docs/design/helix/L3-requirements/github-atomic-development-requirements.md",
    "c025741e505bc244da7319448f2396aab1930d35c6877f1f16c403d342fddbf8",
  ],
  [
    "docs/test-design/helix/github-atomic-development-system-test-design.md",
    "a36eff5d2becc09bdb4c83f6b9ddf17423ca93e33486c2f0e20246aa5762168e",
  ],
] as const;

describe("L3 G1/G3 freeze packet v2", () => {
  it("binds the required freeze target PLAN exact set without legacy ranges or duplicates", () => {
    const planManifest = freezeTargetPlanSet(plan);
    const packetManifest = freezeTargetPlanSet(packet);
    expect(planManifest.schema_version).toBe("helix-l3-g3-freeze-target-plan-set.v1");
    expect(planManifest.plans).toEqual(requiredFreezeTargetPlans);
    expect(new Set(planManifest.plans).size).toBe(planManifest.plans.length);
    expect(packetManifest).toEqual(planManifest);
    for (const planId of requiredFreezeTargetPlans) {
      expect(sha256(`docs/plans/${planId}.md`)).toMatch(/^[a-f0-9]{64}$/);
      expect(plan).toContain(`- docs/plans/${planId}.md`);
    }
    for (const legacyScope of ["L3-16〜19", "L3-15〜39", "L3-16〜39"]) {
      expect(plan).not.toContain(legacyScope);
    }
    expect(plan).toContain("authoring runtimeと異なる独立AI-B");
    expect(plan).not.toContain("packet を別 runtime (Codex)");
  });

  it("binds the final material snapshot and delegates self-referential receipts externally", () => {
    expect(plan).toContain("PLAN-L7-465-g3-logical-db-bootstrap-verifier.md");
    expect(plan).not.toContain(
      "artifact_path: tests/l3-g3-freeze-packet-v2.test.ts\n    artifact_type: test_code",
    );
    expect(packet).toContain("状態: `review-ready-awaiting-external-receipts`");
    expect(packet).toContain("PR #131でdelivery route意味残差");
    expect(packet).toContain("PR #133でdelivery route PLANのreview evidence");
    expect(packet).toContain("PR #134でdelivery routeのdownstream queue");
    expect(packet).toContain("PR #130のsame-HEAD review、CI、DB receipt");
    expect(packet).toContain("L12R-FR-001..014 / L12R-AC-001..022");
    expect(packet).toContain("schema、router、DB projectionはL6/L7未実装");
    expect(packet).toContain("bb33e39be8761a7734cbd7c1d8163036081e0f90");
    expect(packet).toContain("1e0d1b161d56febefc82e67958f2460a741c3c2a");
    expect(packet).toContain("PR #138/#142");
    expect(packet).toContain("GitHub same-HEAD review receiptへ外部束縛");
    expect(packet).toContain("tracked authority projection rebuild 2回一致");
    expect(packet).toContain("policy記載のruntime観測8入力をprojectionから明示除外");
    expect(packet).toContain("`.helix/evidence/run-debug/runtime-verification.jsonl` はtracked");
    expect(packet).toContain("helix-l3-g3-logical-db-bootstrap-policy.v2");
    expect(packet).toContain("l3-g3-logical-db-bootstrap-policy.json");
    expect(packet).toContain("npx tsx src/doctor/l3-g3-logical-db-receipt.ts");
    expect(packet).toContain("review HEADとmerge HEADのtreeが同一");
    expect(packet).not.toContain("PENDING_PACKET_PR_HEAD");
    expect(packet).not.toContain("PENDING_SAME_HEAD_ISOLATED_REBUILD_X2");
    expect(packet).not.toContain("PENDING_AFTER_PR_98_L3_26_L3_27_MERGE");
    expect(packet).not.toContain("PENDING_L3_26_INDEPENDENT_DIGEST_REVIEW");
  });

  it("executes the versioned logical DB bootstrap policy instead of checking prose only", () => {
    const policy = JSON.parse(
      readFileSync("docs/governance/l3-g3-logical-db-bootstrap-policy.json", "utf8"),
    ) as {
      schema_version: string;
      normalization_marker: string;
      observation_columns: string[];
      checkpoint_tables: string[];
      stale_rules: unknown[];
      orphan_rules: unknown[];
    };
    expect(policy.schema_version).toBe("helix-l3-g3-logical-db-bootstrap-policy.v2");
    expect(policy.observation_columns.length).toBeGreaterThan(0);
    expect(new Set(policy.observation_columns).size).toBe(policy.observation_columns.length);
    expect(policy.checkpoint_tables).toEqual([
      "artifact_registry",
      "descent_obligations",
      "plan_registry",
      "review_evidence_registry",
    ]);
    expect(policy.stale_rules).toHaveLength(1);
    expect(policy.orphan_rules).toHaveLength(1);

    const receipt = createL3G3LogicalDbReceipt(process.cwd(), {
      afterRebuild(db) {
        for (const table of [
          "drive_runs",
          "hook_events",
          "feedback_lifecycle",
          "runtime_verification_events",
          "loop_iterations",
          "model_evaluations",
        ]) {
          expect(db.prepare(`SELECT COUNT(*) AS n FROM ${table}`).get()?.n, table).toBe(0);
        }
        expect(
          db
            .prepare(
              "SELECT COUNT(*) AS n FROM model_runs WHERE evidence_path LIKE '.helix/evidence/pair-agent/%'",
            )
            .get()?.n,
          "pair-agent model_runs",
        ).toBe(0);
      },
    });
    expect(receipt.schema_version).toBe("helix-l3-g3-logical-db-bootstrap-receipt.v2");
    expect(receipt.canonicalization_contract).toEqual({
      object_keys: "lexicographic_ascending",
      array_order: "preserve",
      binary: "unsigned_byte_array",
      encoding: "utf8",
      digest: "sha256",
    });
    expect(receipt.table_order).toBe("lexicographic_ascending");
    expect(receipt.column_order).toBe("lexicographic_ascending");
    expect(receipt.row_order).toEqual({
      columns: "all non-observation columns in lexicographic order",
      fallback: "all columns in lexicographic order",
    });
    expect(receipt.normalization_marker).toBe(policy.normalization_marker);
    expect(receipt.observation_columns).toEqual(policy.observation_columns);
    expect(receipt.observation_columns_digest).toBe(
      "sha256:75bf22b6d9fbe4467aa3474c6df11c85eed1e7e0d34d75306730830c426381d4",
    );
    expect(receipt.source_head).toMatch(/^[a-f0-9]{40}$/);
    expect(receipt.policy_digest).toMatch(/^sha256:[a-f0-9]{64}$/);
    expect(receipt.verifier_digest).toMatch(/^sha256:[a-f0-9]{64}$/);
    expect(receipt.projection_digest).toBe(receipt.replay_projection_digest);
    expect(receipt.checkpoint_digest).toBe(receipt.replay_checkpoint_digest);
    expect(receipt.checkpoint_tables).toEqual(receipt.replay_checkpoint_tables);
    expect(receipt.checkpoint_population_valid).toBe(true);
    expect(Object.values(receipt.checkpoint_row_counts).every((count) => count > 0)).toBe(true);
    expect(receipt.workspace_attestation.clean).toBe(true);
    expect(receipt.projection_input_mode).toBe("tracked-authority-runtime-logs-excluded");
    expect(receipt.excluded_projection_inputs).toEqual([
      ".helix/logs/plan/*.digest.json",
      ".helix/logs/session/*.jsonl",
      ".helix/logs/feedback-lifecycle.jsonl",
      ".helix/handover/provider/*.json",
      ".helix/evidence/run-debug/runtime-verification.jsonl",
      ".helix/evidence/pair-agent/*.json",
      ".helix/state/loop/*.iterations.jsonl",
      ".helix/config/model-opt-in.yaml",
    ]);
    expect(receipt.excluded_projection_steps).toEqual([
      "projectDriveRuns",
      "projectHookEvents",
      "projectRuntimeVerificationEvents",
      "projectPairAgentRunEvidence",
      "projectLoopIterations",
      "projectFeedbackLifecycle",
      "projectModelEvaluations",
    ]);
    expect(receipt.executed_excluded_projection_steps).toEqual([]);
    expect(receipt.replay_executed_excluded_projection_steps).toEqual([]);
    expect(receipt.schema_revision).toBe(SCHEMA_VERSION);
    expect(receipt.replay_schema_revision).toBe(SCHEMA_VERSION);
    expect(receipt.stale_population_valid).toBe(true);
    expect(receipt.stale_count + receipt.replay_stale_count).toBe(0);
    expect(receipt.orphan_population_valid).toBe(true);
    expect(receipt.orphan_count + receipt.replay_orphan_count).toBe(0);
    expect(receipt.finding_count + receipt.replay_finding_count).toBe(0);
    expect(receipt.unexpected_unstable_columns).toEqual([]);
    expect(receipt.converged).toBe(true);
    expect(receipt.receipt_digest).toMatch(/^sha256:[a-f0-9]{64}$/);
  });

  it("rejects policy sort and canonicalization declarations that the verifier does not implement", () => {
    const policy = JSON.parse(
      readFileSync("docs/governance/l3-g3-logical-db-bootstrap-policy.json", "utf8"),
    ) as BootstrapPolicy;
    for (const mutant of [
      { ...policy, schema_version: "helix-l3-g3-logical-db-bootstrap-policy.v999" },
      { ...policy, table_order: "preserve" },
      { ...policy, column_order: "schema_order" },
      { ...policy, row_order: { ...policy.row_order, columns: "primary_key_only" } },
      { ...policy, row_order: { ...policy.row_order, fallback: "unspecified" } },
      { ...policy, normalization_marker: "<unsupported>" },
      {
        ...policy,
        observation_columns: [...policy.observation_columns, "workflow_runs.started_at"],
      },
      { ...policy, rebuild_count: 1 },
      {
        ...policy,
        projection_input_policy: {
          ...policy.projection_input_policy,
          tracked_workspace_required: false,
        },
      },
      {
        ...policy,
        projection_input_policy: {
          ...policy.projection_input_policy,
          runtime_logs: "include",
        },
      },
      {
        ...policy,
        projection_input_policy: {
          ...policy.projection_input_policy,
          excluded_paths: [".helix/logs/unknown.jsonl"],
        },
      },
      {
        ...policy,
        projection_input_policy: {
          ...policy.projection_input_policy,
          excluded_projection_steps: ["projectUnknownRuntimeState"],
        },
      },
      ...Object.keys(policy.canonical_json).map((key) => ({
        ...policy,
        canonical_json: {
          ...policy.canonical_json,
          [key]: `unsupported_${key}`,
        },
      })),
    ]) {
      expect(() =>
        assertL3G3BootstrapPolicyContract(mutant as unknown as BootstrapPolicy),
      ).toThrow();
    }
  });

  it("rejects stale rows, relational orphans, and empty checkpoint populations", () => {
    const receipt = createL3G3LogicalDbReceipt(process.cwd(), {
      afterRebuild(db, ordinal) {
        if (ordinal !== 2) return;
        db.exec(
          "UPDATE artifact_registry SET status = 'stale' WHERE artifact_id = (SELECT artifact_id FROM artifact_registry LIMIT 1)",
        );
        db.exec(
          "UPDATE artifact_progress_events SET artifact_path = '__missing__' WHERE artifact_progress_event_id = (SELECT artifact_progress_event_id FROM artifact_progress_events LIMIT 1)",
        );
        db.exec("DELETE FROM review_evidence_registry");
      },
    });
    expect(receipt.replay_stale_count).toBe(1);
    expect(receipt.replay_orphan_count).toBe(1);
    expect(receipt.replay_checkpoint_population_valid).toBe(false);
    expect(receipt.converged).toBe(false);
  });

  // U-G3DB-008: checkout の絶対 path を投影すると logical digest がcheckout位置の関数になる。
  // 同一HEADの別checkoutで同じfreeze証拠を返せるよう、実DB全体にrootが現れないことを固定する。
  it("keeps projected rows free of the checkout absolute path", () => {
    const repoRoot = process.cwd();
    const leaks: string[] = [];
    createL3G3LogicalDbReceipt(repoRoot, {
      afterRebuild(db, ordinal) {
        if (ordinal !== 1) return;
        const tables = db
          .prepare("SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name")
          .all() as Array<{ name: string }>;
        for (const { name } of tables) {
          const columns = db.prepare(`PRAGMA table_info("${name}")`).all() as Array<{
            name: string;
          }>;
          for (const column of columns) {
            const hit = db
              .prepare(
                `SELECT "${column.name}" AS value FROM "${name}" WHERE "${column.name}" LIKE ? LIMIT 1`,
              )
              .get(`%${repoRoot}%`) as { value?: unknown } | undefined;
            if (hit) leaks.push(`${name}.${column.name}`);
          }
        }
      },
    });
    expect(leaks).toEqual([]);
  });

  it("binds every listed L3/L10 artifact candidate to its current digest", () => {
    for (const [path, expected] of pairedArtifacts) {
      expect(sha256(path), path).toBe(expected);
      expect(packet, path).toContain(expected);
    }
    expect(sha256("docs/governance/helix-harness-requirements_v1.3.md")).toBe(
      "b7a582a2b4460e03f18c0b4fc91f5b4e4d6d68ca16bf2cd8f6b415d2af88a3a8",
    );
    expect(sha256("docs/governance/l3-progression-authority-rebaseline-2026-07-19.md")).toBe(
      "f7e425c53a42b7a04d02b277d869b9e1dee9ed48b2126505add49569546cfd8d",
    );
    expect(sha256("docs/design/design-catalog.yaml")).toBe(
      "1b61fea46ebe4649200163d4ab0df633cea951b7eef19f424025ab2f435e9de7",
    );
  });

  it("contains the five-question batch and unresolved issue dispositions", () => {
    for (const question of [
      "L3承認前のdraft PR",
      "merge方式",
      "Update priority",
      "flat PLAN migration",
      "AWS reference profile",
    ]) {
      expect(packet).toContain(question);
    }
    for (const issue of ["#30", "#73", "#74", "#75"]) {
      expect(packet).toContain(issue);
    }
    expect(packet).toContain("ADOPTED_L3_L10_DOWNSTREAM_RESERVED_PENDING_FREEZE");
    expect(packet).toContain("DISPOSITION_SYNCED_DOWNSTREAM_RESERVED_PENDING_EXECUTION");
    expect(packet).toContain("ADOPTED_DOWNSTREAM_RESERVED_PENDING_IMPLEMENTATION");
    expect(packet).toContain("2026-07-25T18:27:27Z");
    expect(packet).toContain("2026-07-23T21:20:29Z");
    expect(packet).toContain("2026-07-23T21:20:30Z");
    expect(packet).toContain("2026-07-23T21:20:31Z");
    expect(packet).toContain(
      "sha256:37d385f2105d79add7bcc41011d719411c84aae5a06df0e12434ebaa38ec71a4",
    );
    expect(packet).toContain("153/153");
    expect(packet).toContain("24 FR / 72 AC / 24 HAT");
    expect(packet).toContain("unresolved audit 0");
    expect(packet).toContain("missing-test-plan-id=100");
    expect(packet).toContain("21+9+27+35=92");
    expect(packet).toContain("自己owner 8件");
    expect(packet).toContain("9+6+5 partition");
    expect(packet).toContain("PLAN slice closureとrequirements freezeの分離");
    expect(packet).toContain(
      "requirements definition 153件のG1/G3 freeze、downstream ownership実装、L4着手承認を意味しない",
    );
    expect(packet).toContain("個別PLANのreview evidenceを代替しない");
    expect(packet).toContain("G3後のGitHub 5責務・10小PR境界");
    expect(packet).toContain("原子的開発5責務・15小PR境界");
    expect(packet).toContain("pair closure 10枠、L6/L7 5枠、15枠");
    expect(packet).toContain("`L3Q-PC-036..045`");
    expect(packet).toContain("`L3Q-IT-023..027`");
    for (const workstream of [
      "atomic_slice_admission",
      "impact_ci_recovery",
      "mini_refactor_migration",
      "dependency_frontier_task_extraction",
      "pr_exclusive_lease",
    ]) {
      expect(packet).toContain(workstream);
    }
    expect(packet).toContain("7+5+4+14+5=35");
    expect(packet).toContain("最小7小PR");
    expect(packet).toContain("12+9+9+6+20+1=57");
    expect(packet).toContain("最小6小PR");
    expect(packet).toContain("初期pair closure分母は23小PR");
    expect(packet).toContain("current pair closure分母は35小PR");
    expect(packet).toContain("追補`L3Q-PC-024..035`");
    expect(packet).toContain("current pair closure分母は45小PR");
    expect(packet).toContain("6+1+5=12小PR");
    expect(packet).toContain("合計16");
    expect(packet).toContain("pair closure 47 + L6/L7 28 + refactor 12 = 87小PR");
    expect(packet).toContain("right-arm execution evidence前");
    for (const planId of [
      "PLAN-L3-28-feedback-test-owner-closure-disposition",
      "PLAN-L3-29-feedback-test-owner-recognition-disposition",
      "PLAN-L3-30-feedback-test-owner-direct-disposition",
      "PLAN-L3-31-feedback-test-owner-residual-disposition",
      "PLAN-L3-32-feedback-refactor-disposition",
    ]) {
      expect(packet).toContain(planId);
    }
    const ownerRows = ["closure", "recognition", "direct", "residual"].flatMap((family) => {
      const disposition = JSON.parse(
        readFileSync(`docs/governance/feedback-test-owner-disposition-${family}.json`, "utf8"),
      ) as {
        bindings: Array<{
          test_path: string;
          expected_case_count: number;
        }>;
      };
      return disposition.bindings;
    });
    expect(ownerRows).toHaveLength(19);
    expect(new Set(ownerRows.map((row) => row.test_path)).size).toBe(19);
    expect(ownerRows.reduce((sum, row) => sum + row.expected_case_count, 0)).toBe(92);
    for (const planId of ["PLAN-L7-351", "PLAN-L7-349", "PLAN-L7-150"]) {
      expect(packet).toContain(planId);
    }
    for (const planId of ["PLAN-L3-27", "PLAN-L3-20", "PLAN-L3-13"]) {
      expect(packet).toContain(planId);
    }
    for (const stem of [
      "github-merge-admission-ci-performance",
      "github-approval-recovery",
      "github-environment-promotion",
      "github-update-lifecycle",
      "github-plan-workflow-governance",
    ]) {
      expect(packet).toContain(`docs/design/helix/L4-basic-design/${stem}.md`);
      expect(packet).toContain(`docs/test-design/helix/L9-${stem}-integration.md`);
      expect(packet).toContain(`docs/design/helix/L5-detail/${stem}.md`);
      expect(packet).toContain(`docs/test-design/helix/L8-${stem}-contracts.md`);
    }
  });

  it("binds the five PO decisions without claiming G1/G3 freeze", () => {
    const approval = readFileSync(
      "docs/design/helix/L3-requirements/github-approval-recovery-requirements.md",
      "utf8",
    );
    const update = readFileSync(
      "docs/design/helix/L3-requirements/github-update-lifecycle-requirements.md",
      "utf8",
    );
    const workflow = readFileSync(
      "docs/design/helix/L3-requirements/github-plan-workflow-governance-requirements.md",
      "utf8",
    );
    const requirements = readFileSync("docs/governance/helix-harness-requirements_v1.3.md", "utf8");
    const agents = readFileSync("AGENTS.md", "utf8");
    const claude = readFileSync("CLAUDE.md", "utf8");
    const audit = readFileSync("docs/governance/audit-framework.md", "utf8");

    expect(packet).toContain("issuecomment-5064713980");
    expect(packet).toContain("5問decision unresolvedは0");
    expect(packet).toContain("状態: `review-ready-awaiting-external-receipts`");
    expect(packet).toContain("packet PR自身の同一HEAD review");
    expect(packet).toContain("PO最終承認資料として提示してはならない");

    expect(approval).toContain("非正本のreview proposalとしてDraft PR");
    expect(approval).not.toContain("承認後にだけPRを作成する");
    expect(update).toContain("Issue identityとpriorityは直交");
    expect(update).toContain("`P3=Update`という固定対応を正本にしない");
    expect(workflow).toContain("L5契約が閉じた後に専用migration PLAN");
    expect(workflow).toContain("legacy loaderとnested loaderのdual-green");
    expect(requirements).toContain("AWS ECS Fargate + CDK TypeScript");
    expect(requirements).toContain("native auto-mergeは禁止");
    expect(agents).toContain("GitHub native auto-mergeは禁止");
    expect(claude).toContain("GitHub native auto-mergeは禁止");
    expect(audit).not.toContain("safe なら auto-merge");
    expect(audit).not.toContain("safe → auto-merge");
  });
});

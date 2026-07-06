import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import {
  DOC_ARTIFACT_TYPES,
  deriveArtifactProgressDecision,
} from "../src/state-db/artifact-progress-decision";
import { openHarnessDb } from "../src/state-db/index";
import { migrate } from "../src/state-db/migration";
import {
  collectReverseCandidates,
  REVERSE_TYPE_BY_ARTIFACT,
} from "../src/state-db/reverse-candidates";

const tempRoots: string[] = [];
afterAll(() => {
  for (const root of tempRoots) rmSync(root, { force: true, recursive: true });
});

function makeDb() {
  const root = mkdtempSync(join(tmpdir(), "helix-reverse-closure-"));
  tempRoots.push(root);
  const db = openHarnessDb(join(root, ".helix", "harness.db"), { repoRoot: root });
  migrate(db);
  return db;
}

describe("doc artifact progress oracle (U-APDOC、PLAN-L7-353)", () => {
  it("U-APDOC-001: confirmed doc は test evidence なしで green (review/pair gate 検証)", () => {
    for (const artifactType of DOC_ARTIFACT_TYPES) {
      const decision = deriveArtifactProgressDecision({
        linkedTestCount: 0,
        dependencyChecked: true,
        openDependencyImpacts: 0,
        artifactType,
        docStatus: "confirmed",
      });
      expect(decision.color).toBe("green");
      expect(decision.state).toBe("verified");
      expect(decision.reason).toContain("review/pair gates");
    }
  });

  it("U-APDOC-002: draft/status 不明の doc は yellow のまま (捏造 green を出さない)", () => {
    for (const docStatus of ["draft", null, ""]) {
      const decision = deriveArtifactProgressDecision({
        linkedTestCount: 0,
        dependencyChecked: true,
        openDependencyImpacts: 0,
        artifactType: "design",
        docStatus,
      });
      expect(decision.color).toBe("yellow");
      expect(decision.state).toBe("implemented_unverified");
    }
  });

  it("U-APDOC-003: doc でも open dependency impact は red が優先 (fail-close 維持)", () => {
    const decision = deriveArtifactProgressDecision({
      linkedTestCount: 0,
      dependencyChecked: true,
      openDependencyImpacts: 3,
      artifactType: "plan",
      docStatus: "confirmed",
    });
    expect(decision.color).toBe("red");
  });

  it("U-APDOC-004: source artifact は従来どおり test-run oracle (doc 規則を適用しない)", () => {
    const unverified = deriveArtifactProgressDecision({
      linkedTestCount: 0,
      dependencyChecked: true,
      openDependencyImpacts: 0,
      artifactType: "source",
      docStatus: "confirmed",
    });
    expect(unverified.color).toBe("yellow");
    const verified = deriveArtifactProgressDecision({
      linkedTestCount: 1,
      passedLinkedTestRunCount: 1,
      dependencyChecked: true,
      openDependencyImpacts: 0,
      artifactType: "source",
    });
    expect(verified.color).toBe("green");
  });
});

describe("reverse candidates (U-RVC、PLAN-L7-353)", () => {
  it("U-RVC-001: recovery 未紐付けの red artifact は reverse 候補になり、type 割当が map に従う", () => {
    const db = makeDb();
    db.exec(
      `INSERT INTO artifact_progress (artifact_path, artifact_type, color, state, reason, recovery_plan_ids)
       VALUES ('docs/design/x.md', 'design', 'red', 'dependency_unchecked', '2 open dependency impact(s)', ''),
              ('src/y.ts', 'source', 'red', 'dependency_unchecked', '1 open dependency impact(s)', ''),
              ('docs/design/covered.md', 'design', 'red', 'recovering', 'recovery', 'PLAN-R-1'),
              ('docs/plans/green.md', 'plan', 'green', 'verified', 'ok', '')`,
    );
    const candidates = collectReverseCandidates(db);
    const subjects = candidates.map((c) => c.subject);
    expect(subjects).toContain("docs/design/x.md");
    expect(subjects).toContain("src/y.ts");
    expect(subjects).not.toContain("docs/design/covered.md");
    expect(subjects).not.toContain("docs/plans/green.md");
    const design = candidates.find((c) => c.subject === "docs/design/x.md");
    expect(design?.reverseType).toBe(REVERSE_TYPE_BY_ARTIFACT.design);
    expect(design?.suggestedRoute).toContain("reverse design R0");
  });

  it("U-RVC-002: warn finding は候補になり info finding は候補にしない", () => {
    const db = makeDb();
    db.exec(
      `INSERT INTO findings (finding_id, kind, severity, subject_id, source, status, evidence_path)
       VALUES ('f1', 'missing-test-coverage', 'warn', 'src/a.ts', 'review', 'open', ''),
              ('f2', 'missing-test-oracle-id', 'info', 'tests/b.test.ts', 'test-case-catalog', 'open', ''),
              ('f3', 'missing-test-coverage', 'warn', 'src/closed.ts', 'review', 'resolved', '')`,
    );
    const candidates = collectReverseCandidates(db);
    expect(candidates.map((c) => c.subject)).toEqual(["src/a.ts"]);
    expect(candidates[0]?.reverseType).toBe("test");
  });

  it("U-RVC-003: 対象なしのとき空配列 (成功を捏造せず 0 件を 0 件として返す)", () => {
    const db = makeDb();
    expect(collectReverseCandidates(db)).toEqual([]);
  });
});

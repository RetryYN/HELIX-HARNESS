import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { loadCanonicalRequirementIrFromShards } from "../src/requirements/requirement-generated-view";
import { openHarnessDb } from "../src/state-db";
import { rebuildHarnessDb } from "../src/state-db/projection-writer";

// PLAN-L7-489-requirement-generated-view-projection

function projectedRows(db: ReturnType<typeof openHarnessDb>) {
  return db
    .prepare(
      `SELECT record_id, record_kind, schema_version, semantic_digest,
              source_root_digest, owner_id, oracle_id, status, source_path, authority
       FROM requirement_ir
       ORDER BY record_kind, record_id`,
    )
    .all();
}

describe("Requirement IR harness.db shadow projection", () => {
  it("U-RGV-006: rebuilds the 153/24/72/24 projection twice without drift", () => {
    const db = openHarnessDb(":memory:");
    try {
      const first = rebuildHarnessDb({
        repoRoot: process.cwd(),
        db,
        runtimeLogPolicy: "exclude",
      });
      const firstRows = projectedRows(db);
      const second = rebuildHarnessDb({
        repoRoot: process.cwd(),
        db,
        runtimeLogPolicy: "exclude",
      });
      const secondRows = projectedRows(db);
      expect(first.findings).toEqual([]);
      expect(second.findings).toEqual([]);
      expect(secondRows).toEqual(firstRows);
      expect(firstRows).toHaveLength(355);
      expect(
        db
          .prepare(
            "SELECT record_kind AS kind, COUNT(*) AS count FROM requirement_ir GROUP BY record_kind ORDER BY record_kind",
          )
          .all(),
      ).toEqual([
        { kind: "acceptance", count: 72 },
        { kind: "refinement_acceptance", count: 48 },
        { kind: "refinement_contract", count: 4 },
        { kind: "refinement_requirement", count: 30 },
        { kind: "requirement", count: 153 },
        { kind: "system_contract", count: 24 },
        { kind: "system_test", count: 24 },
      ]);
    } finally {
      db.close();
    }
  });

  it("U-RGV-007: keeps root/record digests current and owner/oracle references non-orphan", () => {
    const source = loadCanonicalRequirementIrFromShards(process.cwd());
    const sourceDigests = new Map([
      ...source.requirements.map(
        (record) => [record.requirement_id, record.semantic_digest] as const,
      ),
      ...source.system_contracts.map(
        (record) => [record.system_contract_id, record.semantic_digest] as const,
      ),
      ...source.acceptance_cases.map(
        (record) => [record.acceptance_id, record.semantic_digest] as const,
      ),
      ...source.system_tests.map(
        (record) => [record.system_test_id, record.semantic_digest] as const,
      ),
      ...source.refinement_contracts.flatMap((record) => [
        [record.refinement_contract_id, record.semantic_digest] as const,
        ...record.supporting_requirements.map(
          (requirement) => [requirement.requirement_id, requirement.semantic_digest] as const,
        ),
        ...record.acceptance_cases.map(
          (acceptance) => [acceptance.acceptance_id, acceptance.semantic_digest] as const,
        ),
      ]),
    ]);
    const db = openHarnessDb(":memory:");
    try {
      rebuildHarnessDb({ repoRoot: process.cwd(), db, runtimeLogPolicy: "exclude" });
      const rows = projectedRows(db);
      expect(
        rows.every(
          (row) =>
            row.authority === "canonical" &&
            row.source_root_digest === source.root_digest &&
            row.semantic_digest === sourceDigests.get(String(row.record_id)),
        ),
      ).toBe(true);
      const orphan = db
        .prepare(
          `SELECT COUNT(*) AS value
           FROM requirement_ir AS subject
           LEFT JOIN requirement_ir AS owner
             ON owner.record_id = subject.owner_id AND owner.record_kind = 'system_contract'
           LEFT JOIN requirement_ir AS oracle
             ON oracle.record_id = subject.oracle_id AND oracle.record_kind = 'system_test'
           WHERE subject.record_kind != 'system_test'
             AND (owner.record_id IS NULL OR oracle.record_id IS NULL)`,
        )
        .get() as { value: number };
      expect(orphan.value).toBe(0);
    } finally {
      db.close();
    }
  });

  it("U-RGV-008: leaves the shadow projection empty when a consumer fixture has no IR manifest", () => {
    const repoRoot = mkdtempSync(join(tmpdir(), "helix-requirement-shadow-absent-"));
    const db = openHarnessDb(":memory:");
    try {
      const result = rebuildHarnessDb({ repoRoot, db, runtimeLogPolicy: "exclude" });
      expect(result.findings).toEqual([]);
      expect(projectedRows(db)).toEqual([]);
    } finally {
      db.close();
    }
  });
});

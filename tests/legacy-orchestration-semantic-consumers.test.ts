import { describe, expect, it } from "vitest";
import {
  analyzeLegacyOrchestrationSemanticConsumers,
  type LegacyOrchestrationSemanticConsumerLedger,
  type LegacyOrchestrationSemanticConsumerSource,
  loadLegacyOrchestrationSemanticConsumerLedger,
} from "../src/lint/legacy-orchestration-semantic-consumers";

const requiredCapabilities = [
  "LEGACY-SEM-TEAM-CLI-DIRECT-001",
  "LEGACY-SEM-PAIR-CLI-DIRECT-001",
  "LEGACY-SEM-LOOP-CLI-DIRECT-001",
  "LEGACY-SEM-TEAM-FIRE-SLOT-001",
  "LEGACY-SEM-TEAM-RELEASE-SLOT-001",
  "LEGACY-SEM-TEAM-MAX-PARALLEL-001",
  "LEGACY-SEM-LOOP-STATE-WRITEBACK-001",
  "LEGACY-SEM-LOOP-LEGACY-IMPORT-001",
] as const;

function cloneLedger(
  ledger: LegacyOrchestrationSemanticConsumerLedger,
): LegacyOrchestrationSemanticConsumerLedger {
  return structuredClone(ledger);
}

function source(path: string, content: string): LegacyOrchestrationSemanticConsumerSource {
  return { path, content };
}

function entryByCapability(
  ledger: LegacyOrchestrationSemanticConsumerLedger,
  capabilityId: string,
) {
  const entry = ledger.entries.find((candidate) => candidate.capability_id === capabilityId);
  expect(entry).toBeDefined();
  if (!entry) throw new Error(`missing test ledger entry: ${capabilityId}`);
  return entry;
}

describe("legacy orchestration semantic consumer ledger", () => {
  it("U-LORET-SEM-009/010: 現行mainの実symbol/callsiteをexact ledgerへ束縛する", () => {
    const loaded = loadLegacyOrchestrationSemanticConsumerLedger(process.cwd());
    const result = analyzeLegacyOrchestrationSemanticConsumers(loaded.ledger, loaded.sourceFiles);

    expect(result.ok).toBe(true);
    expect(result.errors).toEqual([]);
    expect(loaded.ledger.entries.map((entry) => entry.capability_id)).toEqual(
      expect.arrayContaining([...requiredCapabilities]),
    );
    for (const entry of loaded.ledger.entries) {
      expect(entry.capability_id).toBeTruthy();
      expect(entry.symbol_or_command).toBeTruthy();
      expect(entry.path).toMatch(/^src\//);
      expect(entry.line_anchor).toBeTruthy();
      expect(entry.consumer_role).toBeTruthy();
      expect(entry.current_authority).toBeTruthy();
      expect(entry.target_authority).toBeTruthy();
      expect(entry).toHaveProperty("successor_symbol");
      expect(entry.migration_state).toBeTruthy();
      expect(entry.removal_preconditions.length).toBeGreaterThan(0);
      expect(entry.negative_oracle_ids.length).toBeGreaterThan(0);
    }
  });

  it("U-LORET-SEM-001/007: direct callをcompatibility/read-onlyへ偽装できない", () => {
    const loaded = loadLegacyOrchestrationSemanticConsumerLedger(process.cwd());
    const mutated = cloneLedger(loaded.ledger);
    const team = entryByCapability(mutated, "LEGACY-SEM-TEAM-CLI-DIRECT-001");
    team.consumer_role = "read_only_replay";

    const result = analyzeLegacyOrchestrationSemanticConsumers(mutated, loaded.sourceFiles);

    expect(result.ok).toBe(false);
    expect(result.errors).toContain(
      "consumer_role_mismatch:LEGACY-SEM-TEAM-CLI-DIRECT-001:direct_execution",
    );
  });

  it("U-LORET-SEM-002/003/004/009: fire/release/max_parallel/write-backを欠落または誤分類できない", () => {
    const loaded = loadLegacyOrchestrationSemanticConsumerLedger(process.cwd());
    for (const capabilityId of [
      "LEGACY-SEM-TEAM-FIRE-SLOT-001",
      "LEGACY-SEM-TEAM-RELEASE-SLOT-001",
      "LEGACY-SEM-TEAM-MAX-PARALLEL-001",
      "LEGACY-SEM-LOOP-STATE-WRITEBACK-001",
    ]) {
      const mutated = cloneLedger(loaded.ledger);
      mutated.entries = mutated.entries.filter((entry) => entry.capability_id !== capabilityId);
      const result = analyzeLegacyOrchestrationSemanticConsumers(mutated, loaded.sourceFiles);
      expect(result.errors).toContain(`required_capability_missing:${capabilityId}`);
    }

    const mutated = cloneLedger(loaded.ledger);
    const fire = entryByCapability(mutated, "LEGACY-SEM-TEAM-FIRE-SLOT-001");
    fire.consumer_role = "compatibility_adapter";
    expect(
      analyzeLegacyOrchestrationSemanticConsumers(mutated, loaded.sourceFiles).errors,
    ).toContain("consumer_role_mismatch:LEGACY-SEM-TEAM-FIRE-SLOT-001:write_control");
  });

  it("U-LORET-SEM-005/006: production callsiteのないsuccessorやclosed predecessorだけでmigratedへ昇格できない", () => {
    const loaded = loadLegacyOrchestrationSemanticConsumerLedger(process.cwd());
    const migrated = cloneLedger(loaded.ledger);
    const team = entryByCapability(migrated, "LEGACY-SEM-TEAM-CLI-DIRECT-001");
    team.migration_state = "migrated";
    team.successor_symbol = "futureAssignmentScheduler";
    team.removal_preconditions = ["predecessor_issue_closed"];

    const result = analyzeLegacyOrchestrationSemanticConsumers(migrated, loaded.sourceFiles);

    expect(result.ok).toBe(false);
    expect(result.errors).toContain(
      "migrated_successor_not_found:LEGACY-SEM-TEAM-CLI-DIRECT-001:futureAssignmentScheduler",
    );
    expect(result.errors).toContain(
      "migration_preconditions_incomplete:LEGACY-SEM-TEAM-CLI-DIRECT-001",
    );
  });

  it("U-LORET-SEM-008: alias/dynamic import/command分割でhidden consumerを作れない", () => {
    const loaded = loadLegacyOrchestrationSemanticConsumerLedger(process.cwd());
    const hidden: LegacyOrchestrationSemanticConsumerSource[] = [
      source("src/hidden-alias.ts", "const alias = executeTeamRunPlan; await alias(plan, deps);"),
      source("src/hidden-dynamic.ts", 'const loader = import("../team/run");'),
      source("src/hidden-command.ts", '["team", "run"].join(" ");'),
      source(
        "src/hidden-multiline.ts",
        'const alias =\n  executeTeamRunPlan;\nconst loader = import(\n  "../team/run"\n);\nconst command = [\n  "team",\n  "run"\n].join(" ");',
      ),
      source("src/hidden-direct.ts", "await executeTeamRunPlan(plan, deps);"),
      source(
        "src/hidden-loop-consumers.ts",
        "await tick(state, rules, deps); importLegacy(planId); const width = plan.max_parallel; import(`../team/run`);",
      ),
    ];

    const result = analyzeLegacyOrchestrationSemanticConsumers(loaded.ledger, [
      ...loaded.sourceFiles,
      ...hidden,
    ]);

    expect(result.ok).toBe(false);
    expect(result.errors).toEqual(
      expect.arrayContaining([
        "hidden_alias_consumer:src/hidden-alias.ts:executeTeamRunPlan",
        "hidden_dynamic_import:src/hidden-dynamic.ts:../team/run",
        "hidden_split_command:src/hidden-command.ts:team run",
        "hidden_alias_consumer:src/hidden-multiline.ts:executeTeamRunPlan",
        "hidden_dynamic_import:src/hidden-multiline.ts:../team/run",
        "hidden_split_command:src/hidden-multiline.ts:team run",
        "unregistered_direct_call:src/hidden-direct.ts:executeTeamRunPlan(",
        "unregistered_direct_call:src/hidden-loop-consumers.ts:tick(",
        "unregistered_direct_call:src/hidden-loop-consumers.ts:importLegacy(",
        "unregistered_direct_call:src/hidden-loop-consumers.ts:plan.max_parallel",
        "hidden_dynamic_import:src/hidden-loop-consumers.ts:../team/run",
      ]),
    );
  });

  it("U-LORET-SEM-005/007: E2E/rollback/read-afterなしのremoved昇格を拒否し、historical/read-onlyのwrite混入も拒否する", () => {
    const loaded = loadLegacyOrchestrationSemanticConsumerLedger(process.cwd());
    const mutated = cloneLedger(loaded.ledger);
    const compatibility = entryByCapability(mutated, "LEGACY-SEM-LOOP-LEGACY-IMPORT-001");
    compatibility.consumer_role = "write_control";
    const team = entryByCapability(mutated, "LEGACY-SEM-TEAM-CLI-DIRECT-001");
    team.migration_state = "retired";
    team.successor_symbol = "futureAssignmentScheduler";
    team.removal_preconditions = ["successor_production_callsite"];

    const result = analyzeLegacyOrchestrationSemanticConsumers(mutated, loaded.sourceFiles);

    expect(result.ok).toBe(false);
    expect(result.errors).toContain(
      "consumer_role_mismatch:LEGACY-SEM-LOOP-LEGACY-IMPORT-001:compatibility_adapter",
    );
    expect(result.errors).toContain(
      "retirement_preconditions_incomplete:LEGACY-SEM-TEAM-CLI-DIRECT-001",
    );
  });

  it("U-LORET-SEM-011: test fixture/historical evidenceをproduction write/control consumerとして登録できない", () => {
    const loaded = loadLegacyOrchestrationSemanticConsumerLedger(process.cwd());
    const mutated = cloneLedger(loaded.ledger);
    mutated.entries.push({
      capability_id: "LEGACY-SEM-FAKE-HISTORICAL-001",
      symbol_or_command: "fireSlot",
      path: "tests/legacy-fixture.ts",
      line_anchor: "fireSlot(",
      consumer_role: "write_control",
      current_authority: "historical_evidence",
      target_authority: "assignment_lease_resident_lane",
      successor_symbol: null,
      migration_state: "frozen",
      removal_preconditions: ["production_consumer_zero"],
      negative_oracle_ids: ["U-LORET-SEM-011"],
    });

    const result = analyzeLegacyOrchestrationSemanticConsumers(mutated, loaded.sourceFiles);

    expect(result.ok).toBe(false);
    expect(result.errors).toContain(
      "non_production_path_for_control_consumer:LEGACY-SEM-FAKE-HISTORICAL-001",
    );
  });

  it("U-LORET-SEM-012: 追加entry、架空source HEAD、未知negative oracleを拒否する", () => {
    const loaded = loadLegacyOrchestrationSemanticConsumerLedger(process.cwd());
    const extra = cloneLedger(loaded.ledger);
    extra.entries.push({
      ...structuredClone(extra.entries[0]),
      capability_id: "LEGACY-SEM-UNREGISTERED-001",
    });
    expect(analyzeLegacyOrchestrationSemanticConsumers(extra, loaded.sourceFiles).errors).toContain(
      "unregistered_capability:LEGACY-SEM-UNREGISTERED-001",
    );

    const staleHead = cloneLedger(loaded.ledger);
    staleHead.source_head = "f".repeat(40);
    expect(
      analyzeLegacyOrchestrationSemanticConsumers(staleHead, loaded.sourceFiles).errors,
    ).toContain("ledger_source_head_unrecognized");

    const unknownOracle = cloneLedger(loaded.ledger);
    unknownOracle.entries[0].negative_oracle_ids.push("U-LORET-SEM-999");
    expect(
      analyzeLegacyOrchestrationSemanticConsumers(unknownOracle, loaded.sourceFiles).errors,
    ).toContain("negative_oracle_set_mismatch:LEGACY-SEM-TEAM-CLI-DIRECT-001");
  });
});

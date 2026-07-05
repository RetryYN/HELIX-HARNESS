import type { HarnessDb } from "./index";

export interface VisualizationSnapshot {
  schema_version: "visualization-snapshot.v1";
  source_clock: string | null;
  progress: {
    artifacts: {
      total: number;
      red: number;
      yellow: number;
      green: number;
      unknown: number;
    };
    plans: {
      total: number;
      by_status: Record<string, number>;
    };
    gates: {
      total: number;
      passed: number;
      failed: number;
      blocked: number;
      other: number;
      by_status: Record<string, number>;
    };
  };
  graph: {
    nodes: number;
    edges: number;
    snapshots: number;
    latest_snapshot_id: string | null;
    latest_snapshot_hash: string | null;
    latest_node_count: number | null;
    latest_edge_count: number | null;
  };
  evidence: {
    test_runs: {
      total: number;
      passed: number;
      failed: number;
      other: number;
    };
    runtime_verification: {
      total: number;
      runtime_verified: number;
      projection_only_unverified: number;
      missing_runtime_provenance: number;
      accepted: number;
      blocked: number;
      other: number;
    };
    skill_invocations: {
      total: number;
      accepted: number;
    };
    model_runs: {
      total: number;
    };
    guardrail_decisions: {
      total: number;
      block: number;
      allow: number;
      human_required: number;
    };
  };
  drilldowns: {
    artifact_progress_command: "helix progress artifacts --json";
    relation_graph_command: "helix graph export --format mermaid";
    runtime_verification_table: "runtime_verification_events";
    search_command: "helix find <query> --json";
  };
  warnings: string[];
}

function scalarNumber(db: HarnessDb, sql: string, params: unknown[] = []): number {
  const row = db.prepare(sql).get(...params) as Record<string, unknown> | undefined;
  return Number(row?.value ?? 0);
}

function scalarText(db: HarnessDb, sql: string, params: unknown[] = []): string | null {
  const row = db.prepare(sql).get(...params) as Record<string, unknown> | undefined;
  const value = row?.value;
  return typeof value === "string" && value.length > 0 ? value : null;
}

function groupedCounts(db: HarnessDb, sql: string): Record<string, number> {
  const rows = db.prepare(sql).all() as Array<{ key?: unknown; value?: unknown }>;
  const counts: Record<string, number> = {};
  for (const row of rows) {
    const key = typeof row.key === "string" && row.key.length > 0 ? row.key : "unknown";
    counts[key] = Number(row.value ?? 0);
  }
  return Object.fromEntries(Object.entries(counts).sort(([a], [b]) => a.localeCompare(b)));
}

interface CountWhereInput {
  table: string;
  where: string;
  params?: unknown[];
}

function countWhere(db: HarnessDb, input: CountWhereInput): number {
  return scalarNumber(
    db,
    `SELECT COUNT(*) AS value FROM ${input.table} WHERE ${input.where}`,
    input.params ?? [],
  );
}

function buildSourceClock(db: HarnessDb): string | null {
  return scalarText(
    db,
    `SELECT MAX(value) AS value
     FROM (
       SELECT MAX(updated_at) AS value FROM plan_registry
       UNION ALL SELECT MAX(indexed_at) FROM artifact_progress
       UNION ALL SELECT MAX(checked_at) FROM gate_runs
       UNION ALL SELECT MAX(indexed_at) FROM graph_nodes
       UNION ALL SELECT MAX(indexed_at) FROM dependency_edges
       UNION ALL SELECT MAX(created_at) FROM graph_snapshots
       UNION ALL SELECT MAX(completed_at) FROM test_runs
       UNION ALL SELECT MAX(occurred_at) FROM runtime_verification_events
       UNION ALL SELECT MAX(fired_at) FROM skill_invocations
       UNION ALL SELECT MAX(completed_at) FROM model_runs
       UNION ALL SELECT MAX(decided_at) FROM guardrail_decisions
     )
     WHERE value IS NOT NULL AND value <> ''`,
  );
}

function normalizedStatusBuckets(counts: Record<string, number>): {
  passed: number;
  failed: number;
  blocked: number;
  other: number;
} {
  let passed = 0;
  let failed = 0;
  let blocked = 0;
  let other = 0;
  for (const [status, count] of Object.entries(counts)) {
    const normalized = status.toLowerCase();
    if (["pass", "passed", "ok", "green"].includes(normalized)) passed += count;
    else if (["fail", "failed", "error", "red"].includes(normalized)) failed += count;
    else if (["block", "blocked", "human-required", "human_required"].includes(normalized)) {
      blocked += count;
    } else other += count;
  }
  return { passed, failed, blocked, other };
}

export function buildVisualizationSnapshot(db: HarnessDb): VisualizationSnapshot {
  const artifactTotal = scalarNumber(db, "SELECT COUNT(*) AS value FROM artifact_progress");
  const artifactRed = countWhere(db, {
    table: "artifact_progress",
    where: "color = ?",
    params: ["red"],
  });
  const artifactYellow = countWhere(db, {
    table: "artifact_progress",
    where: "color = ?",
    params: ["yellow"],
  });
  const artifactGreen = countWhere(db, {
    table: "artifact_progress",
    where: "color = ?",
    params: ["green"],
  });
  const planStatusCounts = groupedCounts(
    db,
    "SELECT COALESCE(NULLIF(status, ''), 'unknown') AS key, COUNT(*) AS value FROM plan_registry GROUP BY key",
  );
  const gateStatusCounts = groupedCounts(
    db,
    "SELECT COALESCE(NULLIF(status, ''), 'unknown') AS key, COUNT(*) AS value FROM gate_runs GROUP BY key",
  );
  const gateBuckets = normalizedStatusBuckets(gateStatusCounts);
  const gateTotal = Object.values(gateStatusCounts).reduce((sum, count) => sum + count, 0);
  const latestSnapshot = db
    .prepare(
      `SELECT graph_snapshot_id, hash, node_count, edge_count
       FROM graph_snapshots
       ORDER BY created_at DESC, graph_snapshot_id DESC
       LIMIT 1`,
    )
    .get() as
    | {
        graph_snapshot_id?: unknown;
        hash?: unknown;
        node_count?: unknown;
        edge_count?: unknown;
      }
    | undefined;
  const testTotal = scalarNumber(db, "SELECT COUNT(*) AS value FROM test_runs");
  const testPassed = countWhere(db, {
    table: "test_runs",
    where: "exit_code = 0 OR lower(status) IN ('pass', 'passed', 'ok', 'green')",
  });
  const testFailed = countWhere(db, {
    table: "test_runs",
    where:
      "(exit_code IS NOT NULL AND exit_code <> 0) OR lower(status) IN ('fail', 'failed', 'error', 'red')",
  });
  const runtimeTotal = scalarNumber(
    db,
    "SELECT COUNT(*) AS value FROM runtime_verification_events",
  );
  const runtimeAccepted = countWhere(db, {
    table: "runtime_verification_events",
    where: "verification_class = ? AND accept_status = ?",
    params: ["runtime_verified", "accepted"],
  });
  const runtimeBlocked = countWhere(db, {
    table: "runtime_verification_events",
    where: "accept_status = ?",
    params: ["blocked"],
  });
  const runtimeVerified = countWhere(db, {
    table: "runtime_verification_events",
    where: "verification_class = ?",
    params: ["runtime_verified"],
  });
  const runtimeProjectionOnly = countWhere(db, {
    table: "runtime_verification_events",
    where: "verification_class = ?",
    params: ["projection_only_unverified"],
  });
  const runtimeMissing = countWhere(db, {
    table: "runtime_verification_events",
    where: "verification_class = ?",
    params: ["missing_runtime_provenance"],
  });
  const guardTotal = scalarNumber(db, "SELECT COUNT(*) AS value FROM guardrail_decisions");
  const guardBlock = countWhere(db, {
    table: "guardrail_decisions",
    where: "decision = ?",
    params: ["block"],
  });
  const guardAllow = countWhere(db, {
    table: "guardrail_decisions",
    where: "decision = ?",
    params: ["allow"],
  });
  const guardHumanRequired = countWhere(db, {
    table: "guardrail_decisions",
    where: "human_signoff_required = 1 OR decision = ?",
    params: ["human-required"],
  });
  const warnings: string[] = [];
  if (artifactTotal === 0) warnings.push("artifact_progress is empty; run `helix db rebuild`");
  if (runtimeProjectionOnly > 0 || runtimeMissing > 0) {
    warnings.push(
      "runtime verification includes non-accepted projection-only or missing-provenance rows",
    );
  }

  return {
    schema_version: "visualization-snapshot.v1",
    source_clock: buildSourceClock(db),
    progress: {
      artifacts: {
        total: artifactTotal,
        red: artifactRed,
        yellow: artifactYellow,
        green: artifactGreen,
        unknown: artifactTotal - artifactRed - artifactYellow - artifactGreen,
      },
      plans: {
        total: Object.values(planStatusCounts).reduce((sum, count) => sum + count, 0),
        by_status: planStatusCounts,
      },
      gates: {
        total: gateTotal,
        passed: gateBuckets.passed,
        failed: gateBuckets.failed,
        blocked: gateBuckets.blocked,
        other: gateBuckets.other,
        by_status: gateStatusCounts,
      },
    },
    graph: {
      nodes: scalarNumber(db, "SELECT COUNT(*) AS value FROM graph_nodes"),
      edges: scalarNumber(db, "SELECT COUNT(*) AS value FROM dependency_edges"),
      snapshots: scalarNumber(db, "SELECT COUNT(*) AS value FROM graph_snapshots"),
      latest_snapshot_id:
        typeof latestSnapshot?.graph_snapshot_id === "string"
          ? latestSnapshot.graph_snapshot_id
          : null,
      latest_snapshot_hash: typeof latestSnapshot?.hash === "string" ? latestSnapshot.hash : null,
      latest_node_count:
        latestSnapshot?.node_count == null ? null : Number(latestSnapshot.node_count ?? 0),
      latest_edge_count:
        latestSnapshot?.edge_count == null ? null : Number(latestSnapshot.edge_count ?? 0),
    },
    evidence: {
      test_runs: {
        total: testTotal,
        passed: testPassed,
        failed: testFailed,
        other: testTotal - testPassed - testFailed,
      },
      runtime_verification: {
        total: runtimeTotal,
        runtime_verified: runtimeVerified,
        projection_only_unverified: runtimeProjectionOnly,
        missing_runtime_provenance: runtimeMissing,
        accepted: runtimeAccepted,
        blocked: runtimeBlocked,
        other: runtimeTotal - runtimeAccepted - runtimeBlocked,
      },
      skill_invocations: {
        total: scalarNumber(db, "SELECT COUNT(*) AS value FROM skill_invocations"),
        accepted: countWhere(db, { table: "skill_invocations", where: "accepted = 1" }),
      },
      model_runs: {
        total: scalarNumber(db, "SELECT COUNT(*) AS value FROM model_runs"),
      },
      guardrail_decisions: {
        total: guardTotal,
        block: guardBlock,
        allow: guardAllow,
        human_required: guardHumanRequired,
      },
    },
    drilldowns: {
      artifact_progress_command: "helix progress artifacts --json",
      relation_graph_command: "helix graph export --format mermaid",
      runtime_verification_table: "runtime_verification_events",
      search_command: "helix find <query> --json",
    },
    warnings,
  };
}

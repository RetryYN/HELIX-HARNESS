export type Sha256Digest = `sha256:${string}`;
export type EvidenceUnavailable = { status: "unavailable"; error_digest: Sha256Digest };
export type MainEvidence =
  | EvidenceUnavailable
  | { status: "available"; ref: string; head: string; history_complete: boolean };
export type OpenPrEvidence =
  | EvidenceUnavailable
  | { status: "available"; branches: Array<{ branch: string; head: string }> };
export type ActiveWriterEvidence =
  | EvidenceUnavailable
  | {
      status: "available";
      branches: Array<{
        branch: string;
        head: string;
        assignment_id: string;
        lease_id: string;
        fence_token: string;
      }>;
    };

export type WorktreeEvidence = {
  path: string;
  head: string;
  branch: string | null;
  cleanliness: "clean" | "dirty" | "unknown";
  main_reachable: boolean | null;
  prunable: boolean;
};

export type WorktreeDisposition = "reclaim_candidate" | "protected" | "unknown_fail_closed";
export type WorktreeHygieneReason =
  | "clean_main_reachable_unowned"
  | "dirty"
  | "not_main_reachable"
  | "open_pr"
  | "active_writer"
  | "prunable_metadata"
  | "detached"
  | "main_evidence_unavailable"
  | "open_pr_evidence_unavailable"
  | "active_writer_evidence_unavailable"
  | "shallow_history"
  | "cleanliness_unknown"
  | "reachability_unknown";

export type RepositoryHygieneInput = {
  main: MainEvidence;
  open_pr_heads: OpenPrEvidence;
  active_writer_branches: ActiveWriterEvidence;
  worktrees: WorktreeEvidence[];
};

export type WorktreeHygieneRow = WorktreeEvidence & {
  disposition: WorktreeDisposition;
  reasons: WorktreeHygieneReason[];
};

export type RepositoryHygieneResult = {
  ok: boolean;
  evidence: {
    main: MainEvidence["status"];
    open_pr_heads: OpenPrEvidence["status"];
    active_writer_branches: ActiveWriterEvidence["status"];
  };
  counts: Record<WorktreeDisposition, number>;
  worktrees: WorktreeHygieneRow[];
};

/**
 * 物理worktreeをPR／writer authorityと結合してread-only分類する。
 * 削除は行わず、証拠不足を回収可能と推測しない。
 */
export function analyzeRepositoryHygiene(input: RepositoryHygieneInput): RepositoryHygieneResult {
  const openPrBranches = new Set(
    input.open_pr_heads.status === "available"
      ? input.open_pr_heads.branches.map((entry) => entry.branch)
      : [],
  );
  const activeWriterBranches = new Set(
    input.active_writer_branches.status === "available"
      ? input.active_writer_branches.branches.map((entry) => entry.branch)
      : [],
  );

  const worktrees = input.worktrees.map((worktree): WorktreeHygieneRow => {
    const unknownReasons: WorktreeHygieneReason[] = [];
    const protectedReasons: WorktreeHygieneReason[] = [];
    if (input.main.status === "unavailable") unknownReasons.push("main_evidence_unavailable");
    if (input.main.status === "available" && !input.main.history_complete) {
      unknownReasons.push("shallow_history");
    }
    if (input.open_pr_heads.status === "unavailable") {
      unknownReasons.push("open_pr_evidence_unavailable");
    }
    if (input.active_writer_branches.status === "unavailable") {
      unknownReasons.push("active_writer_evidence_unavailable");
    }
    if (worktree.branch === null) unknownReasons.push("detached");
    if (worktree.cleanliness === "unknown") unknownReasons.push("cleanliness_unknown");
    if (worktree.main_reachable === null) unknownReasons.push("reachability_unknown");

    if (worktree.cleanliness === "dirty") protectedReasons.push("dirty");
    if (worktree.main_reachable === false) protectedReasons.push("not_main_reachable");
    if (worktree.branch !== null && openPrBranches.has(worktree.branch)) {
      protectedReasons.push("open_pr");
    }
    if (worktree.branch !== null && activeWriterBranches.has(worktree.branch)) {
      protectedReasons.push("active_writer");
    }
    if (worktree.prunable) protectedReasons.push("prunable_metadata");

    if (unknownReasons.length > 0) {
      return { ...worktree, disposition: "unknown_fail_closed", reasons: unknownReasons };
    }
    if (protectedReasons.length > 0) {
      return { ...worktree, disposition: "protected", reasons: protectedReasons };
    }
    return {
      ...worktree,
      disposition: "reclaim_candidate",
      reasons: ["clean_main_reachable_unowned"],
    };
  });

  const counts: Record<WorktreeDisposition, number> = {
    reclaim_candidate: 0,
    protected: 0,
    unknown_fail_closed: 0,
  };
  for (const worktree of worktrees) counts[worktree.disposition] += 1;

  return {
    ok: counts.unknown_fail_closed === 0,
    evidence: {
      main: input.main.status,
      open_pr_heads: input.open_pr_heads.status,
      active_writer_branches: input.active_writer_branches.status,
    },
    counts,
    worktrees: worktrees.sort((left, right) => left.path.localeCompare(right.path)),
  };
}

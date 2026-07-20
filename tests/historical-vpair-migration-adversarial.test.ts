import { execFileSync, spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const tsxCli = join(process.cwd(), "node_modules", "tsx", "dist", "cli.mjs");

import {
  classifyHistoricalVpairMigration,
  parseHistoricalVpairAuthority,
} from "../src/policy/historical-vpair-migration-authority";
import { openHarnessDb } from "../src/state-db";
import {
  appendHistoricalAuthorityArtifact,
  auditHistoricalTempArtifacts,
  canonicalRepositoryIdentity,
  loadHistoricalAuthority,
  loadHistoricalCandidate,
  loadHistoricalReviewChainTip,
  verifyHistoricalTerminationEvent,
  verifyPinnedCutoff,
} from "../src/state-db/historical-vpair-migration-authority";
import { migrate } from "../src/state-db/migration";

const digest = (value: string) =>
  `sha256:${createHash("sha256").update(value).digest("hex")}` as const;
const stableValue = (v: unknown): string =>
  Array.isArray(v)
    ? `[${v.map(stableValue).join(",")}]`
    : v && typeof v === "object"
      ? `{${Object.entries(v as Record<string, unknown>)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([k, x]) => `${JSON.stringify(k)}:${stableValue(x)}`)
          .join(",")}}`
      : JSON.stringify(v);
const appendHistoricalChainArtifact = (input: {
  repoRoot: string;
  artifactKind: "authority";
  repositoryHead: string;
  repositoryIdentity: string;
  bundleDigest: `sha256:${string}`;
  payload: unknown;
  expectedPreviousDigest: `sha256:${string}` | null;
}) =>
  appendHistoricalAuthorityArtifact({
    repoRoot: input.repoRoot,
    repositoryHead: input.repositoryHead,
    repositoryIdentity: input.repositoryIdentity,
    bundleDigest: input.bundleDigest,
    expectedPreviousDigest: input.expectedPreviousDigest,
    payload: { manifest_generation: 1, authority_digest: digest(JSON.stringify(input.payload)) },
  });
function fixture() {
  const root = mkdtempSync(join(tmpdir(), "helix-historical-"));
  const git = (...args: string[]) =>
    execFileSync("git", args, {
      cwd: root,
      encoding: "utf8",
      env: {
        ...process.env,
        GIT_AUTHOR_NAME: "test",
        GIT_AUTHOR_EMAIL: "test@example.invalid",
        GIT_COMMITTER_NAME: "test",
        GIT_COMMITTER_EMAIL: "test@example.invalid",
      },
    }).trim();
  git("init", "-q");
  const path = "docs/plans/PLAN-L7-1-x.md";
  mkdirSync(join(root, "docs/plans"), { recursive: true });
  const source = (created: string) =>
    `---\nplan_id: PLAN-L7-1-x\nkind: impl\nstatus: active\nparent_design: docs/design/x.md\npair_artifact: docs/test-design/x.md\ncreated: ${created}\n---\n# x\n`;
  writeFileSync(join(root, path), source("2099-12-31"));
  git("add", path);
  git("commit", "-qm", "cutoff");
  const cutoff = git("rev-parse", "HEAD");
  writeFileSync(join(root, path), `${source("1999-01-01")}post\n`);
  git("add", path);
  git("commit", "-qm", "post");
  return { root, git, path, cutoff };
}

describe("historical migration adversarial boundaries", () => {
  it("cutoff presence wins over author/committer/created backdating", () => {
    const f = fixture();
    const candidate = loadHistoricalCandidate({
      repoRoot: f.root,
      decision: {
        plan_id: "PLAN-L7-1-x",
        classification: "needs_design",
        reason: "PLAN verification binding absent",
      },
      planPath: f.path,
      cutoffCommit: f.cutoff,
      assisted: false,
    });
    expect(candidate.cutoff_present).toBe(true);
    expect(candidate.current_raw_digest).not.toBe(candidate.cutoff_raw_digest);
    expect(candidate.cutoff_plan_id).toBe("PLAN-L7-1-x");
  });

  it("U-HVMA-011: [PLAN-L7-437-historical-vpair-migration-authority/U-HVMA-011] NEW post-cutoff PLAN remains post primary despite all three dates backdated", () => {
    const f = fixture();
    const path = "docs/plans/PLAN-L7-NEW-backdated.md";
    writeFileSync(
      join(f.root, path),
      `---\nplan_id: PLAN-L7-NEW-backdated\nkind: impl\nstatus: active\nparent_design: docs/design/x.md\npair_artifact: docs/test-design/x.md\ncreated: 2026-07-07\n---\n# new\n`,
    );
    f.git("add", path);
    execFileSync("git", ["commit", "-qm", "backdated new path"], {
      cwd: f.root,
      env: {
        ...process.env,
        GIT_AUTHOR_NAME: "test",
        GIT_AUTHOR_EMAIL: "test@example.invalid",
        GIT_COMMITTER_NAME: "test",
        GIT_COMMITTER_EMAIL: "test@example.invalid",
        GIT_AUTHOR_DATE: "2026-07-07T00:00:00Z",
        GIT_COMMITTER_DATE: "2026-07-07T00:00:00Z",
      },
    });
    const candidate = loadHistoricalCandidate({
      repoRoot: f.root,
      decision: {
        plan_id: "PLAN-L7-NEW-backdated",
        classification: "needs_design",
        reason: "PLAN verification binding absent",
      },
      planPath: path,
      cutoffCommit: f.cutoff,
      assisted: false,
    });
    const authority = parseHistoricalVpairAuthority(
      JSON.parse(readFileSync("config/historical-vpair-migration-authority.json", "utf8")),
    );
    expect(
      classifyHistoricalVpairMigration({ authority, candidates: [candidate] }).decisions[0]
        ?.primary,
    ).toBe("post_enforcement_violation");
  });

  it("cutoff commit with target path on orphan branch is rejected as non-ancestor", () => {
    const f = fixture();
    const tree = f.git("rev-parse", `${f.cutoff}^{tree}`);
    const orphan = f.git("commit-tree", tree, "-m", "orphan-with-path");
    const a = {
      ...parseHistoricalVpairAuthority(
        JSON.parse(readFileSync("config/historical-vpair-migration-authority.json", "utf8")),
      ),
      cutoff_commit_sha: orphan,
      cutoff_tree_oid: tree,
    };
    expect(() => verifyPinnedCutoff(f.root, a)).toThrow();
  });

  it("unrelated/orphan cutoff fails closed as absent", () => {
    const f = fixture();
    const orphan = f.git("commit-tree", f.git("write-tree"), "-m", "orphan");
    const candidate = loadHistoricalCandidate({
      repoRoot: f.root,
      decision: {
        plan_id: "PLAN-L7-1-x",
        classification: "needs_design",
        reason: "PLAN verification binding absent",
      },
      planPath: "docs/plans/missing.md",
      cutoffCommit: orphan,
      assisted: false,
    });
    expect(candidate.cutoff_present).toBe(false);
  });

  it("repository URL forms normalize to one identity", () => {
    expect(canonicalRepositoryIdentity("git@github.com:RetryYN/HELIX-HARNESS.git")).toBe(
      canonicalRepositoryIdentity("https://github.com/RetryYN/HELIX-HARNESS/"),
    );
    expect(canonicalRepositoryIdentity("file:///tmp/repo")).toBe("file:///tmp/repo");
  });

  it("tracked authority manifest binds HEAD regular blob and rejects committed drift", () => {
    const f = fixture();
    f.git("remote", "add", "origin", "https://github.com/RetryYN/HELIX-HARNESS.git");
    const configDir = join(f.root, "config");
    mkdirSync(configDir, { recursive: true });
    const body: Record<string, unknown> = {
      schema_version: "historical-vpair-migration-authority.v1",
      repository_identity: "git@github.com:RetryYN/HELIX-HARNESS.git",
      cutoff_commit_sha: f.cutoff,
      cutoff_tree_oid: f.git("show", "-s", "--format=%T", f.cutoff),
      initial_census_digest: digest("[]"),
      previous_digest: null,
      rows: [],
    };
    const stable = (v: unknown): string =>
      Array.isArray(v)
        ? `[${v.map(stable).join(",")}]`
        : v && typeof v === "object"
          ? `{${Object.entries(v as Record<string, unknown>)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([k, x]) => `${JSON.stringify(k)}:${stable(x)}`)
              .join(",")}}`
          : JSON.stringify(v);
    body.authority_digest = digest(stable(body));
    const authorityBytes = `${JSON.stringify(body)}\n`;
    writeFileSync(join(configDir, "historical-vpair-migration-authority.json"), authorityBytes);
    const blob = f.git("hash-object", "config/historical-vpair-migration-authority.json");
    const manifest: Record<string, unknown> = {
      schema_version: "historical-vpair-migration-authority-manifest.v1",
      authority_path: "config/historical-vpair-migration-authority.json",
      repository_identity: "git@github.com:RetryYN/HELIX-HARNESS.git",
      expected_tree_mode: "100644",
      expected_blob_oid: blob,
      expected_raw_digest: digest(authorityBytes),
      generation: 1,
      previous_manifest_digest: null,
      review_digest: null,
    };
    manifest.manifest_digest = digest(stable(manifest));
    writeFileSync(
      join(configDir, "historical-vpair-migration-authority.manifest.json"),
      `${JSON.stringify(manifest)}\n`,
    );
    f.git("add", "config");
    f.git("commit", "-qm", "authority");
    const head = f.git("rev-parse", "HEAD");
    expect(() => loadHistoricalAuthority(f.root, head)).toThrow(/genesis pin drift/);
    writeFileSync(
      join(configDir, "historical-vpair-migration-authority.json"),
      `${authorityBytes} `,
    );
    expect(() => loadHistoricalAuthority(f.root, head)).toThrow(/genesis pin drift/);
    f.git("add", "config/historical-vpair-migration-authority.json");
    f.git("commit", "-qm", "drift");
    expect(() => loadHistoricalAuthority(f.root, f.git("rev-parse", "HEAD"))).toThrow(
      /genesis pin drift|provenance envelope drift/,
    );
  });

  it("append-only chain enforces CAS/continuity and preserves create-new bytes", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-chain-"));
    const first = appendHistoricalChainArtifact({
      repoRoot: root,
      artifactKind: "authority",
      repositoryHead: "a".repeat(40),
      repositoryIdentity: "https://github.com/RetryYN/HELIX-HARNESS",
      bundleDigest: digest("bundle"),
      payload: { n: 1 },
      expectedPreviousDigest: null,
    });
    const before = readFileSync(
      join(root, ".helix/evidence/historical-vpair-migration/authority/00000001.json"),
    );
    expect(() =>
      appendHistoricalChainArtifact({
        repoRoot: root,
        artifactKind: "authority",
        repositoryHead: "a".repeat(40),
        repositoryIdentity: "https://github.com/RetryYN/HELIX-HARNESS",
        bundleDigest: digest("bundle"),
        payload: { n: 2 },
        expectedPreviousDigest: digest("wrong"),
      }),
    ).toThrow(/CAS/);
    expect(
      readFileSync(
        join(root, ".helix/evidence/historical-vpair-migration/authority/00000001.json"),
      ),
    ).toEqual(before);
    const second = appendHistoricalChainArtifact({
      repoRoot: root,
      artifactKind: "authority",
      repositoryHead: "a".repeat(40),
      repositoryIdentity: "https://github.com/RetryYN/HELIX-HARNESS",
      bundleDigest: digest("bundle"),
      payload: { n: 2 },
      expectedPreviousDigest: first.artifact_digest,
    });
    expect(second.sequence).toBe(2);
  });

  it("two real writer processes permit exactly one CAS winner", async () => {
    const root = mkdtempSync(join(tmpdir(), "helix-chain-race-"));
    const modulePath = join(
      import.meta.dirname,
      "../src/state-db/historical-vpair-migration-authority.ts",
    );
    const run = (n: number) =>
      new Promise<number>((resolve) => {
        const code = `import {appendHistoricalAuthorityArtifact} from ${JSON.stringify(modulePath)};appendHistoricalAuthorityArtifact({repoRoot:${JSON.stringify(root)},repositoryHead:"${"a".repeat(40)}",repositoryIdentity:"https://github.com/RetryYN/HELIX-HARNESS",bundleDigest:"${digest("bundle")}",payload:{manifest_generation:1,authority_digest:"${digest(String(n))}"},expectedPreviousDigest:null})`;
        const child = spawn("node", [tsxCli, "-e", code], { stdio: "ignore" });
        child.on("exit", (status) => resolve(status ?? 1));
      });
    const statuses = await Promise.all([run(1), run(2)]);
    expect(statuses.filter((status) => status === 0)).toHaveLength(1);
    expect(
      readFileSync(
        join(root, ".helix/evidence/historical-vpair-migration/authority/00000001.json"),
        "utf8",
      ),
    ).toMatch(/artifact_digest/);
  });

  it("full-prefix validation rejects gap/fork and never deletes foreign crash temp", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-chain-prefix-"));
    const common = {
      repoRoot: root,
      artifactKind: "authority" as const,
      repositoryHead: "a".repeat(40),
      repositoryIdentity: "https://github.com/RetryYN/HELIX-HARNESS",
      bundleDigest: digest("bundle"),
    };
    const first = appendHistoricalChainArtifact({
      ...common,
      payload: { n: 1 },
      expectedPreviousDigest: null,
    });
    const dir = join(root, ".helix/evidence/historical-vpair-migration/authority");
    writeFileSync(join(dir, "crash.tmp"), "partial");
    appendHistoricalChainArtifact({
      ...common,
      payload: { n: 2 },
      expectedPreviousDigest: first.artifact_digest,
    });
    expect(readFileSync(join(dir, "crash.tmp"), "utf8")).toBe("partial");
    writeFileSync(join(dir, "00000004.json"), readFileSync(join(dir, "00000002.json")));
    expect(() =>
      appendHistoricalChainArtifact({
        ...common,
        payload: { n: 3 },
        expectedPreviousDigest: first.artifact_digest,
      }),
    ).toThrow(/gap\/fork/);
  });

  it("termination event performs exact DB join", () => {
    const review = {
      review_kind: "intra_runtime_subagent",
      worker_identity: "reviewer",
      reviewer_identity: "reviewer-session",
      worker_task_id: "worker",
      reviewer_task_id: "reviewer",
      termination_event_id: "event",
      worker_termination_event_id: "event",
      reviewed_at: "2026-07-12T00:30:00.000Z",
      review_digest: digest("review"),
      bundle_digest: digest("review"),
    };
    const row = {
      event_id: "event",
      operation_id: "worker",
      session_id: "reviewer",
      event_kind: "subagent_completed",
      payload_hash: review.review_digest,
      recorded_at: "2026-07-12T00:00:00.000Z",
    };
    const db = openHarnessDb(":memory:");
    migrate(db);
    db.prepare(
      "INSERT INTO session_events (event_key,event_id,schema_version,operation_id,session_id,event_seq,plan_id,event_kind,next_action,memory_ref,recorded_at,payload_hash) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)",
    ).run(
      "key",
      row.event_id,
      "session-event.v1",
      row.operation_id,
      row.session_id,
      1,
      null,
      row.event_kind,
      null,
      null,
      row.recorded_at,
      row.payload_hash,
    );
    expect(() => verifyHistoricalTerminationEvent({ db, review })).not.toThrow();
    expect(() =>
      verifyHistoricalTerminationEvent({
        db,
        review: { ...review, review_digest: digest("tamper") },
      }),
    ).toThrow(/exact join/);
    db.prepare(
      "INSERT INTO session_events (event_key,event_id,schema_version,operation_id,session_id,event_seq,plan_id,event_kind,next_action,memory_ref,recorded_at,payload_hash) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)",
    ).run(
      "reviewer-key",
      "reviewer-event",
      "session-event.v1",
      "reviewer",
      "reviewer-session",
      2,
      null,
      "subagent_completed",
      null,
      null,
      row.recorded_at,
      review.review_digest,
    );
    expect(() =>
      verifyHistoricalTerminationEvent({
        db,
        review: { ...review, review_kind: "cross_agent", termination_event_id: "reviewer-event" },
      }),
    ).not.toThrow();
    expect(() =>
      verifyHistoricalTerminationEvent({
        db,
        review: {
          ...review,
          review_kind: "cross_agent",
          termination_event_id: "reviewer-event",
          reviewer_identity: "worker-session",
        },
      }),
    ).toThrow(/exact join/);
  });

  it("temp audit never removes live owner and only cleans expired dead owner", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-temp-audit-"));
    const dir = join(root, ".helix/evidence/historical-vpair-migration/authority");
    mkdirSync(dir, { recursive: true });
    const live = join(dir, `00000001.json.${process.pid}.${"a".repeat(16)}.tmp`);
    const dead = join(dir, `00000001.json.99999999.${"b".repeat(16)}.tmp`);
    writeFileSync(live, "live");
    writeFileSync(dead, "dead");
    const result = auditHistoricalTempArtifacts({
      repoRoot: root,
      nowMs: Date.now() + 7_200_000,
      ttlMs: 1,
      cleanup: true,
    });
    expect(result.findings.find((row) => row.path === live)?.removed).toBe(false);
    expect(result.findings.find((row) => row.path === dead)?.removed).toBe(true);
  });

  it("classification leaves registry/DB/status bytes unchanged", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-no-mutation-"));
    const paths = ["registry.json", "harness.db", "status.json"];
    for (const path of paths) writeFileSync(join(root, path), `before:${path}`);
    const before = paths.map((path) => readFileSync(join(root, path)));
    const authority = parseHistoricalVpairAuthority(
      JSON.parse(readFileSync("config/historical-vpair-migration-authority.json", "utf8")),
    );
    classifyHistoricalVpairMigration({ authority, candidates: [] });
    expect(paths.map((path) => readFileSync(join(root, path)))).toEqual(before);
  });

  it("two-stage review chain rejects fully resealed intermediate semantic attacks", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-review-prefix-"));
    const bundle = classifyHistoricalVpairMigration({
      authority: parseHistoricalVpairAuthority(
        JSON.parse(readFileSync("config/historical-vpair-migration-authority.json", "utf8")),
      ),
      candidates: [],
    });
    const authorityDir = join(root, ".helix/evidence/historical-vpair-migration/authority");
    const reviewDir = join(root, ".helix/evidence/historical-vpair-migration/review");
    mkdirSync(authorityDir, { recursive: true });
    mkdirSync(reviewDir, { recursive: true });
    const artifact = (
      kind: "authority" | "review",
      sequence: number,
      previous: `sha256:${string}` | null,
      payload: unknown,
      bundleDigest = bundle.bundle_digest,
    ) => {
      const body = {
        schema_version: "historical-vpair-migration-chain.v1" as const,
        artifact_kind: kind,
        sequence,
        previous_artifact_digest: previous,
        repository_head: "a".repeat(40),
        repository_identity: "file:///fixture",
        bundle_digest: bundleDigest,
        payload,
      };
      return { ...body, artifact_digest: digest(stableValue(body)) };
    };
    const a1 = artifact("authority", 1, null, {
      manifest_generation: 1,
      authority_digest: digest("a1"),
    });
    const a2 = artifact("authority", 2, a1.artifact_digest, {
      manifest_generation: 2,
      authority_digest: digest("a2"),
    });
    writeFileSync(join(authorityDir, "00000001.json"), JSON.stringify(a1));
    writeFileSync(join(authorityDir, "00000002.json"), JSON.stringify(a2));
    const reviewPayload = (
      generation: number,
      authorityDigest: string,
      previous: string | null,
    ) => {
      const body: Record<string, unknown> = {
        schema_version: "historical-vpair-migration-review.v1",
        worker_identity: `worker-${generation}`,
        reviewer_identity: `reviewer-${generation}`,
        review_kind: "cross_agent",
        worker_task_id: `worker-task-${generation}`,
        reviewer_task_id: `reviewer-task-${generation}`,
        termination_event_id: `reviewer-event-${generation}`,
        worker_termination_event_id: `worker-event-${generation}`,
        termination_status: "completed",
        bundle_digest: bundle.bundle_digest,
        authority_artifact_digest: authorityDigest,
        authority_generation: generation,
        previous_digest: previous,
        reviewed_at: "2026-07-12T00:00:00.000Z",
        expires_at: "2026-07-12T01:00:00.000Z",
        verdicts: [],
      };
      return { ...body, review_digest: digest(stableValue(body)) };
    };
    const r1 = artifact("review", 1, null, reviewPayload(1, a1.artifact_digest, null));
    const r2 = artifact(
      "review",
      2,
      r1.artifact_digest,
      reviewPayload(2, a2.artifact_digest, r1.artifact_digest),
    );
    const writeChain = (first: typeof r1, second: typeof r2) => {
      writeFileSync(join(reviewDir, "00000001.json"), JSON.stringify(first));
      writeFileSync(join(reviewDir, "00000002.json"), JSON.stringify(second));
    };
    writeChain(r1, r2);
    expect(() =>
      loadHistoricalReviewChainTip({
        repoRoot: root,
        bundle,
        review: r2.payload as never,
        authorityTip: a2,
      }),
    ).not.toThrow();
    for (const mutate of [
      (p: Record<string, unknown>) => {
        p.bundle_digest = digest("other-bundle");
      },
      (p: Record<string, unknown>) => {
        p.authority_generation = 2;
      },
      (p: Record<string, unknown>) => {
        p.previous_digest = digest("wrong-previous");
      },
    ]) {
      const p1 = structuredClone(r1.payload) as Record<string, unknown>;
      mutate(p1);
      delete p1.review_digest;
      p1.review_digest = digest(stableValue(p1));
      const attacked1 = artifact("review", 1, null, p1);
      const p2 = structuredClone(r2.payload) as Record<string, unknown>;
      p2.previous_digest = attacked1.artifact_digest;
      delete p2.review_digest;
      p2.review_digest = digest(stableValue(p2));
      const attacked2 = artifact("review", 2, attacked1.artifact_digest, p2);
      writeChain(attacked1, attacked2);
      expect(() =>
        loadHistoricalReviewChainTip({
          repoRoot: root,
          bundle,
          review: attacked2.payload as never,
          authorityTip: a2,
        }),
      ).toThrow(/prefix/);
    }
  });
});

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import type {
  LiteConsumerDelegationInput,
  LiteConsumerNodeServiceResult,
  LiteConsumerNodeServices,
} from "./distribution-consumer-node-adapter";

const MANAGED_ARTIFACTS = [
  { source: "docs/templates/adapter/AGENTS.md", target: "AGENTS.md" },
  { source: "docs/templates/adapter/CLAUDE.md", target: "CLAUDE.md" },
  { source: "docs/templates/distribution-lite/.codex/hooks.json", target: ".codex/hooks.json" },
  {
    source: "docs/templates/distribution-lite/.claude/settings.json",
    target: ".claude/settings.json",
  },
  {
    source: "docs/templates/github/common/pack-harness-check.yml",
    target: ".github/workflows/helix-harness-check.yml",
  },
] as const;

const digest = (value: string): string =>
  `sha256:${createHash("sha256").update(value).digest("hex")}`;

function result(payload: unknown, exitCode = 0): LiteConsumerNodeServiceResult {
  return { payload, exit_code: exitCode };
}

function consumerHead(root: string): string | null {
  try {
    return execFileSync("git", ["rev-parse", "HEAD"], {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return null;
  }
}

function managedState(consumerRoot: string, packageRoot: string) {
  return MANAGED_ARTIFACTS.map(({ source, target }) => {
    const expected = readFileSync(join(packageRoot, source), "utf8");
    const targetPath = join(consumerRoot, target);
    const actual = existsSync(targetPath) ? readFileSync(targetPath, "utf8") : null;
    return {
      source,
      target,
      expected,
      actual,
      state: actual === null ? "missing" : actual === expected ? "current" : "consumer_owned",
    } as const;
  });
}

export function createLiteConsumerServices(input: {
  consumer_root: string;
  package_root: string;
}): LiteConsumerNodeServices {
  const setup = (dryRun: boolean): LiteConsumerNodeServiceResult => {
    const state = managedState(input.consumer_root, input.package_root);
    const conflicts = state
      .filter((item) => item.state === "consumer_owned")
      .map((item) => item.target);
    if (conflicts.length > 0) {
      return result(
        { ok: false, operation: "setup_project", dry_run: dryRun, conflicts, writes: [] },
        1,
      );
    }
    const writes = state.filter((item) => item.state === "missing").map((item) => item.target);
    if (!dryRun) {
      for (const item of state.filter((candidate) => candidate.state === "missing")) {
        const target = join(input.consumer_root, item.target);
        mkdirSync(dirname(target), { recursive: true });
        writeFileSync(target, item.expected, "utf8");
      }
    }
    return result({ ok: true, operation: "setup_project", dry_run: dryRun, writes, conflicts: [] });
  };

  const statusPayload = () => {
    const state = managedState(input.consumer_root, input.package_root);
    return {
      schema_version: "helix-lite-consumer-status.v1",
      ok: state.every((item) => item.state === "current"),
      consumer_head: consumerHead(input.consumer_root),
      managed: state.map(({ target, state: disposition }) => ({ target, disposition })),
    };
  };

  const completionPayload = (kind: "decision_packet" | "review_bundle") => {
    const status = statusPayload();
    const material = JSON.stringify({ kind, status });
    return {
      schema_version: `helix-lite-completion-${kind}.v1`,
      ok: status.ok,
      kind,
      status,
      evidence_digest: digest(material),
    };
  };

  return {
    setup_project: ({ dry_run }) => setup(dry_run),
    status: () => result(statusPayload(), statusPayload().ok ? 0 : 1),
    consumer_doctor: () => {
      const status = statusPayload();
      const version = process.versions.node.split(".").map(Number);
      const nodeOk =
        version[0] === 24 && (version[1] > 15 || (version[1] === 15 && version[2] >= 0));
      const payload = {
        schema_version: "helix-lite-consumer-doctor.v1",
        ok: nodeOk && status.ok,
        checks: { node_24_15: nodeOk, managed_artifacts: status.ok },
      };
      return result(payload, payload.ok ? 0 : 1);
    },
    completion_decision_packet: () => {
      const payload = completionPayload("decision_packet");
      return result(payload, payload.ok ? 0 : 1);
    },
    completion_review_bundle: () => {
      const payload = completionPayload("review_bundle");
      return result(payload, payload.ok ? 0 : 1);
    },
    lifecycle_rehearsal: ({ operation }) =>
      result({
        schema_version: "helix-lite-lifecycle-rehearsal.v1",
        ok: true,
        operation,
        apply: false,
        preserves: ["consumer_owned_files", "completion_evidence"],
        next_action:
          operation === "upgrade"
            ? "install_verified_target_artifact"
            : operation === "rollback"
              ? "restore_previous_verified_artifact_pin"
              : "remove_package_and_managed_files_after_backup",
      }),
    minimal_delegated_workflow: (delegation: LiteConsumerDelegationInput) =>
      result({
        schema_version: "helix-lite-minimal-delegated-workflow.v1",
        ok: true,
        ...delegation,
        dry_run: true,
        prompt_digest: digest(
          JSON.stringify({
            provider: delegation.provider,
            role: delegation.role,
            task: delegation.task,
            plan_id: delegation.plan_id,
          }),
        ),
      }),
  };
}

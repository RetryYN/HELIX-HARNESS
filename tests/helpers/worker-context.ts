import { execFileSync } from "node:child_process";
import type { WorkerContextExecutionInput } from "../../src/runtime/adapter";
import { sha256Digest } from "../../src/runtime/digest";
import { attestWorkerContextAuthority } from "../../src/runtime/worker-context-packet";

export function testWorkerContext(repoRoot = process.cwd()): WorkerContextExecutionInput {
  const currentHead = execFileSync("git", ["rev-parse", "HEAD"], {
    cwd: repoRoot,
    encoding: "utf8",
  }).trim();
  const authority = attestWorkerContextAuthority({
    repo_root: repoRoot,
    current_head: currentHead,
    authority_paths: [
      "docs/governance/helix-harness-requirements_v1.3.md",
      "docs/governance/l12-canonical-vmodel-direction-directive_v0.1.md",
      "docs/design/helix/L3-requirements/worker-common-contract.md",
    ],
    rule_paths: ["AGENTS.md", "CLAUDE.md", ".claude/CLAUDE.md", "docs/skills/judgment-core.md"],
  });
  if (!("kind" in authority)) throw new Error(authority.failure_code);
  return {
    authority,
    boundary: {
      goal_id: "TEST-WORKER-CONTEXT",
      workflow_style: "v_model",
      case_model: "none",
      specialist_process: "none",
      behavior_contract_id: "TEST-WORKER-CONTEXT-001",
      responsibility_owner: "test-worker-context",
      allowed_paths: ["src", "tests"],
      forbidden_paths: ["docs/governance"],
      severity_policy_digest: sha256Digest("test-severity-policy"),
      required_output_schema: sha256Digest("test-output-schema"),
      budget: { time_ms: 60_000, token_limit: 4_096 },
    },
  };
}

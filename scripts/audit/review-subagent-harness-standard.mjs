import crypto from "node:crypto";
import fs from "node:fs";

const paths = {
  l1: "docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md",
  l3: "docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md",
  l4: "docs/design/helix/L4-basic-design/infinity-loop-platform-basic-design.md",
  hat: "docs/test-design/helix/L3-infinity-loop-acceptance-test-design.md",
  hst: "docs/test-design/helix/L10-infinity-loop-platform-system-test-design.md",
};
const text = Object.fromEntries(Object.entries(paths).map(([key, path]) => [key, fs.readFileSync(path, "utf8")]));
const sha256 = (value) => crypto.createHash("sha256").update(value).digest("hex");
const dimensions = [
  ["harness_ownership", [["l1", "HIL-FR-11"], ["l3", "HR-FR-HIL-08"], ["l4", "HARNESS registry"], ["hat", "HAT-HIL-08"], ["hst", "HST-HIL-006"]]],
  ["role_separation", [["l1", "HIL-NFR-02"], ["l3", "worker≠verifier"], ["l4", "HIL_AGENT_VERIFIER_NOT_INDEPENDENT"], ["hat", "self-verify"]]],
  ["bounded_spawn", [["l1", "最大spawn depth"], ["l3", "fan-out"], ["l4", "global active ceiling"], ["hat", "recursive spawn"]]],
  ["role_authority", [["l1", "role別read/write/tool/delegation authority"], ["l3", "role authority"], ["l4", "authority matrix"], ["hat", "越権tool"]]],
  ["lifecycle_and_fencing", [["l1", "timed_out"], ["l3", "fencing"], ["l4", "agent_instance_events"], ["hst", "durable checkpoint"]]],
  ["timeout_retry_dead_letter", [["l1", "retry max/backoff/exhaustion"], ["l3", "dead-letter"], ["l4", "dead_lettered"], ["hat", "retry exhaustion"]]],
  ["completion_compaction", [["l1", "no-promotion"], ["l3", "compaction receipt"], ["l4", "agent_compaction_receipts"], ["hst", "compaction→release"]]],
  ["evidence_custody", [["l1", "chain-of-custody receipt"], ["l3", "chain-of-custody receipt"], ["l4", "agent_evidence_custody_events"], ["hat", "custody切断"]]],
].map(([dimension, markers]) => {
  const checks = markers.map(([source, marker]) => ({ source, marker, present: text[source].includes(marker) }));
  return { dimension, checks, design_edge_complete: checks.every((check) => check.present), executed: false, verified: false, coverage_credit: false };
});
const artifact = {
  schema_version: "helix.subagent-harness-standard-readiness.v1",
  status: dimensions.every((item) => item.design_edge_complete) ? "design_edges_complete_not_executed" : "design_edge_incomplete",
  generated_at: "2026-07-16",
  authority: "candidate_design_review_only",
  inputs: Object.entries(paths).map(([key, path]) => ({ key, path, sha256: sha256(text[key]) })),
  trace: {
    l1: ["HIL-BR-09", "HIL-BR-18", "HIL-FR-10", "HIL-FR-11", "HIL-FR-12", "HIL-FR-13", "HIL-FR-32", "HIL-NFR-02", "HIL-NFR-10", "HIL-NFR-18"],
    l3: "HR-FR-HIL-08",
    acceptance_conditions: ["HAC-HIL-08a", "HAC-HIL-08b", "HAC-HIL-08c"],
    acceptance_test: "HAT-HIL-08",
    system_test: "HST-HIL-006",
  },
  dimensions,
  summary: {
    dimensions: dimensions.length,
    design_complete: dimensions.filter((item) => item.design_edge_complete).length,
    executed: 0,
    verified: 0,
    coverage_credit_true: 0,
  },
  freeze: false,
  invariants: ["all_8_design_dimensions_present", "execution_zero", "verification_zero", "coverage_zero", "freeze_false_until_runtime_receipts"],
};
if (!artifact.dimensions.every((item) => item.design_edge_complete)) process.exitCode = 1;
const serialized = `${JSON.stringify(artifact, null, 2)}\n`;
if (process.argv.includes("--write")) fs.writeFileSync("docs/governance/generated/subagent-harness-standard-readiness-v1.json", serialized);
process.stdout.write(serialized);

#!/usr/bin/env python3
"""Independent fail-closed validator for SCF-B-0141."""
from __future__ import annotations

import hashlib
import json
import subprocess
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
BUNDLE = ROOT / "scaffold/legacy-config-product-classification-0141"
LEDGER = BUNDLE / "classification-research.jsonl"
INVENTORY = BUNDLE / "inventory.json"
BINDING = ROOT / "scaffold/bindings/SCF-B-0141.json"
BASE_REVISION = "5562f04da0f3205f9aa58205ec0d478419fc4f2e"
BINDING_ID = "SCF-B-0141"
ARCHIVE_PREFIX = "archive/legacy-generation-2026-09-14/root/"
PHASE = "docs/governance/legacy-asset-phase-product-classification-bootstrap.jsonl"
DISPOSITION = "docs/governance/legacy-asset-disposition.jsonl"
DECISIONS = "docs/governance/legacy-asset-decisions.jsonl"
READ_AFTER = "docs/governance/legacy-asset-copy-read-after.jsonl"
MANIFEST = "archive/legacy-generation-2026-09-14/MANIFEST.sha256"
BOUNDARY = "docs/concept/product-boundary.md"
L1 = {"HELIX-HARNESS": "docs/helix-harness/L1-planning/product-intent.md", "HELIX-OS": "docs/helix-os/L1-planning/system-intent.md", "HELIX-Web": "docs/helix-web/L1-planning/product-intent.md", "HELIX-Web-OS": "docs/helix-web-os/L1-planning/system-intent.md"}
FAILURE = "docs/governance/audits/source-rebaseline/legacy-ci-ai-runtime-source-inventory.md"
CONSUMER = "docs/governance/audits/source-rebaseline/legacy-ci-consumer-relation-inventory.md"
DECISION_RECORD = "docs/governance/decisions/concept-v4.1-and-four-l1-approval-2026-09-17.md"
DECISION_PACKET = "docs/governance/audits/source-rebaseline/concept-v4.1-human-decision-packet.md"
REUSE = "docs/governance/legacy-asset-reuse-control.md"
START = "docs/governance/new-generation-start-here.md"
WAVE_PATHS = {n: (f"docs/governance/legacy-requirement-direct-semantic-review-wave{n}.jsonl" if n <= 36 else f"scaffold/legacy-semantic-review-wave{n}/legacy-requirement-direct-semantic-review-wave{n}.jsonl") for n in range(1, 51)}
PRODUCTS = tuple(L1)
MAIN_RESEARCH_INPUTS = ["scaffold/legacy-asset-product-classification-0107/inventory.json", "scaffold/legacy-lint-product-classification-0108/inventory.json", "scaffold/legacy-runtime-product-classification-0117/inventory.json", "scaffold/legacy-schema-product-classification-0120/inventory.json", "scaffold/legacy-source-product-classification-0123/inventory.json", "scaffold/legacy-state-db-product-classification-0127/inventory.json", "scaffold/legacy-lint-candidate-product-classification-0128/inventory.json", "scaffold/legacy-runtime-residual-product-classification-0133/inventory.json"]
BASE_INPUTS = [PHASE, DISPOSITION, DECISIONS, READ_AFTER, BOUNDARY, *L1.values(), FAILURE, CONSUMER, DECISION_RECORD, DECISION_PACKET, REUSE, START, MANIFEST, *WAVE_PATHS.values()]
NONARCHIVE_INPUTS = [p for p in BASE_INPUTS if not p.startswith("archive/")]
ALL_HEAD_INPUTS = NONARCHIVE_INPUTS + MAIN_RESEARCH_INPUTS

EXPECTED_NEGATIVE_CASES = (
    "target_omission",
    "target_duplicate",
    "target_extra",
    "source_sha_tamper",
    "source_blob_tamper",
    "source_anchor_tamper",
    "source_coverage_tamper",
    "phase_status_tamper",
    "manual_category_tamper",
    "bootstrap_all_product_rewrap_rejected",
    "manual_product_tamper",
    "manual_product_basis_tamper",
    "manual_counterevidence_tamper",
    "implementation_tamper",
    "history_failure_nested_tamper",
    "history_consumer_nested_tamper",
    "boundary_tamper",
    "edge_injection",
    "authority_promotion",
    "inventory_input_omission",
    "inventory_input_duplicate",
    "input_wave1_stale",
    "input_wave37_stale",
    "input_wave50_stale",
    "input_main_bundle_stale",
    "inventory_nested_duplicate",
    "ledger_nested_duplicate",
    "inventory_target_tamper",
    "inventory_category_count",
    "inventory_union_tamper",
    "inventory_overlap_tamper",
    "inventory_authority_tamper",
    "inventory_output_tamper",
    "inventory_base_tamper",
    "binding_omission",
    "binding_extra",
    "binding_stale",
    "malformed_json",
    "duplicate_json_key",
    "archive_symlink_mode",
    "archive_nonregular_type",
    "archive_path_mismatch",
    "manifest_mismatch",
    "generator_manual_pin_drift",
)
HUMAN_JUDGMENT = ["product_owner_and_boundary_decision", "configuration_semantic_anchor_acceptance", "phase_candidate_admission_and_successor_assignment", "legacy_implementation_degradation_failure_and_consumer_closure", "formal_asset_classification_update"]
RULES = {"direct_product_basis": "manual semantic span maps to exactly one four-product L1 boundary; this is a research candidate and not formal ownership", "multi_product_conflict": "manual semantic span maps to two or more four-product L1 boundaries; retain the conflict without choosing an owner", "insufficient_basis": "manual semantic span has no product responsibility mapping; retain the insufficiency without inferring ownership"}
RECORD_KEYS = {"asset_id", "source_path", "source_exact", "phase_evidence", "legacy_asset_evidence", "classification", "boundary_evidence", "legacy_history_failure_consumer", "implementation_evidence", "wave_semantic_links", "wave_edge_count", "human_judgment_remaining", "authority_effect", "formal_asset_classification_updated", "new_build_allowed"}
SOURCE_KEYS = {"archive_path", "source_path", "blob", "archive_mode", "archive_type", "bytes", "line_count", "sha256", "ledger_source_sha256", "ledger_digest_match", "archive_manifest_sha256", "archive_manifest_match", "semantic_anchor", "anchor_line_coverage", "read_mode"}
ANCHOR_KEYS = {"marker", "line_start", "line_end", "line_text", "line_text_sha256", "interpretation", "products_considered"}
EDGE_KEYS = {"wave", "path", "line", "row_sha256", "asset_id", "source_path", "source_sha256", "source_requirement_id", "unit_candidate_id", "semantic_link_status", "candidate_product_targets", "candidate_phase_targets", "product_scope", "evidence_refs", "counterevidence"}
PHASE_KEYS = {"path", "line", "row_sha256", "artifact_evidence_kind", "candidate_phase_targets", "candidate_product_targets", "phase_classification_status", "product_classification_status", "implementation_evidence_state", "legacy_implementation_status", "legacy_execution_performed", "consumer_closure_status", "unresolved"}
DISP_KEYS = {"path", "line", "row_sha256", "source_path", "source_sha256", "disposition", "asset_class", "product_target", "implementation_status", "consumer_refs", "decision_record_ref", "read_after_record_ref"}
EXPECTED_INV_KEYS = {"schema_revision", "binding_id", "bundle_revision", "base_revision", "base_source_mode", "scope", "research_scope", "evidence_completeness", "target_count", "target_asset_ids", "target_source_paths", "target_asset_ids_sha256", "target_artifact_evidence_kinds", "classification_counts", "input_digests", "binding_upstream_paths", "output_sha256", "research_union", "overlap_status", "denominator_role", "classification_rule", "authority_boundary", "old_archive_execution", "wave_scan", "negative_cases", "artifacts"}
EXPECTED_INPUT_KEYS = {"path", "blob", "bytes", "sha256"}

# Independent manual pin table: source path -> category, products, semantic lines, meaning, counterevidence.
PROFILE_DATA = {
"config/artifact-retirement-authority.json": ("direct_product_basis", ["HELIX-OS"], 6, 15, "retirement authority enumerates the retired handover artifacts and their disposition", ["The entries govern operational retirement state; the Harness L1 owns V-model meaning but does not own this operational cutover registry."]),
"config/ci-responsibility-registry.v1.json": ("direct_product_basis", ["HELIX-OS"], 14, 35, "CI runtime, security admission, artifact, module, and verification responsibility edges", ["The span names CI runtime and admission responsibilities; Harness evidence contracts are consumers, not the operational responsibility owner."]),
"config/cli-r00-throughput-baseline.v1.json": ("direct_product_basis", ["HELIX-OS"], 10, 33, "CLI and GitHub Actions wall-clock observations with runner and workflow conditions", ["Measured CI/runner execution belongs to OS operational control; Harness L1 does not own runtime throughput."]),
"config/design-artifact-source-digest-baseline.json": ("direct_product_basis", ["HELIX-HARNESS"], 3, 35, "design-to-artifact pinned digest entries for worker context and risk designs", ["The records bind design and implementation evidence; OS executes workers but does not define the design artifact contract."]),
"config/design-reality-binding-empty-baseline.json": ("multi_product_conflict", ["HELIX-HARNESS", "HELIX-OS"], 3, 25, "empty design-reality binding census across worker, requirement, and state design paths", ["Design/artifact semantics point to Harness while worker and state execution paths point to OS; neither boundary can be selected from this shared inventory."]),
"config/digest-canonicalization-inventory.json": ("multi_product_conflict", ["HELIX-HARNESS", "HELIX-OS"], 2, 45, "digest variants and source occurrences used to preserve canonicalization and byte-oracle behavior", ["Canonical evidence and requirement meaning are Harness concerns, while source/runtime digest execution is OS concern; the inventory deliberately crosses both."]),
"config/distribution-capability-artifact-catalog.json": ("direct_product_basis", ["HELIX-HARNESS"], 3, 28, "distribution capabilities and their canonical V-model, workflow, quality, and consumer artifacts", ["The catalog defines Harness distribution capability contracts; OS is a downstream runtime boundary and does not define these artifact meanings."]),
"config/distribution-profile-catalog.json": ("direct_product_basis", ["HELIX-HARNESS"], 3, 25, "consumer distribution profile allowlist and capability exclusions", ["The profile is a Harness distribution contract; execution platform details are explicitly exclusions rather than ownership evidence."]),
"config/document-agent-metadata-scope.json": ("direct_product_basis", ["HELIX-HARNESS"], 2, 19, "document roots, metadata scope, and required evidence gates for design/test documents", ["Document/evidence scope is Harness governance; Web and OS are consumers of the metadata rather than its boundary owner."]),
"config/drive-route-catalog.json": ("insufficient_basis", [], 2, 22, "generic workflow route catalog with layer gates, route classes, and projection fields", ["The route IDs, layer names, modes, and projection fields contain no HELIX product owner, L1 identifier, or product-boundary responsibility; bootstrap candidates are not sufficient evidence."]),
"config/github-action-immutable-ref-registry.json": ("direct_product_basis", ["HELIX-OS"], 2, 17, "immutable GitHub Action release-to-commit verification registry", ["An empty bootstrap candidate is only a missing phase label; the pinned action/ref and admission entries are concrete OS CI controls, while no Web or Harness product behavior is defined by this span."]),
"config/handover-generated-resurrection-authority.json": ("direct_product_basis", ["HELIX-OS"], 2, 8, "generated handover resurrection baseline pointer, blob, and digest authority", ["The authority controls runtime handover resurrection material; the Harness process may consume it but does not own operational replay."]),
"config/handover-generated-resurrection-baseline.json": ("direct_product_basis", ["HELIX-OS"], 2, 20, "generated handover projection kinds and fingerprints for fresh/brownfield setup", ["Handover restoration state is an OS lifecycle concern; no product UI or V-model responsibility is declared in the span."]),
"config/handover-preserve-authority.json": ("direct_product_basis", ["HELIX-OS"], 2, 18, "preserved handover provider evidence entries and digests", ["Provider evidence persistence is operational state control; Harness governance is only a consumer."]),
"config/handover-resurrection-authority.json": ("direct_product_basis", ["HELIX-OS"], 2, 8, "handover resurrection baseline pointer, blob, revision, and digest", ["The span is an operational replay authority; the other L1s have no direct runtime-state ownership evidence."]),
"config/handover-resurrection-baseline.json": ("direct_product_basis", ["HELIX-OS"], 2, 18, "resurrection policy digest and baseline fingerprints", ["Policy/fingerprint replay is OS lifecycle integrity; Harness does not execute the resurrection mechanism."]),
"config/handover-retirement-enforce-authority.json": ("direct_product_basis", ["HELIX-OS"], 1, 1, "single-line handover retirement enforcement authority and preserve digest", ["The one JSON object is an operational enforcement authority; its compactness does not add Harness or Web ownership evidence."]),
"config/helix-bench/fixtures.v1.json": ("direct_product_basis", ["HELIX-HARNESS"], 2, 15, "benchmark fixtures for typed-axis, legacy-taxonomy, and requirement-binding cases", ["Fixtures evaluate Harness contracts and evidence boundaries; OS/Web are test subjects rather than fixture ownership."]),
"config/helix-bench/hidden/hidden-oracles.v1.json": ("direct_product_basis", ["HELIX-HARNESS"], 2, 15, "hidden benchmark oracle failure classes and negative mutations", ["Oracle semantics belong to Harness verification; execution products do not define the oracle taxonomy."]),
"config/helix-bench/public-tasks.v1.json": ("direct_product_basis", ["HELIX-HARNESS"], 2, 25, "public benchmark tasks, prompts, snapshots, and requirement/design categories", ["The dataset tests V-model and governance binding, which is a Harness contract; no product runtime implementation is asserted."]),
"config/historical-vpair-migration-authority.json": ("multi_product_conflict", ["HELIX-HARNESS", "HELIX-OS"], 1, 1, "one-line historical V-pair migration cutoff and census authority", ["V-pair migration meaning is Harness, while the repository cutoff and migration material are operational OS state; both L1s are evidenced."]),
"config/historical-vpair-migration-authority.manifest.json": ("multi_product_conflict", ["HELIX-HARNESS", "HELIX-OS"], 1, 1, "one-line migration authority manifest with regular mode, blob, and digest expectations", ["The manifest binds a Harness migration contract to Git/object integrity controlled by OS tooling; both boundaries remain live."]),
"config/legacy-orchestration-semantic-consumers-revision-2026-09-10.json": ("direct_product_basis", ["HELIX-OS"], 2, 30, "revised compatibility ledger of legacy orchestration semantic consumers and retirement references", ["Consumer/runtime compatibility is operational migration control; the ledger does not define a new Harness authority."]),
"config/legacy-orchestration-semantic-consumers.json": ("direct_product_basis", ["HELIX-OS"], 2, 30, "compatibility-only semantic consumer ledger for legacy orchestration", ["The explicit compatibility-only role and runtime consumer references place this in OS migration control."]),
"config/legacy-orchestration-surface-inventory.json": ("direct_product_basis", ["HELIX-OS"], 2, 30, "compatibility-only retirement-ratchet inventory of legacy orchestration surfaces", ["Surface retirement and runtime compatibility are OS concerns; no current product authority is declared."]),
"config/nfr-registry.json": ("direct_product_basis", ["HELIX-HARNESS"], 2, 25, "typed non-functional requirement registry with quality family and source authority entries", ["NFR meaning and evidence quality are Harness requirement contracts; OS implements operational controls after admission."]),
"config/objective-evidence-substance-binding.v1.json": ("direct_product_basis", ["HELIX-HARNESS"], 2, 30, "objective-to-evidence path, digest, minimum substance, and acceptance binding", ["Evidence substance and acceptance are Harness V-model obligations; runtime consumers do not own the binding semantics."]),
"config/plan-legacy-workflow-identity-inventory.json": ("insufficient_basis", [], 2, 35, "compatibility-only inventory of plan IDs and document paths", ["The entries expose plan IDs and paths under compatibility_input_only but no product field, L1 identifier, or boundary responsibility; plan names containing helix/harness are not product ownership evidence."]),
"config/plan-specific-vpair-binding-authority.json": ("multi_product_conflict", ["HELIX-HARNESS", "HELIX-OS"], 2, 35, "plan-specific V-pair fingerprints, reasons, and verification bindings", ["V-pair semantics belong to Harness while verification material and repository execution are OS-facing; authority cannot be singularly assigned."]),
"config/repo-wide-guard-tests.v1.json": ("multi_product_conflict", ["HELIX-HARNESS", "HELIX-OS"], 2, 25, "repository-wide guard test paths covering asset drift, governance, descent, and cutover", ["Guard meaning is Harness governance while test execution and repository admission are OS controls; both are concrete."]),
"config/requirement-discovery-event-schema.json": ("multi_product_conflict", ["HELIX-OS", "HELIX-Web-OS"], 2, 24, "shadow migration discovery event envelope, L1/L2 authority boundary, and append-only projection", ["Discovery events are OS workflow state and Web-OS integration projection; the span has no single boundary."]),
"config/requirement-ir-authority.json": ("direct_product_basis", ["HELIX-HARNESS"], 2, 24, "canonical requirement IR authority, schema, manifest, baseline, and digest", ["Canonical requirement authority is a Harness V-model contract; OS and Web consume the resulting IR."]),
"config/requirement-ir-schema.json": ("direct_product_basis", ["HELIX-HARNESS"], 2, 32, "canonical requirement IR envelope schema, authority, partitions, and digest definitions", ["The schema defines requirement semantics and evidence structure, which is Harness L1 scope; it does not implement runtime behavior."]),
"config/specialist-agent-registry.json": ("direct_product_basis", ["HELIX-OS"], 2, 21, "specialist agent runtime, role, authority, capability, and sync source registry", ["Agent runtime and role capability dispatch belong to OS runtime control; Harness only specifies the surrounding contract."]),
"config/ui-domain/harness-console-bundle.json": ("direct_product_basis", ["HELIX-Web"], 2, 24, "HELIX harness management console domain entities, screens, navigation, and UI components", ["The span is a user-facing console domain; Web owns presentation interaction while Harness supplies the upstream contract and Web-OS supplies integration."]),
"config/universal-improvement-source-registry.v1.integrity.json": ("insufficient_basis", [], 2, 6, "integrity pointer and exact-bytes policy for another registry", ["This object only points to a registry digest and contains no product responsibility or consumer behavior."]),
"config/universal-improvement-source-registry.v1.json": ("insufficient_basis", [], 2, 70, "universal improvement registry authority and generic source-kind requirements", ["source_kind and owner values such as ci, requirements, provider, distribution, and security name capability roles rather than HELIX product boundaries; no L1/product mapping is present."]),
"config/worker-isolation-runtime-catalog.json": ("insufficient_basis", [], 2, 5, "empty worker isolation backend and runtime catalog", ["Empty arrays establish no concrete product responsibility, implementation, consumer, or boundary mapping."]),
"config/workflow-classification-catalog.v1.json": ("insufficient_basis", [], 2, 30, "generated workflow classification projection with typed axes, entities, and fail-close policy", ["The projection contains workflow axes, layer/state meanings, and signal bindings but no HELIX product owner or product-boundary mapping; all-product bootstrap candidates are unsupported here."]),
"config/workflow-execution-policy.v1.json": ("multi_product_conflict", ["HELIX-HARNESS", "HELIX-OS", "HELIX-Web"], 2, 44, "generated workflow execution policy with route evaluation, identity, approval, and execution fields", ["The policy combines Harness workflow contract, OS execution/approval, and Web route signals; a single L1 would erase concrete evidence."]),
"config/workflow-output-consumer-inventory.json": ("multi_product_conflict", ["HELIX-HARNESS", "HELIX-OS"], 2, 25, "workflow output fields, CLI/state consumers, producer symbols, and successor issues", ["Output contract meaning is Harness while CLI/state consumers are OS; the inventory explicitly binds both."]),
}

MAIN_PINS = {
"scaffold/legacy-asset-product-classification-0107/inventory.json": ("b5201e8aadc71e94cf0a44f94d825582a729a673", 29120, "sha256:0bbcd6433312154f131d9d4ff71e47886ae352aba87f96f62cb97715117f6393", 64, "sha256:ea5dbea614e4a19032aa25370c942b9d02a5dc0f2cdcfdb80c7393334b10b707"),
"scaffold/legacy-lint-product-classification-0108/inventory.json": ("a97ebd5190bef017b94499e75caf5a95dae162d8", 62315, "sha256:66f46326fa5344921365252bbec17058b3dddb97733674373758215d1e76a267", 95, "sha256:340bfa818c7d9282d3e9f48b19b9402c5fac2b2c191ae704b554831654dc361b"),
"scaffold/legacy-runtime-product-classification-0117/inventory.json": ("0003d5aa7bc4a3defc43b4b51c280941c206f1e4", 59214, "sha256:6451b00b8ba68fdfa7960a3593c73d168f1d9be64d64d7275b0c5e12fe22f496", 73, "sha256:483c9fe3ccb88c768c7d6f6023989da830a5d997a5a9dd83807ec0f8d593a709"),
"scaffold/legacy-schema-product-classification-0120/inventory.json": ("1a10ea894aef325a1c98bd4cebb0c6830d1c82f6", 42544, "sha256:aede25f1bf82e42d999fc5f64db1d25854bc7495e414134ffb3104b2af2eb091", 31, "sha256:ec5857912e9b5adb60d976d106286af62796776294a51dcb6a7bdc9cf0bd8842"),
"scaffold/legacy-source-product-classification-0123/inventory.json": ("05e3c21381b22f84cacd35424fce4c88518a2107", 57071, "sha256:e5ed5144572a60919d4b929395bca50077825cb0f3c66a200ae8dd66871122c4", 59, "sha256:dc2018a31d6a1021d98832a618b625e3df453b843e7ad2df589582ac47f13cf4"),
"scaffold/legacy-state-db-product-classification-0127/inventory.json": ("f7a3d594669a515da6793d75ed804fa91bcb8638", 36622, "sha256:8c3b31bb74e5b947224c61b5ad4cb1a2578fbebaf65a06c0374105f8123d3c5d", 39, "sha256:c23c7479f3c09ae494a36a4d9864e519a0319c34768e68329437cedeab0c0164"),
"scaffold/legacy-lint-candidate-product-classification-0128/inventory.json": ("2ed160fdb92bcc9428e80fa526fafb8def663998", 43118, "sha256:be2d6f05f4748183c88eef767814fcb275d025d2cf7d1257a7ca7ea086cbb485", 51, "sha256:a1fe7586b733bfcaae27710f0a0bd8daea56d4e566942828a8efecca426498b4"),
"scaffold/legacy-runtime-residual-product-classification-0133/inventory.json": ("eed51a0e0a92599ea2e4da159be40ac324e7fa1c", 59563, "sha256:f08c7cddc980144ae8bd9551ecb857b05509b00c0314f1b2b188ff60f419f644", 59, "sha256:b8d304a4abe5c7d0f7764e1367e7ec35c6ab11104bf6691b34cf44ded0256f03"),
}


def fail(code: str, msg: str) -> None: raise AssertionError(f"{code}: {msg}")
def tagged(data: bytes) -> str: return "sha256:" + hashlib.sha256(data).hexdigest()
def canonical(v: object) -> bytes: return json.dumps(v, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode()
def row_digest(v: object) -> str: return tagged(canonical(v))

def strict_pairs(pairs: list[tuple[str, object]]) -> dict:
    out = {}
    for key, value in pairs:
        if key in out: raise ValueError(f"duplicate key {key}")
        out[key] = value
    return out

def local_json(path: Path):
    try: return json.loads(path.read_text(), object_pairs_hook=strict_pairs)
    except (OSError, json.JSONDecodeError, ValueError) as exc: fail("E_JSON", f"{path}: {exc}")

def local_jsonl(path: Path) -> list[dict]:
    out = []
    for n, line in enumerate(path.read_text().splitlines(), 1):
        if not line.strip(): continue
        try: obj = json.loads(line, object_pairs_hook=strict_pairs)
        except (json.JSONDecodeError, ValueError) as exc: fail("E_JSON", f"{path}:{n}: {exc}")
        if not isinstance(obj, dict): fail("E_JSON", f"{path}:{n}: object required")
        out.append(obj)
    return out

def git_bytes(path: str) -> bytes:
    try: return subprocess.check_output(["git", "show", f"{BASE_REVISION}:{path}"])
    except subprocess.CalledProcessError: fail("E_BASE_SOURCE", path)

def git_blob(path: str) -> str:
    try: return subprocess.check_output(["git", "rev-parse", f"{BASE_REVISION}:{path}"], text=True).strip()
    except subprocess.CalledProcessError: fail("E_BASE_SOURCE", path)

def head_bytes(path: str) -> bytes:
    try: return subprocess.check_output(["git", "show", f"HEAD:{path}"])
    except subprocess.CalledProcessError: fail("E_RESEARCH_INPUT", path)

def head_blob(path: str) -> str:
    try: return subprocess.check_output(["git", "rev-parse", f"HEAD:{path}"], text=True).strip()
    except subprocess.CalledProcessError: fail("E_RESEARCH_INPUT", path)

def base_jsonl(path: str) -> list[tuple[int, dict]]:
    out = []
    for n, line in enumerate(git_bytes(path).decode(errors="replace").splitlines(), 1):
        if not line.strip(): continue
        try: obj = json.loads(line, object_pairs_hook=strict_pairs)
        except (json.JSONDecodeError, ValueError) as exc: fail("E_JSON", f"{path}:{n}: {exc}")
        if not isinstance(obj, dict): fail("E_JSON", f"{path}:{n}: object required")
        out.append((n, obj))
    return out

def archive_tree(path: str) -> tuple[str, str, str]:
    try: out = subprocess.check_output(["git", "ls-tree", BASE_REVISION, "--", path], text=True).splitlines()
    except subprocess.CalledProcessError: fail("E_ARCHIVE_STATIC", path)
    if len(out) != 1: fail("E_ARCHIVE_STATIC", f"missing/ambiguous {path}")
    try: mode_type_oid, entry = out[0].split("\t", 1); mode, kind, oid = mode_type_oid.split()
    except ValueError: fail("E_ARCHIVE_STATIC", out[0])
    if mode != "100644" or kind != "blob" or entry != path: fail("E_ARCHIVE_STATIC", out[0])
    return mode, kind, oid

def receipt(path: str, start: int, end: int) -> dict:
    lines = git_bytes(path).decode(errors="replace").splitlines()
    if start < 1 or end > len(lines) or start > end: fail("E_BOUNDARY_ANCHOR", f"{path}:{start}-{end}")
    text = "\n".join(lines[start - 1:end])
    return {"path": path, "line_start": start, "line_end": end, "line_text_sha256": tagged(text.encode()), "line_text": lines[start - 1:end]}

def boundary_expected() -> dict:
    return {"path": BOUNDARY, "blob": git_blob(BOUNDARY), "sha256": tagged(git_bytes(BOUNDARY)), "ranges": [receipt(BOUNDARY, *r) for r in [(36, 39), (54, 65), (86, 89)]]}

def l1_expected() -> dict:
    ranges = {"HELIX-HARNESS": [(22, 35), (54, 58)], "HELIX-OS": [(22, 40), (59, 63)], "HELIX-Web": [(24, 35), (45, 49)], "HELIX-Web-OS": [(14, 23), (37, 44)]}
    return {p: {"path": path, "blob": git_blob(path), "sha256": tagged(git_bytes(path)), "ranges": [receipt(path, *rs) for rs in ranges[p]]} for p, path in L1.items()}

def manifest_sha(path: str) -> str:
    hits = [line for line in git_bytes(MANIFEST).decode(errors="replace").splitlines() if line.endswith(" " + path)]
    if len(hits) != 1: fail("E_ARCHIVE_STATIC", f"manifest entry {path}")
    return "sha256:" + hits[0].split(maxsplit=1)[0]

def expected_source(asset: dict) -> dict:
    path = asset["source_path"]; archive = ARCHIVE_PREFIX + path
    mode, kind, oid = archive_tree(archive)
    if mode != "100644" or kind != "blob": fail("E_ARCHIVE_STATIC", archive)
    try:
        if oid != git_blob(archive): fail("E_ARCHIVE_STATIC", archive)
    except AssertionError:
        raise
    data = git_bytes(archive); lines = data.decode(errors="replace").splitlines()
    category, products, start, end, meaning, _ = PROFILE_DATA[path]
    if start < 1 or end > len(lines) or start > end: fail("E_BOUNDARY_ANCHOR", path)
    digest = tagged(data); ledger = "sha256:" + asset["source_sha256"]; manifest = manifest_sha(path)
    if digest != ledger: fail("E_SOURCE", f"ledger {path}")
    if digest != manifest: fail("E_ARCHIVE_STATIC", f"MANIFEST {path}")
    anchor_lines = lines[start - 1:end]; text = "\n".join(anchor_lines); unread = []
    if start > 1: unread.append([1, start - 1])
    if end < len(lines): unread.append([end + 1, len(lines)])
    return {"archive_path": archive, "source_path": path, "blob": oid, "archive_mode": mode, "archive_type": kind, "bytes": len(data), "line_count": len(lines), "sha256": digest, "ledger_source_sha256": ledger, "ledger_digest_match": True, "archive_manifest_sha256": manifest, "archive_manifest_match": True, "semantic_anchor": {"marker": anchor_lines[0][:240], "line_start": start, "line_end": end, "line_text": anchor_lines, "line_text_sha256": tagged(text.encode()), "interpretation": meaning, "products_considered": products}, "anchor_line_coverage": {"source_line_count": len(lines), "anchor_line_count": end - start + 1, "coverage_ratio": round((end - start + 1) / len(lines), 6), "unread_line_ranges": unread}, "read_mode": "git_object_static_read_only"}

def expected_history(asset: dict, disp_line: int, disp: dict, decisions: list[tuple[int, dict]], read_after: list[tuple[int, dict]]) -> dict:
    compact = {"path": DISPOSITION, "line": disp_line, "row_sha256": row_digest(disp), "source_path": disp.get("source_path"), "source_sha256": disp.get("source_sha256"), "disposition": disp.get("disposition"), "asset_class": disp.get("asset_class"), "product_target": disp.get("product_target"), "implementation_status": disp.get("implementation_status"), "consumer_refs": sorted(disp.get("consumer_refs", [])), "decision_record_ref": disp.get("decision_record_ref"), "read_after_record_ref": disp.get("read_after_record_ref")}
    return {"disposition": compact, "decisions": [{"path": DECISIONS, "line": n, "row_sha256": row_digest(r), "decision_id": r.get("decision_id"), "product_target": r.get("product_target"), "disposition": r.get("disposition")} for n, r in decisions if r.get("asset_id") == asset["asset_id"]], "read_after": [{"path": READ_AFTER, "line": n, "row_sha256": row_digest(r), "read_after_id": r.get("read_after_id"), "result": r.get("result"), "digest_match": r.get("digest_match"), "consumer_match": r.get("consumer_match")} for n, r in read_after if r.get("asset_id") == asset["asset_id"]], "failure_consumer_static": {"failure": {"path": FAILURE, "blob": git_blob(FAILURE), "sha256": tagged(git_bytes(FAILURE)), "read_mode": "git_object_static_read_only"}, "consumer": {"path": CONSUMER, "blob": git_blob(CONSUMER), "sha256": tagged(git_bytes(CONSUMER)), "read_mode": "git_object_static_read_only"}}, "observed_failure_status": "asset_specific_failure_or_degradation_not_established", "consumer_closure_status": "asset-level consumer closure pending; disposition refs and global static inventory retained", "degradation_status": "unknown"}

def expected_targets():
    phases = base_jsonl(PHASE); phase_by_path = {r.get("source_path"): (n, r) for n, r in phases}
    disp_rows = base_jsonl(DISPOSITION); disp_by_id = {r["asset_id"]: (n, r) for n, r in disp_rows}
    targets = [r for _, r in disp_rows if r.get("source_path", "").startswith("config/")]
    if len(targets) != 41 or len({r["asset_id"] for r in targets}) != 41 or len({r["source_path"] for r in targets}) != 41 or set(r["source_path"] for r in targets) != set(PROFILE_DATA): fail("E_TARGET_SET", "config disposition exact 41 set")
    for asset in targets:
        if asset["source_path"] not in phase_by_path or phase_by_path[asset["source_path"]][1].get("asset_id") != asset["asset_id"]: fail("E_TARGET_SET", f"phase mismatch {asset['source_path']}")
    return sorted(targets, key=lambda x: x["source_path"]), phase_by_path, disp_by_id, base_jsonl(DECISIONS), base_jsonl(READ_AFTER)

def ids_from_inventory(obj: dict) -> set[str]:
    ids = obj.get("target_asset_ids")
    if isinstance(ids, list): return set(ids)
    ids = obj.get("expected_sets", {}).get("target_asset_ids")
    return set(ids) if isinstance(ids, list) else set()

def id_digest(ids: set[str]) -> str: return tagged(("\n".join(sorted(ids))).encode())

def prior_union() -> set[str]:
    sets = []
    for path, (blob, size, digest, count, idsha) in MAIN_PINS.items():
        data = head_bytes(path)
        if len(data) != size or tagged(data) != digest or head_blob(path) != blob: fail("E_RESEARCH_INPUT", f"main snapshot stale {path}")
        obj = local_json(ROOT / path); ids = ids_from_inventory(obj)
        if len(ids) != count or id_digest(ids) != idsha: fail("E_RESEARCH_INPUT", f"main target set stale {path}")
        sets.append(ids)
    pre = set().union(*(s for p, s in zip(MAIN_PINS, sets) if "0120" not in p))
    if len(pre) != 399: fail("E_RESEARCH_UNION", f"pre-2074-main={len(pre)}")
    main = set().union(*sets)
    if len(main) != 429: fail("E_RESEARCH_UNION", f"current-main={len(main)}")
    return main

def verify_inventory(inv: dict) -> None:
    if set(inv) != EXPECTED_INV_KEYS: fail("E_INVENTORY_SCHEMA", "top-level keys")
    if inv["schema_revision"] != 2 or inv["binding_id"] != BINDING_ID or inv["base_revision"] != BASE_REVISION: fail("E_BASE_PIN", "binding/base")
    if inv["base_source_mode"] != "all legacy source, fixed inputs, and archive evidence bytes from fixed BASE Git objects": fail("E_BASE_SOURCE", "source mode")
    if inv["scope"] != "fixed BASE unresolved config/** exact 41 assets; current-main research union is authoritative and open-PR projections are conditional": fail("E_INVENTORY", "scope")
    if inv["bundle_revision"] != "SCF-B-0141-r2": fail("E_INVENTORY", "bundle revision")
    expected_scope = {"source_prefix": "config/", "asset_class": "Historical", "disposition": "unresolved", "artifact_evidence_kind": "configuration", "mode": "research_only", "products": list(PRODUCTS), "authoritative_prior_union": "origin/main current 429"}
    if inv["research_scope"] != expected_scope: fail("E_INVENTORY", "research scope")
    expected_comp = {"source_blob_sha_line_anchor": True, "semantic_span_manual_pin": True, "anchor_coverage_and_unread_ranges": True, "phase_and_implementation_status": True, "missing_evidence_preserved": True, "failure_degradation": "global_static_inventory_and_asset_unknown", "consumer": "global_static_inventory_and_asset_pending", "wave_scan": True, "bootstrap_candidates_comparison_only": True}
    if inv["evidence_completeness"] != expected_comp: fail("E_INVENTORY", "evidence completeness")
    if inv["classification_rule"] != RULES: fail("E_INVENTORY", "classification rules")
    expected_artifacts = [f"scaffold/bindings/{BINDING_ID}.json", "scaffold/legacy-config-product-classification-0141/README.md", "scaffold/legacy-config-product-classification-0141/PR-DRAFT.md", "scaffold/legacy-config-product-classification-0141/generate.py", "scaffold/legacy-config-product-classification-0141/validate.py", "scaffold/legacy-config-product-classification-0141/selfcheck.py", "scaffold/legacy-config-product-classification-0141/inventory.json", "scaffold/legacy-config-product-classification-0141/classification-research.jsonl"]
    if inv["artifacts"] != expected_artifacts: fail("E_INVENTORY", "artifacts")
    if inv["authority_boundary"] != {"authority_effect": "none", "formal_product_authority": None, "formal_asset_classification_updated": False, "formal_implementation_status": "unknown", "phase_updated": False, "successor_assignment": None, "new_build_allowed": False, "read_mode": "static_git_object_only"}: fail("E_AUTHORITY", "authority boundary")
    if inv["old_archive_execution"] != {"source_read": "git show fixed BASE regular blobs only", "runtime": False, "test": False, "ci": False, "workflow": False, "hook": False, "adapter": False}: fail("E_ARCHIVE_EXECUTION", "archive execution declaration")
    if inv["negative_cases"] != list(EXPECTED_NEGATIVE_CASES): fail("E_NEGATIVE_CASES", "ordered exact negative case IDs")

def verify_inputs(inv: dict) -> None:
    got = inv.get("input_digests")
    if not isinstance(got, list) or [x.get("path") for x in got] != ALL_HEAD_INPUTS or len({x.get("path") for x in got}) != len(got) or any(set(x) != EXPECTED_INPUT_KEYS for x in got): fail("E_INPUT_DIGEST", "input path/key set")
    for item in got:
        path = item["path"]; data = head_bytes(path) if path in MAIN_RESEARCH_INPUTS else git_bytes(path); blob = head_blob(path) if path in MAIN_RESEARCH_INPUTS else git_blob(path)
        if item != {"path": path, "blob": blob, "bytes": len(data), "sha256": tagged(data)}: fail("E_INPUT_DIGEST", path)

def verify_binding_closure(inv: dict) -> None:
    binding = local_json(BINDING)
    if binding.get("id") != BINDING_ID or binding.get("kind") != "scaffold": fail("E_BINDING_CLOSURE", "binding identity")
    upstream = binding.get("upstream")
    expected_paths = NONARCHIVE_INPUTS + MAIN_RESEARCH_INPUTS
    if not isinstance(upstream, list) or [x.get("path") for x in upstream] != expected_paths or len({x.get("path") for x in upstream}) != len(upstream): fail("E_BINDING_CLOSURE", "omission/extra/duplicate upstream")
    inv_upstream = inv.get("binding_upstream_paths")
    if not isinstance(inv_upstream, list) or [x.get("path") for x in inv_upstream] != expected_paths: fail("E_BINDING_CLOSURE", "inventory upstream closure")
    for item, inv_item in zip(upstream, inv_upstream):
        path = item["path"]; data = head_bytes(path) if path in MAIN_RESEARCH_INPUTS else git_bytes(path); raw = hashlib.sha256(data).hexdigest()
        if set(item) != {"path", "sha256"} or item["sha256"] != raw or inv_item != {"path": path, "sha256": "sha256:" + raw}: fail("E_BINDING_CLOSURE", path)

def expected_product_basis(products: list[str], meaning: str, counter: list[str]) -> dict:
    l1 = l1_expected(); boundary = boundary_expected()
    return {p: {"product": p, "mapping": f"semantic span: {meaning}", "l1_evidence": l1[p], "boundary_evidence": boundary, "counterevidence": counter} for p in products}

def expected_wave_links(asset_id: str) -> list[dict]:
    out = []
    for wave, path in WAVE_PATHS.items():
        for line, edge in base_jsonl(path):
            if edge.get("asset_id") == asset_id:
                out.append({"wave": wave, "path": path, "line": line, "row_sha256": row_digest(edge), "asset_id": edge.get("asset_id"), "source_path": edge.get("source_path"), "source_sha256": edge.get("source_sha256"), "source_requirement_id": edge.get("source_requirement_id"), "unit_candidate_id": edge.get("unit_candidate_id"), "semantic_link_status": edge.get("semantic_link_status"), "candidate_product_targets": edge.get("candidate_product_targets") or [], "candidate_phase_targets": edge.get("candidate_phase_targets") or [], "product_scope": edge.get("product_scope") or [], "evidence_refs": edge.get("evidence_refs") or [], "counterevidence": edge.get("counterevidence") or []})
    return out

def verify_record(row: dict, asset: dict, phase: dict, disp_line: int, disp: dict, decisions: list[tuple[int, dict]], read_after: list[tuple[int, dict]]) -> None:
    aid = asset["asset_id"]
    if set(row) != RECORD_KEYS or row["asset_id"] != aid or row["source_path"] != asset["source_path"]: fail("E_RECORD_SCHEMA", aid)
    profile = PROFILE_DATA[asset["source_path"]]; category, products, start, end, meaning, counter = profile
    source = expected_source(asset)
    if set(row["source_exact"]) != SOURCE_KEYS or set(row["source_exact"]["semantic_anchor"]) != ANCHOR_KEYS or row["source_exact"] != source: fail("E_SOURCE", aid)
    if source["semantic_anchor"]["line_start"] != start or source["semantic_anchor"]["line_end"] != end or not source["semantic_anchor"]["line_text"] or (end > start and source["semantic_anchor"]["marker"] == source["semantic_anchor"]["line_text"][0][:240] and source["semantic_anchor"]["marker"] == "{"): fail("E_SOURCE", f"nonsemantic anchor {aid}")
    phase_line = phase.pop("_line"); phase_expected = {"path": PHASE, "line": phase_line, "row_sha256": row_digest(phase), "artifact_evidence_kind": phase.get("artifact_evidence_kind"), "candidate_phase_targets": phase.get("candidate_phase_targets") or [], "candidate_product_targets": phase.get("candidate_product_targets") or [], "phase_classification_status": phase.get("phase_classification_status"), "product_classification_status": phase.get("product_classification_status"), "implementation_evidence_state": phase.get("implementation_evidence_state"), "legacy_implementation_status": phase.get("legacy_implementation_status"), "legacy_execution_performed": phase.get("legacy_execution_performed"), "consumer_closure_status": phase.get("consumer_closure_status"), "unresolved": phase.get("unresolved") or []}; phase["_line"] = phase_line
    if row["phase_evidence"] != phase_expected or set(row["phase_evidence"]) != PHASE_KEYS: fail("E_PHASE", aid)
    disp_expected = {"path": DISPOSITION, "line": disp_line, "row_sha256": row_digest(disp), "source_path": disp.get("source_path"), "source_sha256": disp.get("source_sha256"), "disposition": disp.get("disposition"), "asset_class": disp.get("asset_class"), "product_target": disp.get("product_target"), "implementation_status": disp.get("implementation_status"), "consumer_refs": sorted(disp.get("consumer_refs", [])), "decision_record_ref": disp.get("decision_record_ref"), "read_after_record_ref": disp.get("read_after_record_ref")}
    if row["legacy_asset_evidence"] != disp_expected or set(row["legacy_asset_evidence"]) != DISP_KEYS: fail("E_LEDGER", aid)
    bootstrap = sorted(set(phase.get("candidate_product_targets") or [])); alignment = "match" if bootstrap == sorted(products) else "diverges_to_manual_semantic_span" if bootstrap and products else "diverges_to_insufficient_manual_span" if bootstrap and not products else "manual_span_found_without_bootstrap_candidate" if products else "both_insufficient"
    expected_class = {"category": category, "candidate_products": products, "semantic_status": "manual_semantic_span_pinned_pending_human_review", "meaning": meaning, "bootstrap_candidate_products": bootstrap, "bootstrap_alignment": alignment, "product_basis": expected_product_basis(products, meaning, counter), "counterevidence": counter, "reason": RULES[category]}
    if row["classification"] != expected_class: fail("E_CLASSIFICATION", aid)
    if category == "direct_product_basis" and len(products) != 1 or category == "multi_product_conflict" and len(products) < 2 or category == "insufficient_basis" and products: fail("E_CATEGORY_PARTITION", aid)
    if row["boundary_evidence"] != {"product_boundary": boundary_expected(), "l1": l1_expected()}: fail("E_BOUNDARY_ANCHOR", aid)
    if row["legacy_history_failure_consumer"] != expected_history(asset, disp_line, disp, decisions, read_after): fail("E_HISTORY_CONSUMER", aid)
    implementation = {"artifact_evidence_kind": "configuration", "status": "unknown", "presence": "configuration_present_unexecuted", "unimplemented_evidence": phase.get("unresolved") or ["legacy_implementation_status_unknown"], "legacy_execution_performed": False}
    if row["implementation_evidence"] != implementation: fail("E_IMPLEMENTATION", aid)
    wave_links = expected_wave_links(aid)
    if any(set(edge) != EDGE_KEYS for edge in row["wave_semantic_links"]) or row["wave_semantic_links"] != wave_links or row["wave_edge_count"] != len(wave_links): fail("E_EDGE_SET", aid)
    if row["human_judgment_remaining"] != HUMAN_JUDGMENT or row["authority_effect"] != "none" or row["formal_asset_classification_updated"] is not False or row["new_build_allowed"] is not False: fail("E_AUTHORITY", aid)

def verify() -> None:
    try: subprocess.check_call(["git", "merge-base", "--is-ancestor", BASE_REVISION, "HEAD"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    except subprocess.CalledProcessError: fail("E_BASE_NOT_ANCESTOR", BASE_REVISION)
    inv = local_json(INVENTORY); verify_inventory(inv); verify_inputs(inv); verify_binding_closure(inv)
    targets, phase_by_path, disp_by_id, decisions, read_after = expected_targets(); rows = local_jsonl(LEDGER); expected_ids = [a["asset_id"] for a in targets]; expected_paths = [a["source_path"] for a in targets]
    if len(rows) != 41 or [r.get("asset_id") for r in rows] != expected_ids or [r.get("source_path") for r in rows] != expected_paths or len({r.get("asset_id") for r in rows}) != 41: fail("E_TARGET_SET", "records exact set/order")
    if inv["target_count"] != 41 or inv["target_asset_ids"] != expected_ids or inv["target_source_paths"] != expected_paths or inv["target_asset_ids_sha256"] != tagged(("\n".join(expected_ids)).encode()): fail("E_TARGET_SET", "inventory exact set")
    if inv["target_artifact_evidence_kinds"] != {"configuration": 41}: fail("E_CATEGORY_PARTITION", "artifact kind count")
    for row, asset in zip(rows, targets):
        phase_line, phase = phase_by_path[asset["source_path"]]; phase_copy = dict(phase); phase_copy["_line"] = phase_line
        verify_record(row, asset, phase_copy, disp_by_id[asset["asset_id"]][0], disp_by_id[asset["asset_id"]][1], decisions, read_after)
    counts = Counter(r["classification"]["category"] for r in rows)
    if dict(counts) != {"direct_product_basis": 26, "multi_product_conflict": 9, "insufficient_basis": 6} or inv["classification_counts"] != dict(counts): fail("E_CATEGORY_PARTITION", f"counts={dict(counts)}")
    if inv["output_sha256"] != tagged(LEDGER.read_bytes()): fail("E_OUTPUT_DIGEST", "ledger digest")
    main = prior_union(); target_set = set(expected_ids)
    if target_set & main: fail("E_OVERLAP", "target intersects authoritative current-main union")
    ru = inv["research_union"]
    expected_ru = {"authoritative": {"basis": "origin/main current", "count": 429, "target_overlap": 0, "archive_population": 4020}, "conditional_projection": {"pre_2074_main_count": 399, "pr2074_increment_count": 31, "old_pr2078_count": 120, "old_union_count": 496, "after_config_count": 537, "status": "conditional_only_open_pr2078_old_head_5322_is_staleable", "old_pr2078_head": "5322a99b96f75e210c68aa56690f2da4fcb4415c"}, "target_overlap_authoritative_current_main": 0, "target_overlap_conditional_old_union": 0, "integration_order": "authoritative current main (429) -> config/41 (470); conditional historical projection old open-PR union (496) -> config/41 (537), all /4020"}
    if ru != expected_ru: fail("E_RESEARCH_UNION", "union declaration")
    if inv["overlap_status"] != {"status": "pass", "research_scope": "config/**", "authoritative_union": "origin/main_current_429", "target_vs_authoritative_current_main": 0, "target_vs_conditional_old_union": 0, "union_exact": True, "open_pr2078_status": "conditional_staleable_not_authoritative"}: fail("E_OVERLAP", "overlap declaration")
    if inv["denominator_role"] != {"archive_population": 4020, "authoritative_current_main": 429, "authoritative_after_config": 470, "conditional_old_open_pr_union": 496, "conditional_after_config": 537, "role": "research_candidate_evidence_only; no formal adoption or completion"}: fail("E_RESEARCH_UNION", "denominator role")
    edges = target_edges = 0
    for path in WAVE_PATHS.values():
        for _, edge in base_jsonl(path): edges += 1; target_edges += edge.get("asset_id") in target_set
    if inv["wave_scan"] != {"files": 50, "edges": 598, "target_edges": 1, "target_linked_assets": 1} or edges != 598 or target_edges != 1: fail("E_EDGE_SET", f"wave={edges}/{target_edges}")
    print("SCF-B-0141 validate PASS records=41 counts={'direct_product_basis': 26, 'multi_product_conflict': 9, 'insufficient_basis': 6} target_edges=1 authoritative_union=429 conditional_projection=496/537")

if __name__ == "__main__": verify()

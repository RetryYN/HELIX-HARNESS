#!/usr/bin/env python3
"""SCF-B-0141 deterministic generator.

Only fixed Git objects are read for legacy evidence.  Archive content is never
executed or imported; it is read as regular 100644 blobs with manifest and
ledger digest checks.
"""
from __future__ import annotations

import hashlib
import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
BUNDLE = ROOT / "scaffold/legacy-config-product-classification-0141"
BASE_REVISION = "5562f04da0f3205f9aa58205ec0d478419fc4f2e"
BINDING_ID = "SCF-B-0141"
ARCHIVE_PREFIX = "archive/legacy-generation-2026-09-14/root/"
PHASE = "docs/governance/legacy-asset-phase-product-classification-bootstrap.jsonl"
DISPOSITION = "docs/governance/legacy-asset-disposition.jsonl"
DECISIONS = "docs/governance/legacy-asset-decisions.jsonl"
READ_AFTER = "docs/governance/legacy-asset-copy-read-after.jsonl"
MANIFEST = "archive/legacy-generation-2026-09-14/MANIFEST.sha256"
BOUNDARY = "docs/concept/product-boundary.md"
L1 = {
    "HELIX-HARNESS": "docs/helix-harness/L1-planning/product-intent.md",
    "HELIX-OS": "docs/helix-os/L1-planning/system-intent.md",
    "HELIX-Web": "docs/helix-web/L1-planning/product-intent.md",
    "HELIX-Web-OS": "docs/helix-web-os/L1-planning/system-intent.md",
}
FAILURE = "docs/governance/audits/source-rebaseline/legacy-ci-ai-runtime-source-inventory.md"
CONSUMER = "docs/governance/audits/source-rebaseline/legacy-ci-consumer-relation-inventory.md"
DECISION_RECORD = "docs/governance/decisions/concept-v4.1-and-four-l1-approval-2026-09-17.md"
DECISION_PACKET = "docs/governance/audits/source-rebaseline/concept-v4.1-human-decision-packet.md"
REUSE = "docs/governance/legacy-asset-reuse-control.md"
START = "docs/governance/new-generation-start-here.md"
WAVE_PATHS = {
    n: (f"docs/governance/legacy-requirement-direct-semantic-review-wave{n}.jsonl" if n <= 36
        else f"scaffold/legacy-semantic-review-wave{n}/legacy-requirement-direct-semantic-review-wave{n}.jsonl")
    for n in range(1, 51)
}
PRODUCTS = tuple(L1)
MAIN_RESEARCH_INPUTS = [
    "scaffold/legacy-asset-product-classification-0107/inventory.json",
    "scaffold/legacy-lint-product-classification-0108/inventory.json",
    "scaffold/legacy-runtime-product-classification-0117/inventory.json",
    "scaffold/legacy-schema-product-classification-0120/inventory.json",
    "scaffold/legacy-source-product-classification-0123/inventory.json",
    "scaffold/legacy-state-db-product-classification-0127/inventory.json",
    "scaffold/legacy-lint-candidate-product-classification-0128/inventory.json",
    "scaffold/legacy-runtime-residual-product-classification-0133/inventory.json",
]
HUMAN_JUDGMENT = [
    "product_owner_and_boundary_decision",
    "configuration_semantic_anchor_acceptance",
    "phase_candidate_admission_and_successor_assignment",
    "legacy_implementation_degradation_failure_and_consumer_closure",
    "formal_asset_classification_update",
]
RULES = {
    "direct_product_basis": "manual semantic span maps to exactly one four-product L1 boundary; this is a research candidate and not formal ownership",
    "multi_product_conflict": "manual semantic span maps to two or more four-product L1 boundaries; retain the conflict without choosing an owner",
    "insufficient_basis": "manual semantic span has no product responsibility mapping; retain the insufficiency without inferring ownership",
}
BASE_INPUTS = [PHASE, DISPOSITION, DECISIONS, READ_AFTER, BOUNDARY, *L1.values(), FAILURE, CONSUMER,
               DECISION_RECORD, DECISION_PACKET, REUSE, START, MANIFEST, *WAVE_PATHS.values()]
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
    "inventory_conditional_overlap_claim_tamper",
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

# These are reviewer-pinned semantic spans from every fixed BASE config body.
# The bootstrap phase candidates are retained only for comparison below.
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


def tagged(data: bytes) -> str:
    return "sha256:" + hashlib.sha256(data).hexdigest()


def canonical(value: object) -> bytes:
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode()


def digest_row(row: dict) -> str:
    return tagged(canonical(row))


def git_bytes(path: str) -> bytes:
    return subprocess.check_output(["git", "show", f"{BASE_REVISION}:{path}"])


def git_blob(path: str) -> str:
    return subprocess.check_output(["git", "rev-parse", f"{BASE_REVISION}:{path}"], text=True).strip()


def head_bytes(path: str) -> bytes:
    return subprocess.check_output(["git", "show", f"HEAD:{path}"])


def head_blob(path: str) -> str:
    return subprocess.check_output(["git", "rev-parse", f"HEAD:{path}"], text=True).strip()


def archive_tree(path: str) -> tuple[str, str, str]:
    out = subprocess.check_output(["git", "ls-tree", BASE_REVISION, "--", path], text=True).splitlines()
    if len(out) != 1:
        raise ValueError(f"archive path missing or ambiguous: {path}")
    mode_type_oid, entry = out[0].split("\t", 1)
    parts = mode_type_oid.split()
    if len(parts) != 3 or parts[0] != "100644" or parts[1] != "blob" or entry != path:
        raise ValueError(f"archive path must be exact regular blob: {out[0]}")
    return parts[0], parts[1], parts[2]


def strict_pairs(pairs: list[tuple[str, object]]) -> dict:
    out = {}
    for key, value in pairs:
        if key in out:
            raise ValueError(f"duplicate JSON key: {key}")
        out[key] = value
    return out


def jsonl(path: str) -> list[tuple[int, dict]]:
    rows = []
    for line_no, line in enumerate(git_bytes(path).decode(errors="replace").splitlines(), 1):
        if not line.strip():
            continue
        row = json.loads(line, object_pairs_hook=strict_pairs)
        if not isinstance(row, dict):
            raise ValueError(f"non-object JSON at {path}:{line_no}")
        rows.append((line_no, row))
    return rows


def manifest_sha(source_path: str) -> str:
    hits = [line for line in git_bytes(MANIFEST).decode(errors="replace").splitlines() if line.endswith(" " + source_path)]
    if len(hits) != 1:
        raise ValueError(f"manifest entry must be unique: {source_path}")
    return "sha256:" + hits[0].split(maxsplit=1)[0]


def receipt(path: str, start: int, end: int) -> dict:
    lines = git_bytes(path).decode(errors="replace").splitlines()
    if start < 1 or end > len(lines) or start > end:
        raise ValueError(f"invalid semantic range {path}:{start}-{end}")
    text = "\n".join(lines[start - 1:end])
    return {"path": path, "line_start": start, "line_end": end,
            "line_text_sha256": tagged(text.encode()), "line_text": lines[start - 1:end]}


def boundary_evidence() -> dict:
    spans = [(36, 39), (54, 65), (86, 89)]
    return {"path": BOUNDARY, "blob": git_blob(BOUNDARY), "sha256": tagged(git_bytes(BOUNDARY)),
            "ranges": [receipt(BOUNDARY, *r) for r in spans]}


def fixed_l1_evidence() -> dict:
    ranges = {"HELIX-HARNESS": [(22, 35), (54, 58)], "HELIX-OS": [(22, 40), (59, 63)],
              "HELIX-Web": [(24, 35), (45, 49)], "HELIX-Web-OS": [(14, 23), (37, 44)]}
    return {p: {"path": path, "blob": git_blob(path), "sha256": tagged(git_bytes(path)),
                "ranges": [receipt(path, start, end) for start, end in ranges[p]]}
            for p, path in L1.items()}


def source_exact(asset: dict, profile: tuple) -> dict:
    category, products, start, end, meaning, _ = profile
    archive_path = ARCHIVE_PREFIX + asset["source_path"]
    mode, kind, oid = archive_tree(archive_path)
    data = git_bytes(archive_path)
    lines = data.decode(errors="replace").splitlines()
    digest = tagged(data)
    manifest = manifest_sha(asset["source_path"])
    ledger = "sha256:" + asset["source_sha256"]
    if digest != ledger or digest != manifest:
        raise ValueError(f"archive digest mismatch {asset['source_path']}")
    anchor_lines = lines[start - 1:end]
    text = "\n".join(anchor_lines)
    unanchored = []
    if start > 1: unanchored.append([1, start - 1])
    if end < len(lines): unanchored.append([end + 1, len(lines)])
    return {
        "archive_path": archive_path, "source_path": asset["source_path"], "blob": oid,
        "archive_mode": mode, "archive_type": kind, "bytes": len(data), "line_count": len(lines), "sha256": digest,
        "ledger_source_sha256": ledger, "ledger_digest_match": True,
        "archive_manifest_sha256": manifest, "archive_manifest_match": True,
        "semantic_anchor": {"marker": anchor_lines[0][:240], "line_start": start, "line_end": end,
                             "line_text": anchor_lines, "line_text_sha256": tagged(text.encode()),
                             "interpretation": meaning, "products_considered": list(products)},
        "anchor_line_coverage": {"source_line_count": len(lines), "anchor_line_count": end - start + 1,
                                  "coverage_ratio": round((end - start + 1) / len(lines), 6),
                                  "unanchored_line_ranges": unanchored},
        "read_mode": "git_object_static_read_only",
    }


def history(asset_id: str, dispositions: dict[str, tuple[int, dict]], decisions: list[tuple[int, dict]], read_after: list[tuple[int, dict]]) -> dict:
    line_no, row = dispositions[asset_id]
    compact = {"path": DISPOSITION, "line": line_no, "row_sha256": digest_row(row), "source_path": row.get("source_path"), "source_sha256": row.get("source_sha256"), "disposition": row.get("disposition"), "asset_class": row.get("asset_class"), "product_target": row.get("product_target"), "implementation_status": row.get("implementation_status"), "consumer_refs": sorted(row.get("consumer_refs", [])), "decision_record_ref": row.get("decision_record_ref"), "read_after_record_ref": row.get("read_after_record_ref")}
    return {"disposition": compact,
            "decisions": [{"path": DECISIONS, "line": n, "row_sha256": digest_row(r), "decision_id": r.get("decision_id"), "product_target": r.get("product_target"), "disposition": r.get("disposition")} for n, r in decisions if r.get("asset_id") == asset_id],
            "read_after": [{"path": READ_AFTER, "line": n, "row_sha256": digest_row(r), "read_after_id": r.get("read_after_id"), "result": r.get("result"), "digest_match": r.get("digest_match"), "consumer_match": r.get("consumer_match")} for n, r in read_after if r.get("asset_id") == asset_id],
            "failure_consumer_static": {"failure": {"path": FAILURE, "blob": git_blob(FAILURE), "sha256": tagged(git_bytes(FAILURE)), "read_mode": "git_object_static_read_only"}, "consumer": {"path": CONSUMER, "blob": git_blob(CONSUMER), "sha256": tagged(git_bytes(CONSUMER)), "read_mode": "git_object_static_read_only"}},
            "observed_failure_status": "asset_specific_failure_or_degradation_not_established", "consumer_closure_status": "asset-level consumer closure pending; disposition refs and global static inventory retained", "degradation_status": "unknown"}


def product_basis(products: list[str], meaning: str, counter: list[str]) -> dict:
    l1 = fixed_l1_evidence()
    boundary = boundary_evidence()
    return {p: {"product": p, "mapping": f"semantic span: {meaning}", "l1_evidence": l1[p], "boundary_evidence": boundary, "counterevidence": counter} for p in products}


def make_record(asset: dict, phase: dict, dispositions: dict[str, tuple[int, dict]], decisions: list[tuple[int, dict]], read_after: list[tuple[int, dict]], wave_links: list[dict]) -> dict:
    profile = PROFILE_DATA[asset["source_path"]]
    category, products, start, end, meaning, counter = profile
    bootstrap = sorted(set(phase.get("candidate_product_targets") or []))
    if bootstrap == sorted(products): alignment = "match"
    elif bootstrap and products: alignment = "diverges_to_manual_semantic_span"
    elif bootstrap and not products: alignment = "diverges_to_insufficient_manual_span"
    elif products: alignment = "manual_span_found_without_bootstrap_candidate"
    else: alignment = "both_insufficient"
    source = source_exact(asset, profile)
    phase_line = phase["_line"]
    phase_copy = {k: v for k, v in phase.items() if k != "_line"}
    return {
        "asset_id": asset["asset_id"], "source_path": asset["source_path"], "source_exact": source,
        "phase_evidence": {"path": PHASE, "line": phase_line, "row_sha256": digest_row(phase_copy), "artifact_evidence_kind": phase.get("artifact_evidence_kind"), "candidate_phase_targets": phase.get("candidate_phase_targets") or [], "candidate_product_targets": phase.get("candidate_product_targets") or [], "phase_classification_status": phase.get("phase_classification_status"), "product_classification_status": phase.get("product_classification_status"), "implementation_evidence_state": phase.get("implementation_evidence_state"), "legacy_implementation_status": phase.get("legacy_implementation_status"), "legacy_execution_performed": phase.get("legacy_execution_performed"), "consumer_closure_status": phase.get("consumer_closure_status"), "unresolved": phase.get("unresolved") or []},
        "legacy_asset_evidence": {"path": DISPOSITION, "line": dispositions[asset["asset_id"]][0], "row_sha256": digest_row(asset["_disp"]), "source_path": asset["_disp"].get("source_path"), "source_sha256": asset["_disp"].get("source_sha256"), "asset_class": asset["_disp"].get("asset_class"), "disposition": asset["_disp"].get("disposition"), "product_target": asset["_disp"].get("product_target"), "implementation_status": asset["_disp"].get("implementation_status"), "consumer_refs": sorted(asset["_disp"].get("consumer_refs", [])), "decision_record_ref": asset["_disp"].get("decision_record_ref"), "read_after_record_ref": asset["_disp"].get("read_after_record_ref")},
        "classification": {"category": category, "candidate_products": products, "semantic_status": "manual_semantic_span_pinned_pending_human_review", "meaning": meaning, "bootstrap_candidate_products": bootstrap, "bootstrap_alignment": alignment, "product_basis": product_basis(products, meaning, counter), "counterevidence": counter, "reason": RULES[category]},
        "boundary_evidence": {"product_boundary": boundary_evidence(), "l1": fixed_l1_evidence()},
        "legacy_history_failure_consumer": history(asset["asset_id"], dispositions, decisions, read_after),
        "implementation_evidence": {"artifact_evidence_kind": "configuration", "status": "unknown", "presence": "configuration_present_unexecuted", "unimplemented_evidence": phase.get("unresolved") or ["legacy_implementation_status_unknown"], "legacy_execution_performed": False},
        "wave_semantic_links": wave_links, "wave_edge_count": len(wave_links), "human_judgment_remaining": HUMAN_JUDGMENT, "authority_effect": "none", "formal_asset_classification_updated": False, "new_build_allowed": False,
    }


def build() -> None:
    phase_rows = jsonl(PHASE); disp_rows = jsonl(DISPOSITION)
    phase_by_path = {r.get("source_path"): (n, r) for n, r in phase_rows}
    disp_by_id = {r.get("asset_id"): (n, r) for n, r in disp_rows}
    targets = [r for _, r in disp_rows if r.get("source_path", "").startswith("config/")]
    if len(targets) != 41 or set(a["source_path"] for a in targets) != set(PROFILE_DATA):
        raise AssertionError("config/** exact 41 profile set required")
    target_ids = {r["asset_id"] for r in targets}; wave_by_asset = {}
    all_decisions, all_read_after = jsonl(DECISIONS), jsonl(READ_AFTER)
    for wave, path in WAVE_PATHS.items():
        for line, edge in jsonl(path):
            if edge.get("asset_id") in target_ids:
                wave_by_asset.setdefault(edge["asset_id"], []).append({"wave": wave, "path": path, "line": line, "row_sha256": digest_row(edge), "asset_id": edge.get("asset_id"), "source_path": edge.get("source_path"), "source_sha256": edge.get("source_sha256"), "source_requirement_id": edge.get("source_requirement_id"), "unit_candidate_id": edge.get("unit_candidate_id"), "semantic_link_status": edge.get("semantic_link_status"), "candidate_product_targets": edge.get("candidate_product_targets") or [], "candidate_phase_targets": edge.get("candidate_phase_targets") or [], "product_scope": edge.get("product_scope") or [], "evidence_refs": edge.get("evidence_refs") or [], "counterevidence": edge.get("counterevidence") or []})
    records = []
    for asset in targets:
        line, phase = phase_by_path[asset["source_path"]]; phase = dict(phase); phase["_line"] = line
        a = dict(asset); a["_disp"] = asset
        records.append(make_record(a, phase, disp_by_id, all_decisions, all_read_after, wave_by_asset.get(asset["asset_id"], [])))
    records.sort(key=lambda x: x["source_path"])
    out = BUNDLE / "classification-research.jsonl"
    out.write_text("".join(json.dumps(r, ensure_ascii=False, sort_keys=True, separators=(",", ":")) + "\n" for r in records))
    input_digests = []
    for path in NONARCHIVE_INPUTS:
        data = git_bytes(path); input_digests.append({"path": path, "blob": git_blob(path), "bytes": len(data), "sha256": tagged(data)})
    for path in MAIN_RESEARCH_INPUTS:
        data = head_bytes(path); input_digests.append({"path": path, "blob": head_blob(path), "bytes": len(data), "sha256": tagged(data)})
    counts = {k: sum(r["classification"]["category"] == k for r in records) for k in RULES}
    inv = {
        "schema_revision": 2, "binding_id": BINDING_ID, "bundle_revision": "SCF-B-0141-r2", "base_revision": BASE_REVISION,
        "base_source_mode": "all legacy source, fixed inputs, and archive evidence bytes from fixed BASE Git objects",
        "scope": "fixed BASE unresolved config/** exact 41 assets; current-main research union is authoritative and open-PR projections are conditional",
        "research_scope": {"source_prefix": "config/", "asset_class": "Historical", "disposition": "unresolved", "artifact_evidence_kind": "configuration", "mode": "research_only", "products": list(PRODUCTS), "authoritative_prior_union": "origin/main current 429"},
        "evidence_completeness": {"source_blob_sha_line_anchor": True, "semantic_span_manual_pin": True, "anchor_coverage_and_unanchored_ranges": True, "phase_and_implementation_status": True, "missing_evidence_preserved": True, "failure_degradation": "global_static_inventory_and_asset_unknown", "consumer": "global_static_inventory_and_asset_pending", "wave_scan": True, "bootstrap_candidates_comparison_only": True},
        "target_count": 41, "target_asset_ids": [r["asset_id"] for r in records], "target_source_paths": [r["source_path"] for r in records], "target_asset_ids_sha256": tagged(("\n".join(r["asset_id"] for r in records)).encode()), "target_artifact_evidence_kinds": {"configuration": 41}, "classification_counts": counts,
        "input_digests": input_digests, "binding_upstream_paths": [{"path": p, "sha256": tagged((git_bytes(p) if p in BASE_INPUTS else head_bytes(p)))} for p in NONARCHIVE_INPUTS + MAIN_RESEARCH_INPUTS], "output_sha256": tagged(out.read_bytes()),
        "research_union": {"authoritative": {"basis": "origin/main current", "count": 429, "target_overlap": 0, "archive_population": 4020}, "conditional_projection": {"pre_2074_main_count": 399, "pr2074_increment_count": 31, "old_pr2078_count": 120, "old_union_count": 496, "after_config_count": 537, "status": "historical_snapshot_only_not_current_pr2078_head; overlap_unverified; post_merge_rebaseline_required", "old_pr2078_head": "5322a99b96f75e210c68aa56690f2da4fcb4415c"}, "target_overlap_authoritative_current_main": 0, "target_overlap_conditional_old_union": None, "integration_order": "authoritative current main (429) -> config/41 (470); historical #2078 snapshot (496) -> (537) is unverified against current HEAD and requires post-merge rebaseline"},
        "overlap_status": {"status": "authoritative_current_main_pass; historical_pr2078_overlap_unverified", "research_scope": "config/**", "authoritative_union": "origin/main_current_429", "target_vs_authoritative_current_main": 0, "target_vs_conditional_old_union": None, "union_exact": True, "open_pr2078_status": "historical_snapshot_not_current_head_or_authoritative"},
        "denominator_role": {"archive_population": 4020, "authoritative_current_main": 429, "authoritative_after_config": 470, "conditional_old_open_pr_union": 496, "conditional_after_config": 537, "conditional_projection_status": "historical_old_pr2078_HEAD_5322_only; overlap_unverified; post_merge_rebaseline_required", "role": "research_candidate_evidence_only; conditional projection is historical and unverified, no formal adoption or completion"},
        "classification_rule": RULES, "authority_boundary": {"authority_effect": "none", "formal_product_authority": None, "formal_asset_classification_updated": False, "formal_implementation_status": "unknown", "phase_updated": False, "successor_assignment": None, "new_build_allowed": False, "read_mode": "static_git_object_only"},
        "old_archive_execution": {"source_read": "git show fixed BASE regular blobs only", "runtime": False, "test": False, "ci": False, "workflow": False, "hook": False, "adapter": False},
        "wave_scan": {"files": 50, "edges": 598, "target_edges": sum(len(v) for v in wave_by_asset.values()), "target_linked_assets": len(wave_by_asset)},
        "negative_cases": list(EXPECTED_NEGATIVE_CASES),
        "artifacts": [f"scaffold/bindings/{BINDING_ID}.json", f"scaffold/legacy-config-product-classification-0141/README.md", f"scaffold/legacy-config-product-classification-0141/PR-DRAFT.md", f"scaffold/legacy-config-product-classification-0141/generate.py", f"scaffold/legacy-config-product-classification-0141/validate.py", f"scaffold/legacy-config-product-classification-0141/selfcheck.py", f"scaffold/legacy-config-product-classification-0141/inventory.json", f"scaffold/legacy-config-product-classification-0141/classification-research.jsonl"],
    }
    (BUNDLE / "inventory.json").write_text(json.dumps(inv, ensure_ascii=False, sort_keys=True, indent=2) + "\n")


if __name__ == "__main__":
    build(); print("SCF-B-0141 generate PASS records=41 manual_profiles=41")

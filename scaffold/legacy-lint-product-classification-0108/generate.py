#!/usr/bin/env python3
"""Materialize SCF-B-0108 static research for unresolved src/lint assets."""
from __future__ import annotations

import hashlib
import json
import subprocess
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
BUNDLE = ROOT / "scaffold/legacy-lint-product-classification-0108"
BASE_REVISION = "5562f04da0f3205f9aa58205ec0d478419fc4f2e"
BINDING_ID = "SCF-B-0108"
ARCHIVE_PREFIX = "archive/legacy-generation-2026-09-14/root/"
PHASE = "docs/governance/legacy-asset-phase-product-classification-bootstrap.jsonl"
DISPOSITION = "docs/governance/legacy-asset-disposition.jsonl"
DECISIONS = "docs/governance/legacy-asset-decisions.jsonl"
READ_AFTER = "docs/governance/legacy-asset-copy-read-after.jsonl"
CROSSWALK = "docs/governance/legacy-requirement-implementation-crosswalk-bootstrap.jsonl"
DECOMPOSITION = "docs/governance/legacy-ir-product-unit-decomposition-bootstrap.jsonl"
BOUNDARY = "docs/concept/product-boundary.md"
L1 = {
    "HELIX-HARNESS": "docs/helix-harness/L1-planning/product-intent.md",
    "HELIX-OS": "docs/helix-os/L1-planning/system-intent.md",
    "HELIX-Web": "docs/helix-web/L1-planning/product-intent.md",
    "HELIX-Web-OS": "docs/helix-web-os/L1-planning/system-intent.md",
}
FAILURE_SOURCE = "docs/governance/audits/source-rebaseline/legacy-ci-ai-runtime-source-inventory.md"
CONSUMER_SOURCE = "docs/governance/audits/source-rebaseline/legacy-ci-consumer-relation-inventory.md"
WAVE_PATHS = {
    n: (f"docs/governance/legacy-requirement-direct-semantic-review-wave{n}.jsonl" if n <= 36 else f"scaffold/legacy-semantic-review-wave{n}/legacy-requirement-direct-semantic-review-wave{n}.jsonl")
    for n in range(1, 51)
}
GLOBAL_INPUTS = [
    PHASE, DISPOSITION, DECISIONS, READ_AFTER, CROSSWALK, DECOMPOSITION,
    BOUNDARY, *L1.values(), FAILURE_SOURCE, CONSUMER_SOURCE,
    "docs/governance/legacy-asset-decision-log.md",
    "docs/governance/legacy-asset-reuse-control.md",
    "docs/governance/new-generation-start-here.md",
    "archive/legacy-generation-2026-09-14/MANIFEST.sha256",
]

# These profiles are research judgments tied to source semantics. They are not
# product authority. A validator checks that every target uses exactly one
# profile and that the profile is supported by the fixed-base source anchor.
HARNESS_NAMES = {
    "cycle-p4-verification", "ddd-tdd-rules", "descent-obligation-types",
    "design-artifact-source-digest", "design-coverage", "doc-consistency",
    "entity-coverage", "fr-registry-audit", "fr-roadmap-coverage", "g1-trace",
    "g3-trace", "gate-confirm", "impl-plan-trace", "judgment-core-coverage",
    "l6-completion", "l6-fr-coverage", "l7-completion", "left-arm-carry-log",
    "merged-plan-status", "oracle-test-trace-baseline", "oracle-test-trace",
    "plan-artifact-existence", "plan-body-substance", "plan-compatibility-parent",
    "plan-completion-drift", "plan-descent", "plan-dod", "plan-entry-routing-legacy-input",
    "plan-entry-routing", "plan-number-uniqueness", "plan-specific-vpair-binding",
    "plan-supersession", "proposal-document-coverage", "roadmap-registry",
    "screen-impl-pair-freeze", "semantic-frontier-binding", "sub-doc-catalog-drift",
    "sub-doc-section-structure", "wcc-trace", "pr-scope-preflight",
}
OS_NAMES = {
    "allowlist-sync", "artifact-retirement-authority", "closure-authority-registry",
    "codex-hook-adapter-policy", "codex-hook-adapter", "codex-hook-trust",
    "cutover-source-ledger", "db-projection-coverage", "db-projection-ingestion",
    "dependency-drift", "drive-route-catalog", "evidence-file-substance",
    "gn-evidence-manifest", "green-command-digest", "issue-closure-graph",
    "l12-hybrid-inventory-lifecycle", "l12-hybrid-recognition", "lint-wiring",
    "module-drift", "outstanding-snapshot", "placeholder-deps", "propagation",
    "relation-graph-evidence", "relation-graph-types", "repository-name-paths",
    "requirements-doc-registry", "right-arm-gate-planning", "rule-automation-closure",
    "rule-drift", "runtime-portability", "s4-decision-readiness", "semantic-boundary",
    "source-boundary-policy", "source-edge-extractor", "source-ledger-freshness",
    "tool-adapter", "toolchain-pin", "tracked-canonical", "triage-decision-integrity",
    "verification-profile-catalog", "verification-profile-safety", "verification-profile-types",
    "verification-profile", "verifier-provider-mismatch", "version-up-bundle",
    "workflow-classification-catalog", "workflow-decision-packets", "issue-closure-graph", "skill-quality",
}
CONFLICT_NAMES = {
    "g8-integration-workflow", "g9-system-workflow", "g10-ux-workflow",
    "relation-graph", "relation-graph-evidence", "relation-graph-types", "scrum-reverse",
}
INSUFFICIENT_NAMES = {"effect-intent", "typescript-lazy"}

# Hand-reviewed source spans.  These are deliberately small and each is tied
# to a current L1 line plus an explicit counter-boundary.  All other assets
# remain pending; filename groups below are never used as ownership evidence.
MANUAL_REVIEWS = {
    "g1-trace": {"product": "HELIX-HARNESS", "start": 128, "end": 171, "l1": ("HELIX-HARNESS", 22, 24), "interpretation": "The source loads business, functional, screen, and L3 plan documents, extracts business/screen/P0 trace maps, reports orphan trace items and missing L3 requirements, and gates the result on zero findings; this is concrete HARNESS V-model trace enforcement.", "counter": (59, 61)},
    "g3-trace": {"product": "HELIX-HARNESS", "start": 1, "end": 5, "l1": ("HELIX-HARNESS", 22, 24), "interpretation": "The source explicitly enforces L1→L3→AC→AT bidirectional trace integrity, a HARNESS verification contract.", "counter": (59, 61)},
    "fr-registry-audit": {"product": "HELIX-HARNESS", "start": 1, "end": 12, "l1": ("HELIX-HARNESS", 22, 24), "interpretation": "The source audits the L1 functional registry for missing IDs, priorities, counts, and screen coverage, which is HARNESS requirement/design trace substance.", "counter": (59, 61)},
    "doc-consistency": {"product": "HELIX-HARNESS", "start": 1, "end": 12, "l1": ("HELIX-HARNESS", 22, 24), "interpretation": "The source automates document consistency through L3 carry, screen IDs, and NFR counts, matching HARNESS requirement/design trace obligations.", "counter": (59, 61)},
    "entity-coverage": {"product": "HELIX-HARNESS", "start": 1, "end": 4, "l1": ("HELIX-HARNESS", 22, 24), "interpretation": "The source checks L1 business entities against L3-derived entities, a HARNESS V-model domain trace contract.", "counter": (59, 61)},
    "plan-specific-vpair-binding": {"product": "HELIX-HARNESS", "start": 822, "end": 925, "l1": ("HELIX-HARNESS", 22, 24), "interpretation": "The source walks eligible plans and validates verification-binding schema, parent pairing, oracle declaration and test citation, generated-test coverage, test evidence, and duplicate oracle ownership; this is concrete HARNESS plan-to-verification pairing enforcement.", "counter": (59, 61)},
    "wcc-trace": {"product": "HELIX-HARNESS", "start": 1, "end": 10, "l1": ("HELIX-HARNESS", 22, 24), "interpretation": "The source enforces Worker Common Contract L3↔L10 exact trace, a HARNESS contract-to-acceptance obligation.", "counter": (59, 61)},
    "sub-doc-section-structure": {"product": "HELIX-HARNESS", "start": 1, "end": 10, "l1": ("HELIX-HARNESS", 54, 58), "interpretation": "The source enforces L4 standard deliverable sections and explicitly treats the harness as the source of the design contract.", "counter": (59, 61)},
    "artifact-retirement-authority": {"product": "HELIX-OS", "start": 16, "end": 22, "l1": ("HELIX-OS", 22, 25), "interpretation": "The source models typed retirement authority, approval decision, and artifact disposition, matching OS authority and operational control.", "counter": (59, 63)},
    "closure-authority-registry": {"product": "HELIX-OS", "start": 22, "end": 30, "l1": ("HELIX-OS", 22, 25), "interpretation": "The source analyzes closure authority registry drift and fail-closed authority state, matching OS control responsibility.", "counter": (59, 63)},
    "db-projection-ingestion": {"product": "HELIX-OS", "start": 14, "end": 31, "l1": ("HELIX-OS", 22, 25), "interpretation": "The source defines automatic graph, dependency, trace, snapshot, and verification projection tables, matching OS state/projection management.", "counter": (59, 63)},
    "codex-hook-trust": {"product": "HELIX-OS", "start": 43, "end": 59, "l1": ("HELIX-OS", 22, 25), "interpretation": "The source filters project hooks, rejects empty unmanaged hook sets, checks trusted status, and records current digests, matching OS execution authority and evidence control.", "counter": (59, 63)},
    "verification-profile-safety": {"product": "HELIX-OS", "start": 63, "end": 88, "l1": ("HELIX-OS", 22, 25), "interpretation": "The source validates generated MCP config mounts and rejects committed editor writes, matching OS verification execution safety control.", "counter": (59, 63)},
    "verifier-provider-mismatch": {"product": "HELIX-OS", "start": 4, "end": 16, "l1": ("HELIX-OS", 22, 25), "interpretation": "The source inspects Worker/verifier provider state and fallback evidence in the loop, matching OS Worker and state control.", "counter": (59, 63)},
}

BOUNDARY_RANGES = {
    "HELIX-HARNESS": [(36, 36), (54, 61), (86, 89)],
    "HELIX-OS": [(37, 37), (55, 65), (86, 89)],
    "HELIX-Web": [(38, 38), (56, 56), (63, 70)],
    "HELIX-Web-OS": [(39, 39), (57, 57), (63, 70)],
}
L1_RANGES = {
    "HELIX-HARNESS": [(22, 24), (54, 58)],
    "HELIX-OS": [(22, 25), (59, 63)],
    "HELIX-Web": [(24, 26), (47, 49)],
    "HELIX-Web-OS": [(14, 15), (39, 44)],
}
FAILURE_RANGES = [(17, 23), (52, 63)]
CONSUMER_RANGES = [(24, 36), (38, 50)]
PRODUCTS = {"HELIX-HARNESS", "HELIX-OS", "HELIX-Web", "HELIX-Web-OS"}


def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def tagged(data: bytes) -> str:
    return "sha256:" + sha(data)


def canonical(value: object) -> str:
    return tagged(json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode())


def git_bytes(path: str) -> bytes:
    return subprocess.check_output(["git", "show", f"{BASE_REVISION}:{path}"])


def git_blob(path: str) -> str:
    return subprocess.check_output(["git", "rev-parse", f"{BASE_REVISION}:{path}"], text=True).strip()


def read_jsonl(path: str) -> list[tuple[int, dict]]:
    return [(i, json.loads(line)) for i, line in enumerate(git_bytes(path).decode().splitlines(), 1) if line.strip()]


def row_digest(row: dict) -> str:
    return canonical(row)


def range_receipt(path: str, start: int, end: int) -> dict:
    lines = git_bytes(path).decode(errors="replace").splitlines()
    if not (1 <= start <= end <= len(lines)):
        raise AssertionError(f"range outside source: {path}:{start}-{end}")
    text = "\n".join(lines[start - 1:end])
    return {
        "path": path, "blob": git_blob(path), "line_start": start, "line_end": end,
        "line_count": end - start + 1, "line_text_sha256": tagged(text.encode()),
        "line_text": lines[start - 1:end],
    }


def boundary_receipts() -> dict:
    return {product: {"path": BOUNDARY, "blob": git_blob(BOUNDARY), "ranges": [range_receipt(BOUNDARY, *r) for r in ranges]}
            for product, ranges in BOUNDARY_RANGES.items()}


def l1_receipts() -> dict:
    return {product: {"path": path, "blob": git_blob(path), "ranges": [range_receipt(path, *r) for r in L1_RANGES[product]]}
            for product, path in L1.items()}


def compact_crosswalk(row: dict, line: int) -> dict:
    fields = ["crosswalk_id", "source_requirement_id", "unit_candidate_id", "product_scope", "responsibility_summary", "direct_legacy_asset_link_status", "phase_classification_status", "direct_phase_candidates", "current_requirement_implementation_status", "legacy_requirement_implementation_status", "consumer_closure_status", "successor_assignment_status", "legacy_execution_performed", "new_build_allowed", "authority_effect", "unresolved"]
    out = {k: row.get(k) for k in fields}
    out.update({"path": CROSSWALK, "line": line, "row_sha256": row_digest(row)})
    return out


def compact_decomp(parent: dict, unit: dict, line: int) -> dict:
    return {"path": DECOMPOSITION, "line": line, "decomposition_id": parent.get("decomposition_id"), "source_requirement_id": parent.get("source_requirement_id"), "unit_candidate_id": unit.get("unit_candidate_id"), "unit_kind": unit.get("unit_kind"), "product_target": unit.get("product_target"), "direct_phase_candidates": unit.get("direct_phase_candidates"), "phase_classification_status": unit.get("phase_classification_status"), "semantic_coverage_status": unit.get("semantic_coverage_status"), "authority_effect": unit.get("authority_effect"), "row_sha256": canonical({"parent": parent.get("source_requirement_id"), "unit": unit})}


def history_receipt(asset_id: str, dispositions: dict, decisions: list[tuple[int, dict]], read_afters: list[tuple[int, dict]]) -> dict:
    line, row = dispositions[asset_id]
    return {
        "disposition": {"path": DISPOSITION, "line": line, "row_sha256": row_digest(row), "asset_id": asset_id, "revision": row.get("revision"), "disposition": row.get("disposition"), "asset_class": row.get("asset_class"), "product_target": row.get("product_target"), "authority_status": row.get("authority_status"), "implementation_status": row.get("implementation_status"), "consumer_refs": sorted(row.get("consumer_refs", [])), "decision_record_ref": row.get("decision_record_ref"), "read_after_record_ref": row.get("read_after_record_ref")},
        "decisions": [{"path": DECISIONS, "line": n, "row_sha256": row_digest(r), "decision_id": r.get("decision_id"), "disposition": r.get("disposition"), "product_target": r.get("product_target"), "consumer_refs": sorted(r.get("consumer_refs", []))} for n, r in decisions if r.get("asset_id") == asset_id],
        "read_after": [{"path": READ_AFTER, "line": n, "row_sha256": row_digest(r), "read_after_id": r.get("read_after_id"), "result": r.get("result"), "digest_match": r.get("digest_match"), "consumer_match": r.get("consumer_match"), "failure": r.get("failure"), "consumer_refs_observed": sorted(r.get("consumer_refs_observed", []))} for n, r in read_afters if r.get("asset_id") == asset_id],
        "state_boundary": "disposition remains unresolved; decision/read-after rows are preserved as historical evidence and do not confer product authority",
    }


def profile_for(name: str) -> tuple[str, list[str], str]:
    # Filename groupings are search seeds only.  Until a reviewer accepts a
    # concrete source span against product-boundary text, they cannot produce a
    # product candidate or a conflict classification.
    if name not in HARNESS_NAMES | OS_NAMES | CONFLICT_NAMES | INSUFFICIENT_NAMES:
        raise AssertionError(f"unprofiled source {name}")
    return "insufficient_basis", [], "The filename grouping is a research seed only; no concrete source span has yet been accepted as a product-boundary proof."


def source_anchor(path: str, profile: str, products: list[str], manual: dict | None = None) -> dict:
    lines = git_bytes(path).decode(errors="replace").splitlines()
    if manual:
        start, end = manual["start"], manual["end"]
        text = "\n".join(lines[start - 1:end])
        return {"line_start": start, "line_end": end, "line_text": lines[start - 1:end], "line_text_sha256": tagged(text.encode()), "interpretation": manual["interpretation"], "products_considered": [manual["product"]]}
    candidates: list[tuple[int, int]] = []
    for i, line in enumerate(lines, 1):
        low = line.lower()
        if line.lstrip().startswith(("/**", "*", "//")) and not line.lstrip().startswith("*/"):
            score = 3 if ("plan" in low or "requirement" in low or "authority" in low or "adapter" in low) else 1
            candidates.append((score, i))
    if candidates:
        _, start = max(candidates, key=lambda x: (x[0], -x[1]))
    else:
        start = next((i for i, line in enumerate(lines, 1) if line.strip() and not line.lstrip().startswith(("import ", "from "))), 1)
    end = min(len(lines), start + (2 if lines[start - 1].lstrip().startswith(("/**", "*", "//")) else 1))
    text = "\n".join(lines[start - 1:end])
    interpretation = "source context is preserved for human semantic review; this span does not prove a product owner"
    return {"line_start": start, "line_end": end, "line_text": lines[start - 1:end], "line_text_sha256": tagged(text.encode()), "interpretation": interpretation, "products_considered": products}


def archive_source(asset: dict, profile: str, products: list[str], manual: dict | None = None) -> dict:
    archive_path = ARCHIVE_PREFIX + asset["source_path"]
    data = git_bytes(archive_path)
    if sha(data) != asset["source_sha256"]:
        raise AssertionError(f"source digest mismatch for {asset['asset_id']}")
    anchor = source_anchor(archive_path, profile, products, manual)
    return {"archive_path": archive_path, "source_path": asset["source_path"], "blob": git_blob(archive_path), "bytes": len(data), "line_count": len(data.decode(errors="replace").splitlines()), "sha256": tagged(data), "ledger_source_sha256": "sha256:" + asset["source_sha256"], "semantic_anchors": [anchor], "read_mode": "git_object_static_read_only"}


def wave_link(item: tuple[int, str, int, dict]) -> dict:
    wave, path, line, row = item
    edge_base = {"wave": wave, "path": path, "line": line, "asset_id": row["asset_id"], "unit_candidate_id": row.get("unit_candidate_id"), "semantic_link_status": row.get("semantic_link_status")}
    return {"edge_id": canonical(edge_base), "wave": wave, "path": path, "line": line, "row_sha256": row_digest(row), "asset_id": row["asset_id"], "source_requirement_id": row.get("source_requirement_id"), "artifact_evidence_kind": row.get("artifact_evidence_kind"), "unit_candidate_id": row.get("unit_candidate_id"), "semantic_link_status": row.get("semantic_link_status"), "semantic_relation": row.get("semantic_relation"), "candidate_product_targets": row.get("candidate_product_targets") or [], "product_scope": row.get("product_scope") or [], "candidate_phase_targets": row.get("candidate_phase_targets") or [], "source_path": row.get("source_path"), "source_sha256": row.get("source_sha256"), "source_statement_semantic_digest": row.get("source_statement_semantic_digest"), "source_statement_text": row.get("source_statement_text"), "source_text_spans": row.get("source_text_spans") or [], "evidence_refs": row.get("evidence_refs") or [], "legacy_asset_evidence_state": row.get("legacy_asset_evidence_state"), "legacy_execution_status": row.get("legacy_execution_status"), "consumer_closure_status": row.get("consumer_closure_status"), "observed_consumer_refs": row.get("observed_consumer_refs") or [], "counterevidence": row.get("counterevidence") or [], "unresolved": row.get("unresolved") or [], "product_alignment_status": row.get("product_alignment_status"), "authority_effect": row.get("authority_effect"), "new_build_allowed": row.get("new_build_allowed")}


def make_record(asset_id: str, phase_item: tuple[int, dict], asset_item: tuple[int, dict], wave_items: list[tuple[int, str, int, dict]], cw: dict, decomp: dict, decisions: list[tuple[int, dict]], read_afters: list[tuple[int, dict]], dispositions: dict, boundary: dict, l1: dict) -> dict:
    phase_line, phase = phase_item
    asset_line, asset = asset_item
    name = asset["source_path"].rsplit("/", 1)[-1].removesuffix(".ts")
    base_category, source_products, base_reason = profile_for(name)
    manual = MANUAL_REVIEWS.get(name)
    links = [wave_link(x) for x in wave_items]
    wave_products = sorted({p for link in links for p in (link.get("candidate_product_targets") or []) + (link.get("product_scope") or [])})
    # Wave unit scope is retained as observed evidence only.  It cannot turn a
    # filename seed into an asset candidate or conflict.
    if manual:
        category, products = "direct_product_basis", [manual["product"]]
        reason = manual["interpretation"] + " Candidate only; formal product authority remains unresolved."
    else:
        category, products, reason = "insufficient_basis", [], base_reason
    unit_ids = sorted({link["unit_candidate_id"] for link in links if link.get("unit_candidate_id")})
    units = [{"unit_candidate_id": uid, "crosswalk": cw[uid], "decomposition": decomp[uid]} for uid in unit_ids]
    phase_receipt = {"path": PHASE, "line": phase_line, "row_sha256": row_digest(phase), "product_classification_status": phase.get("product_classification_status"), "candidate_product_targets": phase.get("candidate_product_targets") or [], "candidate_phase_targets": phase.get("candidate_phase_targets") or [], "source_path": phase.get("source_path"), "source_sha256": phase.get("source_sha256"), "consumer_closure_status": phase.get("consumer_closure_status")}
    asset_receipt = {"path": DISPOSITION, "line": asset_line, "row_sha256": row_digest(asset), "source_path": asset.get("source_path"), "source_sha256": asset.get("source_sha256"), "disposition": asset.get("disposition"), "product_target": asset.get("product_target"), "authority_status": asset.get("authority_status"), "implementation_status": asset.get("implementation_status"), "consumer_refs": sorted(asset.get("consumer_refs", []))}
    return {
        "asset_id": asset_id, "classification_category": category, "classification_reason": reason, "classification_state": "research_proposal_pending_human_product_review", "authority_effect": "none", "formal_asset_classification_updated": False, "new_build_allowed": False,
        "source_profile": {"name": name, "base_category": base_category, "source_products": source_products, "wave_products": wave_products, "profile_reason": base_reason, "semantic_review_status": "reviewed_candidate" if manual else "source_semantic_review_pending"},
        "phase_ledger": phase_receipt, "asset_ledger": asset_receipt, "source_exact": archive_source(asset, base_category, source_products, manual),
        "wave_semantic_links": sorted(links, key=lambda x: (x["wave"], x["line"], x["edge_id"])), "unit_product_candidates": units,
        "candidate_products": products, "observed_wave_products": wave_products, "semantic_link_statuses": sorted({x.get("semantic_link_status") for x in links}), "artifact_evidence_kinds": sorted({x.get("artifact_evidence_kind") for x in links}) if links else ["implementation_source"],
        "legacy_history_failure_consumer": history_receipt(asset_id, dispositions, decisions, read_afters), "boundary_evidence": boundary, "l1_evidence": l1,
        "manual_semantic_review": ({
            "status": "reviewed_candidate",
            "source_span": source_anchor(ARCHIVE_PREFIX + asset["source_path"], base_category, source_products, manual),
            "candidate_product": manual["product"],
            "l1_product": manual["l1"][0],
            "l1_evidence": range_receipt(L1[manual["l1"][0]], manual["l1"][1], manual["l1"][2]),
            "interpretation": manual["interpretation"],
            "boundary_counterevidence": range_receipt(BOUNDARY, manual["counter"][0], manual["counter"][1]),
            "consumer_boundary": {"status": "pending", "interpretation": "legacy consumer relation is retained as a pending closure boundary; no direct semantic link is accepted", "refs": [range_receipt(CONSUMER_SOURCE, *r) for r in CONSUMER_RANGES]},
        } if manual else {
            "status": "source_semantic_review_pending",
            "source_span": source_anchor(ARCHIVE_PREFIX + asset["source_path"], base_category, source_products),
            "candidate_product": None,
            "l1_product": None,
            "l1_evidence": None,
            "interpretation": "filename seed and source context retained; concrete product-boundary mapping, counterevidence, and consumer closure have not been accepted",
            "boundary_counterevidence": None,
            "consumer_boundary": {"status": "pending", "interpretation": "consumer relation remains unreviewed", "refs": [range_receipt(CONSUMER_SOURCE, *r) for r in CONSUMER_RANGES]},
        }),
        "failure_consumer_static_refs": {"failure": {"path": FAILURE_SOURCE, "blob": git_blob(FAILURE_SOURCE), "ranges": [range_receipt(FAILURE_SOURCE, *r) for r in FAILURE_RANGES]}, "consumer": {"path": CONSUMER_SOURCE, "blob": git_blob(CONSUMER_SOURCE), "ranges": [range_receipt(CONSUMER_SOURCE, *r) for r in CONSUMER_RANGES]}},
        "human_judgment_remaining": ["product_owner_and_boundary_decision", "source_semantic_anchor_acceptance", "phase_admission_and_successor_assignment", "legacy_consumer_closure_and_failure_disposition", "formal_asset_classification_update"],
    }


def build() -> None:
    BUNDLE.mkdir(parents=True, exist_ok=True)
    wave_rows = []
    for wave, path in WAVE_PATHS.items():
        wave_rows.extend((wave, path, line, row) for line, row in read_jsonl(path))
    by_asset: defaultdict[str, list] = defaultdict(list)
    for item in wave_rows: by_asset[item[3]["asset_id"]].append(item)
    phase_by_asset = {row["asset_id"]: (line, row) for line, row in read_jsonl(PHASE)}
    disposition_by_asset = {row["asset_id"]: (line, row) for line, row in read_jsonl(DISPOSITION)}
    decisions, read_afters = read_jsonl(DECISIONS), read_jsonl(READ_AFTER)
    cw = {row["unit_candidate_id"]: compact_crosswalk(row, line) for line, row in read_jsonl(CROSSWALK)}
    decomp: dict = {}
    for line, parent in read_jsonl(DECOMPOSITION):
        for unit in parent.get("candidate_units", []): decomp[unit["unit_candidate_id"]] = compact_decomp(parent, unit, line)
    targets = sorted(a for a, (line, row) in phase_by_asset.items() if row.get("product_classification_status") == "unresolved" and row.get("artifact_evidence_kind") == "implementation_source" and row.get("source_path", "").startswith("src/lint/"))
    if len(targets) != 95: raise AssertionError(f"expected 95 target assets, got {len(targets)}")
    if any(a not in disposition_by_asset for a in targets): raise AssertionError("target absent from disposition ledger")
    boundary, l1 = boundary_receipts(), l1_receipts()
    records = [make_record(a, phase_by_asset[a], disposition_by_asset[a], by_asset.get(a, []), cw, decomp, decisions, read_afters, disposition_by_asset, boundary, l1) for a in targets]
    out = BUNDLE / "classification-research.jsonl"
    out.write_text("".join(json.dumps(r, ensure_ascii=False, sort_keys=True, separators=(",", ":")) + "\n" for r in records))
    source_paths = [ARCHIVE_PREFIX + phase_by_asset[a][1]["source_path"] for a in targets]
    input_paths = [*WAVE_PATHS.values(), *GLOBAL_INPUTS, *source_paths]
    if len(input_paths) != len(set(input_paths)): raise AssertionError("input path list duplicated")
    input_digests = [{"path": p, "blob": git_blob(p), "bytes": len(git_bytes(p)), "sha256": tagged(git_bytes(p))} for p in input_paths]
    category_counts = Counter(r["classification_category"] for r in records)
    category_counts = Counter({key: category_counts.get(key, 0) for key in ("direct_product_basis", "multi_product_conflict", "insufficient_basis")})
    wave_status_counts = Counter(r["semantic_link_statuses"][0] for r in records if r["semantic_link_statuses"])
    inventory = {
        "schema_revision": 1, "binding_id": BINDING_ID, "base_revision": BASE_REVISION, "base_source_mode": "all input and archive evidence bytes from fixed BASE Git objects",
        "scope": "phase product unresolved + implementation_source + src/lint/ exact 95 assets",
        "wave_source_paths": WAVE_PATHS,
        "counts": {"wave_files": 50, "wave_edges": len(wave_rows), "wave_unique_assets": len(by_asset), "target_assets": len(records), "target_wave_edges": sum(len(r["wave_semantic_links"]) for r in records), "target_wave_linked_assets": sum(bool(r["wave_semantic_links"]) for r in records), "categories": dict(sorted(category_counts.items())), "artifact_evidence_kinds": {"implementation_source": 95}},
        "review_counts": {"source_semantic_reviewed": sum(r["manual_semantic_review"]["status"] == "reviewed_candidate" for r in records), "source_semantic_review_pending": sum(r["manual_semantic_review"]["status"] == "source_semantic_review_pending" for r in records), "direct_candidate_basis": sum(r["classification_category"] == "direct_product_basis" for r in records), "multi_product_conflict": sum(r["classification_category"] == "multi_product_conflict" for r in records), "insufficient_basis": sum(r["classification_category"] == "insufficient_basis" for r in records)},
        "expected_sets": {"target_asset_count": 95, "target_asset_ids": targets, "target_asset_ids_sha256": tagged("\n".join(targets).encode()), "source_paths": [phase_by_asset[a][1]["source_path"] for a in targets]},
        "input_digests": input_digests,
        "old_asset_source_mode": "archive bytes are read through git show BASE:<archive-path>; never executed",
        "formal_update": {"formal_asset_classification_updated": False, "phase_ledger_updated": False, "product_route_updated": False, "successor_updated": False, "new_build_allowed": False, "authority_effect": "none"},
        "classification_rule": {"direct_product_basis": "a manually reviewed concrete source span mapped to one product L1 with explicit counter-boundary and pending consumer evidence", "multi_product_conflict": "requires separately reviewed source spans proving two product boundaries (none admitted in this bundle)", "insufficient_basis": "filename seed, generic declaration, or unresolved Wave unit scope without accepted product-boundary proof"},
        "manual_reviewed_asset_ids": [r["asset_id"] for r in records if r["manual_semantic_review"]["status"] == "reviewed_candidate"],
        "negative_cases": ["target_record_omission", "target_record_duplicate", "edge_omission", "edge_duplicate", "source_digest_tamper", "source_line_text_digest_tamper", "source_profile_tamper", "candidate_product_tamper", "authority_promotion", "boundary_line_digest_tamper", "input_digest_omission", "input_digest_duplicate", "input_digest_extra_path", "manual_semantic_review_tamper", "manual_review_inventory_tamper", "record_top_level_extra_key", "source_read_mode_tamper", "inventory_authority_promotion", "inventory_scope_tamper", "inventory_formal_update_tamper", "inventory_classification_rule_tamper", "fixed_BASE_non_ancestor"],
        "boundary_refs": {"product_boundary": BOUNDARY, "l1": L1}, "history_failure_consumer": {"disposition_rows": 95, "decision_rows_for_targets": sum(bool(r["legacy_history_failure_consumer"]["decisions"]) for r in records), "read_after_rows_for_targets": sum(bool(r["legacy_history_failure_consumer"]["read_after"]) for r in records), "failure_consumer_refs_are_static_global_inventory": True},
        "edge_contract": {"edge_identity": "edge_id derived from wave/path/line/asset_id/unit_candidate_id/semantic_link_status", "duplicate_edges_forbidden": True, "missing_edges_forbidden": True},
        "authority_boundary": {"authority_effect": "none", "classification_state": "research_proposal_pending_human_product_review", "formal_asset_classification_updated": False, "new_build_allowed": False},
        "artifacts": ["scaffold/bindings/SCF-B-0108.json", "scaffold/legacy-lint-product-classification-0108/README.md", "scaffold/legacy-lint-product-classification-0108/PR-DRAFT.md", "scaffold/legacy-lint-product-classification-0108/generate.py", "scaffold/legacy-lint-product-classification-0108/validate.py", "scaffold/legacy-lint-product-classification-0108/selfcheck.py", "scaffold/legacy-lint-product-classification-0108/inventory.json", "scaffold/legacy-lint-product-classification-0108/classification-research.jsonl"],
        "output_sha256": tagged(out.read_bytes()),
    }
    # Keep counts JSON-native and deterministic; phase candidate distribution is
    # useful inventory context but never a product authority.
    phase_dist = Counter(tuple(phase_by_asset[a][1].get("candidate_phase_targets") or []) for a in targets)
    inventory["counts"]["target_phase_candidate_distribution"] = {"|".join(k): v for k, v in sorted(phase_dist.items())}
    (BUNDLE / "inventory.json").write_text(json.dumps(inventory, ensure_ascii=False, sort_keys=True, indent=2) + "\n")


if __name__ == "__main__":
    build()

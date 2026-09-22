#!/usr/bin/env python3
"""Fail-closed validator for SCF-B-0108."""
from __future__ import annotations

import hashlib
import json
import subprocess
from collections import Counter, defaultdict
from pathlib import Path
from functools import lru_cache


ROOT = Path(__file__).resolve().parents[2]
BUNDLE = ROOT / "scaffold/legacy-lint-product-classification-0108"
LEDGER = BUNDLE / "classification-research.jsonl"
INVENTORY = BUNDLE / "inventory.json"
BASE_REVISION = "5562f04da0f3205f9aa58205ec0d478419fc4f2e"
EXPECTED_NEGATIVE_CASES = ["target_record_omission", "target_record_duplicate", "edge_omission", "edge_duplicate", "source_digest_tamper", "source_line_text_digest_tamper", "source_profile_tamper", "candidate_product_tamper", "authority_promotion", "boundary_line_digest_tamper", "input_digest_omission", "input_digest_duplicate", "input_digest_extra_path", "manual_semantic_review_tamper", "manual_review_inventory_tamper", "record_top_level_extra_key", "source_read_mode_tamper", "inventory_authority_promotion", "inventory_scope_tamper", "inventory_formal_update_tamper", "inventory_classification_rule_tamper", "inventory_counts_artifact_kind_tamper", "fixed_BASE_non_ancestor", "generator_manual_oracle_tamper", "base_pin_tamper", "base_source_missing", "history_tamper", "human_judgment_tamper", "input_digest_value_tamper", "inventory_negative_case_tamper", "output_digest_tamper", "phase_status_tamper", "source_line_range_tamper"]
RECORD_KEYS = frozenset({
    "artifact_evidence_kinds", "asset_id", "asset_ledger", "authority_effect",
    "boundary_evidence", "candidate_products", "classification_category",
    "classification_reason", "classification_state", "failure_consumer_static_refs",
    "formal_asset_classification_updated", "human_judgment_remaining", "l1_evidence",
    "legacy_history_failure_consumer", "manual_semantic_review", "new_build_allowed",
    "observed_wave_products", "phase_ledger", "semantic_link_statuses", "source_exact",
    "source_profile", "unit_product_candidates", "wave_semantic_links",
})
SOURCE_KEYS = frozenset({
    "archive_path", "blob", "bytes", "ledger_source_sha256", "line_count", "read_mode",
    "semantic_anchors", "sha256", "source_path",
})

FIXED_BASE_REVISION = "5562f04da0f3205f9aa58205ec0d478419fc4f2e"
FIXED_PROFILE_REASON = "The filename grouping is a research seed only; no concrete source span has yet been accepted as a product-boundary proof."
# Independent oracle: keyed by fixed-base asset ID. Validator expectations do
# not import generate.MANUAL_REVIEWS, so generator table edits cannot self-authorize.
PINNED_MANUAL_REVIEWS = {'LEGACY-ASSET-53FA13D3AC94F7FB15AC': {'name': 'artifact-retirement-authority', 'product': 'HELIX-OS', 'start': 16, 'end': 22, 'l1': ('HELIX-OS', 22, 25), 'interpretation': 'The source models typed retirement authority, approval decision, and artifact disposition, matching OS authority and operational control.', 'counter': (59, 63)}, 'LEGACY-ASSET-4C6B30DDEF93FEB65EFA': {'name': 'closure-authority-registry', 'product': 'HELIX-OS', 'start': 22, 'end': 30, 'l1': ('HELIX-OS', 22, 25), 'interpretation': 'The source analyzes closure authority registry drift and fail-closed authority state, matching OS control responsibility.', 'counter': (59, 63)}, 'LEGACY-ASSET-F8B7209FBAC14A898EC1': {'name': 'codex-hook-trust', 'product': 'HELIX-OS', 'start': 43, 'end': 59, 'l1': ('HELIX-OS', 22, 25), 'interpretation': 'The source filters project hooks, rejects empty unmanaged hook sets, checks trusted status, and records current digests, matching OS execution authority and evidence control.', 'counter': (59, 63)}, 'LEGACY-ASSET-44C4FC0A3896A110ACE9': {'name': 'db-projection-ingestion', 'product': 'HELIX-OS', 'start': 14, 'end': 31, 'l1': ('HELIX-OS', 22, 25), 'interpretation': 'The source defines automatic graph, dependency, trace, snapshot, and verification projection tables, matching OS state/projection management.', 'counter': (59, 63)}, 'LEGACY-ASSET-5D21DA06253C752E3CE8': {'name': 'doc-consistency', 'product': 'HELIX-HARNESS', 'start': 1, 'end': 12, 'l1': ('HELIX-HARNESS', 22, 24), 'interpretation': 'The source automates document consistency through L3 carry, screen IDs, and NFR counts, matching HARNESS requirement/design trace obligations.', 'counter': (59, 61)}, 'LEGACY-ASSET-7B8CD56F87BD7B107F9D': {'name': 'entity-coverage', 'product': 'HELIX-HARNESS', 'start': 1, 'end': 4, 'l1': ('HELIX-HARNESS', 22, 24), 'interpretation': 'The source checks L1 business entities against L3-derived entities, a HARNESS V-model domain trace contract.', 'counter': (59, 61)}, 'LEGACY-ASSET-33435EC54373CF7F54C4': {'name': 'fr-registry-audit', 'product': 'HELIX-HARNESS', 'start': 1, 'end': 12, 'l1': ('HELIX-HARNESS', 22, 24), 'interpretation': 'The source audits the L1 functional registry for missing IDs, priorities, counts, and screen coverage, which is HARNESS requirement/design trace substance.', 'counter': (59, 61)}, 'LEGACY-ASSET-AC999B8370D994760AA8': {'name': 'g1-trace', 'product': 'HELIX-HARNESS', 'start': 128, 'end': 171, 'l1': ('HELIX-HARNESS', 22, 24), 'interpretation': 'The source loads business, functional, screen, and L3 plan documents, extracts business/screen/P0 trace maps, reports orphan trace items and missing L3 requirements, and gates the result on zero findings; this is concrete HARNESS V-model trace enforcement.', 'counter': (59, 61)}, 'LEGACY-ASSET-F08A55DF0252487B2BC1': {'name': 'g3-trace', 'product': 'HELIX-HARNESS', 'start': 1, 'end': 5, 'l1': ('HELIX-HARNESS', 22, 24), 'interpretation': 'The source explicitly enforces L1→L3→AC→AT bidirectional trace integrity, a HARNESS verification contract.', 'counter': (59, 61)}, 'LEGACY-ASSET-C3E9F5F1618847273CDB': {'name': 'plan-specific-vpair-binding', 'product': 'HELIX-HARNESS', 'start': 822, 'end': 925, 'l1': ('HELIX-HARNESS', 22, 24), 'interpretation': 'The source walks eligible plans and validates verification-binding schema, parent pairing, oracle declaration and test citation, generated-test coverage, test evidence, and duplicate oracle ownership; this is concrete HARNESS plan-to-verification pairing enforcement.', 'counter': (59, 61)}, 'LEGACY-ASSET-C784270ED911BC5EC123': {'name': 'sub-doc-section-structure', 'product': 'HELIX-HARNESS', 'start': 1, 'end': 10, 'l1': ('HELIX-HARNESS', 54, 58), 'interpretation': 'The source enforces L4 standard deliverable sections and explicitly treats the harness as the source of the design contract.', 'counter': (59, 61)}, 'LEGACY-ASSET-898CAFFFFED4F1FDB37C': {'name': 'verification-profile-safety', 'product': 'HELIX-OS', 'start': 63, 'end': 88, 'l1': ('HELIX-OS', 22, 25), 'interpretation': 'The source validates generated MCP config mounts and rejects committed editor writes, matching OS verification execution safety control.', 'counter': (59, 63)}, 'LEGACY-ASSET-B4B60B5559AF71A92EFD': {'name': 'verifier-provider-mismatch', 'product': 'HELIX-OS', 'start': 4, 'end': 16, 'l1': ('HELIX-OS', 22, 25), 'interpretation': 'The source inspects Worker/verifier provider state and fallback evidence in the loop, matching OS Worker and state control.', 'counter': (59, 63)}, 'LEGACY-ASSET-A0AE5F81F5970756C21B': {'name': 'wcc-trace', 'product': 'HELIX-HARNESS', 'start': 1, 'end': 10, 'l1': ('HELIX-HARNESS', 22, 24), 'interpretation': 'The source enforces Worker Common Contract L3↔L10 exact trace, a HARNESS contract-to-acceptance obligation.', 'counter': (59, 61)}}
EXPECTED_TARGET_IDS = ('LEGACY-ASSET-0083DCA4103F4097190D', 'LEGACY-ASSET-05404E683196BAE99C13', 'LEGACY-ASSET-0BF6DB7D19D1B4CD3FD1', 'LEGACY-ASSET-0E5802171DF2D0D025D7', 'LEGACY-ASSET-0EC5D034DFD4488E964C', 'LEGACY-ASSET-0F9EB8B9C48B77D8928E', 'LEGACY-ASSET-0FE08940293D287D54A7', 'LEGACY-ASSET-18A13B095C62F371CDB4', 'LEGACY-ASSET-1B131E1B4D35900C81F0', 'LEGACY-ASSET-1C8F4DBFA4EF2529437B', 'LEGACY-ASSET-1D0383464109A9B2CB32', 'LEGACY-ASSET-1EBE6FBF0757C3C5937B', 'LEGACY-ASSET-20AC96DD07436D7C7793', 'LEGACY-ASSET-22D68806FAB3A785468D', 'LEGACY-ASSET-23F77C36D3ECB2986D0B', 'LEGACY-ASSET-29B37C44079F551E95F7', 'LEGACY-ASSET-2AA6246191AF3D2AF0E4', 'LEGACY-ASSET-2ABE853897A0EE2362A4', 'LEGACY-ASSET-32C253400AF10D88F04A', 'LEGACY-ASSET-33435EC54373CF7F54C4', 'LEGACY-ASSET-3D27002D783B5C838DC2', 'LEGACY-ASSET-41C752D10BF2ECC0B092', 'LEGACY-ASSET-4414F0D2104D4F4DFD82', 'LEGACY-ASSET-44C4FC0A3896A110ACE9', 'LEGACY-ASSET-462F60E486F8DB80687E', 'LEGACY-ASSET-49DFCEC264EEB35C12F5', 'LEGACY-ASSET-4A4748D0D13DB21F86C8', 'LEGACY-ASSET-4C6B30DDEF93FEB65EFA', 'LEGACY-ASSET-4D591198CE4854AE4BDF', 'LEGACY-ASSET-52C3660E59418EB47AD7', 'LEGACY-ASSET-53FA13D3AC94F7FB15AC', 'LEGACY-ASSET-5C20A89B41C756A70D42', 'LEGACY-ASSET-5D21DA06253C752E3CE8', 'LEGACY-ASSET-5D45C6678C0FFCBC1EE1', 'LEGACY-ASSET-5E21E491D7314FB5B330', 'LEGACY-ASSET-659BC8C9409A09406296', 'LEGACY-ASSET-6F7A240102E9C4A26FA0', 'LEGACY-ASSET-7188688E58AC57AF27CC', 'LEGACY-ASSET-721B9C75F7D1D9FDF05B', 'LEGACY-ASSET-73AB19B1DC1E83E34A98', 'LEGACY-ASSET-75FD2A62567B0D5F7D5E', 'LEGACY-ASSET-762A055F8BD1312B6DE1', 'LEGACY-ASSET-7B8CD56F87BD7B107F9D', 'LEGACY-ASSET-7C0EDC30775347127C64', 'LEGACY-ASSET-7F9C6C726C5778BBFE61', 'LEGACY-ASSET-8015AEF74A72B1476EB2', 'LEGACY-ASSET-81D47891C96849D54045', 'LEGACY-ASSET-82C2FBF8D260D0378A88', 'LEGACY-ASSET-863D1F132051C380B623', 'LEGACY-ASSET-8708C945F00E862D4655', 'LEGACY-ASSET-898CAFFFFED4F1FDB37C', 'LEGACY-ASSET-8D6337F73D8F7B2F36F3', 'LEGACY-ASSET-8E09834B0F10A4590AC6', 'LEGACY-ASSET-8ECF9F82BFC760C5DEF3', 'LEGACY-ASSET-8F6E3C5A46A56B0D9BED', 'LEGACY-ASSET-8F7FBDC185C7BA0851DA', 'LEGACY-ASSET-90F9409BF26E24B4367E', 'LEGACY-ASSET-92242288769754D23608', 'LEGACY-ASSET-9B572F6E5E5E57606D81', 'LEGACY-ASSET-9F85BD95DD4E7FE1C972', 'LEGACY-ASSET-A0AE5F81F5970756C21B', 'LEGACY-ASSET-A0F75E001FB05D4E4BFB', 'LEGACY-ASSET-A4599DA4E4C9C1EE6369', 'LEGACY-ASSET-AC999B8370D994760AA8', 'LEGACY-ASSET-AF428B258EE497BAE419', 'LEGACY-ASSET-B132AE007E1B7658E448', 'LEGACY-ASSET-B1D4D7FF7D9043D7EFB3', 'LEGACY-ASSET-B4B60B5559AF71A92EFD', 'LEGACY-ASSET-B5C4F0A803AA80593EB0', 'LEGACY-ASSET-B940E046D00B14FE07D4', 'LEGACY-ASSET-BD8524CE4E8D0F5F4922', 'LEGACY-ASSET-C03055EC007EAB41A3B2', 'LEGACY-ASSET-C3E9F5F1618847273CDB', 'LEGACY-ASSET-C4C919D9EED4DB53481A', 'LEGACY-ASSET-C784270ED911BC5EC123', 'LEGACY-ASSET-C9D410C78FBA67A7FEF8', 'LEGACY-ASSET-C9D48162E43EB2C5E74A', 'LEGACY-ASSET-CA0080C347516A34541B', 'LEGACY-ASSET-CCC6D153B22D926E3B40', 'LEGACY-ASSET-D086183D43E088E04C95', 'LEGACY-ASSET-D385E8FAD478091775A6', 'LEGACY-ASSET-DDDED793C93712190619', 'LEGACY-ASSET-DF03A960FB000F2F6668', 'LEGACY-ASSET-EA6B8D0F70F0016C1462', 'LEGACY-ASSET-EBC0F854AA874E00C1F2', 'LEGACY-ASSET-EE04E18F84F035A337D5', 'LEGACY-ASSET-F08A55DF0252487B2BC1', 'LEGACY-ASSET-F1A9489676B907E8B6AB', 'LEGACY-ASSET-F3FD25C20D41269BFCDC', 'LEGACY-ASSET-F87843CAC8A85F21A3ED', 'LEGACY-ASSET-F8B7209FBAC14A898EC1', 'LEGACY-ASSET-FA95FD1F5859B6576A13', 'LEGACY-ASSET-FDA3C9D1BA6E5F53D329', 'LEGACY-ASSET-FF862C002A149C94A66C', 'LEGACY-ASSET-FFFADD75B11FFA35DFDE')
EXPECTED_MANUAL_ASSET_IDS = frozenset(PINNED_MANUAL_REVIEWS)

ARCHIVE_PREFIX_FIXED = "archive/legacy-generation-2026-09-14/root/"
PHASE_FIXED = "docs/governance/legacy-asset-phase-product-classification-bootstrap.jsonl"
DISPOSITION_FIXED = "docs/governance/legacy-asset-disposition.jsonl"
DECISIONS_FIXED = "docs/governance/legacy-asset-decisions.jsonl"
READ_AFTER_FIXED = "docs/governance/legacy-asset-copy-read-after.jsonl"
CROSSWALK_FIXED = "docs/governance/legacy-requirement-implementation-crosswalk-bootstrap.jsonl"
DECOMPOSITION_FIXED = "docs/governance/legacy-ir-product-unit-decomposition-bootstrap.jsonl"
BOUNDARY_FIXED = "docs/concept/product-boundary.md"
L1_FIXED = {"HELIX-HARNESS": "docs/helix-harness/L1-planning/product-intent.md", "HELIX-OS": "docs/helix-os/L1-planning/system-intent.md", "HELIX-Web": "docs/helix-web/L1-planning/product-intent.md", "HELIX-Web-OS": "docs/helix-web-os/L1-planning/system-intent.md"}
FAILURE_SOURCE_FIXED = "docs/governance/audits/source-rebaseline/legacy-ci-ai-runtime-source-inventory.md"
CONSUMER_SOURCE_FIXED = "docs/governance/audits/source-rebaseline/legacy-ci-consumer-relation-inventory.md"
WAVE_PATHS_FIXED = {n: (f"docs/governance/legacy-requirement-direct-semantic-review-wave{n}.jsonl" if n <= 36 else f"scaffold/legacy-semantic-review-wave{n}/legacy-requirement-direct-semantic-review-wave{n}.jsonl") for n in range(1, 51)}
GLOBAL_INPUTS_FIXED = [PHASE_FIXED, DISPOSITION_FIXED, DECISIONS_FIXED, READ_AFTER_FIXED, CROSSWALK_FIXED, DECOMPOSITION_FIXED, BOUNDARY_FIXED, *L1_FIXED.values(), FAILURE_SOURCE_FIXED, CONSUMER_SOURCE_FIXED, "docs/governance/legacy-asset-decision-log.md", "docs/governance/legacy-asset-reuse-control.md", "docs/governance/new-generation-start-here.md", "archive/legacy-generation-2026-09-14/MANIFEST.sha256"]
BOUNDARY_RANGES_FIXED = {"HELIX-HARNESS": [(36, 36), (54, 61), (86, 89)], "HELIX-OS": [(37, 37), (55, 65), (86, 89)], "HELIX-Web": [(38, 38), (56, 56), (63, 70)], "HELIX-Web-OS": [(39, 39), (57, 57), (63, 70)]}
L1_RANGES_FIXED = {"HELIX-HARNESS": [(22, 24), (54, 58)], "HELIX-OS": [(22, 25), (59, 63)], "HELIX-Web": [(24, 26), (47, 49)], "HELIX-Web-OS": [(14, 15), (39, 44)]}
FAILURE_RANGES_FIXED = [(17, 23), (52, 63)]
CONSUMER_RANGES_FIXED = [(24, 36), (38, 50)]
BINDING_ID_FIXED = "SCF-B-0108"

def compact_crosswalk(row: dict, line: int) -> dict:
    fields = ["crosswalk_id", "source_requirement_id", "unit_candidate_id", "product_scope", "responsibility_summary", "direct_legacy_asset_link_status", "phase_classification_status", "direct_phase_candidates", "current_requirement_implementation_status", "legacy_requirement_implementation_status", "consumer_closure_status", "successor_assignment_status", "legacy_execution_performed", "new_build_allowed", "authority_effect", "unresolved"]
    out = {k: row.get(k) for k in fields}
    out.update({"path": CROSSWALK_FIXED, "line": line, "row_sha256": row_digest(row)})
    return out

def compact_decomp(parent: dict, unit: dict, line: int) -> dict:
    return {"path": DECOMPOSITION_FIXED, "line": line, "decomposition_id": parent.get("decomposition_id"), "source_requirement_id": parent.get("source_requirement_id"), "unit_candidate_id": unit.get("unit_candidate_id"), "unit_kind": unit.get("unit_kind"), "product_target": unit.get("product_target"), "direct_phase_candidates": unit.get("direct_phase_candidates"), "phase_classification_status": unit.get("phase_classification_status"), "semantic_coverage_status": unit.get("semantic_coverage_status"), "authority_effect": unit.get("authority_effect"), "row_sha256": canonical({"parent": parent.get("source_requirement_id"), "unit": unit})}

def wave_link(item: tuple[int, str, int, dict]) -> dict:
    wave, path, line, row = item
    edge_base = {"wave": wave, "path": path, "line": line, "asset_id": row["asset_id"], "unit_candidate_id": row.get("unit_candidate_id"), "semantic_link_status": row.get("semantic_link_status")}
    return {"edge_id": canonical(edge_base), "wave": wave, "path": path, "line": line, "row_sha256": row_digest(row), "asset_id": row["asset_id"], "source_requirement_id": row.get("source_requirement_id"), "artifact_evidence_kind": row.get("artifact_evidence_kind"), "unit_candidate_id": row.get("unit_candidate_id"), "semantic_link_status": row.get("semantic_link_status"), "semantic_relation": row.get("semantic_relation"), "candidate_product_targets": row.get("candidate_product_targets") or [], "product_scope": row.get("product_scope") or [], "candidate_phase_targets": row.get("candidate_phase_targets") or [], "source_path": row.get("source_path"), "source_sha256": row.get("source_sha256"), "source_statement_semantic_digest": row.get("source_statement_semantic_digest"), "source_statement_text": row.get("source_statement_text"), "source_text_spans": row.get("source_text_spans") or [], "evidence_refs": row.get("evidence_refs") or [], "legacy_asset_evidence_state": row.get("legacy_asset_evidence_state"), "legacy_execution_status": row.get("legacy_execution_status"), "consumer_closure_status": row.get("consumer_closure_status"), "observed_consumer_refs": row.get("observed_consumer_refs") or [], "counterevidence": row.get("counterevidence") or [], "unresolved": row.get("unresolved") or [], "product_alignment_status": row.get("product_alignment_status"), "authority_effect": row.get("authority_effect"), "new_build_allowed": row.get("new_build_allowed")}


def fail(code: str, message: str) -> None:
    raise AssertionError(f"{code}: {message}")


def tagged(data: bytes) -> str:
    return "sha256:" + hashlib.sha256(data).hexdigest()


def canonical(value: object) -> str:
    return tagged(json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode())


@lru_cache(maxsize=None)
def git_bytes(path: str, base: str = BASE_REVISION) -> bytes:
    try:
        return subprocess.check_output(["git", "show", f"{base}:{path}"])
    except subprocess.CalledProcessError as exc:
        fail("E_BASE_SOURCE", f"missing fixed-base path {path}: {exc}")


@lru_cache(maxsize=None)
def git_blob(path: str, base: str = BASE_REVISION) -> str:
    try:
        return subprocess.check_output(["git", "rev-parse", f"{base}:{path}"], text=True).strip()
    except subprocess.CalledProcessError as exc:
        fail("E_BASE_SOURCE", f"missing fixed-base blob {path}: {exc}")


def local_json(path: Path):
    return json.loads(path.read_text())


def local_jsonl(path: Path) -> list[dict]:
    return [json.loads(x) for x in path.read_text().splitlines() if x.strip()]


def base_jsonl(path: str) -> list[tuple[int, dict]]:
    return [(i, json.loads(x)) for i, x in enumerate(git_bytes(path).decode().splitlines(), 1) if x.strip()]


def row_digest(row: dict) -> str:
    return canonical(row)


def receipt(path: str, start: int, end: int) -> dict:
    lines = git_bytes(path).decode(errors="replace").splitlines()
    if not (1 <= start <= end <= len(lines)):
        fail("E_SOURCE_LINE", f"range outside {path}:{start}-{end}")
    text = "\n".join(lines[start - 1:end])
    return {"path": path, "blob": git_blob(path), "line_start": start, "line_end": end, "line_count": end - start + 1, "line_text_sha256": tagged(text.encode()), "line_text": lines[start - 1:end]}


def assert_receipt(actual: dict, path: str, start: int, end: int, code: str = "E_BOUNDARY_DIGEST") -> None:
    if actual != receipt(path, start, end):
        fail(code, f"receipt mismatch {path}:{start}-{end}")


def expected_links(rows: list[tuple[int, str, int, dict]]) -> list[dict]:
    return sorted([wave_link(x) for x in rows], key=lambda x: (x["wave"], x["line"], x["edge_id"]))


def expected_source_anchor(path: str, profile: str, products: list[str], manual: dict | None = None) -> dict:
    # Re-derive the semantic anchor from the fixed BASE bytes. This avoids
    # treating a recorded line number as evidence unless its text/digest agrees.
    lines = git_bytes(path).decode(errors="replace").splitlines()
    if manual:
        start, end = manual["start"], manual["end"]
        text = "\n".join(lines[start - 1:end])
        return {"line_start": start, "line_end": end, "line_text": lines[start - 1:end], "line_text_sha256": tagged(text.encode()), "interpretation": manual["interpretation"], "products_considered": [manual["product"]]}
    candidates = []
    for i, line in enumerate(lines, 1):
        low = line.lower()
        if line.lstrip().startswith(("/**", "*", "//")) and not line.lstrip().startswith("*/"):
            score = (3 if ("plan" in low or "requirement" in low or "authority" in low or "adapter" in low) else 1)
            candidates.append((score, i))
    start = max(candidates, key=lambda x: (x[0], -x[1]))[1] if candidates else next((i for i, line in enumerate(lines, 1) if line.strip() and not line.lstrip().startswith(("import ", "from "))), 1)
    end = min(len(lines), start + (2 if lines[start - 1].lstrip().startswith(("/**", "*", "//")) else 1))
    text = "\n".join(lines[start - 1:end])
    interpretation = "source context is preserved for human semantic review; this span does not prove a product owner"
    return {"line_start": start, "line_end": end, "line_text": lines[start - 1:end], "line_text_sha256": tagged(text.encode()), "interpretation": interpretation, "products_considered": products}


def expected_manual_review(path: str, manual: dict, consumer_path: str, consumer_ranges: list[tuple[int, int]]) -> dict:
    source_span = expected_source_anchor(path, "insufficient_basis", [], manual)
    return {"status": "reviewed_candidate", "source_span": source_span, "candidate_product": manual["product"], "l1_product": manual["l1"][0], "l1_evidence": receipt(L1_FIXED[manual["l1"][0]], manual["l1"][1], manual["l1"][2]), "interpretation": manual["interpretation"], "boundary_counterevidence": receipt(BOUNDARY_FIXED, manual["counter"][0], manual["counter"][1]), "consumer_boundary": {"status": "pending", "interpretation": "legacy consumer relation is retained as a pending closure boundary; no direct semantic link is accepted", "refs": [receipt(consumer_path, *r) for r in consumer_ranges]}}


def verify_base() -> None:
    try:
        subprocess.check_call(["git", "merge-base", "--is-ancestor", BASE_REVISION, "HEAD"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    except subprocess.CalledProcessError:
        fail("E_BASE_NOT_ANCESTOR", f"fixed BASE {BASE_REVISION} is not an ancestor of HEAD")


def verify_inputs(inventory: dict, targets: list[str], phase_by_asset: dict) -> None:
    source_paths = [ARCHIVE_PREFIX_FIXED + phase_by_asset[a][1]["source_path"] for a in targets]
    expected_paths = [*WAVE_PATHS_FIXED.values(), *GLOBAL_INPUTS_FIXED, *source_paths]
    actual = inventory.get("input_digests")
    if not isinstance(actual, list) or [x.get("path") for x in actual] != expected_paths or len({x.get("path") for x in actual}) != len(expected_paths):
        fail("E_INPUT_SET", "input digest path set/order differs from deterministic target source set")
    for item in actual:
        data = git_bytes(item["path"])
        expected = {"path": item["path"], "blob": git_blob(item["path"]), "bytes": len(data), "sha256": tagged(data)}
        if item != expected:
            fail("E_INPUT_DIGEST", f"input digest mismatch {item.get('path')}")


def verify_ranges(record: dict) -> None:
    boundary = record.get("boundary_evidence")
    if set(boundary or {}) != set(BOUNDARY_RANGES_FIXED): fail("E_BOUNDARY_DIGEST", "boundary product set mismatch")
    for product, ranges in BOUNDARY_RANGES_FIXED.items():
        obj = boundary[product]
        if obj.get("path") != BOUNDARY_FIXED or obj.get("blob") != git_blob(BOUNDARY_FIXED) or len(obj.get("ranges", [])) != len(ranges): fail("E_BOUNDARY_DIGEST", product)
        for actual, pair in zip(obj["ranges"], ranges): assert_receipt(actual, BOUNDARY_FIXED, *pair)
    l1 = record.get("l1_evidence")
    if set(l1 or {}) != set(L1_FIXED): fail("E_BOUNDARY_DIGEST", "L1 product set mismatch")
    for product, path in L1_FIXED.items():
        obj = l1[product]
        if obj.get("path") != path or obj.get("blob") != git_blob(path) or len(obj.get("ranges", [])) != len(L1_RANGES_FIXED[product]): fail("E_BOUNDARY_DIGEST", product)
        for actual, pair in zip(obj["ranges"], L1_RANGES_FIXED[product]): assert_receipt(actual, path, *pair)
    static = record.get("failure_consumer_static_refs", {})
    for key, path, ranges in [("failure", FAILURE_SOURCE_FIXED, FAILURE_RANGES_FIXED), ("consumer", CONSUMER_SOURCE_FIXED, CONSUMER_RANGES_FIXED)]:
        obj = static.get(key, {})
        if obj.get("path") != path or obj.get("blob") != git_blob(path) or len(obj.get("ranges", [])) != len(ranges): fail("E_BOUNDARY_DIGEST", key)
        for actual, pair in zip(obj["ranges"], ranges): assert_receipt(actual, path, *pair)


def expected_history(aid: str, dispositions: dict, decisions: list[tuple[int, dict]], read_afters: list[tuple[int, dict]]) -> dict:
    line, row = dispositions[aid]
    return {"disposition": {"path": DISPOSITION_FIXED, "line": line, "row_sha256": row_digest(row), "asset_id": aid, "revision": row.get("revision"), "disposition": row.get("disposition"), "asset_class": row.get("asset_class"), "product_target": row.get("product_target"), "authority_status": row.get("authority_status"), "implementation_status": row.get("implementation_status"), "consumer_refs": sorted(row.get("consumer_refs", [])), "decision_record_ref": row.get("decision_record_ref"), "read_after_record_ref": row.get("read_after_record_ref")}, "decisions": [{"path": DECISIONS_FIXED, "line": n, "row_sha256": row_digest(r), "decision_id": r.get("decision_id"), "disposition": r.get("disposition"), "product_target": r.get("product_target"), "consumer_refs": sorted(r.get("consumer_refs", []))} for n, r in decisions if r.get("asset_id") == aid], "read_after": [{"path": READ_AFTER_FIXED, "line": n, "row_sha256": row_digest(r), "read_after_id": r.get("read_after_id"), "result": r.get("result"), "digest_match": r.get("digest_match"), "consumer_match": r.get("consumer_match"), "failure": r.get("failure"), "consumer_refs_observed": sorted(r.get("consumer_refs_observed", []))} for n, r in read_afters if r.get("asset_id") == aid], "state_boundary": "disposition remains unresolved; decision/read-after rows are preserved as historical evidence and do not confer product authority"}


def verify() -> dict:
    verify_base()
    inventory, rows = local_json(INVENTORY), local_jsonl(LEDGER)
    if BASE_REVISION != FIXED_BASE_REVISION or inventory.get("base_revision") != FIXED_BASE_REVISION or inventory.get("base_source_mode") != "all input and archive evidence bytes from fixed BASE Git objects": fail("E_BASE_PIN", "BASE pin/source mode drift")
    if inventory.get("negative_cases") != EXPECTED_NEGATIVE_CASES: fail("E_INVENTORY", "negative case declaration drift")
    phase_rows = base_jsonl(PHASE_FIXED)
    phase_by_asset = {r["asset_id"]: (n, r) for n, r in phase_rows}
    targets = sorted(a for a, (n, r) in phase_by_asset.items() if r.get("product_classification_status") == "unresolved" and r.get("artifact_evidence_kind") == "implementation_source" and r.get("source_path", "").startswith("src/lint/"))
    if tuple(targets) != EXPECTED_TARGET_IDS or len(targets) != 95: fail("E_TARGET_SET", "fixed BASE target ID set drift")
    verify_inputs(inventory, targets, phase_by_asset)
    if len(rows) != 95 or sorted(r.get("asset_id") for r in rows) != targets or len({r.get("asset_id") for r in rows}) != 95: fail("E_TARGET_SET", "records have missing, duplicate, or extra target asset")
    if inventory.get("expected_sets", {}).get("target_asset_ids") != targets or inventory["expected_sets"].get("target_asset_ids_sha256") != tagged("\n".join(targets).encode()): fail("E_TARGET_SET", "target set digest drift")
    dispositions = {r["asset_id"]: (n, r) for n, r in base_jsonl(DISPOSITION_FIXED)}
    decisions, read_afters = base_jsonl(DECISIONS_FIXED), base_jsonl(READ_AFTER_FIXED)
    wave_rows = []
    for wave, path in WAVE_PATHS_FIXED.items(): wave_rows.extend((wave, path, n, r) for n, r in base_jsonl(path))
    if len(wave_rows) != 598 or len({r[3]["asset_id"] for r in wave_rows}) != 355: fail("E_EXPECTED_DENOMINATOR", "Wave denominator drift")
    by_asset: defaultdict[str, list] = defaultdict(list)
    for item in wave_rows: by_asset[item[3]["asset_id"]].append(item)
    cw = {r["unit_candidate_id"]: compact_crosswalk(r, n) for n, r in base_jsonl(CROSSWALK_FIXED)}
    decomp = {}
    for n, parent in base_jsonl(DECOMPOSITION_FIXED):
        for unit in parent.get("candidate_units", []): decomp[unit["unit_candidate_id"]] = compact_decomp(parent, unit, n)
    expected_categories = defaultdict(int)
    expected_edges = 0
    for record in rows:
        aid = record["asset_id"]
        if set(record) != RECORD_KEYS:
            fail("E_RECORD_SCHEMA", f"record key set mismatch {aid}")
        phase_line, phase = phase_by_asset[aid]
        expected_phase = {"path": PHASE_FIXED, "line": phase_line, "row_sha256": row_digest(phase), "product_classification_status": phase.get("product_classification_status"), "candidate_product_targets": phase.get("candidate_product_targets") or [], "candidate_phase_targets": phase.get("candidate_phase_targets") or [], "source_path": phase.get("source_path"), "source_sha256": phase.get("source_sha256"), "consumer_closure_status": phase.get("consumer_closure_status")}
        if record.get("phase_ledger") != expected_phase: fail("E_PHASE_STATUS", aid)
        disp_line, disp = dispositions[aid]
        expected_asset = {"path": DISPOSITION_FIXED, "line": disp_line, "row_sha256": row_digest(disp), "source_path": disp.get("source_path"), "source_sha256": disp.get("source_sha256"), "disposition": disp.get("disposition"), "product_target": disp.get("product_target"), "authority_status": disp.get("authority_status"), "implementation_status": disp.get("implementation_status"), "consumer_refs": sorted(disp.get("consumer_refs", []))}
        if record.get("asset_ledger") != expected_asset: fail("E_HISTORY", aid)
        if disp.get("disposition") != "unresolved" or disp.get("product_target") != "unresolved" or disp.get("authority_status") != "historical": fail("E_PHASE_STATUS", aid)
        source = record.get("source_exact", {}); archive_path = ARCHIVE_PREFIX_FIXED + disp["source_path"]; data = git_bytes(archive_path)
        if set(source) != SOURCE_KEYS or source.get("archive_path") != archive_path or source.get("source_path") != disp["source_path"] or source.get("blob") != git_blob(archive_path) or source.get("bytes") != len(data) or source.get("line_count") != len(data.decode(errors="replace").splitlines()) or source.get("sha256") != tagged(data) or source.get("ledger_source_sha256") != "sha256:" + disp["source_sha256"] or source.get("read_mode") != "git_object_static_read_only": fail("E_SOURCE_DIGEST", aid)
        profile = record.get("source_profile", {}); name = disp["source_path"].rsplit("/", 1)[-1].removesuffix(".ts")
        # Expected classification is pinned independently by asset ID.
        base_category, source_products, base_reason = "insufficient_basis", [], FIXED_PROFILE_REASON
        links = expected_links(by_asset.get(aid, [])); wave_products = sorted({p for link in links for p in (link.get("candidate_product_targets") or []) + (link.get("product_scope") or [])})
        manual = PINNED_MANUAL_REVIEWS.get(aid)
        expected_profile = {"name": name, "base_category": base_category, "source_products": source_products, "wave_products": wave_products, "profile_reason": base_reason, "semantic_review_status": "reviewed_candidate" if manual else "source_semantic_review_pending"}
        if profile != expected_profile: fail("E_PROFILE", aid)
        for anchor in source.get("semantic_anchors", []):
            if not isinstance(anchor.get("line_start"), int) or not isinstance(anchor.get("line_end"), int) or anchor["line_start"] < 1 or anchor["line_start"] > anchor["line_end"] or anchor["line_end"] > source.get("line_count", 0):
                fail("E_SOURCE_LINE", aid)
        expected_anchor = expected_source_anchor(archive_path, base_category, source_products, manual)
        if source.get("semantic_anchors") != [expected_anchor]: fail("E_SOURCE_ANCHOR", aid)
        actual_links = record.get("wave_semantic_links", [])
        if actual_links != links: fail("E_EDGE_SET", aid)
        expected_edges += len(links)
        unit_ids = sorted({x["unit_candidate_id"] for x in links if x.get("unit_candidate_id")}); units = record.get("unit_product_candidates", [])
        if [u.get("unit_candidate_id") for u in units] != unit_ids: fail("E_CANDIDATE_PRODUCTS", aid)
        for unit in units:
            uid = unit["unit_candidate_id"]
            if uid not in cw or uid not in decomp or unit.get("crosswalk") != cw[uid] or unit.get("decomposition") != decomp[uid]: fail("E_CANDIDATE_PRODUCTS", f"{aid}:{uid}")
        if manual:
            category, products, reason = "direct_product_basis", [manual["product"]], manual["interpretation"] + " Candidate only; formal product authority remains unresolved."
        else:
            category, products, reason = "insufficient_basis", [], base_reason
        if record.get("classification_category") != category or record.get("classification_reason") != reason or record.get("candidate_products") != products or record.get("observed_wave_products") != wave_products: fail("E_CANDIDATE_PRODUCTS", aid)
        expected_manual = expected_manual_review(archive_path, manual, CONSUMER_SOURCE_FIXED, CONSUMER_RANGES_FIXED) if manual else {"status": "source_semantic_review_pending", "source_span": expected_source_anchor(archive_path, base_category, source_products), "candidate_product": None, "l1_product": None, "l1_evidence": None, "interpretation": "filename seed and source context retained; concrete product-boundary mapping, counterevidence, and consumer closure have not been accepted", "boundary_counterevidence": None, "consumer_boundary": {"status": "pending", "interpretation": "consumer relation remains unreviewed", "refs": [receipt(CONSUMER_SOURCE_FIXED, *r) for r in CONSUMER_RANGES_FIXED]}}
        if record.get("manual_semantic_review") != expected_manual: fail("E_SEMANTIC_REVIEW", aid)
        if record.get("semantic_link_statuses") != sorted({x.get("semantic_link_status") for x in links}): fail("E_EDGE_SET", aid)
        if record.get("artifact_evidence_kinds") != (sorted({x.get("artifact_evidence_kind") for x in links}) if links else ["implementation_source"]): fail("E_CANDIDATE_PRODUCTS", aid)
        if record.get("legacy_history_failure_consumer") != expected_history(aid, dispositions, decisions, read_afters): fail("E_HISTORY", aid)
        if record.get("authority_effect") != "none" or record.get("classification_state") != "research_proposal_pending_human_product_review" or record.get("formal_asset_classification_updated") is not False or record.get("new_build_allowed") is not False: fail("E_AUTHORITY_PROMOTION", aid)
        if record.get("human_judgment_remaining") != ["product_owner_and_boundary_decision", "source_semantic_anchor_acceptance", "phase_admission_and_successor_assignment", "legacy_consumer_closure_and_failure_disposition", "formal_asset_classification_update"]: fail("E_HUMAN_JUDGMENT", aid)
        verify_ranges(record)
        expected_categories[category] += 1
    expected_counts = {"direct_product_basis": expected_categories["direct_product_basis"], "multi_product_conflict": expected_categories["multi_product_conflict"], "insufficient_basis": expected_categories["insufficient_basis"]}
    counts = inventory.get("counts", {})
    phase_distribution = Counter(tuple(phase_by_asset[a][1].get("candidate_phase_targets") or []) for a in targets)
    target_asset_evidence_kinds = Counter(phase_by_asset[a][1].get("artifact_evidence_kind") for a in targets)
    expected_counts_block = {"wave_files": 50, "wave_edges": 598, "wave_unique_assets": 355, "target_assets": 95, "target_wave_edges": expected_edges, "target_wave_linked_assets": sum(bool(by_asset.get(a)) for a in targets), "categories": expected_counts, "target_asset_artifact_evidence_kinds": dict(sorted(target_asset_evidence_kinds.items())), "target_phase_candidate_distribution": {"|".join(k): v for k, v in sorted(phase_distribution.items())}}
    if counts != expected_counts_block: fail("E_EXPECTED_DENOMINATOR", "inventory counts mismatch")
    manual_ids = sorted(r["asset_id"] for r in rows if r.get("manual_semantic_review", {}).get("status") == "reviewed_candidate")
    if set(manual_ids) != EXPECTED_MANUAL_ASSET_IDS or len(manual_ids) != 14: fail("E_SEMANTIC_REVIEW", "independent manual asset ID set mismatch")
    expected_review_counts = {"source_semantic_reviewed": 14, "source_semantic_review_pending": 81, "direct_candidate_basis": 14, "multi_product_conflict": 0, "insufficient_basis": 81}
    if inventory.get("review_counts") != expected_review_counts or sorted(inventory.get("manual_reviewed_asset_ids", [])) != manual_ids: fail("E_SEMANTIC_REVIEW", "manual semantic review inventory mismatch")
    expected_inventory_meta = {
        "schema_revision": 1,
        "binding_id": BINDING_ID_FIXED,
        "scope": "phase product unresolved + implementation_source + src/lint/ exact 95 assets",
        "wave_source_paths": {str(n): path for n, path in WAVE_PATHS_FIXED.items()},
        "expected_sets": {"target_asset_count": 95, "target_asset_ids": targets, "target_asset_ids_sha256": tagged("\n".join(targets).encode()), "source_paths": [phase_by_asset[a][1]["source_path"] for a in targets]},
        "old_asset_source_mode": "archive bytes are read through git show BASE:<archive-path>; never executed",
        "formal_update": {"formal_asset_classification_updated": False, "phase_ledger_updated": False, "product_route_updated": False, "successor_updated": False, "new_build_allowed": False, "authority_effect": "none"},
        "classification_rule": {"direct_product_basis": "a manually reviewed concrete source span mapped to one product L1 with explicit counter-boundary and pending consumer evidence", "multi_product_conflict": "requires separately reviewed source spans proving two product boundaries (none admitted in this bundle)", "insufficient_basis": "filename seed, generic declaration, or unresolved Wave unit scope without accepted product-boundary proof"},
        "boundary_refs": {"product_boundary": BOUNDARY_FIXED, "l1": L1_FIXED},
        "history_failure_consumer": {"disposition_rows": 95, "decision_rows_for_targets": sum(bool(r["legacy_history_failure_consumer"]["decisions"]) for r in rows), "read_after_rows_for_targets": sum(bool(r["legacy_history_failure_consumer"]["read_after"]) for r in rows), "failure_consumer_refs_are_static_global_inventory": True},
        "edge_contract": {"edge_identity": "edge_id derived from wave/path/line/asset_id/unit_candidate_id/semantic_link_status", "duplicate_edges_forbidden": True, "missing_edges_forbidden": True},
        "authority_boundary": {"authority_effect": "none", "classification_state": "research_proposal_pending_human_product_review", "formal_asset_classification_updated": False, "new_build_allowed": False},
        "artifacts": ["scaffold/bindings/SCF-B-0108.json", "scaffold/legacy-lint-product-classification-0108/README.md", "scaffold/legacy-lint-product-classification-0108/PR-DRAFT.md", "scaffold/legacy-lint-product-classification-0108/generate.py", "scaffold/legacy-lint-product-classification-0108/validate.py", "scaffold/legacy-lint-product-classification-0108/selfcheck.py", "scaffold/legacy-lint-product-classification-0108/inventory.json", "scaffold/legacy-lint-product-classification-0108/classification-research.jsonl"],
    }
    expected_top = set(expected_inventory_meta) | {"base_revision", "base_source_mode", "counts", "input_digests", "output_sha256", "review_counts", "manual_reviewed_asset_ids", "negative_cases"}
    if set(inventory) != expected_top:
        fail("E_INVENTORY_DECLARATION", "inventory top-level key set mismatch")
    for key, expected_value in expected_inventory_meta.items():
        if inventory.get(key) != expected_value:
            fail("E_INVENTORY_DECLARATION", f"inventory {key} mismatch")
    if inventory.get("negative_cases") != EXPECTED_NEGATIVE_CASES:
        fail("E_INVENTORY_DECLARATION", "inventory negative case declaration mismatch")
    if inventory.get("output_sha256") != tagged(LEDGER.read_bytes()): fail("E_OUTPUT_DIGEST", "classification output digest mismatch")
    print(f"SCF-B-0108 validate: PASS records=95 target_edges={expected_edges} categories={dict(sorted(expected_categories.items()))}")
    return {"rows": rows, "inventory": inventory}


if __name__ == "__main__":
    verify()

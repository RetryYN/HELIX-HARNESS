#!/usr/bin/env python3
"""Static consistency verifier. It reads legacy Git objects but never executes them."""
from __future__ import annotations

import hashlib
import json
import re
import subprocess
from functools import lru_cache
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
BUNDLE = Path(__file__).resolve().parent
BASE = "a577a7cddd1405de27bf01d22b050eb2acaa9ba9"
MAIN = "be9cf8cf99ee94a487e54d372d7a34e9266b1ee3"
LEDGER = "docs/governance/legacy-asset-disposition.jsonl"
PHASE = "docs/governance/legacy-asset-phase-product-classification-bootstrap.jsonl"
MANIFEST = "archive/legacy-generation-2026-09-14/MANIFEST.sha256"
ARCHIVE = "archive/legacy-generation-2026-09-14/root/"
BINDING = "scaffold/bindings/SCF-B-0147.json"
EXPECTED_INV_KEYS = {"schema_revision", "binding_id", "base_revision", "archive_population_count", "selection", "comparison_sets", "input_digests", "classification_counts", "implementation_status_counts", "degradation_status_counts", "formal_effect", "authority_boundary", "outputs", "output_sha256"}
# Exact byte pins bind every nested record field, key set, value type, and line ending.
PINNED_RECORDS_SHA256 = "sha256:237a9cf9bae1963205f58e7a925ded128aa265b0f5f5342a9b8ed57fd907d8a0"
PINNED_INVENTORY_SHA256 = "sha256:f9b3e578575d4a05c224cef01cb5cce1113c7587177a6bb1357341ba0d7505bb"
PINNED_BINDING_SHA256 = "sha256:8d105c1becb20c7de9f6f737e85bef7b44861f23e88b4346a690450d9afe2c68"

def artifact_pin_errors(data: bytes, expected_sha256: str, code: str) -> list[str]:
    return [] if expected_sha256 and digest(data) == expected_sha256 else [code]
BOUNDARY = "docs/concept/product-boundary.md"
APPROVAL = "docs/governance/decisions/concept-v4.1-and-four-l1-approval-2026-09-17.md"
L1 = {
    "HELIX-HARNESS": ("docs/helix-harness/L1-planning/product-intent.md", "HARNESS-L1-004", "| HARNESS |", "| `HDEC-HARNESS-L1-01` |"),
    "HELIX-OS": ("docs/helix-os/L1-planning/system-intent.md", "HELIXOS-L1-003", "| HELIX-OS |", "| `HDEC-HELIXOS-L1-01` |"),
    "HELIX-Web": ("docs/helix-web/L1-planning/product-intent.md", "HELIXWEB-L1-001", "| HELIX-Web |", "| `HDEC-HELIXWEB-L1-01` |"),
    "HELIX-Web-OS": ("docs/helix-web-os/L1-planning/system-intent.md", "HELIXWEBOS-L1-002", "| HELIX-Web-OS |", "| `HDEC-HELIXWEBOS-L1-01` |"),
}
EXPECTED = {
    "execution-ticket-acceptance.md": ("multi_product_conflict", ["HELIX-HARNESS", "HELIX-OS"]),
    "execution-ticket-intake.md": ("multi_product_conflict", ["HELIX-HARNESS", "HELIX-OS"]),
    "execution-ticket-recognition.md": ("insufficient_basis", []),
    "execution-ticket-requests.md": ("multi_product_conflict", ["HELIX-HARNESS", "HELIX-OS"]),
    "execution-ticket-requirements.md": ("multi_product_conflict", ["HELIX-HARNESS", "HELIX-OS"]),
    "execution-ticket-trace.md": ("insufficient_basis", []),
    "execution-ticket-validation.md": ("multi_product_conflict", ["HELIX-HARNESS", "HELIX-OS"]),
    "execution-ticket-vision.md": ("multi_product_conflict", ["HELIX-HARNESS", "HELIX-OS"]),
}
SOURCE_UNIMPLEMENTED_CLAIM = {
    "execution-ticket-acceptance.md": True,
    "execution-ticket-intake.md": True,
    "execution-ticket-recognition.md": False,
    "execution-ticket-requests.md": False,
    "execution-ticket-requirements.md": True,
    "execution-ticket-trace.md": True,
    "execution-ticket-validation.md": False,
    "execution-ticket-vision.md": False,
}
EXPECTED_RECORD_KEYS = {"asset_id", "ledger", "source_exact", "classification", "phase", "implementation_degradation", "history_failure_consumer", "authority_boundary"}
NESTED_RECORD_KEYS = {
    "ledger": {"path", "line", "row_sha256", "source_path", "source_sha256", "disposition", "product_target", "implementation_status"},
    "source_exact": {"source_path", "archive_path", "archive_blob", "archive_mode", "archive_type", "bytes", "line_count", "sha256", "manifest_sha256", "ledger_sha256", "read_mode", "semantic_anchors"},
    "classification": {"status", "candidate_products", "rationale", "formal_owner", "formal_classification_updated", "boundary_evidence", "l1_evidence", "approval_evidence"},
    "phase": {"bootstrap_path", "bootstrap_line", "bootstrap_row_sha256", "phase_classification_status", "candidate_phase_targets", "bootstrap_candidate_product_targets", "formal_phase_admission", "phase_updated"},
    "implementation_degradation": {"implementation_status", "bootstrap_implementation_evidence_state", "historical_execution_performed", "source_text_claims_unimplemented_or_unexecuted", "degradation_status", "asset_specific_failure_status", "source_document_presence", "limits"},
    "history_failure_consumer": {"decision_log_asset_match", "read_after_asset_match", "failure_inventory", "consumer_inventory", "consumer_refs", "direct_refs", "consumer_closure_status", "scope_limit", "bootstrap_candidate_product_targets", "counterevidence", "carry_forward_preservation"},
    "authority_boundary": {"authority_effect", "formal_product_authority", "new_build_allowed", "successor_assignment", "legacy_execution_performed"},
}
RATIONALE = {
    "execution-ticket-acceptance.md": "HXT受入は要求・検証・実行契約、HXB受入はBench・Worker観測を含む。HARNESSのV-modelとOSのWorker/計測統制の境界で分割根拠が残っていない。",
    "execution-ticket-intake.md": "sourceはHELIX本体の測定・チューニングと既存Assignment/runner/workerを一体に記述するが、current boundary上のowner分割を決めていない。Web関連を対象外とするsource記述はWeb runtimeへの移管根拠にならない。",
    "execution-ticket-recognition.md": "運用検証候補という文書種別だけでは、4製品の責務境界への具体的な意味接続を確定できない。",
    "execution-ticket-requests.md": "HXT要求はV-model要求・検証追跡と実行契約を混在させ、能力評価・配車への還流はOS側責務候補になる。単一ownerを確定する証拠はない。",
    "execution-ticket-requirements.md": "HXT実行TicketとHXB測定、Assignment、event/read model、dispatch禁止を併記し、現行HARNESSとOSの複数境界にまたがる。",
    "execution-ticket-trace.md": "HXT/HXB IDを他文書へ束縛する索引であり、owner割当の独立した根拠を示さない。",
    "execution-ticket-validation.md": "HXT利用要求は実行・追跡・既存Benchへの接続を含む。文書はHARNESSとOSの責務分担を決めていない。",
    "execution-ticket-vision.md": "「HELIX本体」の実行契約と測定接続を一体に掲げ、HARNESSのV-model実行契約とOSの計測・Worker運用の両境界に接する。単一製品ownerを特定できないため、研究上の複数製品衝突として記録する。",
}


@lru_cache(maxsize=None)
def gshow(rev: str, path: str) -> bytes:
    return subprocess.check_output(["git", "show", f"{rev}:{path}"], cwd=ROOT)


@lru_cache(maxsize=None)
def gjsonl(rev: str, path: str) -> list[tuple[int, dict]]:
    return [(n, json.loads(line)) for n, line in enumerate(gshow(rev, path).decode().splitlines(), 1) if line.strip()]


def digest(data: bytes) -> str:
    return "sha256:" + hashlib.sha256(data).hexdigest()


@lru_cache(maxsize=8)
def independently_derive_direct_refs(path: str) -> tuple[list[dict], int]:
    """Re-scan the fixed-BASE docs tree; carry-forward remains a separate preservation receipt."""
    basename = path.rsplit("/", 1)[-1]
    pattern = re.compile(r"(?<![A-Za-z0-9_-])" + re.escape(basename) + r"(?![A-Za-z0-9_-])")
    paths = subprocess.check_output(["git", "ls-tree", "-r", "--name-only", BASE, "docs"], cwd=ROOT, text=True).splitlines()
    refs, carry_count = [], 0
    for candidate in paths:
        if not candidate.startswith("docs/helix-") and not candidate.startswith("docs/governance/"):
            continue
        data = gshow(BASE, candidate)
        lines = data.decode("utf-8", errors="replace").splitlines()
        matching_lines = [(n, text) for n, text in enumerate(lines, 1) if pattern.search(text)]
        if candidate == "docs/governance/legacy-candidate-source-line-carry-forward.jsonl":
            carry_count += len(matching_lines)
            continue
        for number, text in matching_lines:
            if candidate.endswith("/phase-capability-inventory.json"):
                kind = "phase_inventory_representative_candidate"
            elif candidate.endswith("/legacy-requirement-implementation-crosswalk-bootstrap.jsonl"):
                kind = "implementation_crosswalk_candidate"
            elif candidate.endswith("/pre-isolation-revision-delta-source-holding.jsonl"):
                kind = "pre_isolation_source_holding"
            elif candidate.endswith("/source-audit.md"):
                kind = "source_audit_reference"
            elif candidate.endswith("/legacy-rule-requirement-overlap-clusters.jsonl"):
                kind = "overlap_cluster_candidate"
            elif candidate.endswith("/l2-source-register.md") or (candidate.startswith("docs/helix-") and ("/L2-" in candidate or "/L11-" in candidate)):
                kind = "current_l2_l11_or_register_connection"
            elif candidate.endswith("/legacy-asset-disposition.jsonl"):
                kind = "source_ledger_entry"
            elif candidate.endswith("/legacy-asset-phase-product-classification-bootstrap.jsonl"):
                kind = "bootstrap_classification_record"
            elif candidate.startswith("docs/helix-"):
                kind = "product_context_reference_only"
            else:
                kind = "governance_reference_only"
            refs.append({"reference_kind": kind, "path": candidate, "line": number, "text": text, "sha256": digest(data)})
    return refs, carry_count


def receipt(rev: str, path: str, marker: str) -> dict | None:
    data = gshow(rev, path)
    for n, line in enumerate(data.decode().splitlines(), 1):
        if marker in line:
            blob = subprocess.check_output(["git", "rev-parse", f"{rev}:{path}"], cwd=ROOT, text=True).strip()
            return {"path": path, "blob": blob, "sha256": digest(data), "line": n, "text": line, "text_sha256": digest(line.encode())}
    return None


def row_identity(row: dict) -> tuple[str, str, str]:
    source = row.get("source_exact") or {}
    identity = row.get("source_identity") or {}
    provenance = identity.get("archive_provenance") or {}
    path = row.get("source_path") or source.get("source_path") or identity.get("source_path") or provenance.get("source_path") or ""
    sha = source.get("sha256") or row.get("source_sha256") or identity.get("source_sha256") or provenance.get("sha256") or ""
    if sha and not sha.startswith("sha256:"):
        sha = "sha256:" + sha
    return row.get("asset_id", ""), path, sha


@lru_cache(maxsize=1)
def audit_overlap() -> tuple[dict, dict[str, list[str]]]:
    target_rows = [r for _, r in gjsonl(BASE, LEDGER) if r["source_path"].startswith("docs/governance/candidates/execution-ticket-")]
    target_id = {r["asset_id"] for r in target_rows}
    target_path = {r["source_path"] for r in target_rows}
    target_sha = {"sha256:" + r["source_sha256"] for r in target_rows}
    target_triple = {(r["asset_id"], r["source_path"], "sha256:" + r["source_sha256"]) for r in target_rows}
    sets = [
        ("main", MAIN, None),
    ]
    summaries, errors = {}, {}
    for name, rev, path in sets:
        paths = [p for p in subprocess.check_output(["git", "ls-tree", "-r", "--name-only", rev, "scaffold"], cwd=ROOT, text=True).splitlines() if p.endswith("/classification-research.jsonl")] if path is None else [path]
        identities = [row_identity(r) for p in paths for _, r in gjsonl(rev, p)]
        ids, source_paths, hashes = ({x[i] for x in identities} for i in range(3))
        triple = set(identities)
        summaries[name] = {"revision": rev, "path": path or "all scaffold/*/classification-research.jsonl", "rows": len(identities), "distinct_ids": len(ids)}
        errors[name] = []
        if target_id & ids: errors[name].append("asset_id")
        if target_path & source_paths: errors[name].append("source_path")
        if target_sha & hashes: errors[name].append("source_sha256")
        if target_triple & triple: errors[name].append("triple")
    return summaries, errors


INPUT_PATHS = [LEDGER, PHASE, "docs/governance/legacy-asset-decisions.jsonl", "docs/governance/legacy-asset-copy-read-after.jsonl", BOUNDARY, APPROVAL, "docs/governance/audits/source-rebaseline/legacy-ci-ai-runtime-source-inventory.md", "docs/governance/audits/source-rebaseline/legacy-ci-consumer-relation-inventory.md", "docs/governance/audits/source-rebaseline/l2-source-register.md", "docs/governance/legacy-candidate-source-line-carry-forward.jsonl", "docs/helix-os/L2-requirements/governance-requirements.md", "docs/helix-os/L11-acceptance/governance-acceptance.md", MANIFEST, "docs/governance/new-generation-start-here.md", "docs/governance/legacy-asset-reuse-control.md", *[x[0] for x in L1.values()]]
OUTPUT_PATHS = ["scaffold/bindings/SCF-B-0147.json", "scaffold/legacy-execution-ticket-product-classification-0147/README.md", "scaffold/legacy-execution-ticket-product-classification-0147/PR-DRAFT.md", "scaffold/legacy-execution-ticket-product-classification-0147/generate.py", "scaffold/legacy-execution-ticket-product-classification-0147/inventory.json", "scaffold/legacy-execution-ticket-product-classification-0147/classification-research.jsonl", "scaffold/legacy-execution-ticket-product-classification-0147/validate.py", "scaffold/legacy-execution-ticket-product-classification-0147/selfcheck.py"]


def same_typed_json(actual, expected) -> bool:
    if type(actual) is not type(expected): return False
    if type(expected) is dict:
        return set(actual) == set(expected) and all(same_typed_json(actual[k], expected[k]) for k in expected)
    if type(expected) is list:
        return len(actual) == len(expected) and all(same_typed_json(a, e) for a, e in zip(actual, expected))
    return actual == expected


def expected_inventory(records: list[dict], inventory: dict, set_summaries: dict) -> dict:
    target = [r["ledger"] for r in records]
    return {
        "schema_revision": 1,
        "binding_id": "SCF-B-0147",
        "base_revision": BASE,
        "archive_population_count": 4020,
        "selection": {"rule": "fixed source ledger rows where source_path starts docs/governance/candidates/execution-ticket-; complete thematic family, no row truncation", "candidate_asset_count": 8, "target_ids": [r["asset_id"] for r in records], "source_paths": [r["source_path"] for r in target], "source_sha256s": [r["source_sha256"] for r in target]},
        "comparison_sets": [{"name": name, **summary} for name, summary in sorted(set_summaries.items())],
        "input_digests": [{"path": path, "sha256": digest(gshow(BASE, path))} for path in INPUT_PATHS],
        "classification_counts": {"multi_product_conflict": 6, "insufficient_basis": 2},
        "implementation_status_counts": {"unknown": 8},
        "degradation_status_counts": {"unknown": 8},
        "formal_effect": {"formal_asset_classification_updated": False, "formal_phase_admission": False, "formal_product_authority": None, "new_build_allowed": False, "authority_effect": "none"},
        "authority_boundary": {"authority_effect": "none", "formal_asset_classification_updated": False, "formal_phase_admission": False, "formal_product_authority": None, "formal_owner_decided": False, "formal_implementation_status": "unknown", "formal_consumer_closure": False, "new_build_allowed": False, "LABO": "excluded; Issue #2089 hold remains in force"},
        "outputs": OUTPUT_PATHS,
        "output_sha256": digest(("".join(json.dumps(row, ensure_ascii=False, sort_keys=True, separators=(",", ":")) + "\n" for row in records)).encode()),
    }


def expected_binding(inventory: dict) -> dict:
    return {
        "schema_revision": 1, "id": "SCF-B-0147", "kind": "scaffold",
        "title": "Execution Ticket候補8資産の四製品責務境界研究",
        "product": "HELIX-OS", "owner_candidate": "四製品product-boundary研究（正式owner未解決）",
        "state": "registered", "reason": "固定BASEの旧候補文書8件を静的に読み、現行4製品境界への候補・衝突・不足根拠とphase／実装／縮退／consumerの未確定を分離記録する。正式採否やauthorityは生成しない。",
        "upstream": [{"path": row["path"], "sha256": row["sha256"].removeprefix("sha256:"), "note": "固定BASE Git objectの静的read-only参照のみ。旧archiveは実行しない"} for row in inventory["input_digests"]],
        "role": "legacy asset product-boundary research",
        "obligations": ["台帳の固定ID/path/SHAをsource archiveとmanifestへ照合する", "候補文書の意味を現行4製品境界とL1へ照合する", "implementation/degradation/phase/consumer unknownと証拠を分離する", "候補集合との重複をID/path/SHA/tripleで確認する"],
        "connections": {"boundary": "research evidence only; no formal product, phase, implementation, successor, consumer, runtime, merge, or close authority", "consumers": ["四製品責務境界reviewer", "legacy asset classification follow-up"], "dependencies": ["fixed source BASE a577a7cddd1405de27bf01d22b050eb2acaa9ba9 for disposition and phase ledgers", "fixed comparison main be9cf8cf99ee94a487e54d372d7a34e9266b1ee3 includes merged #2094 and #2096", "fixed archive MANIFEST", "stop before use if current main differs from the pinned revision; recompare the full candidate set against the new main, and stop selection if source scope or any overlap changes"]},
        "operations": {"allowed": ["read fixed Git objects statically", "write research-only scaffold", "run deterministic generator, static validator, negative selfcheck, scfctl static validation"], "forbidden": ["execute legacy archive source/runtime/test/hook/adapter/CI", "旧archiveは実行しない", "promote formal product/phase/implementation/consumer authority", "create successor or new capability", "apply LABO classification; Issue #2089 hold remains in force", "merge, close, deploy"]},
        "artifacts": OUTPUT_PATHS,
        "verification": {"evidence_kind": "scaffold", "scope": ["schema_interface", "source_revision_stale", "negative_case", "forbidden_write_scope"], "oracles": ["validator rederives target family, archive anchors, document basename references, source hashes, manifest, and main overlap from fixed Git objects; merged #2094 and #2096 are counted through main once", "typed semantic closure checks every record, inventory, and Binding field before complete byte pins are checked"], "negative_cases": ["asset omission or duplicate", "semantic anchor omission or mutation", "formal phase/implementation/authority promotion", "direct reference omission, addition, or reclassification", "target overlap with fixed comparison sets", "record, inventory, or Binding nested type/key/value mutation", "ledger byte/line-ending mutation"]},
        "replacement": {"role_target": None, "formal_artifacts": [], "issue": 0, "status": "pending"},
        "created": "2026-09-23", "updated": "2026-09-23",
    }


def _validate_records(records: list[dict], inventory: dict) -> list[str]:
    errors: list[str] = []
    if type(inventory) is not dict: return ["E_INVENTORY_SCHEMA"]
    if set(inventory) != EXPECTED_INV_KEYS: errors.append("E_INVENTORY_SCHEMA")
    if type(inventory.get("base_revision")) is not str or inventory.get("base_revision") != BASE: errors.append("E_BASE_REVISION")
    if type(records) is not list or len(records) != 8 or any(type(row) is not dict for row in records): return errors + ["E_RECORD_SCHEMA"]
    if type(inventory.get("comparison_sets")) is not list or any(type(item) is not dict for item in inventory["comparison_sets"]): return errors + ["E_INVENTORY_SCHEMA"]
    record_bytes = ("".join(json.dumps(row, ensure_ascii=False, sort_keys=True, separators=(",", ":")) + "\n" for row in records)).encode()
    if inventory.get("output_sha256") != digest(record_bytes): errors.append("E_OUTPUT_DIGEST")
    targets = [(n, r) for n, r in gjsonl(BASE, LEDGER) if r["source_path"].startswith("docs/governance/candidates/execution-ticket-")]
    expected_ids = [r["asset_id"] for _, r in targets]
    ids = [r.get("asset_id") for r in records]
    if ids != expected_ids: errors.append("E_TARGET_SET")
    if len(ids) != len(set(ids)): errors.append("E_DUPLICATE")
    target_by_id = {r["asset_id"]: r for _, r in targets}
    phases = {r["asset_id"]: (n, r) for n, r in gjsonl(BASE, PHASE)}
    for row in records:
        if type(row) is not dict: errors.append("E_RECORD_SCHEMA"); continue
        if set(row) != EXPECTED_RECORD_KEYS: errors.append("E_RECORD_SCHEMA:" + str(row.get("asset_id")))
        nested = ("ledger", "source_exact", "classification", "phase", "implementation_degradation", "history_failure_consumer", "authority_boundary")
        if any(type(row.get(key)) is not dict for key in nested): errors.append("E_RECORD_SCHEMA:" + str(row.get("asset_id"))); continue
        if any(set(row[key]) != NESTED_RECORD_KEYS[key] for key in nested): errors.append("E_RECORD_SCHEMA:" + str(row.get("asset_id")))
        aid = row.get("asset_id")
        asset = target_by_id.get(aid)
        if not asset: continue
        path = asset["source_path"]
        basename = path.rsplit("/", 1)[-1]
        archive = ARCHIVE + path
        source = gshow(BASE, archive)
        exact = row["source_exact"]
        tree = subprocess.check_output(["git", "ls-tree", BASE, "--", archive], cwd=ROOT, text=True).strip()
        fields, found = tree.split("\t", 1)
        mode, kind, oid = fields.split()
        manifest = [ln.split()[0] for ln in gshow(BASE, MANIFEST).decode().splitlines() if ln.endswith(" " + path)]
        ledger_row = row.get("ledger", {})
        if (found != archive or mode != "100644" or kind != "blob" or type(exact.get("source_path")) is not str or exact.get("source_path") != path or type(exact.get("archive_path")) is not str or exact.get("archive_path") != archive or type(exact.get("archive_mode")) is not str or exact.get("archive_mode") != mode or type(exact.get("archive_type")) is not str or exact.get("archive_type") != kind or type(exact.get("archive_blob")) is not str or exact.get("archive_blob") != oid or type(exact.get("bytes")) is not int or exact.get("bytes") != len(source) or type(exact.get("line_count")) is not int or exact.get("line_count") != len(source.decode("utf-8", errors="replace").splitlines()) or exact.get("read_mode") != "fixed_git_object_static_read_only" or type(exact.get("sha256")) is not str or exact.get("sha256") != digest(source) or type(exact.get("ledger_sha256")) is not str or exact.get("ledger_sha256") != "sha256:" + asset["source_sha256"] or exact.get("sha256") != exact.get("ledger_sha256") or len(manifest) != 1 or type(exact.get("manifest_sha256")) is not str or exact.get("manifest_sha256") != "sha256:" + manifest[0]): errors.append("E_SOURCE:" + aid)
        expected_ledger = {"path": LEDGER, "line": next(n for n, r in gjsonl(BASE, LEDGER) if r["asset_id"] == aid), "row_sha256": digest(json.dumps(asset, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode()), "source_path": path, "source_sha256": "sha256:" + asset["source_sha256"], "disposition": "unresolved", "product_target": "unresolved", "implementation_status": "unknown"}
        if set(ledger_row) != set(expected_ledger) or any(type(ledger_row.get(k)) is not type(v) or ledger_row.get(k) != v for k, v in expected_ledger.items()): errors.append("E_LEDGER:" + aid)
        lines = source.decode().splitlines()
        expected_markers = {"execution-ticket-acceptance.md": ["以下90件は未実行oracle", "| HXT-AC-001 |", "| HXB-AC-001 |"], "execution-ticket-intake.md": ["本版はHELIX本体の測定・チューニング要求", "現行Assignment／Bench資産の接続", "本書を要求候補として受理"], "execution-ticket-recognition.md": ["# 企画価値の運用検証候補"], "execution-ticket-requests.md": ["現時点は候補であり、新規実行権限を発行しない", "| HXT-RQ-01 |", "| HXT-RQ-05 |"], "execution-ticket-requirements.md": ["# 要件候補", "| ExecutionTicket |", "| MeasurementEpisode / MetricReceipt |", "L3承認・canonical freeze"], "execution-ticket-trace.md": ["canonical freeze・runtime実装・稼働・性能改善は未完了", "HXT-RQ-02 | HXT-FR-013", "| HXB-FR-001 |"], "execution-ticket-validation.md": ["# 利用要求の受入候補", "| HXT-RQ-05 |", "| HXT-RQ-06 |"], "execution-ticket-vision.md": ["通常開発を追加LLM起動なしで観測", "対象はHELIX本体の実行契約と測定接続"]}[basename]
        anchors = exact.get("semantic_anchors")
        if type(anchors) is not list or len(anchors) != len(expected_markers): errors.append("E_ANCHOR:" + aid)
        else:
            actual_markers = [a.get("marker") if type(a) is dict else None for a in anchors]
            if actual_markers != expected_markers: errors.append("E_ANCHOR:" + aid)
            for anchor in anchors:
                if type(anchor) is not dict or set(anchor) != {"line", "marker", "text", "text_sha256"} or type(anchor.get("line")) is not int: errors.append("E_ANCHOR:" + aid); continue
                n = anchor["line"]
                if n < 1 or n > len(lines) or lines[n-1] != anchor.get("text") or type(anchor.get("marker")) is not str or anchor["marker"] not in lines[n-1] or digest(lines[n-1].encode()) != anchor.get("text_sha256"): errors.append("E_ANCHOR:" + aid)
        status, products = EXPECTED[basename]
        cl = row.get("classification", {})
        if type(cl) is not dict or cl.get("status") != status or cl.get("candidate_products") != products or cl.get("rationale") != RATIONALE[basename] or cl.get("formal_owner") is not None or cl.get("formal_classification_updated") is not False: errors.append("E_PRODUCT:" + aid)
        if type(products) is not list or (status == "direct_product_basis" and len(products) != 1) or (status == "multi_product_conflict" and len(products) < 2) or (status == "insufficient_basis" and len(products) != 0): errors.append("E_CATEGORY_PARTITION:" + aid)
        for p, (l1path, l1marker, boundarymarker, approvalmarker) in L1.items():
            for key, target, marker in [("boundary_evidence", BOUNDARY, boundarymarker), ("l1_evidence", l1path, l1marker), ("approval_evidence", APPROVAL, approvalmarker)]:
                actual = receipt(BASE, target, marker)
                if actual is None or type(cl.get(key)) is not list or actual not in cl[key]: errors.append("E_BOUNDARY:" + aid + ":" + p)
        for key, count in (("boundary_evidence", len(L1)), ("l1_evidence", len(L1)), ("approval_evidence", len(L1))):
            values = cl.get(key)
            if type(values) is not list or len(values) != count or any(type(value) is not dict or set(value) != {"path", "blob", "sha256", "line", "text", "text_sha256"} for value in values): errors.append("E_BOUNDARY:" + aid)
        p_line, phase = phases[aid]
        ph = row.get("phase", {})
        expected_phase = {"bootstrap_path": PHASE, "bootstrap_line": p_line, "bootstrap_row_sha256": digest(json.dumps(phase, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode()), "phase_classification_status": phase["phase_classification_status"], "candidate_phase_targets": phase["candidate_phase_targets"], "bootstrap_candidate_product_targets": sorted(phase["candidate_product_targets"]), "formal_phase_admission": False, "phase_updated": False}
        if not same_typed_json(ph, expected_phase): errors.append("E_PHASE:" + aid)
        impl = row.get("implementation_degradation", {})
        expected_impl = {"implementation_status": "unknown", "bootstrap_implementation_evidence_state": phase["implementation_evidence_state"], "historical_execution_performed": False, "source_text_claims_unimplemented_or_unexecuted": SOURCE_UNIMPLEMENTED_CLAIM[basename], "degradation_status": "unknown", "asset_specific_failure_status": "not_established", "source_document_presence": "evidenced", "limits": "historical claim or document presence does not prove implementation, non-implementation, operation, or degradation"}
        if not same_typed_json(impl, expected_impl): errors.append("E_IMPLEMENTATION:" + aid)
        hist = row.get("history_failure_consumer", {})
        identity_terms = (aid, path)
        decision_match = any(term in gshow(BASE, "docs/governance/legacy-asset-decisions.jsonl").decode() for term in identity_terms)
        read_after_match = any(term in gshow(BASE, "docs/governance/legacy-asset-copy-read-after.jsonl").decode() for term in identity_terms)
        failure_match = any(term in gshow(BASE, "docs/governance/audits/source-rebaseline/legacy-ci-ai-runtime-source-inventory.md").decode() for term in identity_terms)
        consumer_match = any(term in gshow(BASE, "docs/governance/audits/source-rebaseline/legacy-ci-consumer-relation-inventory.md").decode() for term in identity_terms)
        derived_refs, carry_scan_count = independently_derive_direct_refs(path)
        expected_scope = "exact basename scan at fixed BASE across docs/helix-* and docs/governance; carry-forward occurrences are summarized separately as source-line preservation, and no reference type establishes consumer closure"
        if type(hist) is not dict or hist.get("consumer_closure_status") != "pending" or hist.get("consumer_refs") != [] or hist.get("decision_log_asset_match") is not decision_match or hist.get("read_after_asset_match") is not read_after_match or hist.get("scope_limit") != expected_scope: errors.append("E_CONSUMER:" + aid)
        if not same_typed_json(hist.get("direct_refs"), derived_refs): errors.append("E_HISTORY:" + aid + ":direct_refs")
        if hist.get("bootstrap_candidate_product_targets") != sorted(phase["candidate_product_targets"]): errors.append("E_BOOTSTRAP_COMPARISON:" + aid)
        if sorted(products) != sorted(phase["candidate_product_targets"]) and not hist.get("counterevidence"): errors.append("E_BOOTSTRAP_COMPARISON:" + aid)
        failure_inventory = hist.get("failure_inventory")
        consumer_inventory = hist.get("consumer_inventory")
        if type(failure_inventory) is not dict or set(failure_inventory) != {"path", "sha256", "asset_id_or_path_match", "match_status"} or failure_inventory.get("path") != "docs/governance/audits/source-rebaseline/legacy-ci-ai-runtime-source-inventory.md" or failure_inventory.get("sha256") != digest(gshow(BASE, failure_inventory["path"])) or failure_inventory.get("asset_id_or_path_match") is not failure_match or failure_inventory.get("match_status") != "no_asset_specific_failure_evidence_located": errors.append("E_HISTORY:" + aid)
        if type(consumer_inventory) is not dict or set(consumer_inventory) != {"path", "sha256", "asset_id_or_path_match", "match_status"} or consumer_inventory.get("path") != "docs/governance/audits/source-rebaseline/legacy-ci-consumer-relation-inventory.md" or consumer_inventory.get("sha256") != digest(gshow(BASE, consumer_inventory["path"])) or consumer_inventory.get("asset_id_or_path_match") is not consumer_match or consumer_inventory.get("match_status") != "no_asset_specific_consumer_closure_located": errors.append("E_HISTORY:" + aid)
        carry = hist.get("carry_forward_preservation")
        carry_path = "docs/governance/legacy-candidate-source-line-carry-forward.jsonl"
        carry_rows = [entry for _, entry in gjsonl(BASE, carry_path) if entry.get("source_path") == path]
        expected_carry = {"path": carry_path, "sha256": digest(gshow(BASE, carry_path)), "matched_source_lines": len(carry_rows), "candidate_source_line_ids_sha256": digest("\n".join(entry["candidate_source_line_id"] for entry in carry_rows).encode()), "scanned_basename_reference_lines": carry_scan_count, "meaning": "source-line preservation evidence; not product-consumer closure"}
        if not same_typed_json(carry, expected_carry): errors.append("E_HISTORY:" + aid + ":carry_forward")
        expected_counterevidence = []
        if sorted(products) != sorted(phase["candidate_product_targets"]): expected_counterevidence.append("bootstrap candidate targets differ from manual semantic-span classification; bootstrap is candidate evidence only")
        if any(ref["reference_kind"] == "current_l2_l11_or_register_connection" for ref in derived_refs): expected_counterevidence.append("current L2/L11 or L2 source register directly connects this historical candidate; rationale cannot claim absence of product connection")
        if type(hist.get("counterevidence")) is not list or hist["counterevidence"] != expected_counterevidence: errors.append("E_HISTORY:" + aid + ":counterevidence")
        auth = row.get("authority_boundary", {})
        expected_auth = {"authority_effect": "none", "formal_product_authority": None, "new_build_allowed": False, "successor_assignment": None, "legacy_execution_performed": False}
        if not same_typed_json(auth, expected_auth): errors.append("E_AUTHORITY:" + aid)
    set_summaries, overlaps = audit_overlap()
    for name, keys in overlaps.items():
        if keys: errors.append("E_OVERLAP:" + name + ":" + ",".join(keys))
    declared_sets = {r.get("name"): r for r in inventory.get("comparison_sets", [])}
    if set(declared_sets) != set(set_summaries): errors.append("E_COMPARISON_SETS")
    for name, actual in set_summaries.items():
        for key in ("revision", "path", "rows", "distinct_ids"):
            declared_value = declared_sets.get(name, {}).get(key)
            if type(declared_value) is not type(actual[key]) or declared_value != actual[key]: errors.append("E_COMPARISON_SET:" + name)
    if not same_typed_json(inventory, expected_inventory(records, inventory, set_summaries)): errors.append("E_INVENTORY_CONTENT")
    category_counts = {"multi_product_conflict": sum(r["classification"].get("status") == "multi_product_conflict" for r in records), "insufficient_basis": sum(r["classification"].get("status") == "insufficient_basis" for r in records)}
    if category_counts != {"multi_product_conflict": 6, "insufficient_basis": 2} or inventory.get("classification_counts") != category_counts: errors.append("E_CATEGORY_PARTITION")
    if inventory.get("authority_boundary") != {"authority_effect": "none", "formal_asset_classification_updated": False, "formal_phase_admission": False, "formal_product_authority": None, "formal_owner_decided": False, "formal_implementation_status": "unknown", "formal_consumer_closure": False, "new_build_allowed": False, "LABO": "excluded; Issue #2089 hold remains in force"}: errors.append("E_AUTHORITY")
    if type(inventory.get("authority_boundary", {}).get("formal_owner_decided")) is not bool or any(type(inventory.get("authority_boundary", {}).get(key)) is not bool for key in ("formal_asset_classification_updated", "formal_phase_admission", "formal_consumer_closure", "new_build_allowed")): errors.append("E_AUTHORITY")
    if type(inventory.get("classification_counts")) is not dict or inventory.get("classification_counts") != {"multi_product_conflict": 6, "insufficient_basis": 2} or any(type(v) is not int for v in inventory["classification_counts"].values()): errors.append("E_CATEGORY_PARTITION")
    return errors


def validate_records(records: list[dict], inventory: dict) -> list[str]:
    try:
        return _validate_records(records, inventory)
    except (AttributeError, KeyError, IndexError, TypeError, ValueError, subprocess.CalledProcessError):
        return ["E_RECORD_SCHEMA"]


def validate_binding(binding: dict, inventory: dict) -> list[str]:
    if type(binding) is not dict or type(inventory) is not dict or type(inventory.get("input_digests")) is not list:
        return ["E_BINDING"]
    try:
        return [] if same_typed_json(binding, expected_binding(inventory)) else ["E_BINDING"]
    except (AttributeError, KeyError, TypeError):
        return ["E_BINDING"]


def verify() -> None:
    record_bytes = (BUNDLE / "classification-research.jsonl").read_bytes()
    inventory_bytes = (BUNDLE / "inventory.json").read_bytes()
    binding_bytes = (ROOT / BINDING).read_bytes()
    if artifact_pin_errors(record_bytes, PINNED_RECORDS_SHA256, "E_RECORD_BYTES"): raise SystemExit("E_RECORD_BYTES: full JSONL object/key/type/value/line-ending pin mismatch")
    if artifact_pin_errors(inventory_bytes, PINNED_INVENTORY_SHA256, "E_INVENTORY_BYTES"): raise SystemExit("E_INVENTORY_BYTES: complete inventory pin mismatch")
    if artifact_pin_errors(binding_bytes, PINNED_BINDING_SHA256, "E_BINDING_BYTES"): raise SystemExit("E_BINDING_BYTES: complete Binding pin mismatch")
    records = [json.loads(line) for line in record_bytes.decode().splitlines() if line.strip()]
    inventory = json.loads(inventory_bytes)
    binding = json.loads(binding_bytes)
    if set(inventory) != EXPECTED_INV_KEYS or inventory.get("output_sha256") != digest(record_bytes): raise SystemExit("E_INVENTORY_SCHEMA: key set or byte binding")
    if validate_binding(binding, inventory): raise SystemExit("E_BINDING: complete typed Binding semantic closure")
    errors = validate_records(records, inventory)
    if errors:
        raise SystemExit("validation failed: " + ", ".join(errors[:12]))
    print(f"SCF-B-0147 static validation passed: {len(records)} assets")


if __name__ == "__main__":
    verify()

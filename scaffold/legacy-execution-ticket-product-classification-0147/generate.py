#!/usr/bin/env python3
"""Generate a read-only product-boundary research projection from fixed Git objects."""
from __future__ import annotations

import hashlib
import json
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
BUNDLE = Path(__file__).resolve().parent
BASE = "a577a7cddd1405de27bf01d22b050eb2acaa9ba9"
MAIN = "be9cf8cf99ee94a487e54d372d7a34e9266b1ee3"
ARCHIVE = "archive/legacy-generation-2026-09-14/root/"
MANIFEST = "archive/legacy-generation-2026-09-14/MANIFEST.sha256"
DISPOSITION = "docs/governance/legacy-asset-disposition.jsonl"
PHASE = "docs/governance/legacy-asset-phase-product-classification-bootstrap.jsonl"
DECISIONS = "docs/governance/legacy-asset-decisions.jsonl"
READ_AFTER = "docs/governance/legacy-asset-copy-read-after.jsonl"
BOUNDARY = "docs/concept/product-boundary.md"
APPROVAL = "docs/governance/decisions/concept-v4.1-and-four-l1-approval-2026-09-17.md"
FAILURE = "docs/governance/audits/source-rebaseline/legacy-ci-ai-runtime-source-inventory.md"
CONSUMER = "docs/governance/audits/source-rebaseline/legacy-ci-consumer-relation-inventory.md"
L1 = {
    "HELIX-HARNESS": ("docs/helix-harness/L1-planning/product-intent.md", "HARNESS-L1-004"),
    "HELIX-OS": ("docs/helix-os/L1-planning/system-intent.md", "HELIXOS-L1-003"),
    "HELIX-Web": ("docs/helix-web/L1-planning/product-intent.md", "HELIXWEB-L1-001"),
    "HELIX-Web-OS": ("docs/helix-web-os/L1-planning/system-intent.md", "HELIXWEBOS-L1-002"),
}
PRODUCT_ROWS = {
    "HELIX-HARNESS": "| HARNESS |",
    "HELIX-OS": "| HELIX-OS |",
    "HELIX-Web": "| HELIX-Web |",
    "HELIX-Web-OS": "| HELIX-Web-OS |",
}
TARGETS = {
    "execution-ticket-acceptance.md": ["以下90件は未実行oracle", "| HXT-AC-001 |", "| HXB-AC-001 |"],
    "execution-ticket-intake.md": ["本版はHELIX本体の測定・チューニング要求", "現行Assignment／Bench資産の接続", "本書を要求候補として受理"],
    "execution-ticket-recognition.md": ["# 企画価値の運用検証候補"],
    "execution-ticket-requests.md": ["現時点は候補であり、新規実行権限を発行しない", "| HXT-RQ-01 |", "| HXT-RQ-05 |"],
    "execution-ticket-requirements.md": ["# 要件候補", "| ExecutionTicket |", "| MeasurementEpisode / MetricReceipt |", "L3承認・canonical freeze"],
    "execution-ticket-trace.md": ["canonical freeze・runtime実装・稼働・性能改善は未完了", "HXT-RQ-02 | HXT-FR-013", "| HXB-FR-001 |"],
    "execution-ticket-validation.md": ["# 利用要求の受入候補", "| HXT-RQ-05 |", "| HXT-RQ-06 |"],
    "execution-ticket-vision.md": ["通常開発を追加LLM起動なしで観測", "対象はHELIX本体の実行契約と測定接続"],
}
PRODUCT_CLASS = {
    "execution-ticket-acceptance.md": ("multi_product_conflict", ["HELIX-HARNESS", "HELIX-OS"], "HXT受入は要求・検証・実行契約、HXB受入はBench・Worker観測を含む。HARNESSのV-modelとOSのWorker/計測統制の境界で分割根拠が残っていない。"),
    "execution-ticket-intake.md": ("multi_product_conflict", ["HELIX-HARNESS", "HELIX-OS"], "sourceはHELIX本体の測定・チューニングと既存Assignment/runner/workerを一体に記述するが、current boundary上のowner分割を決めていない。Web関連を対象外とするsource記述はWeb runtimeへの移管根拠にならない。"),
    "execution-ticket-recognition.md": ("insufficient_basis", [], "運用検証候補という文書種別だけでは、4製品の責務境界への具体的な意味接続を確定できない。"),
    "execution-ticket-requests.md": ("multi_product_conflict", ["HELIX-HARNESS", "HELIX-OS"], "HXT要求はV-model要求・検証追跡と実行契約を混在させ、能力評価・配車への還流はOS側責務候補になる。単一ownerを確定する証拠はない。"),
    "execution-ticket-requirements.md": ("multi_product_conflict", ["HELIX-HARNESS", "HELIX-OS"], "HXT実行TicketとHXB測定、Assignment、event/read model、dispatch禁止を併記し、現行HARNESSとOSの複数境界にまたがる。"),
    "execution-ticket-trace.md": ("insufficient_basis", [], "HXT/HXB IDを他文書へ束縛する索引であり、owner割当の独立した根拠を示さない。"),
    "execution-ticket-validation.md": ("multi_product_conflict", ["HELIX-HARNESS", "HELIX-OS"], "HXT利用要求は実行・追跡・既存Benchへの接続を含む。文書はHARNESSとOSの責務分担を決めていない。"),
    "execution-ticket-vision.md": ("multi_product_conflict", ["HELIX-HARNESS", "HELIX-OS"], "「HELIX本体」の実行契約と測定接続を一体に掲げ、HARNESSのV-model実行契約とOSの計測・Worker運用の両境界に接する。単一製品ownerを特定できないため、研究上の複数製品衝突として記録する。"),
}


def git_bytes(rev: str, path: str) -> bytes:
    return subprocess.check_output(["git", "show", f"{rev}:{path}"], cwd=ROOT)


def git_blob(rev: str, path: str) -> str:
    return subprocess.check_output(["git", "rev-parse", f"{rev}:{path}"], cwd=ROOT, text=True).strip()


def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def lines_at(rev: str, path: str) -> list[str]:
    return git_bytes(rev, path).decode("utf-8", errors="replace").splitlines()


def line_receipt(rev: str, path: str, marker: str) -> dict:
    data = git_bytes(rev, path)
    for number, line in enumerate(data.decode("utf-8", errors="replace").splitlines(), 1):
        if marker in line:
            return {"path": path, "blob": git_blob(rev, path), "sha256": "sha256:" + sha(data), "line": number, "text": line, "text_sha256": "sha256:" + sha(line.encode())}
    raise ValueError(f"marker absent: {rev}:{path}: {marker}")


def jsonl(rev: str, path: str) -> list[tuple[int, dict]]:
    result = []
    for n, line in enumerate(lines_at(rev, path), 1):
        if line.strip():
            result.append((n, json.loads(line)))
    return result


def comparison_summary(rev: str, path: str | None) -> dict:
    paths = [path] if path else [
        p for p in subprocess.check_output(
            ["git", "ls-tree", "-r", "--name-only", rev, "scaffold"], cwd=ROOT, text=True
        ).splitlines() if p.endswith("/classification-research.jsonl")
    ]
    rows = [row for candidate in paths for _, row in jsonl(rev, candidate)]
    identities = {row["asset_id"] for row in rows}
    return {"revision": rev, "path": path or "all scaffold/*/classification-research.jsonl", "rows": len(rows), "distinct_ids": len(identities)}


def direct_reference_kind(path: str) -> str:
    if path.endswith("/phase-capability-inventory.json"):
        return "phase_inventory_representative_candidate"
    if path.endswith("/legacy-requirement-implementation-crosswalk-bootstrap.jsonl"):
        return "implementation_crosswalk_candidate"
    if path.endswith("/pre-isolation-revision-delta-source-holding.jsonl"):
        return "pre_isolation_source_holding"
    if path.endswith("/source-audit.md"):
        return "source_audit_reference"
    if path.endswith("/legacy-rule-requirement-overlap-clusters.jsonl"):
        return "overlap_cluster_candidate"
    if path.endswith("/l2-source-register.md") or (path.startswith("docs/helix-") and ("/L2-" in path or "/L11-" in path)):
        return "current_l2_l11_or_register_connection"
    if path.endswith("/legacy-asset-disposition.jsonl"):
        return "source_ledger_entry"
    if path.endswith("/legacy-asset-phase-product-classification-bootstrap.jsonl"):
        return "bootstrap_classification_record"
    if path.startswith("docs/helix-"):
        return "product_context_reference_only"
    return "governance_reference_only"


def scan_direct_refs(source_path: str) -> tuple[list[dict], dict]:
    """Find exact candidate basenames in fixed-BASE docs; carry-forward has its own preservation receipt."""
    basename = source_path.rsplit("/", 1)[-1]
    pattern = re.compile(r"(?<![A-Za-z0-9_-])" + re.escape(basename) + r"(?![A-Za-z0-9_-])")
    paths = subprocess.check_output(["git", "ls-tree", "-r", "--name-only", BASE, "docs"], cwd=ROOT, text=True).splitlines()
    matches, carry_hits = [], []
    for path in paths:
        if not (path.startswith("docs/helix-") or path.startswith("docs/governance/")):
            continue
        data = git_bytes(BASE, path)
        lines = data.decode("utf-8", errors="replace").splitlines()
        hit_lines = [(n, text) for n, text in enumerate(lines, 1) if pattern.search(text)]
        if path == "docs/governance/legacy-candidate-source-line-carry-forward.jsonl":
            carry_hits.extend(n for n, _ in hit_lines)
            continue
        for line, text in hit_lines:
            matches.append({"reference_kind": direct_reference_kind(path), "path": path, "line": line, "text": text, "sha256": "sha256:" + sha(data)})
    return matches, {"path": "docs/governance/legacy-candidate-source-line-carry-forward.jsonl", "matched_reference_line_count": len(carry_hits), "meaning": "source-line preservation evidence; not product-consumer closure"}


def manifest_sha(source_path: str) -> str:
    matches = [ln.split()[0] for ln in lines_at(BASE, MANIFEST) if ln.endswith(" " + source_path)]
    if len(matches) != 1:
        raise ValueError(f"manifest entry count {source_path}: {len(matches)}")
    return matches[0]


def source_anchor(source_path: str) -> dict:
    basename = source_path.rsplit("/", 1)[-1]
    path = ARCHIVE + source_path
    lines = lines_at(BASE, path)
    anchors = []
    for marker in TARGETS[basename]:
        matches = [(n, text) for n, text in enumerate(lines, 1) if marker in text]
        if len(matches) != 1:
            raise ValueError(f"anchor marker not unique: {source_path} {marker} {len(matches)}")
        n, text = matches[0]
        anchors.append({"line": n, "marker": marker, "text": text, "text_sha256": "sha256:" + sha(text.encode())})
    data = git_bytes(BASE, path)
    tree = subprocess.check_output(["git", "ls-tree", BASE, "--", path], cwd=ROOT, text=True).strip()
    fields, found = tree.split("\t", 1)
    mode, kind, blob = fields.split()
    if found != path or mode != "100644" or kind != "blob":
        raise ValueError(f"archive entry is not a regular blob: {tree}")
    return {
        "source_path": source_path,
        "archive_path": path,
        "archive_blob": blob,
        "archive_mode": mode,
        "archive_type": kind,
        "bytes": len(data),
        "line_count": len(lines),
        "sha256": "sha256:" + sha(data),
        "manifest_sha256": "sha256:" + manifest_sha(source_path),
        "ledger_sha256": None,
        "read_mode": "fixed_git_object_static_read_only",
        "semantic_anchors": anchors,
    }


def main() -> None:
    dispositions = jsonl(BASE, DISPOSITION)
    selected = [(n, row) for n, row in dispositions if row["source_path"].startswith("docs/governance/candidates/execution-ticket-")]
    if len(selected) != 8:
        raise SystemExit(f"expected 8 target assets, found {len(selected)}")
    phase_rows = {r["asset_id"]: (n, r) for n, r in jsonl(BASE, PHASE)}
    records = []
    for ledger_line, asset in selected:
        source_path = asset["source_path"]
        basename = source_path.rsplit("/", 1)[-1]
        phase_line, phase = phase_rows[asset["asset_id"]]
        exact = source_anchor(source_path)
        exact["ledger_sha256"] = "sha256:" + asset["source_sha256"]
        product_class, candidates, rationale = PRODUCT_CLASS[basename]
        boundary = [line_receipt(BASE, BOUNDARY, PRODUCT_ROWS[p]) for p in PRODUCT_ROWS]
        l1 = [line_receipt(BASE, *L1[p]) for p in L1]
        approval_markers = {
            "HELIX-HARNESS": "| `HDEC-HARNESS-L1-01` |",
            "HELIX-OS": "| `HDEC-HELIXOS-L1-01` |",
            "HELIX-Web": "| `HDEC-HELIXWEB-L1-01` |",
            "HELIX-Web-OS": "| `HDEC-HELIXWEBOS-L1-01` |",
        }
        approval = [line_receipt(BASE, APPROVAL, approval_markers[p]) for p in PRODUCT_ROWS]
        decision_text = git_bytes(BASE, DECISIONS).decode()
        read_after_text = git_bytes(BASE, READ_AFTER).decode()
        failure_text = git_bytes(BASE, FAILURE).decode()
        consumer_text = git_bytes(BASE, CONSUMER).decode()
        identity_terms = (asset["asset_id"], source_path)
        history = {
            "decision_log_asset_match": any(term in decision_text for term in identity_terms),
            "read_after_asset_match": any(term in read_after_text for term in identity_terms),
            "failure_inventory": {"path": FAILURE, "sha256": "sha256:" + sha(failure_text.encode()), "asset_id_or_path_match": any(term in failure_text for term in identity_terms), "match_status": "no_asset_specific_failure_evidence_located"},
            "consumer_inventory": {"path": CONSUMER, "sha256": "sha256:" + sha(consumer_text.encode()), "asset_id_or_path_match": any(term in consumer_text for term in identity_terms), "match_status": "no_asset_specific_consumer_closure_located"},
            "consumer_refs": [],
            "direct_refs": [],
            "consumer_closure_status": "pending",
            "scope_limit": "exact basename scan at fixed BASE across docs/helix-* and docs/governance; carry-forward occurrences are summarized separately as source-line preservation, and no reference type establishes consumer closure",
            "bootstrap_candidate_product_targets": sorted(phase["candidate_product_targets"]),
            "counterevidence": [],
        }
        if sorted(candidates) != history["bootstrap_candidate_product_targets"]:
            history["counterevidence"].append("bootstrap candidate targets differ from manual semantic-span classification; bootstrap is candidate evidence only")
        history["direct_refs"], carry_ref_scan = scan_direct_refs(source_path)
        carry_lines = [json.loads(line) for line in git_bytes(BASE, "docs/governance/legacy-candidate-source-line-carry-forward.jsonl").decode().splitlines() if line.strip()]
        carry_matches = [r for r in carry_lines if r.get("source_path") == source_path]
        history["carry_forward_preservation"] = {"path": "docs/governance/legacy-candidate-source-line-carry-forward.jsonl", "sha256": "sha256:" + sha(git_bytes(BASE, "docs/governance/legacy-candidate-source-line-carry-forward.jsonl")), "matched_source_lines": len(carry_matches), "candidate_source_line_ids_sha256": "sha256:" + sha("\n".join(r["candidate_source_line_id"] for r in carry_matches).encode()), "scanned_basename_reference_lines": carry_ref_scan["matched_reference_line_count"], "meaning": "source-line preservation evidence; not product-consumer closure"}
        if any(ref["reference_kind"] == "current_l2_l11_or_register_connection" for ref in history["direct_refs"]):
            history["counterevidence"].append("current L2/L11 or L2 source register directly connects this historical candidate; rationale cannot claim absence of product connection")
        records.append({
            "asset_id": asset["asset_id"],
            "ledger": {"path": DISPOSITION, "line": ledger_line, "row_sha256": "sha256:" + sha(json.dumps(asset, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode()), "source_path": source_path, "source_sha256": "sha256:" + asset["source_sha256"], "disposition": asset["disposition"], "product_target": asset["product_target"], "implementation_status": asset["implementation_status"]},
            "source_exact": exact,
            "classification": {"status": product_class, "candidate_products": candidates, "rationale": rationale, "formal_owner": None, "formal_classification_updated": False, "boundary_evidence": boundary, "l1_evidence": l1, "approval_evidence": approval},
            "phase": {"bootstrap_path": PHASE, "bootstrap_line": phase_line, "bootstrap_row_sha256": "sha256:" + sha(json.dumps(phase, ensure_ascii=False, sort_keys=True, separators=(",", ":")).encode()), "phase_classification_status": phase["phase_classification_status"], "candidate_phase_targets": phase["candidate_phase_targets"], "bootstrap_candidate_product_targets": sorted(phase["candidate_product_targets"]), "formal_phase_admission": False, "phase_updated": False},
            "implementation_degradation": {"implementation_status": "unknown", "bootstrap_implementation_evidence_state": phase["implementation_evidence_state"], "historical_execution_performed": False, "source_text_claims_unimplemented_or_unexecuted": basename in ("execution-ticket-acceptance.md", "execution-ticket-intake.md", "execution-ticket-requirements.md", "execution-ticket-trace.md"), "degradation_status": "unknown", "asset_specific_failure_status": "not_established", "source_document_presence": "evidenced", "limits": "historical claim or document presence does not prove implementation, non-implementation, operation, or degradation"},
            "history_failure_consumer": history,
            "authority_boundary": {"authority_effect": "none", "formal_product_authority": None, "new_build_allowed": False, "successor_assignment": None, "legacy_execution_performed": False},
        })
    ids = [r["asset_id"] for r in records]
    if len(ids) != len(set(ids)):
        raise SystemExit("duplicate target asset IDs")
    (BUNDLE / "classification-research.jsonl").write_text("".join(json.dumps(r, ensure_ascii=False, sort_keys=True, separators=(",", ":")) + "\n" for r in records), encoding="utf-8")
    input_paths = [DISPOSITION, PHASE, DECISIONS, READ_AFTER, BOUNDARY, APPROVAL, FAILURE, CONSUMER, "docs/governance/audits/source-rebaseline/l2-source-register.md", "docs/governance/legacy-candidate-source-line-carry-forward.jsonl", "docs/helix-os/L2-requirements/governance-requirements.md", "docs/helix-os/L11-acceptance/governance-acceptance.md", MANIFEST, "docs/governance/new-generation-start-here.md", "docs/governance/legacy-asset-reuse-control.md", *[x[0] for x in L1.values()]]
    inputs = [{"path": p, "sha256": "sha256:" + sha(git_bytes(BASE, p))} for p in input_paths]
    inv = {
        "schema_revision": 1,
        "binding_id": "SCF-B-0147",
        "base_revision": BASE,
        "archive_population_count": 4020,
        "selection": {"rule": "fixed source ledger rows where source_path starts docs/governance/candidates/execution-ticket-; complete thematic family, no row truncation", "candidate_asset_count": 8, "target_ids": ids, "source_paths": [r["ledger"]["source_path"] for r in records], "source_sha256s": [r["ledger"]["source_sha256"] for r in records]},
        "comparison_sets": [
            {"name": "main", **comparison_summary(MAIN, None)},
        ],
        "input_digests": inputs,
        "classification_counts": {"multi_product_conflict": sum(r["classification"]["status"] == "multi_product_conflict" for r in records), "insufficient_basis": sum(r["classification"]["status"] == "insufficient_basis" for r in records)},
        "implementation_status_counts": {"unknown": len(records)},
        "degradation_status_counts": {"unknown": len(records)},
        "formal_effect": {"formal_asset_classification_updated": False, "formal_phase_admission": False, "formal_product_authority": None, "new_build_allowed": False, "authority_effect": "none"},
        "authority_boundary": {"authority_effect": "none", "formal_asset_classification_updated": False, "formal_phase_admission": False, "formal_product_authority": None, "formal_owner_decided": False, "formal_implementation_status": "unknown", "formal_consumer_closure": False, "new_build_allowed": False, "LABO": "excluded; Issue #2089 hold remains in force"},
        "outputs": ["scaffold/bindings/SCF-B-0147.json", "scaffold/legacy-execution-ticket-product-classification-0147/README.md", "scaffold/legacy-execution-ticket-product-classification-0147/PR-DRAFT.md", "scaffold/legacy-execution-ticket-product-classification-0147/generate.py", "scaffold/legacy-execution-ticket-product-classification-0147/inventory.json", "scaffold/legacy-execution-ticket-product-classification-0147/classification-research.jsonl", "scaffold/legacy-execution-ticket-product-classification-0147/validate.py", "scaffold/legacy-execution-ticket-product-classification-0147/selfcheck.py"],
    }
    inv["output_sha256"] = "sha256:" + sha((BUNDLE / "classification-research.jsonl").read_bytes())
    (BUNDLE / "inventory.json").write_text(json.dumps(inv, ensure_ascii=False, sort_keys=True, indent=2) + "\n", encoding="utf-8")
    artifacts = [
        "scaffold/bindings/SCF-B-0147.json",
        "scaffold/legacy-execution-ticket-product-classification-0147/README.md",
        "scaffold/legacy-execution-ticket-product-classification-0147/PR-DRAFT.md",
        "scaffold/legacy-execution-ticket-product-classification-0147/generate.py",
        "scaffold/legacy-execution-ticket-product-classification-0147/inventory.json",
        "scaffold/legacy-execution-ticket-product-classification-0147/classification-research.jsonl",
        "scaffold/legacy-execution-ticket-product-classification-0147/validate.py",
        "scaffold/legacy-execution-ticket-product-classification-0147/selfcheck.py",
    ]
    binding = {
        "schema_revision": 1, "id": "SCF-B-0147", "kind": "scaffold",
        "title": "Execution Ticket候補8資産の四製品責務境界研究",
        "product": "HELIX-OS", "owner_candidate": "四製品product-boundary研究（正式owner未解決）",
        "state": "registered", "reason": "固定BASEの旧候補文書8件を静的に読み、現行4製品境界への候補・衝突・不足根拠とphase／実装／縮退／consumerの未確定を分離記録する。正式採否やauthorityは生成しない。",
        "upstream": [{"path": x["path"], "sha256": x["sha256"].removeprefix("sha256:"), "note": "固定BASE Git objectの静的read-only参照のみ。旧archiveは実行しない"} for x in inputs],
        "role": "legacy asset product-boundary research",
        "obligations": ["台帳の固定ID/path/SHAをsource archiveとmanifestへ照合する", "候補文書の意味を現行4製品境界とL1へ照合する", "implementation/degradation/phase/consumer unknownと証拠を分離する", "候補集合との重複をID/path/SHA/tripleで確認する"],
        "connections": {"boundary": "research evidence only; no formal product, phase, implementation, successor, consumer, runtime, merge, or close authority", "consumers": ["四製品責務境界reviewer", "legacy asset classification follow-up"], "dependencies": ["fixed source BASE a577a7cddd1405de27bf01d22b050eb2acaa9ba9 for disposition and phase ledgers", "fixed comparison main be9cf8cf99ee94a487e54d372d7a34e9266b1ee3 includes merged #2094 and #2096", "fixed archive MANIFEST", "stop before use if current main differs from the pinned revision; recompare the full candidate set against the new main, and stop selection if source scope or any overlap changes"]},
        "operations": {"allowed": ["read fixed Git objects statically", "write research-only scaffold", "run deterministic generator, static validator, negative selfcheck, scfctl static validation"], "forbidden": ["execute legacy archive source/runtime/test/hook/adapter/CI", "旧archiveは実行しない", "promote formal product/phase/implementation/consumer authority", "create successor or new capability", "apply LABO classification; Issue #2089 hold remains in force", "merge, close, deploy"]},
        "artifacts": artifacts,
        "verification": {"evidence_kind": "scaffold", "scope": ["schema_interface", "source_revision_stale", "negative_case", "forbidden_write_scope"], "oracles": ["validator rederives target family, archive anchors, document basename references, source hashes, manifest, and main overlap from fixed Git objects; merged #2094 and #2096 are counted through main once", "typed semantic closure checks every record, inventory, and Binding field before complete byte pins are checked"], "negative_cases": ["asset omission or duplicate", "semantic anchor omission or mutation", "formal phase/implementation/authority promotion", "direct reference omission, addition, or reclassification", "target overlap with fixed comparison sets", "record, inventory, or Binding nested type/key/value mutation", "ledger byte/line-ending mutation"]},
        "replacement": {"role_target": None, "formal_artifacts": [], "issue": 0, "status": "pending"},
        "created": "2026-09-23", "updated": "2026-09-23",
    }
    (ROOT / "scaffold/bindings/SCF-B-0147.json").write_text(json.dumps(binding, ensure_ascii=False, sort_keys=True, indent=2) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""Generate bounded semantic relation evidence for four pre-isolation L1 paths."""

from __future__ import annotations

import hashlib
import json
import subprocess
from pathlib import Path


HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
PRE_ISOLATION = "2d4991042be55268bac30a8bbcdac45b3865030a"
ARCHIVE = "064280b5c1c5c98f949e6e3be5ef87cbe4a4b658"
CURRENT_HEAD = "3df81ad27157c471e004083783f37a5860eaa2ee"
FIRST15_PATH = "scaffold/pre-isolation-outside-holding-first15/inventory.json"
REGISTER_PATH = "docs/governance/management-provisional-requirement-register.jsonl"
DECISION_PATH = "docs/governance/decisions/concept-v4.1-and-four-l1-approval-2026-09-17.md"
BOUNDARY_PATH = "docs/concept/product-boundary.md"
START_HERE_PATH = "docs/governance/new-generation-start-here.md"
HOLDING_PATH = "docs/governance/pre-isolation-revision-delta-source-holding.jsonl"
DISPOSITION_PROGRAM_PATH = "docs/governance/requirement-disposition-review-program.md"
SCHEMA = "rdp001-preisolation-outside-l1-semantic/v1"

PRODUCTS = ["HELIX-HARNESS", "HELIX-OS", "HELIX-Web", "HELIX-Web-OS"]

CASES = [
    {
        "case_id": "OUTSIDE67-L1-HARNESS",
        "product": "HELIX-HARNESS",
        "old_path": "docs/design/harness/L1-planning/product-intent.md",
        "current_path": "docs/helix-harness/L1-planning/product-intent.md",
        "relation": "partial",
        "relation_label": "partial_substantive_subset",
        "decision_id": "HDEC-HARNESS-L1-01",
        "decision_line": 26,
        "boundary_line": 36,
        "anchors": [
            {"kind": "old_current_exact", "old": [28, 34], "current": [28, 34], "claim": "HARNESS-L1-001..007の7要求行は現行L1へ保持されている"},
            {"kind": "current_addition", "current": [35, 36], "claim": "現行L1はHARNESS-L1-008..009を追加して9要求へ拡張している"},
            {"kind": "old_current_exact", "old": [54, 56], "current": [56, 58], "claim": "Worker・CI・state等をOSへ置く対象外境界は保持されている"},
            {"kind": "decision_approved_sha", "decision": [26, 26], "current": [1, 64], "claim": "現行L1の承認対象SHAはdecision recordへ記録されている"},
            {"kind": "boundary_owner", "boundary": [36, 36], "claim": "HARNESSの所有責務はVモデル・工程・要求・設計・検証対応として記録されている"},
        ],
        "semantic_gap": "旧sourceは7要求、現行承認L1は9要求。旧7要求の保持は確認できるが、追加2要求と旧source blobの保存関係は別途記録が必要。",
    },
    {
        "case_id": "OUTSIDE67-L1-OS",
        "product": "HELIX-OS",
        "old_path": "docs/design/helix-os/L1-planning/system-intent.md",
        "current_path": "docs/helix-os/L1-planning/system-intent.md",
        "relation": "partial",
        "relation_label": "partial_refined_boundary",
        "decision_id": "HDEC-HELIXOS-L1-01",
        "decision_line": 27,
        "boundary_line": 37,
        "anchors": [
            {"kind": "old_current_exact_except_one", "old": [29, 34], "current": [29, 34], "claim": "HELIXOS-L1-001..006の6要求行は同一内容で保持されている"},
            {"kind": "semantic_refinement", "old": [35, 35], "current": [35, 35], "claim": "HELIXOS-L1-007は旧来のdeployment統制からpackage運転・release準備・artifact受渡しとruntime deployment authority分離へ精緻化されている"},
            {"kind": "semantic_refinement", "old": [54, 54], "current": [54, 54], "claim": "P6投影もdeployment運転を含む表現からHARNESS配布・release準備・artifact受渡しへ変更されている"},
            {"kind": "old_current_exact", "old": [61, 63], "current": [61, 63], "claim": "OSは各対象を管理するがWeb-OS runtimeを内包しない境界は保持されている"},
            {"kind": "decision_approved_sha", "decision": [27, 27], "current": [1, 69], "claim": "現行L1の精緻化後SHAはdecision recordへ記録されている"},
            {"kind": "boundary_owner", "boundary": [37, 37], "claim": "OSの所有責務はproject群の管理・統制・Worker・CI・継続改善として記録されている"},
        ],
        "semantic_gap": "旧L1-007/P6のdeployment運転を現行L1はruntime deployment authorityから分離している。旧文言の意味同値は成立せず、差分の保持・採否関係を別途判断する必要がある。",
    },
    {
        "case_id": "OUTSIDE67-L1-WEB",
        "product": "HELIX-Web",
        "old_path": "docs/design/helix-web/L1-planning/product-intent.md",
        "current_path": "docs/helix-web/L1-planning/product-intent.md",
        "relation": "exact",
        "relation_label": "exact_substantive_content",
        "decision_id": "HDEC-HELIXWEB-L1-01",
        "decision_line": 28,
        "boundary_line": 38,
        "anchors": [
            {"kind": "old_current_exact", "old": [24, 26], "current": [24, 26], "claim": "WebのConnector型AI開発SaaS価値と重複実装禁止境界は同一"},
            {"kind": "old_current_exact", "old": [30, 35], "current": [30, 35], "claim": "HELIXWEB-L1-001..006の6要求行は同一"},
            {"kind": "old_current_exact", "old": [47, 49], "current": [47, 49], "claim": "HARNESS・OS・Web-OSへの責務分離境界は同一"},
            {"kind": "decision_approved_sha", "decision": [28, 28], "current": [1, 56], "claim": "現行L1の承認対象SHAはdecision recordへ記録されている"},
            {"kind": "boundary_owner", "boundary": [38, 38], "claim": "Webの所有責務はConnector型AI開発SaaSのdashboard・service・操作体験として記録されている"},
        ],
        "semantic_gap": "実質本文は同一。front matterのparent_candidateとsource_vision pathだけが現行構成へ更新されており、旧blob保存と現行承認L1のrelationを別記録する必要がある。",
    },
    {
        "case_id": "OUTSIDE67-L1-WEB-OS",
        "product": "HELIX-Web-OS",
        "old_path": "docs/design/helix-web-os/L1-planning/system-intent.md",
        "current_path": "docs/helix-web-os/L1-planning/system-intent.md",
        "relation": "exact",
        "relation_label": "exact_substantive_content",
        "decision_id": "HDEC-HELIXWEBOS-L1-01",
        "decision_line": 29,
        "boundary_line": 39,
        "anchors": [
            {"kind": "old_current_exact", "old": [14, 15], "current": [14, 15], "claim": "Web-OSの独立service runtimeとOS state分離の価値は同一"},
            {"kind": "old_current_exact", "old": [19, 23], "current": [19, 23], "claim": "HELIXWEBOS-L1-001..005の5要求行は同一"},
            {"kind": "old_current_exact", "old": [39, 44], "current": [39, 44], "claim": "独立運転・service log連携・credential/data分離境界は同一"},
            {"kind": "decision_approved_sha", "decision": [29, 29], "current": [1, 50], "claim": "現行L1の承認対象SHAはdecision recordへ記録されている"},
            {"kind": "boundary_owner", "boundary": [39, 39], "claim": "Web-OSの所有責務はtenant・Connector・job・service state・配備・監視・復旧として記録されている"},
        ],
        "semantic_gap": "実質本文は同一。front matterのparent_candidate pathだけが現行構成へ更新されており、旧blob保存と現行承認L1のrelationを別記録する必要がある。",
    },
]


def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def load_jsonl(path: Path) -> list[dict]:
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


def git_blob(commit: str, path: str) -> bytes:
    return subprocess.run(["git", "show", f"{commit}:{path}"], cwd=ROOT, check=True, stdout=subprocess.PIPE).stdout


def git_oid(commit: str, path: str) -> str | None:
    result = subprocess.run(["git", "rev-parse", f"{commit}:{path}"], cwd=ROOT, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL, text=True)
    return result.stdout.strip() if result.returncode == 0 else None


def exact_hits(value: object, target: str, path: str = "") -> list[str]:
    hits: list[str] = []
    if isinstance(value, dict):
        for key, child in value.items():
            child_path = f"{path}.{key}" if path else key
            if child == target:
                hits.append(child_path)
            hits.extend(exact_hits(child, target, child_path))
    elif isinstance(value, list):
        for index, child in enumerate(value):
            hits.extend(exact_hits(child, target, f"{path}[{index}]"))
    return hits


def line_anchor(data: bytes, start: int, end: int) -> dict:
    lines = data.decode("utf-8").splitlines()
    selected = lines[start - 1:end]
    return {"line_start": start, "line_end": end, "text": selected, "sha256": sha("\n".join(selected).encode("utf-8"))}


def live_holdings(register: list[dict]) -> list[dict]:
    superseded = {row.get("supersedes_registration_id") for row in register if row.get("supersedes_registration_id")}
    live = [row for row in register if row.get("registration_id") not in superseded]
    result = []
    for row in live:
        path = ROOT / row["source_atom_set_ref"]
        records = load_jsonl(path)
        result.append({
            "registration_id": row["registration_id"],
            "source_atom_set_ref": row["source_atom_set_ref"],
            "source_atom_set_sha256": sha(path.read_bytes()),
            "source_atom_set_record_count": len(records),
            "registration_kind": row["registration_kind"],
            "product_target": row["product_target"],
            "authority_effect": row["authority_effect"],
            "register_line": next(i for i, item in enumerate(register, 1) if item["registration_id"] == row["registration_id"]),
        })
    return result


def first15_row(path: str) -> dict:
    inventory = json.loads((ROOT / FIRST15_PATH).read_text(encoding="utf-8"))
    return next(row for row in inventory["paths"] if row["path"] == path)


def build_case(case: dict, holdings: list[dict], holding_rows: dict[str, list[dict]], decision_bytes: bytes, boundary_bytes: bytes) -> dict:
    old_blob = git_blob(PRE_ISOLATION, case["old_path"])
    archive_blob = git_blob(ARCHIVE, case["old_path"])
    old_oid = git_oid(PRE_ISOLATION, case["old_path"])
    archive_oid = git_oid(ARCHIVE, case["old_path"])
    current_bytes = (ROOT / case["current_path"]).read_bytes()
    current_oid = git_oid(CURRENT_HEAD, case["current_path"])
    report_row = first15_row(case["old_path"])
    relations = []
    old_sha = sha(old_blob)
    for holding in holdings:
        path_hits: list[str] = []
        blob_hits: list[str] = []
        sha_hits: list[str] = []
        for index, item in enumerate(holding_rows[holding["registration_id"]], 1):
            path_hits.extend(f"{index}:{hit}" for hit in exact_hits(item, case["old_path"]))
            blob_hits.extend(f"{index}:{hit}" for hit in exact_hits(item, old_oid or ""))
            sha_hits.extend(f"{index}:{hit}" for hit in exact_hits(item, old_sha))
        relations.append({
            "registration_id": holding["registration_id"],
            "source_atom_set_ref": holding["source_atom_set_ref"],
            "path_match_count": len(path_hits),
            "pre_isolation_blob_match_count": len(blob_hits),
            "pre_isolation_sha256_match_count": len(sha_hits),
            "path_match_evidence": path_hits,
            "blob_match_evidence": blob_hits,
            "sha256_match_evidence": sha_hits,
            "relation": "no_exact_path_or_blob_or_sha_match" if not (path_hits or blob_hits or sha_hits) else "match_requires_review",
        })
    anchors = []
    for spec in case["anchors"]:
        item = {"kind": spec["kind"], "claim": spec["claim"]}
        if "old" in spec:
            item["old"] = {"ref": f"{PRE_ISOLATION}:{case['old_path']}", **line_anchor(old_blob, *spec["old"])}
        if "current" in spec:
            item["current"] = {"ref": f"{CURRENT_HEAD}:{case['current_path']}", **line_anchor(current_bytes, *spec["current"])}
        if "decision" in spec:
            item["decision"] = {"ref": DECISION_PATH, **line_anchor(decision_bytes, *spec["decision"])}
        if "boundary" in spec:
            item["boundary"] = {"ref": BOUNDARY_PATH, **line_anchor(boundary_bytes, *spec["boundary"])}
        anchors.append(item)
    return {
        "case_id": case["case_id"],
        "product": case["product"],
        "old_source": {
            "path": case["old_path"],
            "commit": PRE_ISOLATION,
            "blob_oid": old_oid,
            "sha256": old_sha,
            "bytes": len(old_blob),
            "reported_blob_oid": report_row["pre_isolation"]["blob_oid"],
            "reported_blob_oid_matches_git": old_oid == report_row["pre_isolation"]["blob_oid"],
        },
        "archive_source": {
            "commit": ARCHIVE,
            "blob_oid": archive_oid,
            "sha256": sha(archive_blob),
            "bytes": len(archive_blob),
            "relation_to_pre_isolation": "same" if archive_blob == old_blob else "different",
        },
        "current_approved_l1": {
            "path": case["current_path"],
            "commit": CURRENT_HEAD,
            "blob_oid": current_oid,
            "sha256": sha(current_bytes),
            "bytes": len(current_bytes),
            "decision_id": case["decision_id"],
            "decision_line": case["decision_line"],
        },
        "product_boundary": {"path": BOUNDARY_PATH, "line": case["boundary_line"]},
        "semantic_relation": case["relation"],
        "semantic_relation_label": case["relation_label"],
        "semantic_gap": case["semantic_gap"],
        "line_anchored_evidence": anchors,
        "existing_holding_relation": "no_exact_path_or_blob_or_sha_match_in_13_live_holdings" if all(item["relation"] == "no_exact_path_or_blob_or_sha_match" for item in relations) else "match_requires_review",
        "live_holding_relations": relations,
        "preservation_disposition": "source_holding_required_before_semantic_disposition",
        "semantic_evidence_role": "evidence_only_not_source_holding",
        "source_holding_precondition": "required_before_semantic_disposition",
        "formal_source_holding_created": False,
        "authority_effect": "none",
        "meaning_change_applied": False,
        "successor_requirement_ids": [],
        "human_decision_ref": None,
        "old_runtime_test_ci_execution": False,
    }


def build() -> dict:
    register_bytes = (ROOT / REGISTER_PATH).read_bytes()
    decision_bytes = (ROOT / DECISION_PATH).read_bytes()
    boundary_bytes = (ROOT / BOUNDARY_PATH).read_bytes()
    disposition_program_bytes = (ROOT / DISPOSITION_PROGRAM_PATH).read_bytes()
    register = load_jsonl(ROOT / REGISTER_PATH)
    holdings = live_holdings(register)
    holding_rows = {item["registration_id"]: load_jsonl(ROOT / item["source_atom_set_ref"]) for item in holdings}
    cases = [build_case(case, holdings, holding_rows, decision_bytes, boundary_bytes) for case in CASES]
    return {
        "schema": SCHEMA,
        "candidate_id": "RDP-001-PREISO-OUTSIDE-L1-SEMANTIC-0036",
        "status": "findings_only",
        "authority_effect": "none",
        "meaning_change_applied": False,
        "successor_requirement_ids": [],
        "human_decision_ref": None,
        "formal_source_holding_created": False,
        "old_runtime_test_ci_execution": False,
        "scope": {
            "pre_isolation_commit": PRE_ISOLATION,
            "archive_commit": ARCHIVE,
            "current_head": CURRENT_HEAD,
            "selected_old_path_count": len(cases),
            "approved_products": PRODUCTS,
            "selection_rule": "outside-67 first15 inventory rows with phase_scope=L1-planning, one path per approved product",
            "first15_inventory_path": FIRST15_PATH,
            "first15_inventory_sha256": sha((ROOT / FIRST15_PATH).read_bytes()),
            "management_register_path": REGISTER_PATH,
            "management_register_sha256": sha(register_bytes),
            "decision_record_path": DECISION_PATH,
            "decision_record_sha256": sha(decision_bytes),
            "product_boundary_path": BOUNDARY_PATH,
            "product_boundary_sha256": sha(boundary_bytes),
            "pre_isolation_holding_path": HOLDING_PATH,
            "pre_isolation_holding_sha256": sha((ROOT / HOLDING_PATH).read_bytes()),
            "disposition_program_path": DISPOSITION_PROGRAM_PATH,
            "disposition_program_sha256": sha(disposition_program_bytes),
            "live_holding_count": len(holdings),
            "read_only": True,
        },
        "live_holdings": holdings,
        "cases": cases,
        "aggregate": {
            "semantic_relation_counts": {key: sum(item["semantic_relation"] == key for item in cases) for key in ("exact", "partial", "unresolved")},
            "holding_exact_match_count": sum(item["existing_holding_relation"] != "no_exact_path_or_blob_or_sha_match_in_13_live_holdings" for item in cases),
            "preservation_unresolved_count": sum(item["preservation_disposition"] == "source_holding_required_before_semantic_disposition" for item in cases),
        },
        "findings": [
            "旧pre-isolation blobとarchive blobは4件すべて同一で、Git objectとoutside-67 first15 inventoryをread-only照合した。",
            "HARNESSは旧7要求行を現行9要求L1へ保持しつつ2要求を追加したpartial relationである。",
            "HELIX-OSはL1-007/P6のdeployment責務をruntime authorityから分離する精緻化を行ったpartial relationである。",
            "HELIX-WebとHELIX-Web-OSはfront matterの参照path以外の本文要求・境界が同一のexact substantive relationである。",
            "4件とも13 live source holdingにexact path、pre-isolation blob OID、SHAの一致はなく、意味relationとsource保存残差を分離して保持した。",
            "要求disposition contractに従い、4件すべてsource_holding登録をsemantic dispositionの前提とする。現行承認L1とdecision recordはsemantic relationの証拠にすぎず、source_holdingを代替しない。",
        ],
        "prohibited_inference": [
            "semantic relationから旧blobの自動採用、successor、requirement identityを生成しない",
            "current approved L1の存在から旧pathのsource_holding保存完了を推定しない",
            "partial relationをmeaning equivalence、retire、縮退の判断へ昇格しない",
            "13 live holdingへの不一致を要求意味の不在、不採用、廃止へ解釈しない",
            "old archive/runtime/test/CI/hookを実行せず、oracle、fallback、implementationへ使わない",
            "このcandidateから正式source_holding、requirement_candidate、authority、consumer closureを生成しない",
        ],
        "verification_scope": {
            "evidence_kind": "scaffold",
            "static_only": True,
            "checks": ["old blob identity", "line anchors", "approved L1 SHA", "decision/boundary references", "13 live holding exact scan", "authority boundary"],
        },
        "source_holding_rule": "new_source_requires_source_holding_before_semantic_disposition",
    }


if __name__ == "__main__":
    (HERE / "inventory.json").write_text(json.dumps(build(), ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

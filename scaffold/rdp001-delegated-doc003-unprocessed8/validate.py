#!/usr/bin/env python3
"""DELEGATED-DOC-003の未処理先頭8文書をread-onlyで再計算する。"""

from __future__ import annotations

import hashlib
import json
import re
import subprocess
import sys
from collections import Counter
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
REPORT_PATH = HERE / "report.json"
BINDING_PATH = ROOT / "scaffold/bindings/SCF-B-0029.json"
HOLDING_PATH = ROOT / "docs/governance/delegated-requirement-document-source-holding.jsonl"
INVENTORY_PATH = ROOT / "docs/governance/delegated-requirement-document-source-inventory.md"
REFERENCE_PATH = ROOT / "docs/governance/delegated-requirement-document-reference-inventory.md"
DISPOSITION_PATH = ROOT / "docs/governance/legacy-asset-disposition.jsonl"
DECISIONS_PATH = ROOT / "docs/governance/legacy-asset-decisions.jsonl"
REGISTER_PATH = ROOT / "docs/governance/management-provisional-requirement-register.jsonl"
SCREEN_PATH = ROOT / "docs/governance/audits/source-rebaseline/l2d-s1-01-input-holding-screen.jsonl"

HEAD = "569d7373c32287bbafadeec6043472563937c5c7"
ARCHIVE = "064280b5c1c5c98f949e6e3be5ef87cbe4a4b658"
HOLDING_SHA = "23d1df9c24b579c78c5836390d4c62c345e483eca42a9452742fad28d1e787fd"
SELECTED = [
    "DELEGATED-DOC-001", "DELEGATED-DOC-009", "DELEGATED-DOC-010", "DELEGATED-DOC-012",
    "DELEGATED-DOC-019", "DELEGATED-DOC-020", "DELEGATED-DOC-021", "DELEGATED-DOC-022",
]
PROCESSED = {
    "DELEGATED-DOC-002", "DELEGATED-DOC-003", "DELEGATED-DOC-004", "DELEGATED-DOC-005",
    "DELEGATED-DOC-006", "DELEGATED-DOC-007", "DELEGATED-DOC-008", "DELEGATED-DOC-011",
    "DELEGATED-DOC-013", "DELEGATED-DOC-014", "DELEGATED-DOC-015", "DELEGATED-DOC-016",
    "DELEGATED-DOC-017", "DELEGATED-DOC-018", "DELEGATED-DOC-028", "DELEGATED-DOC-029",
    "DELEGATED-DOC-030", "DELEGATED-DOC-034",
}
LEXICAL = {
    "failure": re.compile(r"failure|fail|失敗|障害", re.I),
    "degraded": re.compile(r"degrad|縮退|degradation", re.I),
    "implementation": re.compile(r"implement|implementation|実装|未実装", re.I),
    "consumer": re.compile(r"consumer|downstream|利用先|利用者|消費", re.I),
    "decision": re.compile(r"decision|approval|判断|承認", re.I),
}


def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def jsonl(path: Path) -> list[dict]:
    return [json.loads(x) for x in path.read_text(encoding="utf-8").splitlines() if x.strip()]


def git_show(spec: str) -> bytes:
    return subprocess.run(["git", "show", spec], cwd=ROOT, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True).stdout


def git_oid(spec: str) -> str:
    return subprocess.run(["git", "rev-parse", spec], cwd=ROOT, stdout=subprocess.PIPE, text=True, check=True).stdout.strip()


def present(commit: str, path: str) -> bool:
    return subprocess.run(["git", "cat-file", "-e", f"{commit}:{path}"], cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL).returncode == 0


def numeric_id(value: str) -> int:
    return int(value.rsplit("-", 1)[1])


def product_candidate(path: str) -> str:
    return "HELIX-HARNESS" if path.startswith("docs/test-design/harness/") else "shared-cross-product"


def phase_candidate(row: dict) -> str:
    ident = row["source_document_id"]
    path = row["source_path"]
    if ident == "DELEGATED-DOC-019":
        return "L11-L12-acceptance"
    if ident == "DELEGATED-DOC-020":
        return "L6"
    if ident == "DELEGATED-DOC-021":
        return "L3-authority"
    if ident == "DELEGATED-DOC-022":
        return "L8"
    if "/L3-requirements/" in path:
        return "L3"
    return "unknown"


def expect(errors: list[str], ok: bool, message: str) -> None:
    if not ok:
        errors.append(message)


def validate(report: dict | None = None) -> list[str]:
    errors: list[str] = []
    if report is None:
        try:
            report = json.loads(REPORT_PATH.read_text(encoding="utf-8"))
        except Exception as exc:
            return [f"report.jsonを読めない: {exc}"]
    try:
        holding = jsonl(HOLDING_PATH)
        disposition = jsonl(DISPOSITION_PATH)
        registrations = jsonl(REGISTER_PATH)
        screens = jsonl(SCREEN_PATH)
    except Exception as exc:
        return [f"上流台帳を読めない: {exc}"]
    by_id = {x["source_document_id"]: x for x in holding}
    by_path = {x["source_path"]: x for x in disposition}

    expect(errors, report.get("schema_revision") == 1, "schema_revision不一致")
    expect(errors, report.get("status") == "findings_only", "status不一致")
    expect(errors, report.get("authority_effect") == "none", "authority_effect不一致")
    expect(errors, report.get("binding_id") == "SCF-B-0029", "binding_id不一致")
    expect(errors, report.get("binding_state") == "registered", "binding state不一致")
    expect(errors, report.get("scope", {}).get("holding_granularity") == "file_blob", "holding granularity不一致")
    expect(errors, report.get("scope", {}).get("file_blob_is_not_single_requirement_atom") is True, "file blob atom境界が無い")
    expect(errors, report.get("scope", {}).get("source_count") == 114, "source count不一致")
    expect(errors, report.get("scope", {}).get("processed_count_subtracted") == 18, "processed denominator不一致")
    expect(errors, report.get("scope", {}).get("remaining_count") == 96, "remaining denominator不一致")
    expect(errors, report.get("scope", {}).get("remaining_count_semantics") == "static_audit_not_yet_sampled; not semantic atomization closure", "remaining count意味境界不一致")
    expect(errors, report.get("scope", {}).get("atomization_pending_count") == 114, "atomization pending分母不一致")
    expect(errors, report.get("scope", {}).get("selected_count") == 8, "selected denominator不一致")
    expect(errors, report.get("scope", {}).get("selected_ids") == SELECTED, "selected IDs不一致")
    expect(errors, report.get("revisions", {}).get("current_head") == HEAD, "current HEAD report不一致")
    expect(errors, report.get("revisions", {}).get("current_ref") == "origin/main", "current ref不一致")
    expect(errors, subprocess.run(["git", "rev-parse", "HEAD"], cwd=ROOT, text=True, stdout=subprocess.PIPE, check=True).stdout.strip() == HEAD, "worktree HEAD不一致")
    expect(errors, len(holding) == 114, f"holding件数不一致: {len(holding)}")
    expect(errors, sha(HOLDING_PATH) == HOLDING_SHA, "holding digest不一致")

    actual_processed: set[str] = set()
    for inv in sorted((ROOT / "scaffold").glob("delegated-doc-*/inventory.json")):
        try:
            data = json.loads(inv.read_text(encoding="utf-8"))
            actual_processed |= {x["source_document_id"] for x in data.get("source_documents", [])}
        except Exception as exc:
            errors.append(f"inventory読込失敗 {inv}: {exc}")
    expect(errors, actual_processed == PROCESSED, f"processed IDs不一致: {sorted(actual_processed)}")
    expect(errors, len(set(by_id) - actual_processed) == 96, "remaining denominator不一致")
    ordered_remaining = sorted((x for x in holding if x["source_document_id"] not in actual_processed), key=lambda x: numeric_id(x["source_document_id"]))
    expect(errors, [x["source_document_id"] for x in ordered_remaining[:8]] == SELECTED, "deterministic first8不一致")

    register = next((x for x in registrations if x.get("registration_id") == "MPR-SH-DELEGATED-DOC-003"), None)
    expect(errors, register is not None, "MPR register rowが無い")
    if register:
        for key, value in {
            "source_atom_set_ref": "docs/governance/delegated-requirement-document-source-holding.jsonl",
            "source_atom_set_digest": "sha256:" + HOLDING_SHA,
            "source_atom_count": 114,
            "product_target": "unassigned_cross_product",
            "coverage_result": "source_preserved_unassigned",
            "management_state": "registered_source_holding",
            "authority_effect": "none",
        }.items():
            expect(errors, register.get(key) == value, f"register {key}不一致")
        for key in ("carried_atom_refs", "preserved_pending_registration_refs", "human_decision_disposition_refs", "unaccounted_atom_refs"):
            expect(errors, register.get(key) == [], f"register {key}が空でない")
    screen = next((x for x in screens if x.get("screen_id") == "S101-HOLD-MPR-SH-DELEGATED-DOC-003"), None)
    expect(errors, screen is not None, "holding screenが無い")
    if screen:
        expect(errors, screen.get("source_atom_count") == 114, "screen count不一致")
        expect(errors, screen.get("disposition") == "unassessed_pending_atomization", "screen disposition不一致")
        expect(errors, screen.get("source_atom_set_sha256") == "sha256:" + HOLDING_SHA, "screen digest不一致")

    documents = report.get("documents", [])
    expect(errors, [x.get("id") for x in documents] == SELECTED, "report document order不一致")
    totals = Counter()
    aggregate = Counter()
    source_declared = Counter()
    products = Counter()
    phases = Counter()
    statuses = {key: Counter() for key in ("authority_status", "disposition", "implementation_status", "executability_status", "external_effect_status")}
    lexical_totals = Counter()
    archive_count = old_count = current_present = disposition_count = 0
    for doc in documents:
        ident = doc.get("id")
        source = by_id.get(ident)
        expect(errors, source is not None, f"selected sourceが無い: {ident}")
        if source is None:
            continue
        path = source["source_path"]
        asset = by_path.get(path)
        expect(errors, asset is not None, f"asset dispositionが無い: {path}")
        if asset is None:
            continue
        expect(errors, doc.get("source_path") == path, f"source path不一致: {ident}")
        expect(errors, doc.get("archive_path") == source["archive_path"], f"archive path不一致: {ident}")
        expect(errors, doc.get("source_sha256") == source["sha256"], f"holding sha不一致: {ident}")
        expect(errors, doc.get("source_declared_status") == source.get("source_declared_status"), f"declared status不一致: {ident}")
        expect(errors, source.get("holding_granularity") == "file_blob", f"granularity不一致: {ident}")
        expect(errors, source.get("carry_status") == "preserved_pending_atomization", f"carry status不一致: {ident}")
        expect(errors, source.get("meaning_change_applied") is False, f"meaning change不一致: {ident}")
        expect(errors, source.get("successor_refs") == [], f"successor refs不一致: {ident}")
        expect(errors, source.get("human_decision_ref") is None, f"human decision不一致: {ident}")
        try:
            old = git_show(f"{ARCHIVE}:{source['archive_path']}")
            oid = git_oid(f"{ARCHIVE}:{source['archive_path']}")
        except subprocess.CalledProcessError as exc:
            errors.append(f"archive object取得失敗 {ident}: {exc}")
            continue
        archive_count += oid == doc.get("archive_blob_oid")
        old_count += bool(old)
        current_present += present(HEAD, path)
        expect(errors, len(old) == doc.get("bytes"), f"byte分母不一致: {ident}")
        expect(errors, old.count(b"\n") + 1 == doc.get("lines"), f"line分母不一致: {ident}")
        expect(errors, hashlib.sha256(old).hexdigest() == source["sha256"], f"archive sha不一致: {ident}")
        expect(errors, doc.get("product_candidate") == product_candidate(path), f"product候補不一致: {ident}")
        expect(errors, doc.get("phase_candidate") == phase_candidate(source), f"phase候補不一致: {ident}")
        expect(errors, doc.get("current_owner") == "unknown", f"current ownerがunknownでない: {ident}")
        expect(errors, doc.get("current_authority") == "unknown", f"current authorityがunknownでない: {ident}")
        expect(errors, "file blob" in doc.get("unatomized_scope", ""), f"unatomized scope不在: {ident}")
        expect(errors, doc.get("legacy", {}).get("implementation_status") == "unknown", f"implementation status不一致: {ident}")
        expect(errors, doc.get("legacy", {}).get("consumer_refs") == [], f"consumer refs不一致: {ident}")
        expect(errors, doc.get("legacy", {}).get("decision_record_ref") is None, f"decision ref不一致: {ident}")
        text = old.decode("utf-8", errors="replace")
        for name, pattern in LEXICAL.items():
            n = len(pattern.findall(text))
            lexical_totals[name] += n
            expect(errors, doc.get("legacy", {}).get(f"{name}_terms") == n, f"lexical signal不一致 {name}: {ident}")
        disposition_count += asset.get("source_path") == path
        source_declared[source.get("source_declared_status") or "missing"] += 1
        products[doc.get("product_candidate")] += 1
        phases[doc.get("phase_candidate")] += 1
        for key in statuses:
            statuses[key][asset.get(key) or "missing"] += 1
        for key in ("bytes", "lines"):
            totals[key] += doc.get(key, 0)
    expect(errors, archive_count == old_count == 8, "archive object denominator不一致")
    expect(errors, current_present == 0, f"current source path present: {current_present}")
    expect(errors, disposition_count == 8, "asset disposition denominator不一致")
    expect(errors, totals == Counter({"bytes": 137328, "lines": 1514}), f"old original totals不一致: {totals}")
    expect(errors, source_declared == Counter({"confirmed": 6, "current-authority": 1, "missing": 1}), "source declared aggregate不一致")
    expect(errors, products == Counter({"shared-cross-product": 7, "HELIX-HARNESS": 1}), "product aggregate不一致")
    expect(errors, phases == Counter({"L3": 4, "L11-L12-acceptance": 1, "L6": 1, "L3-authority": 1, "L8": 1}), "phase aggregate不一致")
    for key, actual in statuses.items():
        expect(errors, actual == Counter({"historical": 8}) if key == "authority_status" else actual == Counter({"unresolved": 8}) if key == "disposition" else actual == Counter({"unknown": 8}) if key == "implementation_status" else actual == Counter({"unreviewed": 8}), f"asset aggregate不一致: {key}")
    expect(errors, lexical_totals == Counter({"failure": 135, "degraded": 7, "implementation": 40, "consumer": 19, "decision": 112}), f"lexical total不一致: {lexical_totals}")
    for key, actual in {
        "archive_blob_verified": archive_count, "archive_original_retrievable": old_count,
        "holding_sha_matches_archive": old_count, "current_source_path_present": current_present,
        "current_source_path_absent": 8 - current_present, "asset_disposition_matches": disposition_count,
        "carry_status_pending_atomization": 8, "meaning_change_false": 8,
        "successor_refs_empty": 8, "human_decision_refs_empty": 8,
        "current_owner_unknown": 8, "current_authority_unknown": 8,
        "decision_record_refs": 0, "consumer_ref_paths": 0,
        "structured_failure_fields": 0, "structured_degraded_fields": 0,
    }.items():
        expect(errors, report.get("denominators", {}).get(key) == actual, f"denominator不一致: {key}")
    for key, actual in {
        "source_declared_status": dict(source_declared), "product_candidate": dict(products),
        "phase_candidate": dict(phases), "asset_authority_status": {"historical": 8},
        "asset_disposition": {"unresolved": 8}, "asset_implementation_status": {"unknown": 8},
        "asset_executability_status": {"unreviewed": 8}, "asset_external_effect_status": {"unreviewed": 8},
        "asset_decision_status": {"missing": 8}, "legacy_lexical_occurrences": dict(lexical_totals),
    }.items():
        expect(errors, report.get("aggregate", {}).get(key) == actual, f"aggregate不一致: {key}")

    for key, path in {
        "source_holding": HOLDING_PATH, "source_inventory": INVENTORY_PATH,
        "reference_inventory": REFERENCE_PATH, "asset_disposition": DISPOSITION_PATH,
        "asset_decisions": DECISIONS_PATH, "mpr_register": REGISTER_PATH,
        "holding_screen": SCREEN_PATH,
    }.items():
        expect(errors, report.get("digests", {}).get(key) == sha(path), f"digest不一致: {key}")
    try:
        binding = json.loads(BINDING_PATH.read_text(encoding="utf-8"))
    except Exception as exc:
        return errors + [f"SCF-B-0029を読めない: {exc}"]
    expect(errors, binding.get("id") == "SCF-B-0029", "binding id不一致")
    expect(errors, binding.get("state") == "registered", "binding state不一致")
    expect(errors, binding.get("role") == "RDP-001 DELEGATED-DOC-003 未処理先頭8文書のfile blob静的監査", "binding role不一致")
    upstream = {x.get("path"): x.get("sha256") for x in binding.get("upstream", [])}
    for path in ("scaffold/rdp001-delegated-doc003-unprocessed8/report.json", "docs/governance/delegated-requirement-document-source-holding.jsonl", "docs/governance/delegated-requirement-document-source-inventory.md", "docs/governance/delegated-requirement-document-reference-inventory.md", "docs/governance/legacy-asset-disposition.jsonl", "docs/governance/legacy-asset-decisions.jsonl", "docs/governance/management-provisional-requirement-register.jsonl", "docs/governance/audits/source-rebaseline/l2d-s1-01-input-holding-screen.jsonl"):
        expect(errors, upstream.get(path) == sha(ROOT / path), f"binding upstream digest不一致: {path}")
    for path in ("scaffold/rdp001-delegated-doc003-unprocessed8/report.json", "scaffold/rdp001-delegated-doc003-unprocessed8/README.md", "scaffold/rdp001-delegated-doc003-unprocessed8/validate.py", "scaffold/rdp001-delegated-doc003-unprocessed8/selfcheck.py", "scaffold/bindings/SCF-B-0029.json"):
        expect(errors, (ROOT / path).is_file(), f"binding artifact不在: {path}")
    return errors


def main() -> int:
    errors = validate()
    if errors:
        print("FAIL rdp001-delegated-doc003-unprocessed8")
        for error in errors:
            print("  - " + error)
        print(f"errors={len(errors)}")
        return 1
    print("PASS rdp001-delegated-doc003-unprocessed8: selected=8 archive=8/8 current_absent=8")
    return 0


if __name__ == "__main__":
    sys.exit(main())

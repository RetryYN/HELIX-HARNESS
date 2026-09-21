#!/usr/bin/env python3
"""RUL-OSP-04 atom research candidate の read-only static validator."""

from __future__ import annotations

import hashlib
import json
import os
import re
import sys
from pathlib import Path


HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
ARCHIVE_ROOT = ROOT / "archive" / "legacy-generation-2026-09-14" / "root"
INVENTORY = ROOT / "docs/governance/legacy-rule-atom-inventory.jsonl"
ACCOUNTING = ROOT / "docs/governance/audits/source-rebaseline/l2d-s1-01-authority-rule-atom-accounting.jsonl"
ASSETS = ROOT / "docs/governance/legacy-asset-disposition.jsonl"
MANIFEST = HERE / "manifest.json"
CANDIDATES = HERE / "atom-candidates.jsonl"


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def file_sha(path: Path) -> str:
    return sha256(path.read_bytes())


def load_jsonl(path: Path):
    rows = []
    for no, line in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
        if not line.strip():
            continue
        try:
            rows.append((no, json.loads(line)))
        except json.JSONDecodeError as exc:
            raise ValueError(f"{path}:{no}: JSON不正: {exc}") from exc
    return rows


def inventory_rows():
    rows = []
    for no, row in load_jsonl(INVENTORY):
        if row.get("requirement_primary") == "RUL-OSP-04" or (
            "RUL-OSP-04" in row.get("requirement_secondary", [])
            and row.get("requirement_primary") != "RUL-OSP-04"
        ):
            relation = "primary" if row.get("requirement_primary") == "RUL-OSP-04" else "secondary_relation"
            rows.append((no, relation, row))
    return rows


def load_candidates():
    rows = []
    for no, row in load_jsonl(CANDIDATES):
        rows.append((no, row))
    return rows


def check() -> list[str]:
    errors: list[str] = []
    try:
        manifest = json.loads(MANIFEST.read_text(encoding="utf-8"))
    except Exception as exc:
        return [f"manifest JSON不正: {exc}"]

    inv = inventory_rows()
    inv_by_id = {row["rule_id"]: (no, rel, row) for no, rel, row in inv}
    inv_primary = {r["rule_id"] for _, rel, r in inv if rel == "primary"}
    inv_secondary = {r["rule_id"] for _, rel, r in inv if rel == "secondary_relation"}
    if len(inv_primary) != 25:
        errors.append(f"inventory primary件数が25でない: {len(inv_primary)}")
    if len(inv_secondary) != 22:
        errors.append(f"inventory secondary relation件数が22でない: {len(inv_secondary)}")
    if inv_primary & inv_secondary:
        errors.append("inventory primary/secondary relation の集合が重複")

    try:
        accounting = [r for _, r in load_jsonl(ACCOUNTING) if r.get("rule_requirement_id") == "RUL-OSP-04"]
    except Exception as exc:
        errors.append(f"S1-01 accounting読み込み失敗: {exc}")
        accounting = []
    if len(accounting) != 1:
        errors.append(f"S1-01 RUL-OSP-04 accounting行数が1でない: {len(accounting)}")
        accounting_row = {}
    else:
        accounting_row = accounting[0]
        for key, expected in (("screened_atoms", 10), ("requirement_total_atoms", 25), ("secondary_links_from_other_primary", 5)):
            if accounting_row.get(key) != expected:
                errors.append(f"S1-01 {key} が{expected}でない: {accounting_row.get(key)!r}")

    if manifest.get("primary_atom_count") != 25 or manifest.get("secondary_relation_atom_count") != 22 or manifest.get("union_atom_count") != 47:
        errors.append("manifestの25/22/47件数が不一致")
    snap = manifest.get("s1_accounting_snapshot", {})
    for key, expected in (("screened_atoms", 10), ("requirement_total_atoms", 25), ("secondary_links_from_other_primary", 5)):
        if snap.get(key) != expected:
            errors.append(f"manifest S1 snapshot {key} が{expected}でない: {snap.get(key)!r}")
    if set(snap.get("screened_atom_refs", [])) != set(accounting_row.get("screened_atom_refs", [])):
        errors.append("manifest S1 screened_atom_refs が accounting 行と不一致")
    if len(snap.get("screened_atom_refs", [])) != snap.get("screened_atoms"):
        errors.append("manifest S1 screened_atom_refs の件数が screened_atoms と不一致")
    if manifest.get("denominator_contract", {}).get("do_not_merge") is not True:
        errors.append("denominator_contract.do_not_merge が true でない")
    secondary_boundary = manifest.get("secondary_relation_boundary", {})
    if secondary_boundary.get("required_field") != "legacy_requirement_primary":
        errors.append("secondary_relation_boundary.required_field が不正")
    if secondary_boundary.get("legacy_primary_product_owner") != "unresolved; secondary relation から旧 primary の製品 owner を確定しない":
        errors.append("secondary relation の旧 primary product owner 境界が不正")
    contradiction = manifest.get("old_current_contradiction", {})
    if contradiction.get("status") != "unresolved_preserved":
        errors.append("old_current_contradiction.status が unresolved_preserved でない")
    if not contradiction.get("old_source_evidence") or not contradiction.get("current_state_evidence"):
        errors.append("old_current_contradiction の old/current evidence が欠落")

    try:
        assets = {row["source_path"]: row for _, row in load_jsonl(ASSETS)}
    except Exception as exc:
        errors.append(f"legacy asset ledger読み込み失敗: {exc}")
        assets = {}
    candidates = load_candidates()
    if len(candidates) != 47:
        errors.append(f"candidate行数が47でない: {len(candidates)}")
    seen = set()
    candidate_primary = set()
    candidate_secondary = set()
    source_files = set()
    for line_no, candidate in candidates:
        atom_id = candidate.get("atom_id")
        rule_id = candidate.get("rule_id")
        relation = candidate.get("relation")
        if not atom_id or atom_id in seen:
            errors.append(f"candidate:{line_no}: atom_id欠落または重複: {atom_id!r}")
        seen.add(atom_id)
        if rule_id not in inv_by_id:
            errors.append(f"candidate:{line_no}: inventoryにないrule_id: {rule_id}")
            continue
        _, expected_rel, inv_row = inv_by_id[rule_id]
        if relation != expected_rel:
            errors.append(f"candidate:{line_no}: relation不一致 {rule_id}: {relation!r} != {expected_rel!r}")
        expected_legacy_primary = inv_row.get("requirement_primary")
        if relation == "secondary_relation":
            if not expected_legacy_primary or expected_legacy_primary == "RUL-OSP-04":
                errors.append(f"candidate:{line_no}: secondary relation の旧 primary が inventory 上で不正: {rule_id}")
            if candidate.get("legacy_requirement_primary") != expected_legacy_primary:
                errors.append(
                    f"candidate:{line_no}: legacy_requirement_primary不一致 {rule_id}: "
                    f"{candidate.get('legacy_requirement_primary')!r} != {expected_legacy_primary!r}"
                )
            if candidate.get("secondary_relation_boundary") != "OSへの関係候補であり旧primaryの製品owner確定ではない":
                errors.append(f"candidate:{line_no}: secondary relation の product owner 境界が欠落: {rule_id}")
            connection = candidate.get("connection_candidate", {})
            if connection.get("legacy_primary_requirement_id") != expected_legacy_primary:
                errors.append(f"candidate:{line_no}: connection の旧 primary が不一致: {rule_id}")
            if connection.get("product_owner_status") != "unresolved; HELIX-OS is only the RUL-OSP-04 relation candidate":
                errors.append(f"candidate:{line_no}: connection の product owner 状態が unresolved でない: {rule_id}")
        elif "legacy_requirement_primary" in candidate:
            errors.append(f"candidate:{line_no}: primary row に旧 primary field が混入: {rule_id}")
        (candidate_primary if relation == "primary" else candidate_secondary).add(rule_id)
        if candidate.get("original_text") != inv_row.get("rule_text"):
            errors.append(f"candidate:{line_no}: original_textがinventoryと不一致: {rule_id}")
        if candidate.get("original_text_sha256") != sha256(inv_row["rule_text"].encode()):
            errors.append(f"candidate:{line_no}: original_text digest不一致: {rule_id}")
        if candidate.get("authority_vocabulary_relation", {}).get("current_authority_claim") is not False:
            errors.append(f"candidate:{line_no}: current authority claimを許している: {rule_id}")
        if candidate.get("authority_vocabulary_relation", {}).get("status") != "per_atom_unassessed":
            errors.append(f"candidate:{line_no}: per-atom authority statusが未評価でない: {rule_id}")
        punit = candidate.get("product_unit_candidate", {})
        if punit.get("product") != "HELIX-OS" or punit.get("status") != "candidate_only":
            errors.append(f"candidate:{line_no}: product候補の境界不正: {rule_id}")
        for span in candidate.get("source_spans", []):
            archive_path = span.get("archive_path") or span.get("path", "")
            prefix = "archive/legacy-generation-2026-09-14/root/"
            if not archive_path.startswith(prefix):
                errors.append(f"candidate:{line_no}: archive source path不正: {archive_path}")
                continue
            relpath = archive_path[len(prefix):]
            source_files.add(relpath)
            source = ARCHIVE_ROOT / relpath
            if not source.is_file():
                errors.append(f"candidate:{line_no}: archive source不存在: {archive_path}")
                continue
            asset = assets.get(relpath)
            if not asset:
                errors.append(f"candidate:{line_no}: legacy asset record欠落: {relpath}")
            else:
                asset_fields = {
                    "asset_id": "asset_id",
                    "asset_sha256": "source_sha256",
                    "disposition": "disposition",
                    "product_target": "product_target",
                }
                for candidate_key, asset_key in asset_fields.items():
                    if span.get("legacy_asset", {}).get(candidate_key) != asset.get(asset_key):
                        errors.append(f"candidate:{line_no}: legacy asset {candidate_key}不一致: {rule_id} {relpath}")
                if span.get("legacy_asset", {}).get("authority_status") not in ("historical", None):
                    errors.append(f"candidate:{line_no}: legacy asset authority_statusがhistorical/nullでない: {rule_id}")
                if asset.get("source_sha256") != file_sha(source):
                    errors.append(f"candidate:{line_no}: archive fileとasset digest不一致: {relpath}")
            match = re.fullmatch(r"(\d+)-(\d+)", str(span.get("lines", "")))
            if not match:
                errors.append(f"candidate:{line_no}: line span不正: {rule_id}")
                continue
            start, end = map(int, match.groups())
            lines = source.read_text(encoding="utf-8").splitlines(keepends=True)
            if start < 1 or end < start or end > len(lines):
                errors.append(f"candidate:{line_no}: line span範囲外: {rule_id} {span.get('lines')}")
                continue
            exact = "".join(lines[start - 1:end])
            if span.get("source_text") != exact:
                errors.append(f"candidate:{line_no}: source_text不一致: {rule_id} {relpath}:{span.get('lines')}")
            if span.get("span_sha256") != sha256(exact.encode()):
                errors.append(f"candidate:{line_no}: span digest不一致: {rule_id} {relpath}:{span.get('lines')}")
            if span.get("source_file_sha256") != file_sha(source):
                errors.append(f"candidate:{line_no}: source_file_sha256不一致: {rule_id} {relpath}")
    if candidate_primary != inv_primary:
        errors.append(f"candidate primary集合不一致: missing={sorted(inv_primary-candidate_primary)} extra={sorted(candidate_primary-inv_primary)}")
    if candidate_secondary != inv_secondary:
        errors.append(f"candidate secondary relation集合不一致: missing={sorted(inv_secondary-candidate_secondary)} extra={sorted(candidate_secondary-inv_secondary)}")
    if len(source_files) != 26:
        errors.append(f"source file closureが26でない: {len(source_files)}")
    if len(seen) != 47:
        errors.append(f"candidate unique atomが47でない: {len(seen)}")
    return errors


def main() -> int:
    errors = check()
    if errors:
        for error in errors:
            print("FAIL", error)
        return 1
    print("PASS RUL-OSP-04 atom candidate: primary=25 secondary_relation=22 union=47 source_files=26")
    print("PASS S1-01 distinction: screened_atoms=10/25 secondary_links_from_other_primary=5; inventory secondary relation=22 (not merged)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

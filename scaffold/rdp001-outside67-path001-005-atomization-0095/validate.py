#!/usr/bin/env python3
"""Fail-closed validator for the PATH-001..005 static source-line bundle."""
from __future__ import annotations

import difflib
import hashlib
import json
import re
import subprocess
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
BASE = "72b9f368a044709437841c5e862f01802b1a88ec"
PRE = "2d4991042be55268bac30a8bbcdac45b3865030a"
ARCH = "064280b5c1c5c98f949e6e3be5ef87cbe4a4b658"
TARGETS = [f"OUTSIDE67-PATH-{n:03d}" for n in range(1, 6)]
PRODUCTS = ["HELIX-HARNESS", "HELIX-OS", "HELIX-Web", "HELIX-Web-OS"]
SOURCE_INFO = {
    "OUTSIDE67-PATH-001": ("docs/design/harness/L1-planning/product-intent.md", "docs/helix-harness/L1-planning/product-intent.md"),
    "OUTSIDE67-PATH-002": ("docs/design/harness/L2-requirements/product-requirements.md", "docs/helix-harness/L2-requirements/product-requirements.md"),
    "OUTSIDE67-PATH-003": ("docs/design/harness/README.md", "docs/helix-harness/README.md"),
    "OUTSIDE67-PATH-004": ("docs/design/helix-os/L1-planning/system-intent.md", "docs/helix-os/L1-planning/system-intent.md"),
    "OUTSIDE67-PATH-005": ("docs/design/helix-os/L2-requirements/governance-requirements.md", "docs/helix-os/L2-requirements/governance-requirements.md"),
}
LEDGERS = [
    "docs/governance/legacy-asset-disposition.jsonl", "docs/governance/legacy-asset-decisions.jsonl", "docs/governance/legacy-asset-copy-read-after.jsonl", "docs/governance/legacy-asset-decision-log.md", "docs/governance/legacy-asset-phase-product-classification-bootstrap.jsonl", "docs/governance/legacy-requirement-implementation-crosswalk-bootstrap.jsonl", "docs/governance/legacy-ir-product-unit-decomposition-bootstrap.jsonl",
]
NORMATIVE = re.compile(r"できる|できない|する|しない|すべき|必要|保持|追跡|区別|確認|定義|適用|規定|所有|提供|含め|置く|扱う|停止|実行|許可|禁止|採択|変更|記録|管理|監査|戻|再|移管|満た|要求|検証|受け入|構成|利用|選び|進行|運用|参照|分離|回復|復旧|推測|生成|宣言|表示|送信|保存|継承|隔離|判断|対応|評価|行う|処理|確定|失敗|改善|展開|承認|担う|揃|外す|追補|正本|consumer|failure|degrad|implementation|requirement|acceptance|must|shall|required|should|unknown|review_waiting|MUST|SHALL")
COMPOSITE = re.compile(r"、|／|/|・|→|；|;|\|.*\||\b(and|or)\b|複数|全件|各product|L[0-9]+[-–]L[0-9]+")
FRONTMATTER_KEYS = re.compile(r"^(title|canonical_|layer|kind|status|authority_|parent_|created|updated):")
ALLOWED = {"atomized_candidate", "metadata_only", "composite_unresolved"}


def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def git_bytes(revision: str, path: str) -> bytes:
    return subprocess.check_output(["git", "-C", str(ROOT), "show", f"{revision}:{path}"])


def git_blob(data: bytes) -> str:
    return hashlib.sha1(f"blob {len(data)}\0".encode() + data).hexdigest()


def classify(text: str) -> str:
    stripped = text.strip()
    if not stripped or stripped == "---" or FRONTMATTER_KEYS.match(stripped) or stripped.startswith("#") or stripped.startswith("<!--") or stripped.endswith("-->"):
        return "metadata_only"
    if stripped.startswith("|") and not stripped.replace("|", "").replace(":", "").replace("-", "").strip():
        return "metadata_only"
    if stripped.startswith("|") and ("内容" in stripped or "状態" in stripped or stripped.count("|") <= 2) and not NORMATIVE.search(stripped):
        return "metadata_only"
    if not NORMATIVE.search(stripped):
        return "metadata_only"
    if COMPOSITE.search(stripped) or len(stripped) > 180 or stripped.count("。") > 1:
        return "composite_unresolved"
    return "atomized_candidate"


def jsonl(path: Path) -> list[dict]:
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


def load(out: Path, name: str):
    path = out / name
    return json.loads(path.read_text(encoding="utf-8")) if path.suffix == ".json" else jsonl(path)


def validate(root: Path = ROOT, out: Path = HERE) -> list[str]:
    errors: list[str] = []
    def fail(condition: bool, code: str) -> None:
        if condition:
            errors.append(code)
    try:
        inv, plan = load(out, "inventory.json"), load(out, "plan.json")
        pairs, atoms, coverage, legacy = load(out, "source-pairs.jsonl"), load(out, "semantic-atoms.jsonl"), load(out, "line-inventory.jsonl"), load(out, "legacy-evidence.jsonl")
        diffs, scan, binding = load(out, "source-diffs.json"), load(out, "evidence-scan.json"), json.loads((root / "scaffold/bindings/SCF-B-0095.json").read_text(encoding="utf-8"))
    except Exception as exc:
        return [f"E_LOAD:{exc}"]
    fail(inv.get("schema") != "rdp001-outside67-path-atomization/v2" or inv.get("binding") != "SCF-B-0095" or inv.get("status") != "findings_only" or inv.get("authority_effect") != "none" or inv.get("meaning_change_applied") is not False, "E_BOUNDARY")
    fail(plan.get("base_origin_main") != BASE or plan.get("binding") != "SCF-B-0095", "E_PLAN_BASE")
    fail(inv.get("base_origin_main") != BASE or plan.get("pre_isolation_commit") != PRE or plan.get("archive_commit") != ARCH, "E_REVISION_PINS")
    fail(subprocess.run(["git", "-C", str(root), "merge-base", "--is-ancestor", BASE, "HEAD"], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL).returncode != 0, "E_BASE_NOT_ANCESTOR")
    holding = jsonl(root / "docs/governance/pre-isolation-outside-holding-67-source-holding.jsonl")
    holds = {row["source_item_id"]: row for row in holding}
    fail(len(holding) != 67 or len(holds) != 67 or set(TARGETS) - set(holds), "E_HOLDING_DENOM")
    fail(scan.get("selected_ids") != TARGETS or scan.get("holding_denominator") != 67 or scan.get("static_only") is not True or scan.get("old_runtime_test_ci_execution") is not False, "E_SCAN_BOUNDARY")
    fail(len(pairs) != 5 or [row.get("source_item_id") for row in pairs] != TARGETS, "E_PAIR_DENOM")
    fail(len(coverage) != 863 or len(atoms) != 863 or len({(r.get("source_item_id"), r.get("archive_line")) for r in coverage}) != 863, "E_LINE_DENOM")
    fail(len(legacy) != 35 or len({(r.get("source_item_id"), r.get("ledger_path")) for r in legacy}) != 35, "E_LEGACY_DENOM")
    pair_by = {row["source_item_id"]: row for row in pairs}
    atom_by = {(row.get("source_item_id"), row.get("archive_line")): row for row in atoms}
    cov_by = {(row.get("source_item_id"), row.get("archive_line")): row for row in coverage}
    diff_by = {row.get("source_item_id"): row for row in diffs.get("items", [])}
    for sid in TARGETS:
        source, current_path = SOURCE_INFO[sid]
        pair = pair_by.get(sid, {})
        pre, archive, current = git_bytes(PRE, source), git_bytes(ARCH, source), git_bytes(BASE, current_path)
        fail(pair.get("source_path") != source or pair.get("current_counterpart_path") != current_path, f"E_PAIR_PATH:{sid}")
        for key, rev, data in (("pre_isolation", PRE, pre), ("archive_revision", ARCH, archive), ("current_counterpart", BASE, current)):
            rec = pair.get(key, {})
            fail(rec.get("commit") != rev or rec.get("blob_oid") != git_blob(data) or rec.get("sha256") != sha(data) or rec.get("bytes") != len(data) or rec.get("line_count") != len(data.decode().splitlines()), f"E_REV_DIGEST:{sid}:{key}")
        archive_lines, pre_lines = archive.decode().splitlines(), pre.decode().splitlines()
        fail(pair.get("archive_line_count") != len(archive_lines), f"E_ARCHIVE_COUNT:{sid}")
        rows = [row for row in coverage if row.get("source_item_id") == sid]
        fail([row.get("archive_line") for row in rows] != list(range(1, len(archive_lines) + 1)), f"E_LINE_ORDER:{sid}")
        pcover = pair.get("source_line_coverage", [])
        fail(len(pcover) != len(archive_lines), f"E_PAIR_COVERAGE:{sid}")
        for n, text in enumerate(archive_lines, 1):
            row, atom = cov_by.get((sid, n), {}), atom_by.get((sid, n), {})
            want = classify(text)
            pre_text = pre_lines[n - 1] if n <= len(pre_lines) else None
            fail(row.get("archive_fragment") != text or row.get("archive_line_sha256") != sha(text.encode()) or row.get("line_status") != want, f"E_LINE_ANCHOR:{sid}:{n}")
            fail(atom.get("source_fragment") != text or atom.get("atomization_status") != want or atom.get("archive_anchor", {}).get("line_sha256") != sha(text.encode()), f"E_ATOM_ANCHOR:{sid}:{n}")
            fail(atom.get("pre_anchor") is None and pre_text is not None, f"E_PRE_MISSING:{sid}:{n}")
            fail(atom.get("pre_anchor") is not None and pre_text is None, f"E_PRE_EXTRA:{sid}:{n}")
            if pre_text is not None:
                fail(atom.get("pre_anchor", {}).get("source_fragment") != pre_text or atom.get("pre_anchor", {}).get("line_sha256") != sha(pre_text.encode()), f"E_PRE_TEXT:{sid}:{n}")
            fail(want != "metadata_only" and not NORMATIVE.search(text), f"E_CLASSIFIER_UNSUPPORTED:{sid}:{n}")
            structural_metadata = (text.strip().startswith("#") or text.strip() == "---" or FRONTMATTER_KEYS.match(text.strip()) or not text.strip())
            fail(NORMATIVE.search(text) and want == "metadata_only" and not structural_metadata, f"E_NORMATIVE_METADATA:{sid}:{n}")
            fail(atom.get("candidate_product") != "unresolved_cross_product" or atom.get("candidate_product_candidates") != PRODUCTS or atom.get("candidate_product_scope") not in PRODUCTS or atom.get("candidate_product_scope_status") != "unknown_path_based_candidate_only" or atom.get("candidate_phase_status") != "unknown_path_based_candidate_only" or atom.get("authority_effect") != "none", f"E_PRODUCT_PROMOTION:{sid}:{n}")
            for key in ("formal_owner_status", "implementation_status", "legacy_implementation_status", "current_implementation_status", "degradation_status", "legacy_degradation_status", "current_degradation_status", "failure_status", "consumer_status", "decision_status", "adoption_status"):
                fail(atom.get(key) != "unknown", f"E_UNKNOWN_PROMOTION:{sid}:{n}:{key}")
            fail(atom.get("successor_requirement_ids") != [] or atom.get("meaning_change_applied") is not False or atom.get("human_decision_ref") is not None, f"E_SUCCESSOR_PROMOTION:{sid}:{n}")
        d = diff_by.get(sid, {})
        text = "".join(difflib.unified_diff(pre.decode().splitlines(True), archive.decode().splitlines(True), fromfile=f"a/{source}", tofile=f"b/{source}", n=3))
        fail(d.get("pre_sha256") != sha(pre) or d.get("archive_sha256") != sha(archive) or d.get("unified_diff") != text or d.get("unified_diff_sha256") != sha(text.encode()), f"E_DIFF:{sid}")
    expected_legacy = {(sid, path) for sid in TARGETS for path in LEDGERS}
    for row in legacy:
        fail((row.get("source_item_id"), row.get("ledger_path")) not in expected_legacy or row.get("scan_commit") != BASE or row.get("lookup") not in ("exact_text_hit", "no_exact_text_hit") or row.get("no_inference_from_absence") is not True, "E_LEGACY_BOUNDARY")
        if row.get("source_item_id") in holds and row.get("ledger_path") in LEDGERS:
            data = git_bytes(BASE, row["ledger_path"])
            fail(row.get("ledger_sha256") != sha(data), f"E_LEGACY_DIGEST:{row.get('ledger_path')}")
            h = holds[row["source_item_id"]]
            terms = [row["source_item_id"], h["source_path"], h["pre_isolation"]["blob_oid"], h["archive"]["blob_oid"]]
            anchors = [{"line": n, "text_sha256": sha(text.encode()), "matched_terms": [term for term in terms if term in text]} for n, text in enumerate(data.decode("utf-8", errors="replace").splitlines(), 1) if any(term in text for term in terms)]
            fail(row.get("anchors") != anchors or row.get("lookup") != ("exact_text_hit" if anchors else "no_exact_text_hit"), "E_LEGACY_ANCHOR")
        for key in ("implementation_status", "degradation_status", "failure_status", "consumer_status", "decision_status"):
            fail(row.get(key) != "unknown", f"E_LEGACY_PROMOTION:{key}")
    counts = {name: sum(row.get("atomization_status") == name for row in atoms) for name in ALLOWED}
    fail(inv.get("archive_line_denominator") != 863 or inv.get("line_inventory_count") != 863 or inv.get("semantic_atom_count") != 863 or inv.get("atomization_status_counts") != counts or inv.get("selected_line_residual_count") != 0 or inv.get("formal_requirement_unit_count") != 0, "E_ACCOUNTING")
    fail(plan.get("accounting", {}).get("status_counts") != counts or plan.get("accounting", {}).get("mutually_exclusive_categories") is not True, "E_PLAN_ACCOUNTING")
    fail(inv.get("candidate_products") != [{"product": p, "status": "boundary_candidate_only", "formal_owner": "unknown", "authority": "none"} for p in PRODUCTS], "E_BOUNDARY_PRODUCTS")
    fail(binding.get("id") != "SCF-B-0095" or binding.get("state") != "registered", "E_BINDING")
    return errors


def main() -> int:
    errors = validate()
    if errors:
        print("FAIL SCF-B-0095 validator\n" + "\n".join(errors))
        return 1
    print("PASS SCF-B-0095 validator: 5 source pairs / 863 archive lines / mutually-exclusive partition")
    return 0


if __name__ == "__main__":
    sys.exit(main())

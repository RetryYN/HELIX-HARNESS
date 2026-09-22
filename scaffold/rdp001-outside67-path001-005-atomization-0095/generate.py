#!/usr/bin/env python3
"""Generate the static, lossless line partition for PATH-001..005."""
from __future__ import annotations

import difflib
import hashlib
import json
import re
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT = Path(__file__).resolve().parent
BASE = "72b9f368a044709437841c5e862f01802b1a88ec"
PRE = "2d4991042be55268bac30a8bbcdac45b3865030a"
ARCH = "064280b5c1c5c98f949e6e3be5ef87cbe4a4b658"
HOLDING = ROOT / "docs/governance/pre-isolation-outside-holding-67-source-holding.jsonl"
TARGETS = [f"OUTSIDE67-PATH-{n:03d}" for n in range(1, 6)]
PRODUCTS = ["HELIX-HARNESS", "HELIX-OS", "HELIX-Web", "HELIX-Web-OS"]
BUNDLES = {
    "OUTSIDE67-PATH-001": ("scaffold/rdp001-outside67-boundary-followup-073", "docs/helix-harness/L1-planning/product-intent.md"),
    "OUTSIDE67-PATH-002": ("scaffold/rdp001-outside67-boundary-followup-074", "docs/helix-harness/L2-requirements/product-requirements.md"),
    "OUTSIDE67-PATH-003": ("scaffold/rdp001-outside67-product-entry-followup-076", "docs/helix-harness/README.md"),
    "OUTSIDE67-PATH-004": ("scaffold/rdp001-outside67-boundary-followup-073", "docs/helix-os/L1-planning/system-intent.md"),
    "OUTSIDE67-PATH-005": ("scaffold/rdp001-outside67-boundary-followup-074", "docs/helix-os/L2-requirements/governance-requirements.md"),
}
LEDGERS = [
    "docs/governance/legacy-asset-disposition.jsonl",
    "docs/governance/legacy-asset-decisions.jsonl",
    "docs/governance/legacy-asset-copy-read-after.jsonl",
    "docs/governance/legacy-asset-decision-log.md",
    "docs/governance/legacy-asset-phase-product-classification-bootstrap.jsonl",
    "docs/governance/legacy-requirement-implementation-crosswalk-bootstrap.jsonl",
    "docs/governance/legacy-ir-product-unit-decomposition-bootstrap.jsonl",
]
NORMATIVE = re.compile(r"できる|できない|する|しない|すべき|必要|保持|追跡|区別|確認|定義|適用|規定|所有|提供|含め|置く|扱う|停止|実行|許可|禁止|採択|変更|記録|管理|監査|戻|再|移管|満た|要求|検証|受け入|構成|利用|選び|進行|運用|参照|分離|回復|復旧|推測|生成|宣言|表示|送信|保存|継承|隔離|判断|対応|評価|行う|処理|確定|失敗|改善|展開|承認|担う|揃|外す|追補|正本|consumer|failure|degrad|implementation|requirement|acceptance|must|shall|required|should|unknown|review_waiting|MUST|SHALL")
COMPOSITE = re.compile(r"、|／|/|・|→|；|;|\|.*\||\b(and|or)\b|複数|全件|各product|L[0-9]+[-–]L[0-9]+")
FRONTMATTER_KEYS = re.compile(r"^(title|canonical_|layer|kind|status|authority_|parent_|created|updated):")
TABLE_REQUIREMENT = re.compile(r"^\|\s*[A-Z][A-Z0-9]*(?:[-_][A-Z0-9]+)+\s*\|.+\|$")
PROHIBITIVE_SUFFIX = re.compile(r"(?:ない|ません|ず|ならない|禁止|不可|できない|しない)(?:[。．、,:：]|$)")
RESPONSIBILITY_CLAUSE = re.compile(r"(?:責務|所有|担当|担う|束縛|分ける|統制|管理)(?:である|とする|する|。|、|$)")
NORMATIVE_VERB_SUFFIX = re.compile(r"(?:する|できる|必要|保持|追跡|確認|適用|定義|記録|実行|停止|許可|変更|採択|検証|要求|移管|隔離|再構築|更新)(?:[。．、,:：]|$)")
ROLE_NORMATIVE = re.compile(r"(?:責務|所有|担当|担う|束縛|分ける|統制|管理|として扱|として|扱い|留め|留まり)")
SENTENCE_END = re.compile(r"[。．.!！？!?]$")
CLASSIFICATION_POLICY = "independent structural guard for requirement/prohibition/responsibility shapes; sentence-ending non-structural lines are retained as composite_unresolved; metadata_only is limited to structural metadata/navigation"


def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def git_bytes(revision: str, path: str) -> bytes:
    return subprocess.check_output(["git", "-C", str(ROOT), "show", f"{revision}:{path}"])


def git_blob(data: bytes) -> str:
    return hashlib.sha1(f"blob {len(data)}\0".encode() + data).hexdigest()


def lines(data: bytes) -> list[str]:
    return data.decode("utf-8").splitlines()


def write_json(path: Path, value: object) -> None:
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2, sort_keys=True) + "\n", encoding="utf-8")


def write_jsonl(path: Path, rows: list[dict]) -> None:
    path.write_text("".join(json.dumps(row, ensure_ascii=False, sort_keys=True) + "\n" for row in rows), encoding="utf-8")


def holding_rows() -> dict[str, dict]:
    rows = [json.loads(line) for line in HOLDING.read_text(encoding="utf-8").splitlines() if line.strip()]
    by = {row["source_item_id"]: row for row in rows}
    if len(rows) != 67 or set(TARGETS) - set(by):
        raise SystemExit("holding denominator or selected source rows changed")
    return by


def revision(rev: str, data: bytes) -> dict:
    return {"commit": rev, "blob_oid": git_blob(data), "sha256": sha(data), "bytes": len(data), "line_count": len(lines(data))}


def structural_metadata(text: str) -> bool:
    stripped = text.strip()
    return not stripped or stripped == "---" or bool(FRONTMATTER_KEYS.match(stripped)) or stripped.startswith("#") or stripped.startswith("<!--") or stripped.endswith("-->")


def structurally_normative(text: str) -> bool:
    """Independent shape check for requirements, prohibitions, and role clauses."""
    stripped = text.strip()
    if structural_metadata(stripped):
        return False
    return bool(TABLE_REQUIREMENT.match(stripped) or PROHIBITIVE_SUFFIX.search(stripped) or RESPONSIBILITY_CLAUSE.search(stripped) or NORMATIVE_VERB_SUFFIX.search(stripped) or ROLE_NORMATIVE.search(stripped))


def align_lines(pre_lines: list[str], archive_lines: list[str]) -> dict[int, dict]:
    """Map archive lines to equal pre lines; replacements/inserts never get anchors."""
    mapping: dict[int, dict] = {}
    for tag, i1, i2, j1, j2 in difflib.SequenceMatcher(None, pre_lines, archive_lines, autojunk=False).get_opcodes():
        if tag == "equal":
            for offset in range(j2 - j1):
                mapping[j1 + offset + 1] = {"status": "equal", "pre_line": i1 + offset + 1, "pre_line_range": [i1 + offset + 1, i1 + offset + 1]}
        elif tag in ("replace", "insert"):
            pre_range = [i1 + 1, i2] if i2 > i1 else []
            for archive_line in range(j1 + 1, j2 + 1):
                mapping[archive_line] = {"status": tag, "pre_line": None, "pre_line_range": pre_range}
    if set(mapping) != set(range(1, len(archive_lines) + 1)):
        raise SystemExit("source alignment did not cover every archive line")
    return mapping


def classify(text: str) -> tuple[str, str]:
    """Classify each exact source line without rewriting its unresolved meaning."""
    stripped = text.strip()
    if structural_metadata(stripped):
        return "metadata_only", "blank/frontmatter metadata"
    if stripped.startswith("#"):
        return "metadata_only", "heading/navigation metadata"
    if stripped.startswith("<!--") or stripped.endswith("-->"):
        return "metadata_only", "comment metadata"
    if stripped.startswith("|") and not stripped.replace("|", "").replace(":", "").replace("-", "").strip():
        return "metadata_only", "table separator"
    if stripped.startswith("|") and ("内容" in stripped or "状態" in stripped or stripped.count("|") <= 2) and not NORMATIVE.search(stripped) and not structurally_normative(stripped):
        return "metadata_only", "table/index metadata"
    # Any normative marker goes to one of the two semantic classes. This is
    # the critical guard against hiding unresolved requirement text as metadata.
    if not NORMATIVE.search(stripped) and not structurally_normative(stripped):
        if SENTENCE_END.search(stripped):
            return "composite_unresolved", "natural-language sentence retained unresolved; no speculative split"
        return "metadata_only", "non-normative source metadata or navigation"
    if COMPOSITE.search(stripped) or len(stripped) > 180 or stripped.count("。") > 1:
        return "composite_unresolved", "normative line contains coupled clauses; no speculative split"
    return "atomized_candidate", "one source-supported normative line; exact text retained"


def make_atom(sid: str, source: str, archive_line: int, archive_text: str, pre_lines: list[str], alignment: dict, relation: str, evidence: list[dict], path_scope: dict) -> dict:
    alignment_row = alignment[archive_line]
    pre_text = pre_lines[alignment_row["pre_line"] - 1] if alignment_row["pre_line"] is not None else None
    status, basis = classify(archive_text)
    aid = f"RDP-001-OUTSIDE67-{sid.rsplit('-', 1)[1]}-L{archive_line:04d}"
    return {"atom_id": aid, "source_item_id": sid, "source_path": source, "archive_line": archive_line, "archive_anchor": {"commit": ARCH, "line": archive_line, "line_sha256": sha(archive_text.encode()), "source_fragment": archive_text}, "pre_anchor": None if pre_text is None else {"commit": PRE, "line": alignment_row["pre_line"], "line_sha256": sha(pre_text.encode()), "source_fragment": pre_text}, "pre_alignment": alignment_row, "source_fragment": archive_text, "atomization_status": status, "span_kind": status, "atomization_basis": basis, "candidate_kind": "source_line_candidate" if status != "metadata_only" else "source_metadata", "candidate_product": "unresolved_cross_product", "candidate_product_candidates": PRODUCTS, "candidate_product_scope": path_scope.get("product_scope"), "candidate_phase": path_scope.get("phase_scope"), "candidate_product_scope_status": path_scope.get("product_status"), "candidate_phase_status": path_scope.get("phase_status"), "authority_effect": "none", "formal_owner_status": "unknown", "formal_requirement_unit_status": "not_generated", "phase_status": "unknown_path_based_candidate_only", "implementation_status": "unknown", "legacy_implementation_status": "unknown", "current_implementation_status": "unknown", "degradation_status": "unknown", "legacy_degradation_status": "unknown", "current_degradation_status": "unknown", "failure_status": "unknown", "consumer_status": "unknown", "decision_status": "unknown", "adoption_status": "unknown", "successor_requirement_ids": [], "human_decision_ref": None, "meaning_change_applied": False, "semantic_fields": {"actor": "unresolved", "action": "unresolved", "condition": "unresolved", "guard": "unresolved", "sequence": "unresolved"}, "normalized_statement": {"status": "source_supported_exact_line", "text": archive_text, "source_ref": "archive_anchor"}, "retained_meaning": {"status": "preserved_source_meaning", "items": [archive_text], "source_ref": "archive_anchor"}, "source_support": {"status": "exact_archive_line_anchor", "pre_anchor_status": alignment_row["status"], "current_counterpart_relation": relation}, "current_counterpart_relation": relation, "diff_observation": {"source_ref": "source-diffs.json", "status": "observed", "text": relation}, "legacy_evidence": {"ledger_rows": len(evidence), "exact_ledger_hits": [row["ledger_path"] for row in evidence if row["lookup"] == "exact_text_hit"], "decision": "unknown", "failure": "unknown", "consumer": "unknown"}, "unresolved_questions": ["formal product/owner/phase/authority and all downstream meaning require independent review"]}


def legacy_evidence(holding: dict[str, dict]) -> list[dict]:
    rows = []
    for sid in TARGETS:
        h = holding[sid]
        terms = [sid, h["source_path"], h["pre_isolation"]["blob_oid"], h["archive"]["blob_oid"]]
        for path in LEDGERS:
            data = git_bytes(BASE, path)
            anchors = []
            for line_no, text in enumerate(lines(data), 1):
                matched = [term for term in terms if term in text]
                if matched:
                    anchors.append({"line": line_no, "text_sha256": sha(text.encode()), "matched_terms": matched})
            rows.append({"source_item_id": sid, "ledger_path": path, "scan_commit": BASE, "ledger_sha256": sha(data), "lookup": "exact_text_hit" if anchors else "no_exact_text_hit", "anchors": anchors, "implementation_status": "unknown", "degradation_status": "unknown", "failure_status": "unknown", "consumer_status": "unknown", "decision_status": "unknown", "no_inference_from_absence": True})
    return rows


def build() -> None:
    holding = holding_rows()
    source_pairs, atoms, coverage, diffs = [], [], [], []
    all_legacy = legacy_evidence(holding)
    for sid in TARGETS:
        bundle, current_path = BUNDLES[sid]
        selected = next(json.loads(line) for line in (ROOT / bundle / "selected-source-items.jsonl").read_text(encoding="utf-8").splitlines() if json.loads(line)["source_item_id"] == sid)
        source = selected["source_path"]
        pre, archive, current = git_bytes(PRE, source), git_bytes(ARCH, source), git_bytes(BASE, current_path)
        if sha(pre) != holding[sid]["pre_isolation"]["sha256"] or sha(archive) != holding[sid]["archive"]["sha256"]:
            raise SystemExit(f"holding digest mismatch: {sid}")
        pre_lines, archive_lines = lines(pre), lines(archive)
        alignment = align_lines(pre_lines, archive_lines)
        relation = selected["archive_counterpart"]["relation"]
        diff_text = "".join(difflib.unified_diff(pre.decode().splitlines(True), archive.decode().splitlines(True), fromfile=f"a/{source}", tofile=f"b/{source}", n=3))
        dstatus = "same" if pre == archive else "different"
        sid_legacy = [row for row in all_legacy if row["source_item_id"] == sid]
        pair_coverage = []
        for n, text in enumerate(archive_lines, 1):
            status, basis = classify(text)
            alignment_row = alignment[n]
            pre_text = pre_lines[alignment_row["pre_line"] - 1] if alignment_row["pre_line"] is not None else None
            coverage.append({"source_item_id": sid, "source_path": source, "archive_line": n, "archive_line_sha256": sha(text.encode()), "archive_fragment": text, "pre_line": alignment_row["pre_line"], "pre_fragment": pre_text, "pre_line_sha256": sha(pre_text.encode()) if pre_text is not None else None, "pre_alignment": alignment_row, "line_status": status, "atomization_basis": basis, "selected_unit_id": f"RDP-001-OUTSIDE67-{sid.rsplit('-', 1)[1]}-L{n:04d}"})
            pair_coverage.append({"archive_line": n, "pre_line": alignment_row["pre_line"], "pre_fragment": pre_text, "pre_alignment": alignment_row, "archive_fragment": text, "atomization_status": status})
            atoms.append(make_atom(sid, source, n, text, pre_lines, alignment, relation, sid_legacy, holding[sid].get("reported_path_scope", {})))
        source_pairs.append({"source_item_id": sid, "source_path": source, "reported_path_scope": holding[sid].get("reported_path_scope", {}), "current_counterpart_path": current_path, "pre_isolation": revision(PRE, pre), "archive_revision": revision(ARCH, archive), "current_counterpart": revision(BASE, current), "current_counterpart_relation": relation, "pre_archive_alignment": list(alignment.values()), "snapshot_paths": {"pre_isolation": f"source-snapshots/{sid}/pre-isolation.md", "archive_revision": f"source-snapshots/{sid}/archive-revision.md"}, "source_line_coverage": pair_coverage, "archive_line_count": len(archive_lines), "examined_archive_lines": list(range(1, len(archive_lines) + 1)), "unexamined_archive_lines": [], "semantic_atomization_scope": "full_selected_archive_line_denominator", "diff_status": dstatus, "unified_diff_sha256": sha(diff_text.encode())})
        diffs.append({"source_item_id": sid, "source_path": source, "pre_sha256": sha(pre), "archive_sha256": sha(archive), "pre_bytes": len(pre), "archive_bytes": len(archive), "status": dstatus, "unified_diff": diff_text, "unified_diff_sha256": sha(diff_text.encode()), "meaning_equivalence": "unresolved"})
        (OUT / "source-snapshots" / sid).mkdir(parents=True, exist_ok=True)
        (OUT / "source-snapshots" / sid / "pre-isolation.md").write_bytes(pre)
        (OUT / "source-snapshots" / sid / "archive-revision.md").write_bytes(archive)
    counts = {name: sum(row["atomization_status"] == name for row in atoms) for name in ("atomized_candidate", "metadata_only", "composite_unresolved")}
    write_jsonl(OUT / "source-pairs.jsonl", source_pairs)
    write_jsonl(OUT / "semantic-atoms.jsonl", atoms)
    write_jsonl(OUT / "line-inventory.jsonl", coverage)
    write_jsonl(OUT / "legacy-evidence.jsonl", all_legacy)
    write_json(OUT / "source-diffs.json", {"schema": "rdp001-outside67-source-diffs/v2", "items": diffs})
    write_json(OUT / "evidence-scan.json", {"schema": "rdp001-outside67-atomization-evidence-scan/v2", "selected_ids": TARGETS, "holding_denominator": 67, "holding_source_set_sha256": sha(HOLDING.read_bytes()), "legacy_catalog_ledgers": LEDGERS, "exact_ledger_hits": {sid: [row["ledger_path"] for row in all_legacy if row["source_item_id"] == sid and row["lookup"] == "exact_text_hit"] for sid in TARGETS}, "legacy_catalog_absence_interpretation": "lookup result is evidence boundary only; no absence/completion/approval inference", "static_only": True, "old_runtime_test_ci_execution": False})
    input_digests = {rel: sha((ROOT / rel).read_bytes()) for rel in sorted({"docs/governance/pre-isolation-outside-holding-67-source-holding.jsonl", "docs/governance/management-provisional-requirement-register.jsonl", "docs/concept/product-boundary.md", "docs/governance/upstream-authority-register-2026-09-14.md", *LEDGERS, *[f"{BUNDLES[sid][0]}/{name}" for sid in TARGETS for name in ("product-units.jsonl", "selected-source-items.jsonl", "source-diffs.json")]})}
    snapshot_manifest = {f"source-snapshots/{row['source_item_id']}/{side}.md": row["archive_revision" if side == "archive-revision" else "pre_isolation"]["sha256"] for row in source_pairs for side in ("pre-isolation", "archive-revision")}
    write_json(OUT / "plan.json", {"schema": "rdp001-outside67-path-atomization-plan/v2", "binding": "SCF-B-0095", "base_origin_main": BASE, "pre_isolation_commit": PRE, "archive_commit": ARCH, "scope": {"holding_denominator": 67, "selected_path_pairs": 5, "archive_line_denominator": len(coverage), "line_partition_complete": True, "semantic_atomization_complete": False, "unselected_path_revision_pair_count": 62}, "accounting": {"status_counts": counts, "deduplication_key": "(source_item_id, archive_line)", "archive_lines_exactly_once": True, "mutually_exclusive_categories": True}, "alignment_policy": "difflib.SequenceMatcher(autojunk=False); only equal opcodes receive pre_anchor; replace/insert opcodes retain pre_alignment status and null pre_anchor", "classification_policy": CLASSIFICATION_POLICY, "snapshot_manifest": snapshot_manifest, "method": ["preserve exact archive/pre line text and revision metadata", "classify every selected archive line exactly once", "retain composite normative lines unresolved instead of speculative splitting", "keep product/phase/owner/authority/implementation/degradation/failure/consumer/decision/adoption unknown"], "input_digests": input_digests, "prohibited": ["old runtime/test/CI execution", "formal requirement/product/owner promotion", "ledger no-hit interpreted as absence or completion", "archive content executed"]})
    write_json(OUT / "inventory.json", {"schema": "rdp001-outside67-path-atomization/v2", "binding": "SCF-B-0095", "status": "findings_only", "authority_effect": "none", "meaning_change_applied": False, "base_origin_main": BASE, "pre_isolation_commit": PRE, "archive_commit": ARCH, "holding": {"path": str(HOLDING.relative_to(ROOT)), "denominator": 67, "source_set_sha256": sha(HOLDING.read_bytes())}, "selected_source_item_ids": TARGETS, "source_paths": {sid: next(row["source_path"] for row in source_pairs if row["source_item_id"] == sid) for sid in TARGETS}, "current_counterpart_paths": {row["source_item_id"]: row["current_counterpart_path"] for row in source_pairs}, "source_pair_count": 5, "archive_line_denominator": len(coverage), "line_inventory_count": len(coverage), "selected_line_residual_count": 0, "semantic_atom_count": len(atoms), "atomization_status_counts": counts, "line_partition_complete": True, "semantic_atomization_complete": False, "holding_closure": False, "formal_requirement_unit_count": 0, "candidate_products": [{"product": p, "status": "boundary_candidate_only", "formal_owner": "unknown", "authority": "none"} for p in PRODUCTS], "unknown_fields": ["formal_owner", "successor", "phase_authority", "implementation", "degradation", "failure", "consumer", "decision", "adoption"], "alignment_policy": "equal-only pre anchors; replace/insert pre anchors are null with explicit status", "classification_policy": CLASSIFICATION_POLICY, "snapshot_manifest": snapshot_manifest, "legacy_catalog_exact_match_count": sum(row["lookup"] == "exact_text_hit" for row in all_legacy), "legacy_evidence_count": len(all_legacy), "static_only": True, "old_runtime_test_ci_execution": False, "input_digests": input_digests, "validation": ["python3 -B scaffold/rdp001-outside67-path001-005-atomization-0095/validate.py", "python3 -B scaffold/rdp001-outside67-path001-005-atomization-0095/selfcheck.py", "python3 scaffold/tools/scfctl.py validate", "python3 scaffold/tools/scfctl.py stale", "python3 scaffold/tools/scfctl.py residuals", "git diff --check"]})
    write_readme(counts, len(coverage))


def write_readme(counts: dict[str, int], denominator: int) -> None:
    (OUT / "README.md").write_text(f'''# RDP-001 outside67 PATH-001..005 source-line atomization (SCF-B-0095)

holding 67件から選んだ5つのpath_revision_pairを、旧本文の意味を変更せずに静的照合した研究束です。固定基準HEADは`{BASE}`、pre-isolationは`{PRE}`、archive revisionは`{ARCH}`です。旧archiveのruntime、test、CI、workflow、hook、adapter、sourceは実行していません。

選択5経路のarchive行分母{denominator}行を`line-inventory.jsonl`と`semantic-atoms.jsonl`で一行一記録にし、各行を相互排他的に`atomized_candidate`、`metadata_only`、`composite_unresolved`のいずれかへ分類しました。分類数は`atomized_candidate={counts['atomized_candidate']}`、`metadata_only={counts['metadata_only']}`、`composite_unresolved={counts['composite_unresolved']}`です。要求・制約・失敗条件を含む行は、分割根拠が足りない場合も`composite_unresolved`として原文を保持し、`metadata_only`へ落としていません。

四製品はcandidate boundaryだけで、formal product／owner／phase authority／successor／implementation／degradation／failure／consumer／decision／adoptionはunknownです。旧資産台帳のexact hit/no-hit、current counterpartの移設・差分、source／decision／failure／consumer ledgerは証拠境界として記録し、採択・完了・不在を生成しません。pre/archive対応は`difflib`のequal行だけをpre_anchorへ結び、replace／insert行はpre_anchorをnullにして未解決statusを保持します。semantic atomizationのline partitionは完了していますが、正式要求の採否・再配置・authorityは未完了です。

成果物: `source-pairs.jsonl`（pre/archive/current revision）、`source-snapshots/`（exact static snapshots）、`semantic-atoms.jsonl`、`line-inventory.jsonl`、`legacy-evidence.jsonl`、`source-diffs.json`、`inventory.json`、`plan.json`、`validate.py`、`selfcheck.py`。

```text
python3 -B scaffold/rdp001-outside67-path001-005-atomization-0095/generate.py
python3 -B scaffold/rdp001-outside67-path001-005-atomization-0095/validate.py
python3 -B scaffold/rdp001-outside67-path001-005-atomization-0095/selfcheck.py
python3 scaffold/tools/scfctl.py validate
python3 scaffold/tools/scfctl.py stale
python3 scaffold/tools/scfctl.py residuals
git diff --check
```
''', encoding="utf-8")


if __name__ == "__main__":
    build()

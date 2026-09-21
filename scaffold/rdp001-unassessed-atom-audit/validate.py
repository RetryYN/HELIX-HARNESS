#!/usr/bin/env python3
"""RDP-001 PREISOLATION holding の read-only 静的再計算。"""

from __future__ import annotations

import copy
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
BINDING_PATH = ROOT / "scaffold/bindings/SCF-B-0027.json"
HOLDING_PATH = ROOT / "docs/governance/pre-isolation-revision-delta-source-holding.jsonl"
DISPOSITION_PATH = ROOT / "docs/governance/legacy-asset-disposition.jsonl"
DECISIONS_PATH = ROOT / "docs/governance/legacy-asset-decisions.jsonl"
REGISTER_PATH = ROOT / "docs/governance/management-provisional-requirement-register.jsonl"
SCREEN_PATH = ROOT / "docs/governance/audits/source-rebaseline/l2d-s1-01-input-holding-screen.jsonl"
PROJECTION_PATH = ROOT / "docs/governance/audits/source-rebaseline/github-requirement-review-program-projection-2026-09-15.md"
PACKET_PATH = ROOT / "docs/governance/audits/source-rebaseline/l2d-s1-01-authority-vocabulary-human-decision-packet-v2.md"
AUDIT_PATH = ROOT / "docs/governance/audits/source-rebaseline/pre-isolation-revision-delta-audit-2026-09-16.md"

BASE = "6fabd12512a3659fff4a956692cdd61faeeb16ce"
PRE = "2d4991042be55268bac30a8bbcdac45b3865030a"
ARCHIVE = "064280b5c1c5c98f949e6e3be5ef87cbe4a4b658"
EXPECTED_HEAD = "569d7373c32287bbafadeec6043472563937c5c7"
SOURCE_DIGEST = "d61a36db8e053d9006d11a09d1c60fd86413f32daa4a766aaeae2bc849130180"


def digest(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def jsonl(path: Path) -> list[dict]:
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


def git_bytes(spec: str) -> bytes:
    return subprocess.run(
        ["git", "show", spec], cwd=ROOT, stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True
    ).stdout


def git_oid(commit: str, path: str) -> str:
    return subprocess.run(
        ["git", "rev-parse", f"{commit}:{path}"], cwd=ROOT, text=True,
        stdout=subprocess.PIPE, stderr=subprocess.PIPE, check=True,
    ).stdout.strip()


def present(commit: str, path: str) -> bool:
    return subprocess.run(
        ["git", "cat-file", "-e", f"{commit}:{path}"], cwd=ROOT,
        stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
    ).returncode == 0


def phase_candidate(path: str) -> str:
    if not path.startswith("docs/"):
        return "non-docs"
    if path.startswith("docs/governance/"):
        return "governance"
    if path.startswith("docs/test-design/"):
        return "L11-acceptance"
    for label, token in (
        ("L7-plan", "PLAN-L7-"), ("L3-plan", "PLAN-L3-"),
        ("L5-plan", "PLAN-L5-"), ("L4-plan", "PLAN-L4-"),
        ("L6-plan", "PLAN-L6-"),
    ):
        if token in path:
            return label
    if re.search(r"PLAN-(?:M|RECOVERY|REVERSE)(?:[-.]|$)", path, re.I):
        return "plan-unknown"
    for label, token in (
        ("L1", "/L1-requirements/"), ("L2", "/L2-screen/"),
        ("L3", "/L3-requirements/"), ("L10", "/L10-"),
    ):
        if token in path:
            return label
    if re.search(r"(?:^|/)L3(?:[-/.])", path, re.I):
        return "L3"
    return "plan-unknown"


def product_candidate(path: str) -> str:
    return "HELIX-HARNESS" if path.startswith("docs/design/harness/") else "shared-cross-product"


def counts(values: list[str], missing: str | None = None) -> dict[str, int]:
    c = Counter(missing if (missing is not None and v is None) else v for v in values)
    return dict(c)


def expect(errors: list[str], condition: bool, message: str) -> None:
    if not condition:
        errors.append(message)


def validate(report: dict | None = None) -> list[str]:
    errors: list[str] = []
    if report is None:
        try:
            report = json.loads(REPORT_PATH.read_text(encoding="utf-8"))
        except Exception as exc:  # pragma: no cover - CLI diagnostic
            return [f"report.jsonを読めない: {exc}"]
    try:
        holding = jsonl(HOLDING_PATH)
        disposition = jsonl(DISPOSITION_PATH)
        decisions = jsonl(DECISIONS_PATH)
        registrations = jsonl(REGISTER_PATH)
        screens = jsonl(SCREEN_PATH)
    except Exception as exc:
        return [f"上流JSONLを読めない: {exc}"]
    by_path = {row["source_path"]: row for row in disposition}
    decision_ids = {row.get("decision_id") for row in decisions}

    expect(errors, report.get("schema_revision") == 1, "report schema_revision不一致")
    expect(errors, report.get("status") == "findings_only", "report statusがfindings_onlyではない")
    expect(errors, report.get("authority_effect") == "none", "report authority_effectがnoneではない")
    expect(errors, report.get("binding_id") == "SCF-B-0027", "report binding_id不一致")
    expect(errors, report.get("binding_state") == "registered", "report binding_stateがregisteredではない")
    collision = report.get("binding_collision_check", {})
    expect(errors, collision.get("allocated_id") == "SCF-B-0027", "report allocated binding id不一致")
    expect(errors, collision.get("previous_uncommitted_candidate_id") == "SCF-B-0026", "report previous binding id不一致")
    expect(errors, collision.get("collision") is False, "report binding collisionがfalseではない")
    expect(errors, report.get("audit_revisions", {}).get("capture_head") == EXPECTED_HEAD, "report capture_head不一致")
    expect(errors, report.get("audit_revisions", {}).get("capture_ref") == "origin/main", "report capture_ref不一致")
    expect(errors, report.get("existing_pr_boundary", {}).get("merge_status_read_only", {}).get("1951", {}).get("state") == "MERGED", "PR #1951 status不一致")
    expect(errors, report.get("existing_pr_boundary", {}).get("merge_status_read_only", {}).get("1955", {}).get("state") == "MERGED", "PR #1955 status不一致")
    expect(errors, report.get("existing_pr_boundary", {}).get("merge_status_read_only", {}).get("1957", {}).get("state") == "OPEN", "PR #1957 status不一致")
    expect(errors, len(holding) == 333, f"holding件数不一致: {len(holding)}")
    expect(errors, len({x.get("source_path") for x in holding}) == 333, "holding source_pathが重複")
    expect(errors, digest(HOLDING_PATH) == SOURCE_DIGEST, "holding digest不一致")
    expect(errors, subprocess.run(["git", "merge-base", "--is-ancestor", EXPECTED_HEAD, "HEAD"], cwd=ROOT, check=False).returncode == 0, "worktreeがcapture HEADの子孫でない")

    # report自身の主要分母と3 sampleは、Git全件走査の前にfail-closeする。
    expect(errors, report.get("source_register", {}).get("product_target") == "unassigned_cross_product", "report product targetが未確定値ではない")
    expect(errors, report.get("source_register", {}).get("unaccounted_atom_refs") == 0, "report unaccounted atom refが0ではない")
    expect(errors, report.get("denominators", {}).get("holding_records") == 333, "report holding denominator不一致")
    expect(errors, report.get("aggregate", {}).get("implementation_status_counts", {}).get("unknown") == 324, "report implementation denominator不一致")
    quick_samples = {x.get("source_path"): x for x in report.get("samples", [])}
    for quick_path in (
        "config/workflow-classification-catalog.v1.json",
        "docs/design/harness/L1-requirements/business-requirements.md",
        "docs/plans/PLAN-L3-82-authority-vocabulary-separation.md",
    ):
        quick_source = next((x for x in holding if x.get("source_path") == quick_path), None)
        quick_sample = quick_samples.get(quick_path)
        expect(errors, quick_source is not None and quick_sample is not None, f"quick sampleが無い: {quick_path}")
        if quick_source and quick_sample:
            for quick_key in ("pre_isolation_blob_oid", "pre_isolation_file_sha256"):
                expect(errors, quick_sample.get(quick_key) == quick_source.get(quick_key), f"quick sample {quick_key}不一致: {quick_path}")
    if errors:
        return errors

    reg = next((x for x in registrations if x.get("registration_id") == "MPR-SH-PREISOLATION-002"), None)
    expect(errors, reg is not None, "MPR register rowが無い")
    if reg:
        for key, want in {
            "source_atom_set_ref": "docs/governance/pre-isolation-revision-delta-source-holding.jsonl",
            "source_atom_set_digest": "sha256:" + SOURCE_DIGEST,
            "source_atom_count": 333,
            "product_target": "unassigned_cross_product",
            "coverage_result": "source_preserved_unassigned",
            "management_state": "registered_source_holding",
            "authority_effect": "none",
        }.items():
            expect(errors, reg.get(key) == want, f"MPR register {key}不一致")
        for key in ("carried_atom_refs", "human_decision_disposition_refs", "unaccounted_atom_refs"):
            expect(errors, reg.get(key) == [], f"MPR register {key}が空でない")

    screen = next((x for x in screens if x.get("screen_id") == "S101-HOLD-MPR-SH-PREISOLATION-002"), None)
    expect(errors, screen is not None, "holding screen rowが無い")
    if screen:
        for key, want in {
            "source_atom_count": 333, "screened_matches": 0,
            "disposition": "unassessed_pending_atomization",
            "authority_effect": "none",
        }.items():
            expect(errors, screen.get(key) == want, f"holding screen {key}不一致")
        expect(errors, screen.get("source_atom_set_sha256") == "sha256:" + SOURCE_DIGEST, "screen source digest不一致")

    expect(errors, digest(PROJECTION_PATH) == report["issue_projection"]["projection_sha256"], "Issue projection digest不一致")
    for key, path in {
        "source_holding": HOLDING_PATH,
        "asset_disposition": DISPOSITION_PATH,
        "asset_decisions": DECISIONS_PATH,
        "mpr_register": REGISTER_PATH,
        "holding_screen": SCREEN_PATH,
        "packet_v2": PACKET_PATH,
        "pre_isolation_audit": AUDIT_PATH,
        "issue_projection": PROJECTION_PATH,
    }.items():
        expect(errors, report["digests"].get(key) == digest(path), f"report digest不一致: {key}")

    base_count = pre_count = archive_count = different_count = old_count = current_count = 0
    byte_sizes: list[int] = []
    line_sizes: list[int] = []
    categories: Counter[str] = Counter()
    products: Counter[str] = Counter()
    phases: Counter[str] = Counter()
    asset_authority: list[str | None] = []
    asset_disposition: list[str] = []
    asset_implementation: list[str] = []
    asset_exec: list[str] = []
    asset_effect: list[str] = []
    asset_decision: list[str | None] = []
    decision_ref_count = consumer_path_count = consumer_ref_count = 0
    lexical = {
        "failure": re.compile(r"failure|fail|失敗|障害", re.I),
        "degraded": re.compile(r"degrad|縮退", re.I),
        "recovery": re.compile(r"recovery|復旧|rollback", re.I),
        "implementation": re.compile(r"implement|実装|未実装", re.I),
        "consumer": re.compile(r"consumer|downstream|利用先|利用者|消費", re.I),
    }
    lex_paths = {name: 0 for name in lexical}
    lex_occurrences = {name: 0 for name in lexical}

    for index, row in enumerate(holding, 1):
        path = row.get("source_path")
        expect(errors, row.get("source_revision_item_id") == f"PREISO-REV-{index:06d}", f"holding ID不連番: {index}")
        expect(errors, row.get("baseline_commit") == BASE, f"baseline commit不一致: {path}")
        expect(errors, row.get("pre_isolation_commit") == PRE, f"pre commit不一致: {path}")
        expect(errors, row.get("archive_commit") == ARCHIVE, f"archive commit不一致: {path}")
        expect(errors, row.get("archive_path") == "archive/legacy-generation-2026-09-14/root/" + path, f"archive path不一致: {path}")
        try:
            baseline = git_bytes(f"{BASE}:{path}")
            pre = git_bytes(f"{PRE}:{path}")
            old = git_bytes(f"{ARCHIVE}:{row['archive_path']}")
            base_oid = git_oid(BASE, path)
            pre_oid = git_oid(PRE, path)
            archive_oid = git_oid(ARCHIVE, row["archive_path"])
        except subprocess.CalledProcessError as exc:
            errors.append(f"Git object取得失敗: {path}: {exc}")
            continue
        base_count += base_oid == row.get("baseline_blob_oid")
        pre_count += pre_oid == row.get("pre_isolation_blob_oid")
        archive_count += archive_oid == pre_oid
        different_count += baseline != pre
        old_count += bool(old)
        current_count += present(EXPECTED_HEAD, path)
        expect(errors, hashlib.sha256(baseline).hexdigest() == row.get("baseline_file_sha256"), f"baseline sha不一致: {path}")
        expect(errors, hashlib.sha256(pre).hexdigest() == row.get("pre_isolation_file_sha256"), f"pre sha不一致: {path}")
        expect(errors, hashlib.sha256(old).hexdigest() == row.get("pre_isolation_file_sha256"), f"archive sha不一致: {path}")

        byte_sizes.append(len(old))
        line_sizes.append(len(old.splitlines()))
        text = old.decode("utf-8", errors="replace")
        for name, pattern in lexical.items():
            found = pattern.findall(text)
            lex_paths[name] += bool(found)
            lex_occurrences[name] += len(found)
        categories[row.get("source_category")] += 1
        products[product_candidate(path)] += 1
        phases[phase_candidate(path)] += 1

        asset = by_path.get(path)
        expect(errors, asset is not None, f"asset dispositionが無い: {path}")
        if asset is None:
            continue
        expect(errors, asset.get("source_sha256") == row.get("pre_isolation_file_sha256"), f"asset/source sha不一致: {path}")
        asset_authority.append(asset.get("authority_status"))
        asset_disposition.append(asset.get("disposition"))
        asset_implementation.append(asset.get("implementation_status"))
        asset_exec.append(asset.get("executability_status"))
        asset_effect.append(asset.get("external_effect_status"))
        asset_decision.append(asset.get("decision_status"))
        if asset.get("decision_record_ref"):
            decision_ref_count += 1
            ref_id = str(asset["decision_record_ref"]).split("#")[-1]
            expect(errors, ref_id in decision_ids, f"decision refが台帳に無い: {path}")
        refs = asset.get("consumer_refs") or []
        if refs:
            consumer_path_count += 1
            consumer_ref_count += len(refs)

    expect(errors, base_count == 333, f"baseline blob照合分母不一致: {base_count}")
    expect(errors, pre_count == 333, f"pre-isolation blob照合分母不一致: {pre_count}")
    expect(errors, archive_count == 333, f"archive blob照合分母不一致: {archive_count}")
    expect(errors, different_count == 333, f"byte差分分母不一致: {different_count}")
    expect(errors, old_count == 333, f"旧原文取得分母不一致: {old_count}")
    expect(errors, current_count == 0, f"current source path存在数不一致: {current_count}")
    expect(errors, len(byte_sizes) == 333 and sum(byte_sizes) == 3141428 and min(byte_sizes) == 1910 and max(byte_sizes) == 152529, "旧原文byte集計不一致")
    expect(errors, len(line_sizes) == 333 and sum(line_sizes) == 44964, "旧原文line集計不一致")
    expect(errors, report.get("original_text", {}).get("total_bytes") == sum(byte_sizes), "report旧原文byte集計不一致")
    expect(errors, report.get("original_text", {}).get("total_lines") == sum(line_sizes), "report旧原文line集計不一致")

    aggregate = report["aggregate"]
    for key, actual in {
        "source_category_counts": dict(categories),
        "product_candidate_counts": dict(products),
        "phase_candidate_counts": dict(phases),
        "authority_status_counts": counts(asset_authority, "missing"),
        "disposition_counts": dict(Counter(asset_disposition)),
        "implementation_status_counts": dict(Counter(asset_implementation)),
        "executability_status_counts": dict(Counter(asset_exec)),
        "external_effect_status_counts": dict(Counter(asset_effect)),
        "decision_status_counts": counts(asset_decision, "missing"),
    }.items():
        expect(errors, aggregate.get(key) == actual, f"aggregate不一致: {key}: {actual}")
    expect(errors, aggregate.get("decision_ref_count") == decision_ref_count == 9, "decision ref数不一致")
    expect(errors, aggregate.get("decided_by_count") == sum(bool(by_path[x["source_path"]].get("decided_by")) for x in holding) == 0, "decided_by数不一致")
    expect(errors, aggregate.get("approval_revision_count") == sum(bool(by_path[x["source_path"]].get("approval_revision")) for x in holding) == 0, "approval revision数不一致")
    for name, pattern in lexical.items():
        entry = aggregate["lexical_signals"][name]
        expect(errors, entry.get("paths") == lex_paths[name] and entry.get("occurrences") == lex_occurrences[name], f"lexical signal不一致: {name}")

    den = report["denominators"]
    for key, actual in {
        "holding_records": len(holding), "baseline_blob_verified": base_count,
        "pre_isolation_blob_verified": pre_count, "archive_blob_verified": archive_count,
        "byte_different": different_count, "old_original_text_retrievable": old_count,
        "current_source_path_present": current_count, "current_source_path_absent": 333 - current_count,
        "asset_disposition_matches": 333, "source_decision_refs": decision_ref_count,
        "consumer_paths": consumer_path_count, "consumer_refs": consumer_ref_count,
        "structured_failure_fields": 0, "structured_degraded_fields": 0,
    }.items():
        expect(errors, den.get(key) == actual, f"denominator不一致: {key}")

    samples = {x["source_path"]: x for x in report.get("samples", [])}
    for path in ("config/workflow-classification-catalog.v1.json", "docs/design/harness/L1-requirements/business-requirements.md", "docs/plans/PLAN-L3-82-authority-vocabulary-separation.md"):
        source = next(x for x in holding if x["source_path"] == path)
        sample = samples.get(path)
        expect(errors, sample is not None, f"sampleが無い: {path}")
        if sample:
            for key in ("source_revision_item_id", "source_category", "baseline_blob_oid", "pre_isolation_blob_oid", "pre_isolation_file_sha256"):
                expect(errors, sample.get(key) == source.get(key), f"sample {key}不一致: {path}")
            expect(errors, sample.get("archive_original_retrievable") is True, f"sample archive flag不一致: {path}")
            expect(errors, sample.get("product_candidate") == product_candidate(path), f"sample product候補不一致: {path}")
            expect(errors, sample.get("phase_candidate") == phase_candidate(path), f"sample phase候補不一致: {path}")

    try:
        binding = json.loads(BINDING_PATH.read_text(encoding="utf-8"))
    except Exception as exc:
        return errors + [f"SCF-B-0027を読めない: {exc}"]
    expect(errors, binding.get("id") == "SCF-B-0027", "binding id不一致")
    expect(errors, binding.get("state") == "registered", "binding state不一致")
    expect(errors, binding.get("kind") == "scaffold", "binding kind不一致")
    expect(errors, binding.get("role") == "RDP-001 PREISOLATION未評価source holdingのatom化前静的監査", "binding role不一致")
    expect(errors, binding.get("replacement", {}).get("issue") == 1866, "binding replacement issue不一致")
    upstream = {x.get("path"): x.get("sha256") for x in binding.get("upstream", [])}
    for path in ("scaffold/rdp001-unassessed-atom-audit/report.json", "docs/governance/pre-isolation-revision-delta-source-holding.jsonl", "docs/governance/legacy-asset-disposition.jsonl", "docs/governance/legacy-asset-decisions.jsonl", "docs/governance/management-provisional-requirement-register.jsonl", "docs/governance/audits/source-rebaseline/l2d-s1-01-input-holding-screen.jsonl", "docs/governance/audits/source-rebaseline/l2d-s1-01-authority-vocabulary-human-decision-packet-v2.md", "docs/governance/audits/source-rebaseline/pre-isolation-revision-delta-audit-2026-09-16.md", "docs/governance/audits/source-rebaseline/github-requirement-review-program-projection-2026-09-15.md"):
        expect(errors, upstream.get(path) == digest(ROOT / path), f"binding upstream digest不一致: {path}")
    for path in ("scaffold/rdp001-unassessed-atom-audit/report.json", "scaffold/rdp001-unassessed-atom-audit/README.md", "scaffold/rdp001-unassessed-atom-audit/validate.py", "scaffold/rdp001-unassessed-atom-audit/selfcheck.py", "scaffold/bindings/SCF-B-0027.json"):
        expect(errors, (ROOT / path).is_file(), f"binding artifactが無い: {path}")
    roles = []
    for candidate in (ROOT / "scaffold/bindings").glob("SCF-B-*.json"):
        try:
            other = json.loads(candidate.read_text(encoding="utf-8"))
        except Exception:
            continue
        if other.get("state") != "retired":
            roles.append(other.get("role"))
    expect(errors, roles.count(binding.get("role")) == 1, "binding roleが別の非退役bindingと重複")
    return errors


def main() -> int:
    errors = validate()
    if errors:
        print("FAIL rdp001-unassessed-atom-audit")
        for error in errors:
            print("  - " + error)
        print(f"errors={len(errors)}")
        return 1
    print("PASS rdp001-unassessed-atom-audit: 333/333 holding records, Git object/archive/source disposition rechecked")
    return 0


if __name__ == "__main__":
    sys.exit(main())

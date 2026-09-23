#!/usr/bin/env python3
"""Independent static audit of target identities, original spans and adapter inventory.

This intentionally does not import generate.py or validate.py. It reads Git objects,
the fixed legacy disposition, the hand-authored span profile and the rendered ledger.
It verifies byte/path/span claims; it does not certify the semantic interpretation.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import subprocess
import sys
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
BUNDLE = ROOT / "scaffold/legacy-ai-instruction-product-classification-0145"
REPORT = BUNDLE / "independent-source-audit.json"
BASE = "5562f04da0f3205f9aa58205ec0d478419fc4f2e"
MAIN = "b3a3c49b34bfaa1cca5861075d1de18c0e5e7204"
PR2078 = "8c8cf851b47c88f6d814dc828a38743fc3cd45b3"
PR2090 = "ef3e1de17f8cd3818d38d5ff9ca512d2eb62f9ac"
ARCHIVE = "archive/legacy-generation-2026-09-14/root/"
MANIFEST = "archive/legacy-generation-2026-09-14/MANIFEST.sha256"
DISPOSITION = "docs/governance/legacy-asset-disposition.jsonl"
CONSUMER_INVENTORY = "docs/governance/audits/source-rebaseline/legacy-ai-consumer-relation-inventory.md"
MAIN_LEDGER_PATHS = [
    "scaffold/legacy-asset-product-classification-0107/classification-research.jsonl",
    "scaffold/legacy-lint-product-classification-0108/classification-research.jsonl",
    "scaffold/legacy-runtime-product-classification-0117/classification-research.jsonl",
    "scaffold/legacy-schema-product-classification-0120/classification-research.jsonl",
    "scaffold/legacy-source-product-classification-0123/classification-research.jsonl",
    "scaffold/legacy-state-db-product-classification-0127/classification-research.jsonl",
    "scaffold/legacy-lint-candidate-product-classification-0128/classification-research.jsonl",
    "scaffold/legacy-runtime-residual-product-classification-0133/classification-research.jsonl",
]
PINNED_SNAPSHOTS = {
    "pr-2078-classification-research.jsonl": "sha256:d7c78523574ed41daa21f7bca6b58d5f7ed1009a47b877d9d8ac78c9b8a75138",
    "pr-2090-classification-research.jsonl": "sha256:88448924b72165336db9699c4b026172782949725d97c38601a403046b497b36",
}
EXCLUSIONS = {
    "LEGACY-ASSET-3AC78FD8A01E0F9811C5": (".claude/hooks/git-command-guard.ts", "94519967c5565bd024b3da03384f7a12d9622c16af0b0836e534d4ff0434853d"),
    "LEGACY-ASSET-A8DD18BCB237675730CD": (".claude/hooks/session-log.ts", "42434283c9fcb273d9064aea08eb35b56bb0f18ee2d89ce75c85005143e3bc8f"),
    "LEGACY-ASSET-DB4925588127A51391D7": (".claude/hooks/work-guard.ts", "c9aa80b399925bb258de728314dc43f531e0f219c771585d9f661cd0772a7009"),
}


def sha(data: bytes) -> str:
    return "sha256:" + hashlib.sha256(data).hexdigest()


def pairs_strict(pairs):
    result = {}
    for key, value in pairs:
        if key in result:
            raise ValueError(f"duplicate JSON key {key!r}")
        result[key] = value
    return result


def parse_json(data: bytes, label: str):
    return json.loads(data.decode("utf-8"), object_pairs_hook=pairs_strict)


def parse_jsonl(data: bytes, label: str) -> list[dict]:
    rows = []
    for line_no, raw in enumerate(data.decode("utf-8").splitlines(), 1):
        if raw.strip():
            value = parse_json(raw.encode(), f"{label}:{line_no}")
            if type(value) is not dict:
                raise ValueError(f"{label}:{line_no}: JSON object required")
            rows.append(value)
    return rows


def git(rev: str, path: str) -> bytes:
    return subprocess.check_output(["git", "show", f"{rev}:{path}"], cwd=ROOT)


def tree(rev: str, path: str) -> tuple[str, str, str]:
    lines = subprocess.check_output(["git", "ls-tree", rev, "--", path], text=True, cwd=ROOT).splitlines()
    if len(lines) != 1:
        raise ValueError(f"archive path missing or ambiguous: {rev}:{path}")
    meta, actual = lines[0].split("\t", 1)
    mode, kind, oid = meta.split()
    if actual != path or kind != "blob" or mode not in {"100644", "100755"}:
        raise ValueError(f"non-regular archive entry: {lines[0]}")
    return mode, kind, oid


def identity(row: dict) -> tuple[str, str, str]:
    source = row.get("source_exact", {})
    path = row.get("source_path") or source.get("source_path")
    digest = source.get("sha256", row.get("source_sha256", ""))
    if isinstance(digest, str):
        digest = digest.removeprefix("sha256:")
    return row["asset_id"], path, digest


def manifest_digest(path: str) -> str:
    inner = path.removeprefix(ARCHIVE)
    lines = git(BASE, MANIFEST).decode("utf-8").splitlines()
    found = [line.split()[0] for line in lines if line.endswith("  " + inner) or line.endswith(" " + inner)]
    if len(found) != 1:
        raise ValueError(f"MANIFEST entry count for {inner}: {len(found)}")
    return "sha256:" + found[0]


def run_audit(bundle: Path) -> dict:
    profile_bytes = (bundle / "semantic-profile.json").read_bytes()
    profile = parse_json(profile_bytes, "semantic-profile.json")
    target_scope = profile["scope"]
    if target_scope["fixed_base_revision"] != BASE:
        raise ValueError("profile fixed BASE drift")
    disposition = parse_jsonl(git(BASE, DISPOSITION), DISPOSITION)
    prefixes = tuple(target_scope["included_unresolved_prefixes"])
    roots = set(target_scope["included_unresolved_root_paths"])
    candidates = [row for row in disposition if row.get("disposition") == "unresolved" and
                  (row.get("source_path", "").startswith(prefixes) or row.get("source_path") in roots)]
    if len(candidates) != 75:
        raise ValueError(f"fixed source scope count is {len(candidates)}, expected 75 before overlap exclusions")

    main_rows = [row for path in MAIN_LEDGER_PATHS for row in parse_jsonl(git(MAIN, path), path)]
    pr_rows = {}
    for pr, snap_name, expected_head, expected_digest, inv_name, inv_digest in (
        ("2078", "pr-2078-classification-research.jsonl", PR2078, PINNED_SNAPSHOTS["pr-2078-classification-research.jsonl"],
         "pr-2078-inventory.json", "sha256:fdfcc7b3f7b7b9c704bf2a63cc5fb7a91b8567e42d708554a49f7f82ba90c860"),
        ("2090", "pr-2090-classification-research.jsonl", PR2090, PINNED_SNAPSHOTS["pr-2090-classification-research.jsonl"],
         "pr-2090-inventory.json", "sha256:e30823f82fc0202f2f9ad0b9eb90a95b42c963758cd3df8596e10789f59a6b72"),
    ):
        data = (bundle / "upstream" / snap_name).read_bytes()
        if sha(data) != expected_digest:
            raise ValueError(f"PR #{pr} classification snapshot digest drift")
        inv_data = (bundle / "upstream" / inv_name).read_bytes()
        if sha(inv_data) != inv_digest:
            raise ValueError(f"PR #{pr} inventory snapshot digest drift")
        pr_rows[pr] = parse_jsonl(data, snap_name)

    prior_rows = {"main": main_rows, "pr_2078": pr_rows["2078"], "pr_2090": pr_rows["2090"]}
    prior_ids, prior_paths = {}, {}
    for label, rows in prior_rows.items():
        prior_ids[label] = {identity(row)[0] for row in rows}
        prior_paths[label] = {(identity(row)[1], identity(row)[2]) for row in rows}
    counts = {label: len(ids) for label, ids in prior_ids.items()}
    if counts != {"main": 429, "pr_2078": 67, "pr_2090": 41}:
        raise ValueError(f"prior set counts changed: {counts}")
    labels = list(prior_rows)
    pairwise = {}
    for i, left in enumerate(labels):
        for right in labels[i + 1:]:
            pairwise[f"{left}/{right}"] = {
                "asset_id_overlap": len(prior_ids[left] & prior_ids[right]),
                "source_path_sha256_overlap": len(prior_paths[left] & prior_paths[right]),
            }
    if any(value != {"asset_id_overlap": 0, "source_path_sha256_overlap": 0} for value in pairwise.values()):
        raise ValueError(f"prior research sets overlap: {pairwise}")

    all_prior_ids = set().union(*prior_ids.values())
    all_prior_paths = set().union(*prior_paths.values())
    candidate_ids = {row["asset_id"] for row in candidates}
    candidate_pairs = {(row["source_path"], row["source_sha256"]) for row in candidates}
    duplicate_ids = candidate_ids & all_prior_ids
    duplicate_pairs = candidate_pairs & all_prior_paths
    if duplicate_ids != set(EXCLUSIONS) or duplicate_pairs != set(EXCLUSIONS.values()):
        raise ValueError("candidate/prior overlap differs from exact 3-row #2078 exclusion set")
    target_rows = [row for row in candidates if row["asset_id"] not in duplicate_ids]
    target_ids = {row["asset_id"] for row in target_rows}
    target_pairs = {(row["source_path"], row["source_sha256"]) for row in target_rows}
    if len(target_rows) != 72:
        raise ValueError(f"target denominator is {len(target_rows)}, expected 72")
    if target_ids & all_prior_ids or target_pairs & all_prior_paths:
        raise ValueError("post-exclusion target still overlaps prior set")

    profile_rows = {row["source_path"]: row for row in profile["records"]}
    ledger_rows = parse_jsonl((bundle / "classification-research.jsonl").read_bytes(), "classification-research.jsonl")
    ledger_by_id = {row.get("asset_id"): row for row in ledger_rows}
    if len(ledger_by_id) != len(ledger_rows) or set(ledger_by_id) != target_ids:
        raise ValueError("rendered ledger exact target set does not equal independent disposition-derived set")
    if set(profile_rows) != {row["source_path"] for row in target_rows}:
        raise ValueError("manual profile path set differs from independent target set")

    audit_records = []
    category_counts = Counter()
    for source in sorted(target_rows, key=lambda row: row["source_path"]):
        path = source["source_path"]
        manual = profile_rows[path]
        ledger = ledger_by_id[source["asset_id"]]
        if (manual["asset_id"], manual["source_sha256"]) != (source["asset_id"], source["source_sha256"]):
            raise ValueError(f"profile identity differs from fixed disposition for {path}")
        archive_path = ARCHIVE + path
        mode, kind, blob = tree(BASE, archive_path)
        content = git(BASE, archive_path)
        content_sha = sha(content)
        expected_sha = "sha256:" + source["source_sha256"]
        if content_sha != expected_sha or manifest_digest(archive_path) != content_sha:
            raise ValueError(f"archive / disposition / MANIFEST SHA mismatch for {path}")
        if hashlib.sha1(b"blob " + str(len(content)).encode() + b"\0" + content).hexdigest() != blob:
            raise ValueError(f"Git object identity mismatch for {path}")
        lines = content.decode("utf-8", errors="strict").splitlines()
        start, end = manual["line_start"], manual["line_end"]
        if not (1 <= start <= end <= len(lines)):
            raise ValueError(f"profile span outside source for {path}:{start}-{end}")
        span = lines[start - 1:end]
        span_sha = sha("\n".join(span).encode("utf-8"))
        output_source = ledger.get("source_exact", {})
        output_anchor = output_source.get("semantic_anchor", {})
        if output_anchor.get("line_start") != start or output_anchor.get("line_end") != end or output_anchor.get("line_text") != span:
            raise ValueError(f"rendered semantic span text differs from direct BASE extraction for {path}")
        if output_anchor.get("line_text_sha256") != span_sha:
            raise ValueError(f"rendered semantic span digest differs from direct BASE extraction for {path}")
        if ledger.get("source_sha256") != source["source_sha256"] or output_source.get("sha256") != content_sha or output_source.get("blob") != blob or output_source.get("archive_mode") != mode or output_source.get("archive_type") != kind:
            raise ValueError(f"rendered archive receipt differs from direct BASE object for {path}")
        if ledger.get("classification", {}).get("category") != manual["category"]:
            raise ValueError(f"rendered candidate category differs from manual profile for {path}")
        products = manual.get("candidate_products")
        basis = manual.get("product_basis")
        counters = manual.get("counterevidence")
        basis_products = [item.get("product") for item in basis if type(item) is dict]
        counter_products = [item.get("product") for item in counters if type(item) is dict]
        if (type(products) is not list or type(basis) is not list or type(counters) is not list or
                len(products) != len(set(products)) or any(product not in {"HELIX-HARNESS", "HELIX-OS", "HELIX-Web", "HELIX-Web-OS"} for product in products) or
                len(basis_products) != len(basis) or set(basis_products) != set(products) or
                len(counter_products) != len(counters) or any(product in products for product in counter_products)):
            raise ValueError(f"manual category evidence invariant failed for {path}")
        category_ok = ((manual["category"] == "direct_product_basis" and len(products) == 1) or
                       (manual["category"] == "multi_product_conflict" and len(products) >= 2) or
                       (manual["category"] == "insufficient_basis" and not products and not basis))
        if not category_ok:
            raise ValueError(f"category/product-count invariant failed for {path}")
        category_counts[manual["category"]] += 1
        audit_records.append({
            "asset_id": source["asset_id"], "source_path": path,
            "archive_blob": blob, "archive_mode": mode, "archive_type": kind,
            "source_sha256": content_sha, "line_start": start, "line_end": end,
            "span_text_sha256": span_sha, "category_candidate": manual["category"],
            "candidate_products": manual["candidate_products"],
        })

    template_prefix = ARCHIVE + "docs/templates/adapter/"
    names = subprocess.check_output(["git", "ls-tree", "-r", "--name-only", BASE, "--", template_prefix], text=True, cwd=ROOT).splitlines()
    template_paths = sorted(name.removeprefix(ARCHIVE) for name in names)
    target_templates = sorted(path for path in profile_rows if path.startswith("docs/templates/adapter/"))
    if len(template_paths) != 34 or template_paths != target_templates:
        raise ValueError(f"AICR-06 exact template set differs: archive={len(template_paths)} profile={len(target_templates)}")
    if dict(category_counts) != {"multi_product_conflict": 41, "direct_product_basis": 28, "insufficient_basis": 3}:
        raise ValueError(f"manual category denominator changed: {dict(category_counts)}")
    consumer_data = git(BASE, CONSUMER_INVENTORY)
    consumer_text = consumer_data.decode("utf-8")
    expected_inventory_claim = "`docs/templates/adapter/`で34ファイルを発見した"
    if expected_inventory_claim not in consumer_text or "AICR-06" not in consumer_text:
        raise ValueError("fixed consumer inventory does not document AICR-06 34-template relation")

    return {
        "schema_revision": 1,
        "audit_kind": "independent_static_source_identity_and_span_reconciliation",
        "fixed_base_revision": BASE,
        "comparison_revisions": {"main": MAIN, "pr_2078": PR2078, "pr_2090": PR2090},
        "profile_sha256": sha(profile_bytes),
        "fixed_disposition": {"path": DISPOSITION, "blob": tree(BASE, DISPOSITION)[2], "sha256": sha(git(BASE, DISPOSITION))},
        "consumer_inventory": {"path": CONSUMER_INVENTORY, "blob": tree(BASE, CONSUMER_INVENTORY)[2], "sha256": sha(consumer_data), "AICR_06_claimed_template_count": 34},
        "selection_counts": {
            "unresolved_candidates_before_overlap": len(candidates),
            "exact_prior_overlap_exclusions": len(duplicate_ids),
            "target_denominator": len(target_rows),
            "main_product_research_ids": counts["main"], "pr_2078_target_ids": counts["pr_2078"], "pr_2090_target_ids": counts["pr_2090"],
        },
        "prior_pairwise_overlap": pairwise,
        "target_overlap_with_main_pr2078_pr2090": {"asset_id": 0, "source_path_sha256": 0},
        "excluded_prior_overlap_rows": [{"asset_id": aid, "source_path": pair[0], "source_sha256": pair[1]} for aid, pair in sorted(EXCLUSIONS.items())],
        "adapter_template_set": {"archive_physical_count": len(template_paths), "target_count": len(target_templates), "exact_set_match": True, "paths": template_paths},
        "category_candidate_counts": dict(sorted(category_counts.items())),
        "source_span_records": audit_records,
        "semantic_interpretation_status": "manual candidate interpretations were not independently adjudicated; human judgment remains required",
        "authority_effect": "none",
        "formal_asset_classification_updated": False,
        "new_build_allowed": False,
        "archive_access": "git-object static reads only; no legacy runtime, source, tests, hooks or CI executed",
        "checks": {
            "fixed_disposition_target_set_exact": True,
            "archive_blob_mode_type_sha_and_manifest_exact_for_all_72": True,
            "profile_line_span_text_exact_for_all_72": True,
            "consumer_inventory_aicr06_34_paths_exact": True,
            "main_pr2078_pr2090_pairwise_deduplicated": True,
            "new_target_id_and_path_sha_overlap_zero": True,
        },
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--write", action="store_true", help="write independently recomputed report")
    parser.add_argument("--bundle", type=Path, default=BUNDLE)
    args = parser.parse_args()
    bundle = args.bundle.resolve()
    report_path = bundle / "independent-source-audit.json"
    try:
        report = run_audit(bundle)
    except (ValueError, KeyError, TypeError, OSError, subprocess.CalledProcessError) as exc:
        print(f"SCF-B-0145 independent-source-audit FAIL {exc}", file=sys.stderr)
        return 1
    rendered = json.dumps(report, ensure_ascii=False, sort_keys=True, indent=2) + "\n"
    if args.write:
        report_path.write_text(rendered, encoding="utf-8")
    elif not report_path.exists() or report_path.read_text(encoding="utf-8") != rendered:
        print("SCF-B-0145 independent-source-audit FAIL report absent or stale; rerun with --write", file=sys.stderr)
        return 1
    print("SCF-B-0145 independent-source-audit PASS targets=72 raw_spans=72 adapter_templates=34 overlaps=0 semantic_adjudication=human_pending")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

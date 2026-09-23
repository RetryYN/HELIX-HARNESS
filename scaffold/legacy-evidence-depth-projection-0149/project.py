#!/usr/bin/env python3
"""Project declared evidence-depth markers from the 14 existing research bundles."""

from __future__ import annotations

import argparse
import copy
import json
import sys
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT = Path(__file__).with_name("projection.json")
BASE = "69e3c6b20541721161cab9d69f3aaf834e89d511"

# These are the 14 existing main-record bundles included in Issue #2100's scope.
BUNDLES = [
    ("legacy-ai-instruction-product-classification-0145", "SCF-B-0145"),
    ("legacy-asset-product-classification-0107", "SCF-B-0107"),
    ("legacy-config-product-classification-0141", "SCF-B-0141"),
    ("legacy-execution-ticket-product-classification-0147", "SCF-B-0147"),
    ("legacy-implementation-residual-0126", "SCF-B-0126"),
    ("legacy-lint-candidate-product-classification-0128", "SCF-B-0128"),
    ("legacy-lint-product-classification-0108", "SCF-B-0108"),
    ("legacy-research-assets-product-classification-0142", "SCF-B-0142"),
    ("legacy-runtime-product-classification-0117", "SCF-B-0117"),
    ("legacy-runtime-residual-product-classification-0133", "SCF-B-0133"),
    ("legacy-schema-product-classification-0120", "SCF-B-0120"),
    ("legacy-source-product-classification-0123", "SCF-B-0123"),
    ("legacy-state-db-product-classification-0127", "SCF-B-0127"),
    ("legacy-test-design-worker-workflow-0148", "SCF-B-0148"),
]


def load_rows(root: Path = ROOT) -> list[dict]:
    rows = []
    for bundle, binding_id in BUNDLES:
        path = root / "scaffold" / bundle / "classification-research.jsonl"
        with path.open(encoding="utf-8") as f:
            for line_number, line in enumerate(f, 1):
                if not line.strip():
                    continue
                record = json.loads(line)
                if not isinstance(record, dict) or not isinstance(record.get("asset_id"), str):
                    raise ValueError(f"{path}:{line_number}: asset_id付きobjectではありません")
                rows.append({"bundle": bundle, "binding_id": binding_id,
                             "line": line_number, "record": record})
    return rows


def category(record: dict) -> str | None:
    classification = record.get("classification")
    if isinstance(classification, dict) and isinstance(classification.get("category"), str):
        return classification["category"]
    value = record.get("classification_category")
    return value if isinstance(value, str) else None


def mechanical_flags(record: dict) -> list[bool]:
    classification = record.get("classification")
    bases = classification.get("product_basis") if isinstance(classification, dict) else None
    if not isinstance(bases, list):
        return []
    flags = []
    for basis in bases:
        if not isinstance(basis, dict):
            continue
        excerpt = basis.get("mechanical_excerpt")
        if isinstance(excerpt, dict) and isinstance(excerpt.get("not_semantic_analysis"), bool):
            flags.append(excerpt["not_semantic_analysis"])
    return flags


def validate_rows(rows: list[dict]) -> None:
    if len({r["bundle"] for r in rows}) != 14:
        raise ValueError("対象bundle数が14ではありません")
    ids = [r["record"]["asset_id"] for r in rows]
    occurrences = Counter(ids)
    if len(rows) != 768 or len(occurrences) != 726:
        raise ValueError(f"分母変更: rows={len(rows)} unique={len(occurrences)} (expected 768/726)")
    if sum(n - 1 for n in occurrences.values()) != 42:
        raise ValueError("重複出現数が42ではありません")
    if sum(category(r["record"]) == "direct_product_basis" for r in rows) != 387:
        raise ValueError("既存category形式2種から再集計したdirect_product_basis出現数が387ではありません")

    by_bundle = defaultdict(list)
    for row in rows:
        by_bundle[row["bundle"]].append(row["record"])
    research = by_bundle["legacy-research-assets-product-classification-0142"]
    direct_0142 = [r for r in research if category(r) == "direct_product_basis"]
    marked_0142 = [r for r in research if True in mechanical_flags(r)]
    if len(research) != 57 or len(direct_0142) != 35 or len(marked_0142) != 52:
        raise ValueError("SCF-B-0142の件数またはmechanical markerが変化しました")
    if sum(category(r) == "direct_product_basis" and True in mechanical_flags(r)
           for r in research) != 35:
        raise ValueError("SCF-B-0142 direct 35件のmechanical markerが一致しません")

    config = by_bundle["legacy-config-product-classification-0141"]
    direct_0141 = [r for r in config if category(r) == "direct_product_basis"]
    span_status = "manual_semantic_span_pinned_pending_human_review"
    if len(config) != 41 or len(direct_0141) != 26:
        raise ValueError("SCF-B-0141の件数またはdirect候補数が変化しました")
    if any(r.get("classification", {}).get("semantic_status") != span_status for r in config):
        raise ValueError("SCF-B-0141のselected-span statusが変化しました")


def project(rows: list[dict]) -> dict:
    validate_rows(rows)
    by_bundle = defaultdict(list)
    by_id = defaultdict(list)
    for row in rows:
        by_bundle[row["bundle"]].append(row)
        by_id[row["record"]["asset_id"]].append(row)

    duplicate_by_bundle = Counter()
    seen_ids = set()
    for bundle, _ in BUNDLES:
        for row in by_bundle[bundle]:
            asset_id = row["record"]["asset_id"]
            if asset_id in seen_ids:
                duplicate_by_bundle[bundle] += 1
            else:
                seen_ids.add(asset_id)

    bundle_summaries = []
    for bundle, binding_id in BUNDLES:
        occurrences = by_bundle[bundle]
        categories = Counter(category(r["record"]) or "<missing>" for r in occurrences)
        semantic_status = Counter(
            r["record"].get("classification", {}).get("semantic_status")
            for r in occurrences
            if isinstance(r["record"].get("classification"), dict)
            and isinstance(r["record"]["classification"].get("semantic_status"), str)
        )
        formal = Counter(
            str(r["record"].get("formal_asset_classification_updated", "<missing>"))
            for r in occurrences
        )
        source_exact = sum(isinstance(r["record"].get("source_exact"), dict) for r in occurrences)
        boundary_material = sum(isinstance(r["record"].get("boundary_evidence"), dict)
                               for r in occurrences)
        mechanical_true = sum(True in mechanical_flags(r["record"]) for r in occurrences)
        bundle_summaries.append({
            "bundle": bundle,
            "binding_id": binding_id,
            "record_rows": len(occurrences),
            "unique_asset_ids": len({r["record"]["asset_id"] for r in occurrences}),
            "extra_duplicate_occurrences_after_first_bundle": duplicate_by_bundle[bundle],
            "source_exact_records": source_exact,
            "boundary_comparison_material_records": boundary_material,
            "declared_category_occurrences": dict(sorted(categories.items())),
            "semantic_status_occurrences": dict(sorted(semantic_status.items())),
            "mechanical_not_semantic_analysis_true_occurrences": mechanical_true,
            "formal_asset_classification_updated_occurrences": dict(sorted(formal.items())),
        })

    direct_occurrences = sum(
        category(row["record"]) == "direct_product_basis" for row in rows
    )
    formal_by_id = Counter()
    for refs in by_id.values():
        # Count a positive only when an existing record explicitly says true.
        # Missing fields remain visible; duplicate records are not selected as winners.
        values = {r["record"].get("formal_asset_classification_updated", "<missing>")
                  for r in refs}
        if True in values:
            formal_by_id["true"] += 1
        elif values == {False}:
            formal_by_id["false"] += 1
        else:
            formal_by_id["missing_or_mixed"] += 1

    return {
        "schema": "helix-legacy-evidence-depth-projection-v1",
        "base_revision": BASE,
        "scope": "14 existing classification-research.jsonl bundles only; research projection",
        "denominator": {
            "record_rows": len(rows),
            "unique_asset_ids": len(by_id),
            "duplicate_asset_ids": sum(count > 1 for count in Counter(
                row["record"]["asset_id"] for row in rows
            ).values()),
            "extra_duplicate_occurrences": sum(len(v) - 1 for v in by_id.values()),
            "legacy_asset_ledger_total": 4020,
            "unique_id_coverage_percent": round(len(by_id) / 4020 * 100, 2),
        },
        "depth_projection": {
            "source_snapshot": {
                "record_rows_with_source_exact_object": sum(
                    isinstance(r["record"].get("source_exact"), dict) for r in rows
                ),
                "meaning": "source receipt presence only; not full-source semantic review",
            },
            "mechanical_profile_excerpt": {
                "0142_records_marked_not_semantic_analysis": sum(
                    True in mechanical_flags(r["record"])
                    for r in by_bundle["legacy-research-assets-product-classification-0142"]
                ),
                "0142_direct_product_basis_occurrences": sum(
                    category(r["record"]) == "direct_product_basis"
                    for r in by_bundle["legacy-research-assets-product-classification-0142"]
                ),
                "0142_direct_occurrences_with_mechanical_marker": sum(
                    category(r["record"]) == "direct_product_basis"
                    and True in mechanical_flags(r["record"])
                    for r in by_bundle["legacy-research-assets-product-classification-0142"]
                ),
                "meaning": "profile/path-group first pass; marker explicitly denies semantic analysis",
            },
            "selected_span_candidate": {
                "0141_records_with_pinned_semantic_span_status": sum(
                    r["record"].get("classification", {}).get("semantic_status")
                    == "manual_semantic_span_pinned_pending_human_review"
                    for r in by_bundle["legacy-config-product-classification-0141"]
                ),
                "0141_direct_product_basis_occurrences": sum(
                    category(r["record"]) == "direct_product_basis"
                    for r in by_bundle["legacy-config-product-classification-0141"]
                ),
                "meaning": "selected source spans and candidate mapping; status still pending human review",
            },
            "responsibility_comparison_material": {
                "0141_records_with_pinned_span_and_product_basis": sum(
                    r["record"].get("classification", {}).get("semantic_status")
                    == "manual_semantic_span_pinned_pending_human_review"
                    and bool(r["record"].get("classification", {}).get("product_basis"))
                    for r in by_bundle["legacy-config-product-classification-0141"]
                ),
                "0142_records_with_boundary_evidence_object": sum(
                    isinstance(r["record"].get("boundary_evidence"), dict)
                    for r in by_bundle["legacy-research-assets-product-classification-0142"]
                ),
                "meaning": "comparison material is present in records; its presence alone does not establish semantic review, owner, or adoption",
            },
            "declared_direct_product_basis_record_occurrences_across_bundles": direct_occurrences,
            "formal_classification_update": {
                "unique_ids_explicit_true": formal_by_id["true"],
                "unique_ids_explicit_false": formal_by_id["false"],
                "unique_ids_missing_or_mixed": formal_by_id["missing_or_mixed"],
                "meaning": "recorded value only; not an approval/adoption receipt or formal adoption rate",
            },
        },
        "bundles": bundle_summaries,
        "duplicate_accounting": {
            "asset_ids_with_multiple_bundle_occurrences": sum(n > 1 for n in Counter(
                r["record"]["asset_id"] for r in rows
            ).values()),
            "extra_duplicate_occurrences": sum(len(v) - 1 for v in by_id.values()),
            "extra_duplicate_occurrences_by_bundle_after_first_bundle": dict(
                (bundle, duplicate_by_bundle[bundle]) for bundle, _ in BUNDLES
                if duplicate_by_bundle[bundle]
            ),
            "occurrence_rows_retained_in_source_bundles": len(rows),
            "reconstruction": "project.py recomputes overlap from all 14 pinned inputs; duplicate IDs are omitted from this compact projection",
        },
        "authority_boundary": [
            "A category label is not normalized across bundles into a semantic-review result.",
            "The 0142 mechanical marker never counts as semantic review or formal product ownership.",
            "Selected-span status pending human review is not approval or formal adoption.",
            "This projection does not change disposition, product target, phase, requirement status, implementation, or authority.",
        ],
    }


def encode(value: dict) -> bytes:
    return (json.dumps(value, ensure_ascii=False, indent=2, sort_keys=False) + "\n").encode()


def main() -> int:
    parser = argparse.ArgumentParser()
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument("--write", action="store_true", help="projection.jsonを再生成")
    mode.add_argument("--check", action="store_true", help="保存projectionとの一致を確認")
    mode.add_argument("--selfcheck", action="store_true", help="機械／semantic境界の否定例を確認")
    args = parser.parse_args()
    try:
        rows = load_rows()
        result = project(rows)
        payload = encode(result)
        if args.write:
            OUT.write_bytes(payload)
            print(f"wrote {OUT.relative_to(ROOT)}: 768 rows / 726 unique IDs")
        elif args.check:
            if not OUT.exists() or OUT.read_bytes() != payload:
                raise ValueError("projection.jsonが再生成結果と一致しません")
            print("projection: pass (768 rows / 726 unique IDs; 42 duplicate occurrences)")
        else:
            changed = copy.deepcopy(rows)
            target = next(
                r["record"] for r in changed
                if r["bundle"] == "legacy-research-assets-product-classification-0142"
                and category(r["record"]) == "direct_product_basis"
            )
            target["classification"]["product_basis"][0]["mechanical_excerpt"]["not_semantic_analysis"] = False
            try:
                project(changed)
            except (KeyError, TypeError, ValueError):
                print("negative check: pass (0142 mechanical marker mutation rejected)")
            else:
                raise ValueError("0142の機械分類marker改変を拒否できませんでした")
    except (OSError, json.JSONDecodeError, KeyError, TypeError, ValueError) as exc:
        print(f"evidence-depth projection: FAIL: {exc}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

#!/usr/bin/env python3
"""SCF-B-0109 fail-closed validator。

validatorも固定BASEのGit object bytesだけを参照し、旧世代の実行経路は呼び出さない。
"""
from __future__ import annotations

import argparse
import importlib.util
import json
import subprocess
import sys
from pathlib import Path
from typing import Any


HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
spec = importlib.util.spec_from_file_location("scf_b_0109_build", HERE / "build.py")
assert spec and spec.loader
build = importlib.util.module_from_spec(spec)
sys.modules[spec.name] = build
spec.loader.exec_module(build)


class Validator:
    def __init__(self, root: Path = ROOT, bundle: Path = HERE):
        self.root = root.resolve()
        self.bundle = bundle.resolve()
        self.errors: list[str] = []

    def error(self, code: str, message: str) -> None:
        self.errors.append(f"{code}: {message}")

    def load(self) -> tuple[dict[str, Any], list[dict[str, Any]]] | None:
        try:
            inventory = json.loads((self.bundle / "inventory.json").read_text(encoding="utf-8"))
            evidence = [json.loads(line) for line in (self.bundle / "evidence.jsonl").read_text(encoding="utf-8").splitlines() if line.strip()]
            return inventory, evidence
        except (OSError, json.JSONDecodeError) as exc:
            self.error("E_BUNDLE", str(exc))
            return None

    def validate(self) -> int:
        loaded = self.load()
        if loaded is None:
            return self.finish()
        inventory, evidence = loaded
        try:
            expected_inventory, expected_evidence = build.build_bundle()
        except Exception as exc:  # fixed BASE input failure is itself a validation failure
            self.error("E_INPUT", repr(exc))
            return self.finish()

        if inventory.get("schema") != build.SCHEMA or inventory.get("binding_id") != build.BINDING_ID:
            self.error("E_INVENTORY_DECLARATION", "schema/bindingがSCF-B-0109と一致しない")
        base = inventory.get("base", {})
        if base.get("repository") != "HELIX-HARNESS" or base.get("commit") != build.BASE or base.get("branch") != "main":
            self.error("E_BASE_COMMIT", "固定BASEのrepository/commit/branch宣言が一致しない")
        required_ancestor = base.get("required_ancestor", build.BASE)
        if subprocess.run(
            ["git", "merge-base", "--is-ancestor", required_ancestor, "HEAD"],
            cwd=self.root, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
        ).returncode != 0:
            self.error("E_BASE_NOT_ANCESTOR", f"required ancestorがHEADの祖先ではない: {required_ancestor}")
        if inventory.get("status") != "research_only_scaffold_candidate" or inventory.get("authority_effect") != "none" or inventory.get("new_build") is not False:
            self.error("E_AUTHORITY_BOUNDARY", "research-only/new_build/authority boundaryが壊れている")

        expected_units = expected_inventory["unit_ids"]
        actual_units = inventory.get("unit_ids")
        if actual_units != expected_units or [row.get("unit_candidate_id") for row in evidence] != expected_units:
            self.error("E_UNIT_SET", "FR01〜20の29 unitの順序・分母・重複が期待値と異なる")
        if len(evidence) != 29 or len({row.get("unit_candidate_id") for row in evidence}) != 29:
            self.error("E_UNIT_SET", "unitが欠落または重複している")
        if any("HIL-BR-" in str(row.get("unit_candidate_id")) for row in evidence):
            self.error("E_UNIT_SET", "BR unitがFR bundleへ混入している")

        self.check_input_snapshot(inventory, expected_inventory)
        self.check_inventory(inventory, expected_inventory)

        expected_by_unit = {row["unit_candidate_id"]: row for row in expected_evidence}
        actual_by_unit = {row.get("unit_candidate_id"): row for row in evidence}
        all_actual_edges: dict[str, str] = {}
        all_expected_edges: dict[str, str] = {
            edge["review_id"]: row["unit_candidate_id"]
            for row in expected_evidence
            for edge in row["semantic_review_edges"]
        }
        for actual in evidence:
            unit = actual.get("unit_candidate_id")
            expected = expected_by_unit.get(unit)
            if expected is None:
                continue
            self.check_unit(actual, expected)
            for edge in actual.get("semantic_review_edges", []):
                review_id = edge.get("review_id")
                if review_id in all_actual_edges:
                    self.error("E_REVIEW_EDGE_DUP", f"review edge重複: {review_id}")
                all_actual_edges[review_id] = unit
        if set(all_actual_edges) != set(all_expected_edges):
            self.error("E_REVIEW_EDGE_SET", f"Wave edge集合が不一致: actual={len(all_actual_edges)} expected={len(all_expected_edges)}")
        if len(all_actual_edges) != 87:
            self.error("E_REVIEW_EDGE_SET", f"Wave edge分母が{len(all_actual_edges)}（期待87）")

        return self.finish()

    def check_input_snapshot(self, actual: dict[str, Any], expected: dict[str, Any]) -> None:
        expected_snapshot = expected.get("input_snapshot", [])
        if actual.get("input_snapshot") != expected_snapshot:
            self.error("E_INPUT_DIGEST", "固定BASE入力snapshotのpath/digest/orderが一致しない")
        for item in actual.get("input_snapshot", []):
            path = item.get("path")
            if not isinstance(path, str):
                self.error("E_INPUT_DIGEST", "入力pathが文字列ではない")
                continue
            try:
                actual_digest = build.base_digest(path)
            except Exception:
                self.error("E_INPUT_DIGEST", f"BASE入力pathを読めない: {path}")
                continue
            if item.get("sha256") != actual_digest:
                self.error("E_INPUT_DIGEST", f"BASE入力digest不一致: {path}")

    def check_inventory(self, actual: dict[str, Any], expected: dict[str, Any]) -> None:
        if set(actual) != set(expected):
            self.error("E_INVENTORY_DECLARATION", "inventoryトップレベルkey集合が再計算値と一致しない")
        for key in ("base", "scope", "counts", "unit_ids", "unit_declarations", "negative_case_codes"):
            if actual.get(key) != expected.get(key):
                self.error("E_INVENTORY_DECLARATION", f"inventory.{key}が再計算値と一致しない")
        if actual.get("partition_contract") != expected.get("partition_contract"):
            self.error("E_INVENTORY_DECLARATION", "partition contractが一致しない")
        if actual.get("prohibited_inference") != expected.get("prohibited_inference"):
            self.error("E_AUTHORITY_BOUNDARY", "prohibited inferenceが一致しない")

    def check_unit(self, actual: dict[str, Any], expected: dict[str, Any]) -> None:
        unit = expected["unit_candidate_id"]
        if set(actual) != set(expected):
            self.error("E_INVENTORY_DECLARATION", f"{unit} evidenceトップレベルkey集合が再計算値と一致しない")
        if actual.get("schema") != expected.get("schema"):
            self.error("E_INVENTORY_DECLARATION", f"{unit} schema不一致")
        if actual.get("source_requirement") != expected.get("source_requirement"):
            self.error("E_SOURCE_BINDING", f"{unit} source/crosswalk/decomposition snapshot不一致")
        if actual.get("source_anchor") != expected.get("source_anchor"):
            self.error("E_SOURCE_ANCHOR", f"{unit} IR原文anchor/digest不一致")

        actual_edges = actual.get("semantic_review_edges", [])
        expected_edges = expected.get("semantic_review_edges", [])
        if [edge.get("review_id") for edge in actual_edges] != [edge.get("review_id") for edge in expected_edges]:
            self.error("E_REVIEW_EDGE_SET", f"{unit} edge順序・集合不一致")
        for actual_edge, expected_edge in zip(actual_edges, expected_edges):
            if actual_edge != expected_edge:
                self.error("E_REVIEW_EDGE_SET", f"{unit} review edge bytes不一致: {actual_edge.get('review_id')}")

        if actual.get("asset_set") != expected.get("asset_set"):
            self.error("E_ASSET_SET", f"{unit} asset set/edge membership不一致")
        actual_old = actual.get("old_asset_evidence", {}).get("assets", [])
        expected_old = expected.get("old_asset_evidence", {}).get("assets", [])
        if [row.get("asset_id") for row in actual_old] != [row.get("asset_id") for row in expected_old]:
            self.error("E_ASSET_SET", f"{unit} old asset集合不一致")
        for actual_asset, expected_asset in zip(actual_old, expected_old):
            if actual_asset.get("source") != expected_asset.get("source"):
                self.error("E_OLD_ASSET_SOURCE", f"{unit}/{actual_asset.get('asset_id')} source/blob不一致")
            if actual_asset.get("history") != expected_asset.get("history"):
                self.error("E_OLD_ASSET_HISTORY", f"{unit}/{actual_asset.get('asset_id')} history/classification不一致")
            if actual_asset.get("failure") != expected_asset.get("failure") or actual_asset.get("consumer") != expected_asset.get("consumer"):
                self.error("E_OLD_ASSET_HISTORY", f"{unit}/{actual_asset.get('asset_id')} failure/consumer history不一致")
            if actual_asset != expected_asset and actual_asset.get("source") == expected_asset.get("source") and actual_asset.get("history") == expected_asset.get("history"):
                self.error("E_OLD_ASSET_HISTORY", f"{unit}/{actual_asset.get('asset_id')} asset record不一致")
        if actual.get("old_asset_evidence", {}).get("static_only") is not True or actual.get("old_asset_evidence", {}).get("not_implementation_proof") is not True:
            self.error("E_AUTHORITY_BOUNDARY", f"{unit} old asset boundaryが壊れている")
        if actual.get("old_asset_evidence") != expected.get("old_asset_evidence"):
            self.error("E_OLD_ASSET_HISTORY", f"{unit} old_asset_evidence全体が再計算値と一致しない")

        if actual.get("representative_assets") != expected.get("representative_assets"):
            self.error("E_REPRESENTATIVE_ASSET", f"{unit} representative asset record/subset不一致")
        for key, code in (
            ("implementation_evidence", "E_IMPLEMENTATION_EVIDENCE"),
            ("degradation_evidence", "E_DEGRADATION_EVIDENCE"),
            ("failure_evidence", "E_FAILURE_EVIDENCE"),
            ("consumer_evidence", "E_CONSUMER_EVIDENCE"),
        ):
            if actual.get(key) != expected.get(key):
                self.error(code, f"{unit} {key} partitionが再計算値と一致しない")

        current = actual.get("current_implementation_evidence")
        if current != expected.get("current_implementation_evidence") or current.get("status") != "unknown" if isinstance(current, dict) else True:
            self.error("E_CURRENT_STATUS", f"{unit} current implementation/operation/acceptanceがunknownではない")
        unimplemented = actual.get("unimplemented_assessment")
        if unimplemented != expected.get("unimplemented_assessment") or unimplemented.get("explicit_non_implementation_claim") is not False if isinstance(unimplemented, dict) else True:
            self.error("E_UNIMPLEMENTED_CLAIM", f"{unit} 未実装断定が混入している")
        if actual.get("authority_boundary") != expected.get("authority_boundary"):
            self.error("E_AUTHORITY_BOUNDARY", f"{unit} formal authority boundaryが壊れている")
        if actual.get("current_context") != expected.get("current_context"):
            self.error("E_CURRENT_STATUS", f"{unit} current context/refのstatusまたはimplementation_claimが壊れている")
        if actual.get("unresolved") != expected.get("unresolved"):
            self.error("E_AUTHORITY_BOUNDARY", f"{unit} unresolved保留理由が一致しない")

    def finish(self) -> int:
        if self.errors:
            for error in self.errors:
                print(error, file=sys.stderr)
            return 1
        print("SCF-B-0109 validate PASS")
        return 0


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", type=Path, default=ROOT)
    parser.add_argument("--bundle", type=Path, default=HERE)
    args = parser.parse_args()
    return Validator(args.root, args.bundle).validate()


if __name__ == "__main__":
    raise SystemExit(main())

#!/usr/bin/env python3
"""SCF-B-0104のfail-closed静的validator。旧世代の実行は行わない。"""
from __future__ import annotations

import argparse
import hashlib
import json
import subprocess
import sys
from pathlib import Path


BASE = "36784d25aa4cc53d89c28c2ff81b4009db234605"
UNITS = [
    "IRUNIT-HIL-BR-06-HELIX-HARNESS", "IRUNIT-HIL-BR-06-HELIX-OS",
    "IRUNIT-HIL-BR-07-HELIX-HARNESS", "IRUNIT-HIL-BR-07-HELIX-OS",
    "IRUNIT-HIL-BR-08-HELIX-HARNESS", "IRCONN-HIL-BR-09-HARNESS-OS",
    "IRUNIT-HIL-BR-10-HELIX-OS", "IRUNIT-HIL-BR-11-HELIX-OS",
    "IRUNIT-HIL-BR-12-HELIX-HARNESS", "IRUNIT-HIL-BR-12-HELIX-OS",
    "IRUNIT-HIL-BR-13-HELIX-HARNESS", "IRUNIT-HIL-BR-14-HELIX-HARNESS",
    "IRUNIT-HIL-BR-14-HELIX-OS", "IRUNIT-HIL-BR-15-HELIX-OS",
    "IRUNIT-HIL-BR-16-HELIX-HARNESS", "IRUNIT-HIL-BR-16-HELIX-OS",
    "IRUNIT-HIL-BR-17-HELIX-HARNESS", "IRUNIT-HIL-BR-17-HELIX-OS",
    "IRUNIT-HIL-BR-18-HELIX-OS", "IRUNIT-HIL-BR-19-HELIX-HARNESS",
    "IRUNIT-HIL-BR-19-HELIX-OS", "IRUNIT-HIL-BR-20-HELIX-HARNESS",
    "IRUNIT-HIL-BR-20-HELIX-OS",
]
ROW_KEYS = [
    "review_id", "schema_revision", "batch_id", "unit_candidate_id", "source_requirement_id",
    "source_statement_semantic_digest", "source_text_spans", "artifact_evidence_kind", "role_kind",
    "asset_id", "source_path", "source_sha256", "semantic_link_status", "semantic_relation",
    "legacy_asset_evidence_state", "legacy_execution_status", "legacy_requirement_implementation_contribution",
    "catalog_legacy_implementation_status", "product_scope", "phase_candidates", "candidate_phase_targets",
    "candidate_product_targets", "covered_requirement_atom_ids", "coverage", "counterevidence",
    "observed_consumer_refs", "consumer_closure_status", "consumer_closure_evidence", "evidence_refs",
    "unresolved", "current_requirement_implementation_status", "new_build_allowed", "authority_effect",
]
ANCHOR_POLICY = {
    "wave_1_17": "raw_span_bytes_including_final_newline",
    "wave_18_50": "utf8_lines_strip_crlf_join_lf_without_terminal_newline",
    "provenance": "legacy semantic review evidence_refs excerpt_sha256 static contract; policy is selected by edge wave",
}
EXPECTED_EVIDENCE_PARTITION = {
    "source_statement": "crosswalk source_requirement snapshot",
    "candidate": "representative_legacy_assets and catalog status; search candidates only",
    "old_implementation": "implementation_source review edges; static, unexecuted, unit status unknown",
    "old_failure": "observed receipt only; none found, status unknown",
    "old_degradation": "phase transition assessment only; unit status unknown",
    "old_consumer": "observed refs and ledger refs; closure pending",
    "current_implementation": "direct implementation evidence only; none found, status unknown",
    "current_acceptance": "direct acceptance receipt only; none found, status unknown",
}
EXPECTED_PROHIBITED_INFERENCE = [
    "代表asset・catalog implementation_source・design・requirementはunitの実装成立を示さない",
    "phase transition assessment・coverage.failure・unreviewed ledger statusは実行failureのreceiptではない",
    "current L2/L11/scaffoldの存在・validator合格から実装・受入・運用・未実装を生成しない",
    "unknown／pendingを未実装・縮退・完了へ変換しない",
]
EXPECTED_INVENTORY_UNRESOLVED = [
    "legacy_unit_implementation_unknown", "legacy_failure_observation_unknown",
    "legacy_degradation_unit_status_unknown", "consumer_closure_pending",
    "current_implementation_evidence_missing", "current_acceptance_evidence_missing",
    "product_boundary_human_decision_pending", "successor_assignment_unassigned",
]


def load_jsonl(path: Path) -> list[dict]:
    return [json.loads(line) for line in path.read_text(encoding="utf-8").splitlines() if line.strip()]


def digest(data: bytes) -> str:
    return "sha256:" + hashlib.sha256(data).hexdigest()


def file_digest(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def base_bytes(root: Path, path: str) -> bytes:
    return subprocess.check_output(["git", "show", f"{BASE}:{path}"], cwd=root)


def base_jsonl(root: Path, path: Path) -> list[dict]:
    relative = str(path.relative_to(root))
    return [json.loads(line) for line in base_bytes(root, relative).decode("utf-8").splitlines() if line.strip()]


def base_digest(root: Path, path: str) -> str:
    return hashlib.sha256(base_bytes(root, path)).hexdigest()


def wave_path(root: Path, wave: int) -> Path:
    docs = root / f"docs/governance/legacy-requirement-direct-semantic-review-wave{wave}.jsonl"
    scaffold = root / f"scaffold/legacy-semantic-review-wave{wave}/legacy-requirement-direct-semantic-review-wave{wave}.jsonl"
    try:
        subprocess.check_output(["git", "cat-file", "-e", f"{BASE}:{docs.relative_to(root)}"], cwd=root, stderr=subprocess.STDOUT)
        return docs
    except subprocess.CalledProcessError:
        return scaffold


def expected_review(row: dict, wave: int, path: Path, root: Path) -> dict:
    out = {key: row[key] for key in ROW_KEYS if key in row}
    out["wave"] = wave
    out["source_review_file"] = str(path.relative_to(root))
    return out


class Validator:
    def __init__(self, root: Path, bundle: Path):
        self.root = root.resolve()
        self.bundle = bundle.resolve()
        self.errors: list[str] = []
        self.crosswalk_path = self.root / "docs/governance/legacy-requirement-implementation-crosswalk-bootstrap.jsonl"
        self.ledger_path = self.root / "docs/governance/legacy-asset-disposition.jsonl"
        self.decisions_path = self.root / "docs/governance/legacy-asset-decisions.jsonl"
        self.read_after_path = self.root / "docs/governance/legacy-asset-copy-read-after.jsonl"

    def error(self, code: str, message: str) -> None:
        self.errors.append(f"{code}: {message}")

    def load(self) -> tuple[dict, list[dict]] | None:
        try:
            inventory = json.loads((self.bundle / "inventory.json").read_text(encoding="utf-8"))
            evidence = load_jsonl(self.bundle / "evidence.jsonl")
            return inventory, evidence
        except (OSError, json.JSONDecodeError) as exc:
            self.error("E_BUNDLE", str(exc))
            return None

    def validate(self) -> int:
        loaded = self.load()
        if loaded is None:
            return 1
        inventory, evidence = loaded
        if inventory.get("schema") != "br-implementation-evidence-0104/v1":
            self.error("E_INVENTORY_SCHEMA", "inventory schema不一致")
        if inventory.get("base_commit") != BASE:
            self.error("E_BASE", "base_commitが固定HEADと一致しない")
        elif subprocess.run(
            ["git", "merge-base", "--is-ancestor", BASE, "HEAD"],
            cwd=self.root, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
        ).returncode != 0:
            self.error("E_BASE_ANCESTRY", "固定BASEが検証対象HEADの祖先ではない")
        if inventory.get("status") != "research_only_scaffold_candidate" or inventory.get("authority_effect") != "none":
            self.error("E_BOUNDARY", "research-only/authority boundaryが壊れている")
        if [x.get("unit_candidate_id") for x in evidence] != UNITS:
            self.error("E_UNIT_SET", "23 unitの順序・分母・重複が期待値と異なる")
        if len(evidence) != len(UNITS) or len({x.get("unit_candidate_id") for x in evidence}) != len(UNITS):
            self.error("E_UNIT_SET", "unitが欠落または重複している")

        try:
            crosswalk = [
                row for row in base_jsonl(self.root, self.crosswalk_path)
                if row.get("source_requirement_id", "").startswith("HIL-BR-")
                and 6 <= int(row["source_requirement_id"].split("-")[-1]) <= 20
            ]
            ledger_rows = base_jsonl(self.root, self.ledger_path)
            ledger = {x["asset_id"]: x for x in ledger_rows}
            decisions = base_jsonl(self.root, self.decisions_path)
            read_after = base_jsonl(self.root, self.read_after_path)
        except (OSError, json.JSONDecodeError, KeyError) as exc:
            self.error("E_INPUT", str(exc))
            return self.finish()
        if [x.get("unit_candidate_id") for x in crosswalk] != UNITS:
            self.error("E_CROSSWALK_SET", "crosswalk HIL-BR-06〜20 unitが期待値と異なる")

        all_scan_rows = 0
        expected_edges: dict[str, dict] = {}
        expected_by_unit: dict[str, list[dict]] = {unit: [] for unit in UNITS}
        for wave in range(1, 51):
            path = wave_path(self.root, wave)
            if not path.is_file():
                self.error("E_WAVE_SCAN", f"Wave{wave}のreview JSONLが見つからない")
                continue
            rows = base_jsonl(self.root, path)
            all_scan_rows += len(rows)
            for row in rows:
                if row.get("unit_candidate_id") in UNITS:
                    edge = expected_review(row, wave, path, self.root)
                    expected_edges[row["review_id"]] = edge
                    expected_by_unit[row["unit_candidate_id"]].append(edge)

        actual_edges: dict[str, dict] = {}
        for unit in evidence:
            for edge in unit.get("semantic_review_edges", []):
                rid = edge.get("review_id")
                if rid in actual_edges:
                    self.error("E_REVIEW_EDGE_DUP", f"review edge重複: {rid}")
                actual_edges[rid] = edge
        if set(actual_edges) != set(expected_edges):
            self.error("E_REVIEW_EDGE_SET", f"review edge集合が不一致: actual={len(actual_edges)} expected={len(expected_edges)}")
        if len(actual_edges) != 68:
            self.error("E_REVIEW_EDGE_COUNT", f"review edge分母が{len(actual_edges)}（期待68）")

        if inventory.get("scope", {}).get("semantic_review_scan_row_count") != all_scan_rows:
            self.error("E_SCAN_COUNT", "Wave1-50 scan row countが一致しない")
        listed_scan = inventory.get("scope", {}).get("semantic_review_scan_files")
        expected_scan = [str(wave_path(self.root, wave).relative_to(self.root)) for wave in range(1, 51)]
        if listed_scan != expected_scan:
            self.error("E_SCAN_FILES", "Wave1-50 scan file一覧が一致しない")
        self.check_input_digests(inventory, evidence)
        if inventory.get("anchor_digest_policy") != ANCHOR_POLICY:
            self.error("E_OLD_ANCHOR_POLICY", "anchor digest normalization provenanceが不一致")

        unit_by_id = {x.get("unit_candidate_id"): x for x in evidence}
        for source in crosswalk:
            unit = source["unit_candidate_id"]
            current = unit_by_id.get(unit)
            if current is None:
                continue
            source_snapshot = current.get("source_requirement", {})
            for key in (
                "source_requirement_id", "source_revision", "source_statement_semantic_digest", "source_text_spans",
                "product_scope", "direct_phase_candidates", "phase_classification_status", "phase_rationale",
                "responsibility_summary", "successor_assignment_status", "unimplemented_assessment_status",
            ):
                if source_snapshot.get(key) != source.get(key):
                    self.error("E_SOURCE_BINDING", f"{unit} source field不一致: {key}")
            if source_snapshot.get("representative_legacy_assets") != source.get("representative_legacy_assets", []):
                self.error("E_CANDIDATE_BINDING", f"{unit} representative candidate record不一致")
            actual_unit_edges = current.get("semantic_review_edges", [])
            expected_unit_edges = expected_by_unit[unit]
            actual_edge_ids = [x.get("review_id") for x in actual_unit_edges]
            expected_edge_ids = [x.get("review_id") for x in expected_unit_edges]
            if sorted(actual_edge_ids) != sorted(expected_edge_ids):
                self.error("E_REVIEW_EDGE_SET", f"{unit} unit edge multiset／件数が不一致")
            for edge in actual_unit_edges:
                rid = edge.get("review_id")
                expected = expected_edges.get(rid)
                if expected is None:
                    continue
                if edge != expected:
                    self.error("E_REVIEW_EDGE_BYTES", f"{rid} semantic review edge snapshot不一致")
                self.check_review_edge(edge, ledger)
            self.check_unit(current, source, ledger, decisions, read_after, expected_unit_edges)

        expected_assets = {x["asset_id"] for x in expected_edges.values()}
        actual_assets = {
            asset.get("asset_id")
            for row in evidence
            for asset in row.get("old_asset_evidence", {}).get("assets", [])
        }
        if actual_assets != expected_assets:
            self.error("E_ASSET_SET", f"old asset集合が不一致: actual={len(actual_assets)} expected={len(expected_assets)}")
        scope = inventory.get("scope", {})
        expected_scope = {
            "source_requirement_ids": list(dict.fromkeys(x["source_requirement_id"] for x in crosswalk)),
            "unit_ids": UNITS,
            "wave_range": "1-50",
            "review_files": [str(wave_path(self.root, wave).relative_to(self.root)) for wave in range(1, 51)],
            "semantic_review_scan_files": [str(wave_path(self.root, wave).relative_to(self.root)) for wave in range(1, 51)],
            "semantic_review_scan_row_count": all_scan_rows,
            "review_edge_count": len(expected_edges),
            "unique_asset_count": len(expected_assets),
        }
        if any(scope.get(key) != value for key, value in expected_scope.items()):
            self.error("E_INVENTORY_DECLARATION", "inventory scope declarationが導出値と不一致")
        expected_current_static_refs = sum(
            len(row.get("current_implementation_evidence", {}).get("current_refs", []))
            for row in evidence
        )
        if inventory.get("evidence_partition") != EXPECTED_EVIDENCE_PARTITION:
            self.error("E_INVENTORY_DECLARATION", "inventory evidence_partitionが固定宣言と不一致")
        if inventory.get("prohibited_inference") != EXPECTED_PROHIBITED_INFERENCE:
            self.error("E_INVENTORY_DECLARATION", "inventory prohibited_inferenceが固定宣言と不一致")
        if inventory.get("unresolved") != EXPECTED_INVENTORY_UNRESOLVED:
            self.error("E_INVENTORY_DECLARATION", "inventory unresolvedが固定宣言と不一致")
        counts = inventory.get("counts", {})
        expected_counts = {
            "units": len(UNITS), "semantic_review_edges": len(expected_edges),
            "unique_old_assets": len(expected_assets), "current_static_refs": expected_current_static_refs,
            "old_failure_receipts": 0, "old_runtime_test_ci_executions": 0,
            "current_runtime_executions": 0,
        }
        for key, value in expected_counts.items():
            if counts.get(key) != value:
                self.error("E_INVENTORY_DECLARATION", f"counts.{key}={counts.get(key)!r}（期待{value!r}）")
        return self.finish()

    def check_input_digests(self, inventory: dict, evidence: list[dict]) -> None:
        paths = {
            "docs/governance/legacy-requirement-implementation-crosswalk-bootstrap.jsonl",
            "docs/governance/legacy-asset-disposition.jsonl",
            "docs/governance/legacy-asset-decisions.jsonl",
            "docs/governance/legacy-asset-copy-read-after.jsonl",
        }
        for wave in range(1, 51):
            paths.add(str(wave_path(self.root, wave).relative_to(self.root)))
        for row in evidence:
            for ref in row.get("current_implementation_evidence", {}).get("current_refs", []):
                if isinstance(ref.get("path"), str):
                    paths.add(ref["path"])
            for edge in row.get("semantic_review_edges", []):
                for ref in edge.get("evidence_refs", []):
                    if isinstance(ref.get("archive_path"), str):
                        paths.add(ref["archive_path"])
        actual = inventory.get("input_digests")
        if inventory.get("input_digest_basis") != "git_object_bytes_at_base":
            self.error("E_INPUT_DIGEST_BASIS", "input digestが固定BASE Git object bytes基準ではない")
        if not isinstance(actual, dict) or set(actual) != paths:
            self.error("E_INPUT_DIGEST", "input digestのpath集合が不足または過剰")
            return
        for path in sorted(paths):
            try:
                expected = base_digest(self.root, path)
            except (subprocess.CalledProcessError, OSError):
                expected = None
            if expected is None or actual.get(path) != expected:
                self.error("E_INPUT_DIGEST", f"input digest不一致: {path}")

    def check_review_edge(self, edge: dict, ledger: dict) -> None:
        asset_id = edge.get("asset_id")
        old = ledger.get(asset_id)
        if old is None:
            self.error("E_OLD_LEDGER", f"ledgerにassetがない: {asset_id}")
            return
        if edge.get("source_path") != old.get("source_path") or edge.get("source_sha256") != old.get("source_sha256"):
            self.error("E_OLD_SOURCE", f"{edge.get('review_id')} source/path digestがledgerと不一致")
        archive = self.root / "archive/legacy-generation-2026-09-14/root" / old["source_path"]
        if not archive.is_file():
            self.error("E_OLD_ARCHIVE", f"旧asset archiveがない: {archive}")
        else:
            try:
                if base_digest(self.root, f"archive/legacy-generation-2026-09-14/root/{old['source_path']}") != old.get("source_sha256"):
                    self.error("E_OLD_BYTES", f"{asset_id} BASE source bytes digest不一致")
                subprocess.check_output(["git", "rev-parse", f"{BASE}:archive/legacy-generation-2026-09-14/root/{old['source_path']}"], cwd=self.root, text=True, stderr=subprocess.STDOUT).strip()
            except (subprocess.CalledProcessError, OSError) as exc:
                self.error("E_OLD_BLOB", f"{asset_id} Git blob確認失敗: {exc}")
        for ref in edge.get("evidence_refs", []):
            self.check_old_anchor(ref)

    def check_old_anchor(self, ref: dict) -> None:
        try:
            lines = base_bytes(self.root, ref["archive_path"]).splitlines(keepends=True)
        except (subprocess.CalledProcessError, OSError):
            self.error("E_OLD_ANCHOR", f"BASE anchor objectがない: {ref.get('archive_path')}")
            return
        start, end = ref.get("line_start"), ref.get("line_end")
        if not isinstance(start, int) or not isinstance(end, int) or start < 1 or end < start or end > len(lines):
            self.error("E_OLD_ANCHOR", f"line anchor範囲不正: {ref.get('archive_path')}:{start}-{end}")
            return

    def expected_anchor_resolution(self, edge: dict) -> dict:
        references = []
        for ref in edge.get("evidence_refs", []):
            actual = None
            range_status = "valid"
            try:
                data = base_bytes(self.root, ref["archive_path"])
                lines = data.splitlines(keepends=True)
                start, end = ref["line_start"], ref["line_end"]
                selected = lines[start - 1:end]
                if len(selected) != end - start + 1:
                    range_status = "invalid"
                else:
                    raw = b"".join(selected)
                    actual = digest(raw)
                    without_terminal_newline = digest(raw[:-1]) if raw.endswith(b"\n") else actual
                    normalized = "\n".join(
                        line.decode("utf-8").rstrip("\r\n") for line in selected
                    ).encode("utf-8")
                    normalized_digest = digest(normalized)
            except (KeyError, subprocess.CalledProcessError, OSError):
                range_status = "missing"
            declared = ref.get("excerpt_sha256")
            wave = edge.get("wave", 0)
            if actual is None:
                without_terminal_newline = None
                normalized_digest = None
                hash_basis = "unresolved"
            elif wave <= 17 and declared == actual:
                hash_basis = "raw_span_bytes"
            elif wave >= 18 and declared == normalized_digest:
                hash_basis = "utf8_lines_strip_crlf_join_lf_without_terminal_newline"
            else:
                hash_basis = "unresolved"
            references.append({
                "review_id": edge["review_id"],
                "evidence_ref_id": ref.get("evidence_ref_id"),
                "archive_path": ref.get("archive_path"),
                "line_start": ref.get("line_start"),
                "line_end": ref.get("line_end"),
                "declared_excerpt_sha256": declared,
                "base_excerpt_sha256": actual,
                "base_excerpt_sha256_without_terminal_newline": without_terminal_newline,
                "base_excerpt_sha256_lf_join_without_terminal_newline": normalized_digest,
                "declared_hash_basis": hash_basis,
                "base_file_sha256": (
                    hashlib.sha256(base_bytes(self.root, ref["archive_path"])).hexdigest()
                    if actual is not None else None
                ),
                "git_blob_oid_at_base": (
                    subprocess.check_output(
                        ["git", "rev-parse", f"{BASE}:{ref['archive_path']}"],
                        cwd=self.root, text=True, stderr=subprocess.STDOUT,
                    ).strip() if actual is not None else None
                ),
                "range_status": range_status,
                "digest_matches": hash_basis != "unresolved",
            })
        mismatches = [x for x in references if not x["digest_matches"]]
        return {
            "status": "resolved" if not mismatches else "unresolved_declared_digest_mismatch_at_base",
            "references": references,
            "mismatch_count": len(mismatches),
            "why_unresolved": (
                "旧semantic reviewが保持するexcerpt digestと固定BASE archive bytesが一致しないため、"
                "旧anchorの成立を断定せず、宣言値とBASE実値を分離して保留する"
                if mismatches else "全旧anchorの宣言excerpt digestが固定BASE bytesと一致する"
            ),
        }

    def check_anchor_resolution(self, current: dict) -> None:
        edges = current.get("semantic_review_edges", [])
        expected_edges = [
            {"review_id": edge["review_id"], **self.expected_anchor_resolution(edge)}
            for edge in edges
        ]
        expected = {
            "status": "unresolved_declared_digest_mismatch_at_base"
            if any(edge["mismatch_count"] for edge in expected_edges) else "resolved",
            "review_edges": expected_edges,
            "why_unresolved": (
                "旧semantic reviewのanchor宣言digestと固定BASE bytesの不一致を含むため、"
                "asset path/blobとanchor path/line/digestを独立に保持して判定保留する"
                if any(edge["mismatch_count"] for edge in expected_edges)
                else "全旧semantic review anchorが固定BASE bytesと一致する"
            ),
        }
        if current.get("legacy_anchor_resolution") != expected:
            self.error("E_OLD_ANCHOR_RESOLUTION", f"{current.get('unit_candidate_id')} anchor resolution不一致")

    def expected_phase_evidence(self, source: dict) -> list[dict]:
        keys = (
            "phase_id", "title", "status_scope", "current_status", "legacy_capability_status",
            "transition_assessment", "gap", "evidence_spans", "evidence_span_matches",
            "evidence_trace_status", "product_candidate_evidence_status", "legacy_layers_evidenced",
        )
        return [
            {key: item.get(key) for key in keys if key in item}
            for item in source.get("phase_capability_evidence", [])
        ]

    def check_phase_source_spans(self, source: dict, phase: list[dict], unit: str) -> None:
        source_spans = source.get("source_text_spans", [])
        for item in phase:
            matches = item.get("evidence_span_matches", [])
            for text in item.get("evidence_spans", []):
                if not any(text == candidate or text in candidate for candidate in source_spans):
                    self.error("E_OLD_DEGRADATION_EVIDENCE", f"{unit} phase evidence spanがsource spanに存在しない")
            for match in matches:
                text = match.get("text")
                kind = match.get("match_kind")
                if kind == "exact_source_span_element":
                    valid = text in source_spans
                elif kind == "source_span_substring":
                    valid = any(text in candidate for candidate in source_spans)
                else:
                    valid = False
                if not valid:
                    self.error("E_OLD_DEGRADATION_EVIDENCE", f"{unit} phase evidence_span_matchがsource bytes由来でない")
            expected_trace = (
                "exact_source_span_element_traced"
                if matches and all(match.get("match_kind") == "exact_source_span_element" for match in matches)
                else "source_substring_quote_traced"
            )
            if item.get("evidence_trace_status") != expected_trace:
                self.error("E_OLD_DEGRADATION_EVIDENCE", f"{unit} phase evidence_trace_statusが導出値と不一致")

    def check_unit_asset_set(self, current: dict, expected_unit_edges: list[dict]) -> None:
        expected_assets = sorted({edge.get("asset_id") for edge in expected_unit_edges})
        actual_assets = [
            asset.get("asset_id")
            for asset in current.get("old_asset_evidence", {}).get("assets", [])
        ]
        if len(actual_assets) != len(set(actual_assets)):
            self.error(
                "E_OLD_ASSET_UNIT_SET",
                f"{current.get('unit_candidate_id')} unit asset行に重複がある",
            )
        actual_assets = sorted(actual_assets)
        if actual_assets != expected_assets:
            self.error(
                "E_OLD_ASSET_UNIT_SET",
                f"{current.get('unit_candidate_id')} unit asset集合がedge由来集合と不一致",
            )

    def check_legacy_implementation(self, current: dict, expected_unit_edges: list[dict]) -> None:
        impl_edges = [
            edge for edge in expected_unit_edges
            if edge.get("artifact_evidence_kind") == "implementation_source"
        ]
        expected = {
            "evidence_presence": (
                "static_implementation_source_candidate_present"
                if impl_edges else "no_static_implementation_source_edge"
            ),
            "unit_implementation_status": "unknown",
            "execution_performed": False,
            "review_edge_ids": [edge["review_id"] for edge in impl_edges],
            "asset_ids": [edge["asset_id"] for edge in impl_edges],
            "semantic_contribution_by_edge": [
                {
                    "review_id": edge["review_id"],
                    "asset_id": edge["asset_id"],
                    "semantic_link_status": edge["semantic_link_status"],
                    "semantic_relation": edge["semantic_relation"],
                    "contribution": edge["legacy_requirement_implementation_contribution"],
                    "counterevidence": edge.get("counterevidence", []),
                }
                for edge in impl_edges
            ],
            "why_unit_status_is_unknown": [
                "implementation_sourceは旧sourceの静的候補であり、unit全atomの成立・consumer接続・受入を証明しない",
                "旧code/test/runtime/CIを実行していない",
                "旧asset ledgerのimplementation_statusはHistorical assetではunknownである",
            ],
        }
        if current.get("legacy_implementation_evidence") != expected:
            self.error("E_OLD_IMPL_EVIDENCE", f"{current.get('unit_candidate_id')} old implementation evidenceがedge由来でない")

    def check_legacy_failure_degradation(
        self,
        current: dict,
        source: dict,
        ledger: dict,
        expected_unit_edges: list[dict],
    ) -> None:
        assets = current.get("old_asset_evidence", {}).get("assets", [])
        expected_failure = {
            "observed_failure_status": "unknown",
            "observed_failure_receipts": [],
            "review_coverage_failure_values": [
                {
                    "review_id": edge["review_id"],
                    "value": (
                        edge.get("coverage", {}).get("failure", "unknown")
                        if isinstance(edge.get("coverage"), dict)
                        else edge.get("coverage", "unknown")
                    ),
                }
                for edge in expected_unit_edges
            ],
            "ledger_external_effect_statuses": [
                {
                    "asset_id": asset["asset_id"],
                    "value": ledger[asset["asset_id"]].get("external_effect_status"),
                }
                for asset in assets if asset.get("asset_id") in ledger
            ],
            "why_unknown": [
                "semantic reviewのcoverage.failureは観測failure receiptではなく、対応範囲の静的分類である",
                "Historical assetのfailure receiptは見つからず、ledgerのexternal_effect_statusも実行観測を示さない",
                "旧failure/runtime/testを実行していないため、失敗・正常・縮退を実行結果から判定できない",
            ],
        }
        if current.get("legacy_failure_evidence") != expected_failure:
            self.error("E_OLD_FAILURE_EVIDENCE", f"{current.get('unit_candidate_id')} failure evidenceがedge/ledger由来でない")
        expected_phase = self.expected_phase_evidence(source)
        expected_degradation = {
            "phase_level_evidence": expected_phase,
            "phase_transition_evidence_status": "present_in_crosswalk_assessment",
            "unit_degradation_status": "unknown",
            "why_phase_transition_is_not_unit_failure": "crosswalkのtransition_assessmentはphase capability候補の静的評価であり、unitの実装失敗receiptではない",
            "counterevidence": [item for edge in expected_unit_edges for item in edge.get("counterevidence", [])],
        }
        if current.get("legacy_degradation_evidence") != expected_degradation:
            self.error("E_OLD_DEGRADATION_EVIDENCE", f"{current.get('unit_candidate_id')} degradation evidenceがsource由来でない")
        self.check_phase_source_spans(source, expected_phase, current.get("unit_candidate_id"))

    def check_unit(
        self,
        current: dict,
        source: dict,
        ledger: dict,
        decisions: list[dict],
        read_after: list[dict],
        expected_unit_edges: list[dict],
    ) -> None:
        self.check_unit_asset_set(current, expected_unit_edges)
        self.check_legacy_implementation(current, expected_unit_edges)
        self.check_legacy_failure_degradation(current, source, ledger, expected_unit_edges)
        impl = current.get("legacy_implementation_evidence", {})
        if impl.get("unit_implementation_status") != "unknown" or impl.get("execution_performed") is not False:
            self.error("E_OLD_IMPL_STATUS", f"{current.get('unit_candidate_id')} old implementation statusがunknown/not-runではない")
        if impl.get("evidence_presence") not in ("static_implementation_source_candidate_present", "no_static_implementation_source_edge"):
            self.error("E_OLD_IMPL_STATUS", f"{current.get('unit_candidate_id')} implementation evidence分類が不正")
        failure = current.get("legacy_failure_evidence", {})
        if failure.get("observed_failure_status") != "unknown" or failure.get("observed_failure_receipts") != []:
            self.error("E_OLD_FAILURE_CLAIM", f"{current.get('unit_candidate_id')} old failureをunknown以外にした")
        degradation = current.get("legacy_degradation_evidence", {})
        if degradation.get("unit_degradation_status") != "unknown":
            self.error("E_OLD_DEGRADATION_CLAIM", f"{current.get('unit_candidate_id')} unit degradationをunknown以外にした")
        curr_impl = current.get("current_implementation_evidence", {})
        if curr_impl.get("status") != "unknown" or curr_impl.get("execution_performed") is not False:
            self.error("E_CURRENT_STATUS", f"{current.get('unit_candidate_id')} current implementationをunknown以外にした")
        if curr_impl.get("operation_status") != "unknown" or curr_impl.get("acceptance_status") != "unknown":
            self.error("E_CURRENT_STATUS", f"{current.get('unit_candidate_id')} current operation/acceptanceをunknown以外にした")
        unimplemented = current.get("unimplemented_assessment", {})
        if unimplemented.get("status") != "not_assessed" or unimplemented.get("explicit_non_implementation_claim") is not False:
            self.error("E_UNIMPLEMENTED_CLAIM", f"{current.get('unit_candidate_id')} 未実装断定を検出")
        for ref in curr_impl.get("current_refs", []):
            self.check_current_ref(ref)
        for asset in current.get("old_asset_evidence", {}).get("assets", []):
            aid = asset.get("asset_id")
            old = ledger.get(aid)
            if old is None:
                self.error("E_OLD_LEDGER", f"bundle assetがledgerにない: {aid}")
                continue
            if asset.get("source_path") != old.get("source_path") or asset.get("source_sha256") != old.get("source_sha256"):
                self.error("E_OLD_SOURCE", f"bundle asset ledger mismatch: {aid}")
            if asset.get("ledger_record") != old:
                self.error("E_OLD_LEDGER_RECORD", f"bundle ledger record mismatch: {aid}")
            try:
                expected_oid = subprocess.check_output(
                    ["git", "rev-parse", f"{BASE}:archive/legacy-generation-2026-09-14/root/{old['source_path']}"],
                    cwd=self.root, text=True, stderr=subprocess.STDOUT,
                ).strip()
                if asset.get("git_blob_oid_at_base") != expected_oid:
                    self.error("E_OLD_BLOB", f"bundle asset blob OID mismatch: {aid}")
            except (subprocess.CalledProcessError, OSError):
                self.error("E_OLD_BLOB", f"bundle asset blob OIDを確認できない: {aid}")
            if asset.get("archive_path") != f"archive/legacy-generation-2026-09-14/root/{old['source_path']}":
                self.error("E_OLD_SOURCE", f"bundle archive path mismatch: {aid}")
            expected_decisions = [x for x in decisions if x.get("asset_id") == aid]
            expected_read_after = [x for x in read_after if x.get("asset_id") == aid]
            if asset.get("decision_records") != expected_decisions:
                self.error("E_HISTORY", f"decision history mismatch: {aid}")
            if asset.get("read_after_records") != expected_read_after:
                self.error("E_HISTORY", f"read-after history mismatch: {aid}")
        self.check_anchor_resolution(current)
        self.check_consumer_evidence(current, ledger)
        self.check_counter_evidence(current)
        expected_unresolved = sorted(set(source.get("unresolved", []) + [
            "legacy_unit_implementation_unknown", "legacy_failure_observation_unknown",
            "legacy_degradation_unit_status_unknown", "consumer_closure_pending",
            "current_implementation_evidence_missing", "current_acceptance_evidence_missing",
            "product_boundary_human_decision_pending", "successor_assignment_unassigned",
            "old_execution_not_run", "current_runtime_not_executed",
        ]))
        if current.get("legacy_anchor_resolution", {}).get("status") != "resolved":
            expected_unresolved.append("legacy_anchor_digest_mismatch_at_base")
            expected_unresolved = sorted(set(expected_unresolved))
        if current.get("unresolved") != expected_unresolved:
            self.error("E_UNRESOLVED", f"{current.get('unit_candidate_id')} unresolved集合が期待値と不一致")

    def check_consumer_evidence(self, current: dict, ledger: dict) -> None:
        edges = current.get("semantic_review_edges", [])
        assets = current.get("old_asset_evidence", {}).get("assets", [])
        expected_observed = sorted({item for edge in edges for item in edge.get("observed_consumer_refs", [])})
        expected_ledger = sorted({item for asset in assets for item in ledger.get(asset.get("asset_id"), {}).get("consumer_refs", [])})
        expected_closure = [
            {"review_id": edge["review_id"], "status": edge.get("consumer_closure_status"), "evidence": edge.get("consumer_closure_evidence", [])}
            for edge in edges
        ]
        expected_present = bool(any(asset.get("decision_records") or asset.get("read_after_records") for asset in assets))
        expected = {
            "closure_status": "pending",
            "review_observed_consumer_refs": expected_observed,
            "ledger_consumer_refs": expected_ledger,
            "decision_and_read_after_records_present": expected_present,
            "consumer_closure_evidence": expected_closure,
            "why_pending": "consumer参照の列挙はconsumer chainの成立・全atom接続・現行利用を証明しない",
        }
        actual = current.get("legacy_consumer_evidence")
        if not isinstance(actual, dict) or set(actual) != set(expected):
            self.error("E_CONSUMER_REQUIRED", f"{current.get('unit_candidate_id')} consumer evidenceのkey集合が不正")
            return
        for key, value in expected.items():
            if actual.get(key) != value:
                self.error("E_CONSUMER_EVIDENCE", f"{current.get('unit_candidate_id')} consumer evidence不一致: {key}")

    def check_counter_evidence(self, current: dict) -> None:
        edges = current.get("semantic_review_edges", [])
        expected = {
            "catalog_candidate_warning": "crosswalk代表assetとasset catalog implementation_sourceは検索候補であり、unit実装成立の証拠ではない",
            "review_edge_counterevidence": [
                {"review_id": edge["review_id"], "items": edge.get("counterevidence", [])} for edge in edges
            ],
            "ledger_boundary": "ledgerのHistorical／unknown／unreviewedは、failure・implementation・consumer closureの肯定証拠ではない",
            "current_boundary": "current L2/L11/scaffold候補の存在は、current implementation・acceptance・operationの成立を証明しない",
        }
        actual = current.get("counter_evidence")
        if not isinstance(actual, dict) or set(actual) != set(expected):
            self.error("E_COUNTER_EVIDENCE", f"{current.get('unit_candidate_id')} counter evidenceのkey集合が不正")
            return
        for key, value in expected.items():
            if actual.get(key) != value or (isinstance(value, (str, list)) and not value):
                self.error("E_COUNTER_EVIDENCE", f"{current.get('unit_candidate_id')} counter evidence不一致: {key}")

    def check_current_ref(self, ref: dict) -> None:
        raw_path = ref.get("path")
        if not isinstance(raw_path, str):
            self.error("E_CURRENT_PATH", "current ref pathが文字列でない")
            return
        path = (self.root / raw_path).resolve()
        if self.root not in path.parents or not path.is_file():
            self.error("E_CURRENT_PATH", f"current ref pathがない／root外: {raw_path}")
            return
        try:
            start, end = int(ref["line_start"]), int(ref["line_end"])
            base_data = base_bytes(self.root, raw_path)
            if hashlib.sha256(base_data).hexdigest() != ref.get("file_sha256"):
                self.error("E_CURRENT_BYTES", f"current BASE file digest不一致: {raw_path}")
            lines = base_data.splitlines(keepends=True)
            selected = lines[start - 1:end]
            if len(selected) != end - start + 1 or [x.decode("utf-8").rstrip("\r\n") for x in selected] != ref.get("line_text"):
                self.error("E_CURRENT_SPAN", f"current line text不一致: {raw_path}:{start}-{end}")
            elif digest(b"".join(selected)) != ref.get("span_sha256"):
                self.error("E_CURRENT_SPAN", f"current span digest不一致: {raw_path}:{start}-{end}")
        except (KeyError, ValueError, UnicodeDecodeError):
            self.error("E_CURRENT_SPAN", f"current span形式不正: {raw_path}")

    def finish(self) -> int:
        if self.errors:
            for item in self.errors:
                print(item)
            return 1
        print("SCF-B-0104 validate: PASS (23 units, 68 review edges, 47 old assets; static-only)")
        return 0


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--bundle", type=Path, default=Path(__file__).resolve().parent)
    parser.add_argument("--repo", type=Path, default=Path(__file__).resolve().parents[2])
    args = parser.parse_args()
    validator = Validator(args.repo, args.bundle)
    try:
        validator.loaded_ledger = load_jsonl(validator.ledger_path)
    except (OSError, json.JSONDecodeError):
        validator.loaded_ledger = []
    return validator.validate()


if __name__ == "__main__":
    sys.exit(main())

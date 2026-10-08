from __future__ import annotations

import copy
import hashlib
import json
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import manifest
from common import Diagnostic, canonical_bytes


def _pin_fixture(manifest_doc, sources):
    records = []
    archive_prefix = "archive/legacy-generation-2026-09-14/root/"
    for index, asset_id in enumerate(sorted(manifest.EXPECTED_LEGACY_ASSETS), 1):
        relative = f"docs/synthetic/legacy-{index}.md"
        archive_path = archive_prefix + relative
        content = f"legacy pin {index}\nsecond line\n".encode()
        digest = hashlib.sha256(content).hexdigest()
        sources[archive_path] = content
        pin = {
            "asset_id": asset_id,
            "archive_path": archive_path,
            "full_file_sha256": digest,
            "line_start": 1,
            "line_end": 1,
            "span_sha256": hashlib.sha256(content.splitlines(keepends=True)[0]).hexdigest(),
        }
        manifest_doc["legacy_pins"].append(pin)
        records.append({"asset_id": asset_id, "source_path": relative, "source_sha256": digest})
    ledger = b"\n".join(canonical_bytes(row) for row in records) + b"\n"
    return ledger


def _baseline():
    sources = {}
    files = []
    verifier_ids = {}
    source_to_path = {ident: path for path, ids in manifest.REQUIRED_SOURCE_IDS_BY_PATH.items() for ident in ids}
    for index, (path, role, pair) in enumerate(manifest.EXPECTED_FILES, 1):
        if path == manifest.CK_L5_PATH:
            sources[path] = (
                "# Synthetic Common Kernel L5\n"
                "### 3.2 K1 API contract\nK1 API synthetic.\n"
                "### 3.3 K2: reference and key records\nK1 range end.\n"
                "### 3.4 K2 API contract\nK2 API synthetic.\n"
                "### 3.5 role-bound input alias binding\nK2 range end.\n"
            ).encode()
            definitions = [
                {"range_id": "ck-l5-k1-api", "start_heading": manifest.CK_L5_K1_LOCATOR,
                 "end_heading": "### 3.3 K2: reference and key records", "grammar": "exact_heading",
                 "id_column": None, "literal_expansions": []},
                {"range_id": "ck-l5-k2-api", "start_heading": manifest.CK_L5_K2_LOCATOR,
                 "end_heading": "### 3.5 role-bound input alias binding", "grammar": "exact_heading",
                 "id_column": None, "literal_expansions": []},
            ]
            references = []
        elif path == manifest.CK_L8_PATH:
            lines = ["# Synthetic Common Kernel L8"]
            definitions, references = [], []
            for key, start, end, range_id, source_locator, l4_id in (
                ("k1", "## 3. K1 fixtures", "## 4. K2 fixtures", manifest.CK_L8_K1_RANGE,
                 manifest.CK_L5_K1_LOCATOR, "K1-I1"),
                ("k2", "## 4. K2 fixtures", "## 5. K3–K10と未実施範囲", manifest.CK_L8_K2_RANGE,
                 manifest.CK_L5_K2_LOCATOR, "K2-I1"),
            ):
                if lines[-1] != start:
                    lines.append(start)
                fixture_ids = sorted(manifest.CK_L8_EXPECTED_IDS_BY_RANGE[range_id])
                grouped_ids = fixture_ids[:3] if key == "k1" else []
                row_ids = ([grouped_ids[0]] + fixture_ids[3:]) if grouped_ids else fixture_ids
                for fixture_id in fixture_ids:
                    if grouped_ids and fixture_id in grouped_ids[1:]:
                        continue
                    raw_literal = f"group-{key}" if grouped_ids and fixture_id == grouped_ids[0] else f"`{fixture_id}`"
                    lines.append(f"| {raw_literal} | `IV-SYNTH-03` | contract-{key}-{fixture_id} | trace | Value(accepted) |")
                lines.append(end)
                definition_expansions = ([{"literal": f"group-{key}", "ids": grouped_ids}] if grouped_ids else [])
                definitions.append({"range_id": range_id, "start_heading": start, "end_heading": end,
                                    "grammar": "table_column", "id_column": 1,
                                    "literal_expansions": definition_expansions})
                references.extend([
                    {"range_id": f"ck-l8-{key}-l9-oracles", "start_heading": start, "end_heading": end,
                     "grammar": "table_column", "id_column": 2, "literal_expansions": []},
                    {"range_id": f"ck-l8-{key}-l4-l5-contracts", "start_heading": start, "end_heading": end,
                     "grammar": "table_column", "id_column": 3,
                     "literal_expansions": [{"literal": f"contract-{key}-{fixture_id}",
                                             "ids": [source_locator, l4_id]} for fixture_id in row_ids]},
                ])
            sources[path] = ("\n".join(lines) + "\n").encode()
        elif path in manifest.REQUIRED_SOURCE_IDS_BY_PATH:
            ids = manifest.REQUIRED_SOURCE_IDS_BY_PATH[path]
            section_ids = [ident for ident in ids if ident.startswith("#")]
            simple_ids = sorted(ids - set(section_ids))
            lines = ["# Synthetic", "## Source IDs"]
            lines.extend(f"- **{ident} synthetic definition**" for ident in simple_ids)
            definitions = [{
                "range_id": "source-bullets", "start_heading": "## Source IDs",
                "end_heading": "## Section locators" if section_ids else None,
                "grammar": "bullet_id", "id_column": None, "literal_expansions": [],
            }]
            if section_ids:
                lines.append("## Section locators")
                for ident in sorted(section_ids):
                    lines.append(ident)
                    definitions.append({
                        "range_id": "section-" + str(len(definitions)),
                        "start_heading": ident, "end_heading": None,
                        "grammar": "exact_heading", "id_column": None, "literal_expansions": [],
                    })
            if role == "l6":
                # Exercise the explicit heading_id grammar used by F-LCI IDs.
                lines = ["# Synthetic", "## Functions"]
                definitions = [{
                    "range_id": "function-headings", "start_heading": "## Functions",
                    "end_heading": None, "grammar": "heading_id", "id_column": None,
                    "literal_expansions": [],
                }]
                expansions = []
                for ident in sorted(ids):
                    literal = f"### `{ident}` — synthetic function"
                    lines.append(literal)
                    expansions.append({"literal": literal, "ids": [ident]})
                definitions[0]["literal_expansions"] = expansions
            sources[path] = ("\n".join(lines) + "\n").encode()
            if path == "docs/helix-os/L4-basic-design/local-ci.md":
                sources[path] += (
                    "\n### 親ACの適用範囲\n"
                    "| 承認済みAC | local CI driverでの扱い | 理由とclaim境界 |\n"
                    "|---|---|---|\n"
                    "| `AC-OS-020-01` | `not_exercised` | synthetic reason for AC-OS-020-01 |\n"
                    "| `AC-OS-020-03` | `not_exercised` | synthetic reason for AC-OS-020-03 |\n"
                    "\n## 2. local CI契約\n"
                ).encode()
            references = []
        else:
            # Every verification document has one typed, nonempty outcome row.
            verifier_id = f"IV-SYNTH-{index:02d}"
            verifier_ids[path] = verifier_id
            sources[path] = (
                "# Synthetic\n## Oracle rows\n"
                "| Test ID | Expected result |\n|---|---|\n"
                f"| `{verifier_id}` | Value(accepted) |\n"
            ).encode()
            definitions = [{
                "range_id": "oracle-rows", "start_heading": "## Oracle rows",
                "end_heading": None, "grammar": "table_column", "id_column": 1,
                "literal_expansions": [],
            }]
            references = []
        files.append({
            "path": path, "role": role, "source_kind": "current_contract",
            "expected_pair": pair, "definition_ranges": definitions,
            "reference_ranges": references,
        })

    doc = {
        "version": "synthetic-test-manifest",
        "files": files,
        "coverage_edges": [],
        "coverage_dispositions": [],
        "parent_ac_coverage": [
            {"parent_ac_id": "AC-OS-020-01", "state": "not_exercised",
             "reason": "synthetic reason for AC-OS-020-01"},
            {"parent_ac_id": "AC-OS-020-03", "state": "not_exercised",
             "reason": "synthetic reason for AC-OS-020-03"},
        ],
        "source_scopeouts": [{
            "source_id": "RL-D4", "reason": "synthetic scopeout",
            "owner_ref": "repository-layout::RL-D4",
            "operational_owner": {"state": "unresolved"}, "return_path": "RL-D4",
        }],
        "legacy_pins": [],
        "unsupported_items": [
            {"id": ident, "reason": "synthetic unsupported scope", "disposition": "non_pass"}
            for ident in sorted(manifest.EXPECTED_UNSUPPORTED)
        ],
    }
    _pin_fixture(doc, sources)

    for source_id, source_path in source_to_path.items():
        state = "partial" if source_id in manifest.EXPECTED_PARTIAL else "not_exercised" if source_id in manifest.EXPECTED_NOT_EXERCISED else "mapped"
        edge_ids = []
        if state != "not_exercised":
            verifier_path = next(row[2] for row in manifest.EXPECTED_FILES if row[0] == source_path)
            if verifier_path == manifest.CK_L8_PATH:
                ck_ids = manifest.CK_L8_EXPECTED_IDS_BY_RANGE[
                    manifest.CK_L8_K1_RANGE if source_id == manifest.CK_L5_K1_LOCATOR else manifest.CK_L8_K2_RANGE
                ]
                for ck_verifier_id in sorted(ck_ids):
                    range_id = manifest.CK_L8_K1_RANGE if ck_verifier_id.startswith("L8-K1-") else manifest.CK_L8_K2_RANGE
                    edge_id = f"edge.ck.synthetic.{ck_verifier_id}"
                    edge_ids.append(edge_id)
                    doc["coverage_edges"].append({
                        "edge_id": edge_id, "source_id": source_id,
                        "source_path": source_path, "verifier_id": ck_verifier_id,
                        "verifier_path": verifier_path,
                        "outcome_ref": {"verifier_path": verifier_path, "range_id": range_id,
                                        "verifier_id": ck_verifier_id, "outcome_column": 5},
                    })
            else:
                verifier_id = verifier_ids[verifier_path]
                edge_id = f"edge.{source_id}.{verifier_id}"
                edge_ids.append(edge_id)
                doc["coverage_edges"].append({
                    "edge_id": edge_id, "source_id": source_id,
                    "source_path": source_path, "verifier_id": verifier_id,
                    "verifier_path": verifier_path,
                    "outcome_ref": {"verifier_path": verifier_path, "range_id": "oracle-rows",
                                    "verifier_id": verifier_id, "outcome_column": 2},
                })
        disp = {"source_id": source_id, "state": state, "edge_ids": edge_ids}
        if state in {"partial", "not_exercised"}:
            disp.update({"reason": "synthetic disposition", "owner_ref": "fixed owner ref",
                         "operational_owner": {"state": "unresolved"}, "return_path": "fixed return"})
        doc["coverage_dispositions"].append(disp)
    return doc, sources, _ledger_from_doc(doc)


def _ledger_from_doc(doc):
    # The fixture helper already installed matching source bytes. Recreate the
    # ledger from the pin rows to keep tests independent of the repository file.
    lines = []
    prefix = "archive/legacy-generation-2026-09-14/root/"
    for pin in doc["legacy_pins"]:
        data = pin["archive_path"]
        relative = data[len(prefix):]
        lines.append(canonical_bytes({"asset_id": pin["asset_id"], "source_path": relative,
                                      "source_sha256": pin["full_file_sha256"]}))
    return b"\n".join(lines) + b"\n"


def _raw(doc):
    return canonical_bytes(doc)


def _expect_diag(test, classification, reason, fn, *args):
    with test.assertRaises(Diagnostic) as caught:
        fn(*args)
    test.assertEqual((caught.exception.classification, caught.exception.reason), (classification, reason))


def _graph(doc, sources):
    return manifest.resolve_id_graph(doc, sources)


class DesignManifestTests(unittest.TestCase):
    def test_ut_lci_19_missing_source_row_is_unknown(self):
        doc, sources, _ = _baseline()
        path = "docs/helix-harness/L4-basic-design/common-kernel.md"
        text = sources[path].decode()
        sources[path] = text.replace("- **K1-I1 synthetic definition**\n", "", 1).encode()
        _expect_diag(self, "Unknown", "missing_input", manifest.load_design_manifest, _raw(doc), sources)

    def test_ut_lci_20_missing_mapped_edge_is_unknown(self):
        doc, sources, _ = _baseline()
        doc["coverage_edges"].pop()
        _expect_diag(self, "Unknown", "missing_input", manifest.verify_coverage_edges, doc, _graph(doc, sources))

    def test_ut_lci_21_span_digest_is_independent_and_checked(self):
        doc, sources, ledger = _baseline()
        doc["legacy_pins"][0]["span_sha256"] = "0" * 64
        _expect_diag(self, "Unknown", "conflict", manifest.verify_legacy_pins, doc, sources, ledger)

    def test_ut_lci_23_duplicate_definition_is_conflict(self):
        doc, sources, _ = _baseline()
        path = "docs/helix-harness/L4-basic-design/common-kernel.md"
        sources[path] = sources[path].replace(b"## Section locators\n", b"- **K1-I1 duplicate definition**\n## Section locators\n")
        _expect_diag(self, "Unknown", "conflict", _graph, doc, sources)

    def test_ut_lci_32_fixed_twelve_document_manifest_loads(self):
        doc, sources, _ = _baseline()
        loaded = manifest.load_design_manifest(_raw(doc), sources)
        self.assertEqual(len(loaded["files"]), 12)
        self.assertEqual(
            [row["parent_ac_id"] for row in loaded["parent_ac_coverage"]],
            ["AC-OS-020-01", "AC-OS-020-03"],
        )

    def test_ut_lci_87_missing_parent_ac_row_is_unknown(self):
        doc, sources, _ = _baseline()
        doc["parent_ac_coverage"] = [doc["parent_ac_coverage"][0]]
        _expect_diag(self, "Unknown", "missing_input", manifest.load_design_manifest, _raw(doc), sources)

    def test_ut_lci_88_parent_ac_cannot_be_promoted_to_pass(self):
        doc, sources, _ = _baseline()
        doc["parent_ac_coverage"][0]["state"] = "pass"
        _expect_diag(self, "Rejected", "invalid_input", manifest.load_design_manifest, _raw(doc), sources)

    def test_ut_lci_89_common_kernel_pair_baseline_has_164_expanded_verifiers(self):
        doc, sources, _ = _baseline()
        loaded = manifest.load_design_manifest(_raw(doc), sources)
        graph = _graph(loaded, sources)
        self.assertEqual(len(loaded["files"]), 12)
        self.assertEqual(len(manifest.REQUIRED_SOURCE_IDS), 187)
        self.assertEqual(len(manifest.EXPECTED_CK_K1_K2_VERIFIER_IDS), 164)
        self.assertEqual(
            len([item for item in graph["definitions"] if item["path"] == manifest.CK_L8_PATH]),
            164,
        )
        grouped = [row for row in graph["definition_rows"].values()
                   if row[0] == manifest.CK_L8_PATH and row[1] == manifest.CK_L8_K1_RANGE
                   and row[3][0] == "group-k1"]
        self.assertEqual(len(grouped), 3)
        self.assertEqual(len({row[2] for row in grouped}), 1)

    def test_ut_lci_90_missing_k2_l5_locator_is_unknown(self):
        doc, sources, _ = _baseline()
        sources[manifest.CK_L5_PATH] = sources[manifest.CK_L5_PATH].replace(
            (manifest.CK_L5_K2_LOCATOR + "\n").encode(), b"", 1)
        _expect_diag(self, "Unknown", "missing_input", manifest.load_design_manifest, _raw(doc), sources)

    def test_ut_lci_91_missing_expanded_middle_fixture_id_is_unknown(self):
        doc, sources, _ = _baseline()
        ck_file = next(f for f in doc["files"] if f["path"] == manifest.CK_L8_PATH)
        expansion = next(r for r in ck_file["definition_ranges"] if r["range_id"] == manifest.CK_L8_K1_RANGE)["literal_expansions"][0]
        expansion["ids"].pop(1)
        _expect_diag(self, "Unknown", "missing_input", manifest.load_design_manifest, _raw(doc), sources)

    def test_ut_lci_92_k1_fixture_cannot_be_owned_by_k2_locator(self):
        doc, sources, _ = _baseline()
        ck_file = next(f for f in doc["files"] if f["path"] == manifest.CK_L8_PATH)
        refs = next(r for r in ck_file["reference_ranges"] if r["range_id"] == "ck-l8-k1-l4-l5-contracts")
        refs["literal_expansions"][0]["ids"][0] = manifest.CK_L5_K2_LOCATOR
        _expect_diag(self, "Unknown", "conflict", _graph, doc, sources)

    def test_ut_lci_93_joint_edge_disposition_and_inventory_removal_is_unknown(self):
        doc, sources, _ = _baseline()
        verifier_id = "L8-K1-01-N"
        edge = next(item for item in doc["coverage_edges"] if item["verifier_id"] == verifier_id)
        doc["coverage_edges"].remove(edge)
        disposition = next(item for item in doc["coverage_dispositions"] if item["source_id"] == edge["source_id"])
        disposition["edge_ids"].remove(edge["edge_id"])
        ck_file = next(f for f in doc["files"] if f["path"] == manifest.CK_L8_PATH)
        expansion = next(r for r in ck_file["definition_ranges"] if r["range_id"] == manifest.CK_L8_K1_RANGE)["literal_expansions"][0]
        expansion["ids"].remove(verifier_id)
        _expect_diag(self, "Unknown", "missing_input", _graph, doc, sources)

    def test_ut_lci_94_outcome_ref_uses_the_same_raw_fixture_row(self):
        doc, sources, _ = _baseline()
        graph = _graph(doc, sources)
        graph["definition_rows"]["L8-K1-06a"] = graph["definition_rows"]["L8-K1-06b"]
        _expect_diag(self, "Unknown", "conflict", manifest.verify_coverage_edges, doc, graph)

    def test_ut_lci_95_l4_invariant_is_not_an_l5_coverage_source(self):
        doc, sources, _ = _baseline()
        edge = next(item for item in doc["coverage_edges"] if item["verifier_id"] == "L8-K1-01-N")
        edge["source_id"] = "K1-I1"
        edge["source_path"] = next(path for path, ids in manifest.REQUIRED_SOURCE_IDS_BY_PATH.items() if "K1-I1" in ids)
        _expect_diag(self, "Unknown", "conflict", manifest.verify_coverage_edges, doc, _graph(doc, sources))

    def test_parent_ac_coverage_missing_list_is_unknown(self):
        doc, sources, _ = _baseline()
        del doc["parent_ac_coverage"]
        _expect_diag(self, "Unknown", "missing_input", manifest.load_design_manifest, _raw(doc), sources)

    def test_parent_ac_coverage_empty_list_is_unknown(self):
        doc, sources, _ = _baseline()
        doc["parent_ac_coverage"] = []
        _expect_diag(self, "Unknown", "missing_input", manifest.load_design_manifest, _raw(doc), sources)

    def test_parent_ac_coverage_duplicate_id_is_conflict(self):
        doc, sources, _ = _baseline()
        doc["parent_ac_coverage"].append(copy.deepcopy(doc["parent_ac_coverage"][0]))
        _expect_diag(self, "Unknown", "conflict", manifest.load_design_manifest, _raw(doc), sources)

    def test_parent_ac_coverage_unknown_id_is_rejected(self):
        doc, sources, _ = _baseline()
        doc["parent_ac_coverage"][0]["parent_ac_id"] = "AC-OS-020-02"
        _expect_diag(self, "Rejected", "invalid_input", manifest.load_design_manifest, _raw(doc), sources)

    def test_parent_ac_coverage_reason_must_match_l4_literal(self):
        doc, sources, _ = _baseline()
        doc["parent_ac_coverage"][0]["reason"] += " changed"
        _expect_diag(self, "Unknown", "conflict", manifest.load_design_manifest, _raw(doc), sources)

    def test_parent_ac_coverage_wrong_type_is_rejected(self):
        doc, sources, _ = _baseline()
        doc["parent_ac_coverage"] = {"parent_ac_id": "AC-OS-020-01"}
        _expect_diag(self, "Rejected", "invalid_input", manifest.load_design_manifest, _raw(doc), sources)

    def test_parent_ac_coverage_row_field_type_is_rejected(self):
        doc, sources, _ = _baseline()
        doc["parent_ac_coverage"][0]["reason"] = None
        _expect_diag(self, "Rejected", "invalid_input", manifest.load_design_manifest, _raw(doc), sources)

    def test_parent_ac_coverage_unknown_row_field_is_rejected(self):
        doc, sources, _ = _baseline()
        doc["parent_ac_coverage"][0]["extra"] = "not allowed"
        _expect_diag(self, "Rejected", "invalid_input", manifest.load_design_manifest, _raw(doc), sources)

    def test_parent_ac_coverage_unknown_manifest_field_is_rejected(self):
        doc, sources, _ = _baseline()
        doc["unknown_field"] = True
        _expect_diag(self, "Rejected", "invalid_input", manifest.load_design_manifest, _raw(doc), sources)

    def test_parent_ac_coverage_l4_row_missing_is_unknown(self):
        doc, sources, _ = _baseline()
        path = "docs/helix-os/L4-basic-design/local-ci.md"
        sources[path] = sources[path].replace(
            b"| `AC-OS-020-03` | `not_exercised` | synthetic reason for AC-OS-020-03 |\n", b""
        )
        _expect_diag(self, "Unknown", "missing_input", manifest.load_design_manifest, _raw(doc), sources)

    def test_parent_ac_coverage_missing_l4_source_is_unknown(self):
        doc, sources, _ = _baseline()
        del sources["docs/helix-os/L4-basic-design/local-ci.md"]
        _expect_diag(self, "Unknown", "missing_input", manifest.load_design_manifest, _raw(doc), sources)

    def test_ut_lci_33_definitions_form_unique_graph(self):
        doc, sources, _ = _baseline()
        graph = _graph(doc, sources)
        self.assertEqual(len(graph["by_id"]), len(manifest.REQUIRED_SOURCE_IDS) + 5 + len(manifest.EXPECTED_CK_K1_K2_VERIFIER_IDS))
        ck_refs = [ref for ref in graph["references"] if ref["path"] == manifest.CK_L8_PATH]
        self.assertEqual(len(ck_refs), 162 * 3)
        self.assertEqual(sum(ref["column"] == 2 for ref in ck_refs), 162)
        self.assertEqual(sum(ref["column"] == 3 for ref in ck_refs), 162 * 2)

    def test_ut_lci_34_mixed_nonpass_dispositions_remain_visible(self):
        doc, sources, _ = _baseline()
        result = manifest.verify_coverage_edges(doc, _graph(doc, sources))
        self.assertTrue(result["structure_complete"])
        kinds = {(item["kind"], item.get("source_id", item.get("id")), item.get("state", item.get("disposition")))
                 for item in result["nonpass_inventory"]}
        self.assertIn(("coverage_disposition", "RL-D4", "partial"), kinds)
        self.assertIn(("coverage_disposition", "RL-V1", "not_exercised"), kinds)
        self.assertIn(("source_scopeout", "RL-D4", None), kinds)
        self.assertEqual(sum(item["kind"] == "unsupported_item" for item in result["nonpass_inventory"]), 4)

    def test_ut_lci_35_legacy_pins_match_full_and_span_digests(self):
        doc, sources, ledger = _baseline()
        result = manifest.verify_legacy_pins(doc, sources, ledger)
        self.assertEqual(result["verified_count"], 15)

    def test_ut_lci_36_deleted_destination_definition_is_unresolved(self):
        doc, sources, _ = _baseline()
        destination = next(item["id"] for item in _graph(doc, sources)["definitions"]
                           if item["definition_kind"] == "table_column")
        verifier_file = next(item for item in doc["files"] if item["role"] == "l9" and
                             item["path"] == next(definition["path"] for definition in _graph(doc, sources)["definitions"]
                                                  if definition["id"] == destination))
        l5_path = "docs/helix-os/L5-detail-design/local-ci-detail-design.md"
        sources[l5_path] += ("\n## Reference rows\n| Ref | Target |\n|---|---|\n"
                             f"| R1 | `{destination}` |\n").encode()
        file = next(item for item in doc["files"] if item["path"] == l5_path)
        file["reference_ranges"].append({
            "range_id": "synthetic-reference", "start_heading": "## Reference rows",
            "end_heading": None, "grammar": "table_column", "id_column": 2,
            "literal_expansions": [],
        })
        self.assertIn(destination, _graph(doc, sources)["by_id"])
        row = f"| `{destination}` | Value(accepted) |\n".encode()
        self.assertIn(row, sources[verifier_file["path"]])
        sources[verifier_file["path"]] = sources[verifier_file["path"]].replace(row, b"", 1)
        with self.assertRaises(Diagnostic) as caught:
            _graph(doc, sources)
        self.assertEqual((caught.exception.classification, caught.exception.reason), ("Unknown", "missing_input"))
        self.assertIn("unresolved reference: " + destination, caught.exception.detail)

    def test_ut_lci_46_removing_only_d4_iv_rl_57_edge_is_unknown(self):
        doc, sources, _ = _baseline()
        source_path = next(path for path, ids in manifest.REQUIRED_SOURCE_IDS_BY_PATH.items() if "RL-D4" in ids)
        verifier_path = next(row[2] for row in manifest.EXPECTED_FILES if row[0] == source_path)
        verifier_file = next(item for item in doc["files"] if item["path"] == verifier_path)
        verifier_ids = ["IV-RL-56", "IV-RL-57", "IV-RL-59"]
        sources[verifier_path] += (
            "".join(f"| `{ident}` | Value(accepted) |\n" for ident in verifier_ids)
            + "\n## Source relations\n| Verifier | Source contract |\n|---|---|\n"
            + "".join(f"| `{ident}` | RL-D4 |\n" for ident in verifier_ids)
        ).encode()
        next(item for item in verifier_file["definition_ranges"] if item["range_id"] == "oracle-rows")["end_heading"] = "## Source relations"
        verifier_file["reference_ranges"].append({
            "range_id": "source-relations", "start_heading": "## Source relations",
            "end_heading": None, "grammar": "table_column", "id_column": 2,
            "literal_expansions": [],
        })
        doc["coverage_edges"] = [edge for edge in doc["coverage_edges"] if edge["source_id"] != "RL-D4"]
        d4_edge_ids = []
        for ident in verifier_ids:
            edge_id = f"edge.RL-D4.{ident}"
            d4_edge_ids.append(edge_id)
            doc["coverage_edges"].append({
                "edge_id": edge_id, "source_id": "RL-D4", "source_path": source_path,
                "verifier_id": ident, "verifier_path": verifier_path,
                "outcome_ref": {"verifier_path": verifier_path, "range_id": "oracle-rows",
                                "verifier_id": ident, "outcome_column": 2},
            })
        disposition = next(item for item in doc["coverage_dispositions"] if item["source_id"] == "RL-D4")
        disposition["edge_ids"] = d4_edge_ids
        self.assertTrue(manifest.verify_coverage_edges(doc, _graph(doc, sources))["structure_complete"])
        removed_id = "edge.RL-D4.IV-RL-57"
        doc["coverage_edges"] = [edge for edge in doc["coverage_edges"] if edge["edge_id"] != removed_id]
        disposition["edge_ids"].remove(removed_id)
        _expect_diag(self, "Unknown", "missing_input", manifest.verify_coverage_edges, doc, _graph(doc, sources))

    def test_ut_lci_47_t3_cannot_be_promoted_to_pass(self):
        doc, sources, _ = _baseline()
        disposition = next(item for item in doc["coverage_dispositions"] if item["source_id"] == "RL-T3")
        disposition["state"] = "pass"
        _expect_diag(self, "Rejected", "invalid_input", manifest.load_design_manifest, _raw(doc), sources)

    def test_ut_lci_57_preflight_missing_edge_is_not_success(self):
        doc, sources, ledger = _baseline()
        doc["coverage_edges"].pop()
        _expect_diag(self, "Unknown", "missing_input", manifest.verify_design_manifest, _raw(doc), sources, ledger)

    def test_ut_lci_58_preflight_duplicate_definition_is_conflict(self):
        doc, sources, ledger = _baseline()
        path = "docs/helix-harness/L4-basic-design/common-kernel.md"
        sources[path] = sources[path].replace(b"## Section locators\n", b"- **K1-I1 duplicate definition**\n## Section locators\n")
        _expect_diag(self, "Unknown", "conflict", manifest.verify_design_manifest, _raw(doc), sources, ledger)

    def test_ut_lci_63_required_manifest_field_is_not_optional(self):
        doc, sources, _ = _baseline()
        del doc["unsupported_items"]
        _expect_diag(self, "Rejected", "invalid_input", manifest.load_design_manifest, _raw(doc), sources)

    def test_ut_lci_64_unsupported_pass_is_rejected(self):
        doc, sources, _ = _baseline()
        doc["unsupported_items"][0]["disposition"] = "pass"
        _expect_diag(self, "Rejected", "invalid_input", manifest.load_design_manifest, _raw(doc), sources)

    def test_ut_lci_65_missing_definition_does_not_get_filled_from_reference(self):
        doc, sources, _ = _baseline()
        path = "docs/helix-harness/L4-basic-design/common-kernel.md"
        sources[path] = sources[path].replace(b"- **K1-I1 synthetic definition**\n", b"")
        sources[path] += b"\n## Ref rows\n| Ref | Target |\n|---|---|\n| R1 | K1-I1 |\n"
        file = next(item for item in doc["files"] if item["path"] == path)
        file["reference_ranges"].append({"range_id": "ref", "start_heading": "## Ref rows",
                                         "end_heading": None, "grammar": "table_column", "id_column": 2,
                                         "literal_expansions": []})
        _expect_diag(self, "Unknown", "missing_input", _graph, doc, sources)

    def test_ut_lci_66_duplicate_edge_id_is_conflict(self):
        doc, sources, _ = _baseline()
        doc["coverage_edges"].append(copy.deepcopy(doc["coverage_edges"][0]))
        _expect_diag(self, "Unknown", "conflict", manifest.verify_coverage_edges, doc, _graph(doc, sources))

    def test_ut_lci_67_disposition_edge_must_resolve(self):
        doc, sources, _ = _baseline()
        doc["coverage_dispositions"][0]["edge_ids"] = ["unregistered-edge"]
        _expect_diag(self, "Unknown", "missing_input", manifest.verify_coverage_edges, doc, _graph(doc, sources))

    def test_ut_lci_68_outcome_column_must_resolve_to_nonempty_cell(self):
        doc, sources, _ = _baseline()
        doc["coverage_edges"][0]["outcome_ref"]["outcome_column"] = 99
        _expect_diag(self, "Unknown", "missing_input", manifest.verify_coverage_edges, doc, _graph(doc, sources))

    def test_outcome_ref_must_use_verifier_definition_range(self):
        doc, sources, _ = _baseline()
        verifier_file = next(item for item in doc["files"] if item["role"] == "l9")
        verifier_file["reference_ranges"].append({
            "range_id": "oracle-reference-only", "start_heading": "## Oracle rows",
            "end_heading": None, "grammar": "table_column", "id_column": 1,
            "literal_expansions": [],
        })
        doc["coverage_edges"][0]["outcome_ref"]["range_id"] = "oracle-reference-only"
        _expect_diag(self, "Unknown", "missing_input", manifest.verify_coverage_edges,
                     doc, _graph(doc, sources))

    def test_outcome_ref_cannot_point_at_verifier_id_column(self):
        doc, sources, _ = _baseline()
        doc["coverage_edges"][0]["outcome_ref"]["outcome_column"] = 1
        _expect_diag(self, "Unknown", "missing_input", manifest.verify_coverage_edges,
                     doc, _graph(doc, sources))

    def test_missing_edge_and_disposition_pointer_still_fails_reference_pair(self):
        doc, sources, _ = _baseline()
        verifier_file = next(item for item in doc["files"] if item["role"] == "l9")
        verifier_path = verifier_file["path"]
        second_id = "IV-SYNTH-SECOND"
        sources[verifier_path] += (
            f"| `{second_id}` | Value(accepted) |\n"
            "\n## Source relations\n| Verifier | Source contract |\n|---|---|\n"
            f"| `{second_id}` | RL-D4 |\n"
        ).encode()
        verifier_file["reference_ranges"].append({
            "range_id": "source-relations", "start_heading": "## Source relations",
            "end_heading": None, "grammar": "table_column", "id_column": 2,
            "literal_expansions": [],
        })
        next(r for r in verifier_file["definition_ranges"] if r["range_id"] == "oracle-rows")["end_heading"] = "## Source relations"
        edge_id = "edge.RL-D4.IV-SYNTH-SECOND"
        doc["coverage_edges"].append({
            "edge_id": edge_id, "source_id": "RL-D4",
            "source_path": next(path for path, ids in manifest.REQUIRED_SOURCE_IDS_BY_PATH.items()
                                 if "RL-D4" in ids),
            "verifier_id": second_id, "verifier_path": verifier_path,
            "outcome_ref": {"verifier_path": verifier_path, "range_id": "oracle-rows",
                            "verifier_id": second_id, "outcome_column": 2},
        })
        disposition = next(item for item in doc["coverage_dispositions"] if item["source_id"] == "RL-D4")
        disposition["edge_ids"].append(edge_id)
        # Both the edge row and its disposition pointer are removed, while the
        # first RL-D4 edge remains. The verifier table still declares the pair.
        doc["coverage_edges"].pop()
        disposition["edge_ids"].pop()
        graph = manifest.resolve_id_graph(doc, sources)
        _expect_diag(self, "Unknown", "missing_input", manifest.verify_coverage_edges, doc, graph)

    def _with_reference_literal(self):
        doc, sources, _ = _baseline()
        path = "docs/helix-os/L5-detail-design/local-ci-detail-design.md"
        sources[path] += b"\n## Reference rows\n| Ref | Target |\n|---|---|\n| R1 | K1-I1 compact |\n"
        file = next(item for item in doc["files"] if item["path"] == path)
        file["reference_ranges"].append({"range_id": "literal-reference", "start_heading": "## Reference rows",
                                         "end_heading": None, "grammar": "table_column", "id_column": 2,
                                         "literal_expansions": [{"literal": "K1-I1 compact", "ids": ["K1-I1"]}]})
        return doc, sources, path

    def test_ut_lci_69_abbreviated_reference_needs_fixed_expansion(self):
        doc, sources, _ = self._with_reference_literal()
        file = next(item for item in doc["files"] if item["path"] == "docs/helix-os/L5-detail-design/local-ci-detail-design.md")
        file["reference_ranges"][-1]["literal_expansions"] = []
        _expect_diag(self, "Unknown", "missing_input", manifest.load_design_manifest, _raw(doc), sources)

    def test_ut_lci_70_exact_heading_locator_must_exist(self):
        doc, sources, _ = _baseline()
        file = next(f for f in doc["files"] for r in f["definition_ranges"] if r["grammar"] == "exact_heading")
        rng = next(r for r in file["definition_ranges"] if r["grammar"] == "exact_heading")
        original_heading = rng["start_heading"]
        sources[file["path"]] = sources[file["path"]].replace(
            (original_heading + "\n").encode(), (original_heading + " changed\n").encode(), 1)
        self.assertEqual(rng["start_heading"], original_heading)
        _expect_diag(self, "Unknown", "missing_input", manifest.load_design_manifest, _raw(doc), sources)

    def test_ut_lci_71_duplicate_heading_id_outside_fence_conflicts(self):
        doc, sources, _ = _baseline()
        path = "docs/helix-os/L6-function-design/local-ci-function-design.md"
        lines = sources[path].decode().splitlines()
        first = next(line for line in lines if line.startswith("### `F-LCI-01`"))
        lines.append(first)
        sources[path] = ("\n".join(lines) + "\n").encode()
        _expect_diag(self, "Unknown", "conflict", manifest.load_design_manifest, _raw(doc), sources)

    def test_ut_lci_72_missing_heading_row_is_not_recovered_from_fence(self):
        doc, sources, _ = _baseline()
        path = "docs/helix-os/L6-function-design/local-ci-function-design.md"
        literal = doc["files"][-2]["definition_ranges"][0]["literal_expansions"][0]["literal"]
        sources[path] = sources[path].replace((literal + "\n").encode(), b"", 1)
        sources[path] += ("\n```md\n" + literal + "\n```\n").encode()
        _expect_diag(self, "Unknown", "missing_input", manifest.load_design_manifest, _raw(doc), sources)

    def test_ut_lci_73_missing_heading_expansion_is_missing_input(self):
        doc, sources, _ = _baseline()
        doc["files"][-2]["definition_ranges"][0]["literal_expansions"].pop()
        _expect_diag(self, "Unknown", "missing_input", manifest.load_design_manifest, _raw(doc), sources)

    def test_ut_lci_74_empty_heading_expansion_is_missing_input(self):
        doc, sources, _ = _baseline()
        doc["files"][-2]["definition_ranges"][0]["literal_expansions"][0]["ids"] = []
        _expect_diag(self, "Unknown", "missing_input", manifest.load_design_manifest, _raw(doc), sources)

    def test_ut_lci_75_duplicate_heading_id_mapping_is_conflict(self):
        doc, sources, _ = _baseline()
        heading_range = doc["files"][-2]["definition_ranges"][0]
        heading_range["literal_expansions"][1]["ids"] = heading_range["literal_expansions"][0]["ids"]
        _expect_diag(self, "Unknown", "conflict", manifest.load_design_manifest, _raw(doc), sources)


if __name__ == "__main__":
    unittest.main()

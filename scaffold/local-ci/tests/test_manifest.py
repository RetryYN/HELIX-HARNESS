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
            lines = [
                "# Synthetic Common Kernel L5",
                "### 3.2 K1 API contract", "K1 API synthetic.",
                "### 3.3 K2: reference and key records", "K1 range end.",
                "### 3.4 K2 API contract", "K2 API synthetic.",
                "### 3.5 role-bound input alias binding", "K2 range end.",
                "#### 6.1.3 K3 function/API contract", "K3 API synthetic.",
                "#### 6.1.4 invariantからL5 functionへのtrace", "K3 range end.",
                "#### 6.2.2 公開関数とprivate helper", "K5 API synthetic.",
                "#### 6.2.3 不変条件の分解", "K5 range end.",
                "## 8. K4/G3 義務評価API", "K4/G3 synthetic API.",
                "## K4/G3 API 範囲終端",
            ]
            sources[path] = ("\n".join(lines) + "\n").encode()
            definitions = [
                {"range_id": rid, "start_heading": heading, "end_heading": end,
                 "grammar": "exact_heading", "id_column": None, "literal_expansions": []}
                for heading, (rid, end) in manifest.CK_L5_RANGE_CONFIG.items()
            ]
            references = []
        elif path == manifest.CK_L8_PATH:
            lines = ["# Synthetic Common Kernel L8"]
            definitions, references = [], []
            for range_id, (start, end, _) in manifest.CK_L8_DEFINITION_CONFIG.items():
                if lines[-1] != start:
                    lines.append(start)
                source_locator = manifest.CK_L5_LOCATOR_BY_RANGE[range_id]
                suffix = range_id.removeprefix("ck-l8-").removesuffix("-fixtures")
                fixture_ids = sorted(manifest.CK_L8_EXPECTED_IDS_BY_RANGE[range_id])
                grouped_ids = fixture_ids[:3] if range_id == manifest.CK_L8_K1_RANGE else []
                expansion = ([{"literal": "group-k1", "ids": grouped_ids}] if grouped_ids else [])
                contract_expansions = []
                for fixture_id in fixture_ids:
                    if grouped_ids and fixture_id in grouped_ids[1:]:
                        continue
                    raw_literal = "group-k1" if grouped_ids and fixture_id == grouped_ids[0] else f"`{fixture_id}`"
                    contract_literal = f"contract-{suffix}-{fixture_id}"
                    outcome_column = manifest.CK_L8_OUTCOME_COLUMN_BY_RANGE[range_id]
                    cells = [raw_literal, "`IV-SYNTH-03`", contract_literal]
                    if outcome_column == 6:
                        cells.append("`AC-SYNTH-01`")
                        cells.append("synthetic boundary")
                    elif outcome_column == 5:
                        cells.append("synthetic trace")
                    lines.append("| " + " | ".join(cells + ["Value(accepted)"]) + " |")
                    if not grouped_ids or fixture_id not in grouped_ids[1:]:
                        if not (grouped_ids and fixture_id == grouped_ids[0]):
                            expansion.append({"literal": raw_literal, "ids": [fixture_id]})
                        contract_ids = [source_locator, "K4-I1"] if range_id == manifest.CK_L8_K4_G3_RANGE else [source_locator, "K1-I1"]
                    contract_expansions.append({"literal": contract_literal, "ids": contract_ids})
                if end is not None:
                    lines.append(end)
                definitions.append({"range_id": range_id, "start_heading": start, "end_heading": end,
                                    "grammar": "table_column", "id_column": 1,
                                    "literal_expansions": expansion})
                references.extend([
                    {"range_id": f"ck-l8-{suffix}-l9-oracles", "start_heading": start, "end_heading": end,
                     "grammar": "table_column", "id_column": 2, "literal_expansions": []},
                    {"range_id": f"ck-l8-{suffix}-l4-l5-contracts", "start_heading": start, "end_heading": end,
                     "grammar": "table_column", "id_column": 3,
                     "literal_expansions": contract_expansions},
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
            references = []
            suite_config = {
                manifest.LCI_L7_PATH: ("l7-suite-oracles", manifest.LCI_L7_SUITE_IDS, 4),
                manifest.LCI_L8_PATH: ("l8-suite-cases", manifest.LCI_L8_CASE_IDS, 5),
            }
            if path == manifest.LCI_L9_PATH:
                design_heading = "## Synthetic design oracle rows"
                suite_heading = "## Synthetic suite oracle rows"
                labels = {
                    "IV-LCI-09": "manifest source scope",
                    "IV-LCI-10": "definition and reference identity",
                    "IV-LCI-11": "coverage disposition separation",
                    "IV-LCI-12": "unsupported inventory",
                    "IV-LCI-13": "historical pin validation",
                    "IV-LCI-14": "source kind separation",
                    "IV-LCI-27": "aggregate consistency",
                    "IV-LCI-63": "Common Kernel corpus source",
                    "IV-LCI-64": "Common Kernel pair binding",
                    "IV-LCI-65": "typed reference preservation",
                    "IV-LCI-66": "expanded fixture inventory",
                    "IV-LCI-67": "Common Kernel edge inventory",
                    "IV-LCI-68": "OutcomeRef binding",
                    "IV-LCI-69": "L4 reference separation",
                    "IV-LCI-70": "locator and range ownership",
                    "IV-LCI-71": "K3/K5 fixed inventory",
                    "IV-LCI-72": "typed reference and outcome",
                    "IV-LCI-87": "K4/G3 fixed destination inventory",
                    "IV-LCI-88": "K4/G3 extra ID rejection",
                    "IV-LCI-89": "K4/G3 duplicate row rejection",
                    "IV-LCI-90": "K4/G3 edge pair ownership",
                    "IV-LCI-91": "K4/G3 L5 locator completeness",
                }
                lines = ["# Synthetic", design_heading,
                         "| Fixture | Contract | Normal | Mutation | Outcome |", "|---|---|---|---|---|"]
                lines.append("| `IV-SYNTH-01` | generic design source | baseline | one mutation | Value(accepted) |")
                for verifier_id in sorted(manifest.LCI_L9_DESIGN_IDS):
                    lines.append(f"| `{verifier_id}` | {labels[verifier_id]} | baseline | one mutation | Value(accepted) |")
                lines.extend([suite_heading, "| Fixture | Oracle | Contract | Parent | Outcome |",
                              "|---|---|---|---|---|"])
                suite_contract_literals = []
                for verifier_id in sorted(manifest.LCI_L9_SUITE_IDS):
                    case_id = manifest.LCI_SUPPLEMENTAL_CASE_BY_IV.get(verifier_id)
                    mutation = (f"synthetic mutation documented by L8 `{case_id}`"
                                if case_id else "LC-STAGE1-L7-001 rowだけをplanから除く")
                    lines.append(
                        f"| `{verifier_id}` | `LC-STAGE1-L7-001` | `LC-SYNTH-01` | {mutation} | Value(accepted) |"
                    )
                    if case_id:
                        suite_contract_literals.append({"literal": mutation, "ids": [case_id]})
                suite_contract_literals.insert(0, {
                    "literal": "LC-STAGE1-L7-001 rowだけをplanから除く",
                    "ids": ["LC-STAGE1-L7-001"],
                })
                sources[path] = ("\n".join(lines) + "\n").encode()
                definitions = [
                    {"range_id": "ci-l9-fixture-definitions", "start_heading": design_heading,
                     "end_heading": suite_heading, "grammar": "table_column", "id_column": 1,
                     "literal_expansions": []},
                    {"range_id": "ci-l9-suite-fixtures", "start_heading": suite_heading,
                     "end_heading": None, "grammar": "table_column", "id_column": 1,
                     "literal_expansions": []},
                ]
                references = [
                    {
                        "range_id": "ci-l9-fixture-tables", "start_heading": design_heading,
                        "end_heading": suite_heading, "grammar": "table_column", "id_column": 2,
                        "literal_expansions": [
                            {"literal": label, "ids": ["LC-DESIGN-001"]} for label in labels.values()
                        ],
                    },
                    {
                        "range_id": "ci-l9-supplemental-source-refs", "start_heading": suite_heading,
                        "end_heading": None, "grammar": "table_column", "id_column": 2,
                        "literal_expansions": [],
                    },
                    {
                        "range_id": "ci-l9-suite-contract-refs", "start_heading": suite_heading,
                        "end_heading": None, "grammar": "table_column", "id_column": 4,
                        "literal_expansions": suite_contract_literals,
                    },
                ]
                verifier_ids[path] = ("IV-SYNTH-01",)
            elif path in suite_config:
                range_id, suite_ids, outcome_column = suite_config[path]
                heading = "## Synthetic suite oracle rows"
                lines = ["# Synthetic", heading,
                         "| Fixture | Oracle | Contract | Parent | Outcome |", "|---|---|---|---|---|"]
                for verifier_id in sorted(suite_ids):
                    cells = [f"`{verifier_id}`", "`IV-SYNTH-01`", "`LC-SYNTH-01`", "`AC-SYNTH-01`", "Value(accepted)"]
                    lines.append("| " + " | ".join(cells[:outcome_column]) + " |")
                sources[path] = ("\n".join(lines) + "\n").encode()
                definitions = [{"range_id": range_id, "start_heading": heading,
                                "end_heading": None, "grammar": "table_column", "id_column": 1,
                                "literal_expansions": []}]
                verifier_ids[path] = tuple(sorted(suite_ids))
            else:
                verifier_id = f"IV-SYNTH-{index:02d}"
                verifier_ids[path] = (verifier_id,)
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
            local_suite_sources = {"LC-STAGE1-L7-001", "D-LCI-06", "D-LCI-03", "F-LCI-10"}
            if source_id in local_suite_sources:
                if source_id == "LC-STAGE1-L7-001":
                    verifier_path, range_id, suite_ids, outcome_column = (
                        manifest.LCI_L9_PATH, "ci-l9-suite-fixtures", manifest.LCI_L9_SUITE_IDS, 5)
                elif source_id == "D-LCI-06":
                    verifier_path, range_id, suite_ids, outcome_column = (
                        manifest.LCI_L8_PATH, "l8-suite-cases", manifest.LCI_L8_SUITE_IDS, 5)
                elif source_id == "D-LCI-03":
                    verifier_path, range_id, suite_ids, outcome_column = (
                        manifest.LCI_L8_PATH, "l8-suite-cases", manifest.LCI_L8_DESIGN_IDS, 5)
                else:
                    verifier_path, range_id, suite_ids, outcome_column = (
                        manifest.LCI_L7_PATH, "l7-suite-oracles", manifest.LCI_L7_SUITE_IDS, 4)
                for verifier_id in sorted(suite_ids):
                    edge_id = f"edge.local.{source_id}.{verifier_id}"
                    edge_ids.append(edge_id)
                    doc["coverage_edges"].append({
                        "edge_id": edge_id, "source_id": source_id, "source_path": source_path,
                        "verifier_id": verifier_id, "verifier_path": verifier_path,
                        "outcome_ref": {"verifier_path": verifier_path, "range_id": range_id,
                                        "verifier_id": verifier_id, "outcome_column": outcome_column},
                    })
            elif source_id == "LC-DESIGN-001":
                for verifier_id in sorted(manifest.LCI_L9_DESIGN_IDS):
                    edge_id = f"edge.local.{source_id}.{verifier_id}"
                    edge_ids.append(edge_id)
                    doc["coverage_edges"].append({
                        "edge_id": edge_id, "source_id": source_id, "source_path": source_path,
                        "verifier_id": verifier_id, "verifier_path": manifest.LCI_L9_PATH,
                        "outcome_ref": {"verifier_path": manifest.LCI_L9_PATH,
                                        "range_id": "ci-l9-fixture-definitions",
                                        "verifier_id": verifier_id, "outcome_column": 5},
                    })
            elif verifier_path == manifest.CK_L8_PATH:
                range_id = next(rid for rid, locator in manifest.CK_L5_LOCATOR_BY_RANGE.items()
                                if source_id == locator)
                ck_ids = manifest.CK_L8_EXPECTED_IDS_BY_RANGE[range_id]
                for ck_verifier_id in sorted(ck_ids):
                    edge_id = f"edge.ck.synthetic.{range_id}.{ck_verifier_id}"
                    edge_ids.append(edge_id)
                    doc["coverage_edges"].append({
                        "edge_id": edge_id, "source_id": source_id,
                        "source_path": source_path, "verifier_id": ck_verifier_id,
                        "verifier_path": verifier_path,
                        "outcome_ref": {"verifier_path": verifier_path, "range_id": range_id,
                                        "verifier_id": ck_verifier_id,
                                        "outcome_column": manifest.CK_L8_OUTCOME_COLUMN_BY_RANGE[range_id]},
                    })
            else:
                for verifier_id in verifier_ids[verifier_path]:
                    edge_id = f"edge.{source_id}.{verifier_id}"
                    edge_ids.append(edge_id)
                    range_id = {manifest.LCI_L7_PATH: "l7-suite-oracles",
                                manifest.LCI_L8_PATH: "l8-suite-cases",
                                manifest.LCI_L9_PATH: "ci-l9-fixture-definitions"}.get(verifier_path, "oracle-rows")
                    outcome_column = {manifest.LCI_L7_PATH: 4, manifest.LCI_L8_PATH: 5,
                                      manifest.LCI_L9_PATH: 5}.get(verifier_path, 2)
                    doc["coverage_edges"].append({
                        "edge_id": edge_id, "source_id": source_id,
                        "source_path": source_path, "verifier_id": verifier_id,
                        "verifier_path": verifier_path,
                        "outcome_ref": {"verifier_path": verifier_path, "range_id": range_id,
                                        "verifier_id": verifier_id, "outcome_column": outcome_column},
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
    def test_supplemental_inventory_has_fixed_edges_and_preserves_dispositions(self):
        doc, sources, _ = _baseline()
        graph = _graph(doc, sources)
        result = manifest.verify_coverage_edges(doc, graph)
        self.assertTrue(result["structure_complete"])
        self.assertEqual(len(doc["coverage_dispositions"]), 193)
        self.assertEqual(len(manifest.LCI_L9_SUITE_IDS), 44)
        self.assertEqual(len(manifest.LCI_L8_SUITE_IDS), 48)
        self.assertEqual(len(manifest.LCI_L7_SUITE_IDS), 49)
        self.assertIn("UT-LCI-154", manifest.LCI_L7_SUITE_IDS)
        self.assertEqual(set(manifest.LCI_SUPPLEMENTAL_CASE_BY_IV),
                         ({f"IV-LCI-{n}" for n in range(100, 111)} | {f"IV-LCI-{n}" for n in range(111, 122)}))
        self.assertEqual(set(manifest.LCI_SUPPLEMENTAL_CASE_BY_IV.values()),
                         ({f"CASE-L8-LCI-{n}" for n in range(131, 142)} | {f"CASE-L8-LCI-{n}" for n in range(142, 153)}))
        self.assertFalse(any(ident.startswith("SUP-") for ident in manifest.REQUIRED_SOURCE_IDS))
        self.assertEqual(len([edge for edge in doc["coverage_edges"]
                              if edge["source_id"] == "LC-STAGE1-L7-001"]), 44)
        self.assertEqual(len([edge for edge in doc["coverage_edges"]
                              if edge["source_id"] == "D-LCI-06"]), 48)
        self.assertEqual(len([edge for edge in doc["coverage_edges"]
                              if edge["source_id"] == "F-LCI-10"]), 49)
        local_edges = [edge for edge in doc["coverage_edges"]
                       if edge["source_id"] in {"LC-STAGE1-L7-001", "D-LCI-06", "F-LCI-10"}]
        self.assertEqual(len(local_edges), 141)

    def test_supplemental_l9_case_reference_cannot_be_crosswired(self):
        doc, sources, _ = _baseline()
        l9 = next(file for file in doc["files"] if file["path"] == manifest.LCI_L9_PATH)
        rng = next(item for item in l9["reference_ranges"]
                   if item["range_id"] == "ci-l9-suite-contract-refs")
        literal = next(item for item in rng["literal_expansions"]
                       if "CASE-L8-LCI-131" in item["literal"])
        literal["ids"] = ["CASE-L8-LCI-132"]
        graph = _graph(doc, sources)
        _expect_diag(self, "Unknown", "conflict", manifest.verify_coverage_edges, doc, graph)

    def test_supplemental_l9_case_reference_without_expansion_is_missing(self):
        doc, sources, _ = _baseline()
        l9 = next(file for file in doc["files"] if file["path"] == manifest.LCI_L9_PATH)
        rng = next(item for item in l9["reference_ranges"]
                   if item["range_id"] == "ci-l9-suite-contract-refs")
        rng["literal_expansions"] = [item for item in rng["literal_expansions"]
                                     if "CASE-L8-LCI-131" not in item["literal"]]
        _expect_diag(self, "Unknown", "missing_input", _graph, doc, sources)

    def test_supplemental_l4_edge_and_disposition_are_both_required(self):
        doc, sources, _ = _baseline()
        edge_id = "edge.local.LC-STAGE1-L7-001.IV-LCI-100"
        doc["coverage_edges"] = [edge for edge in doc["coverage_edges"] if edge["edge_id"] != edge_id]
        disposition = next(item for item in doc["coverage_dispositions"]
                           if item["source_id"] == "LC-STAGE1-L7-001")
        disposition["edge_ids"].remove(edge_id)
        _expect_diag(self, "Unknown", "missing_input", manifest.verify_coverage_edges,
                     doc, _graph(doc, sources))

    def test_supplemental_l5_edge_and_disposition_are_both_required(self):
        doc, sources, _ = _baseline()
        edge_id = "edge.local.D-LCI-06.CASE-L8-LCI-131"
        doc["coverage_edges"] = [edge for edge in doc["coverage_edges"] if edge["edge_id"] != edge_id]
        disposition = next(item for item in doc["coverage_dispositions"]
                           if item["source_id"] == "D-LCI-06")
        disposition["edge_ids"].remove(edge_id)
        _expect_diag(self, "Unknown", "missing_input", manifest.verify_coverage_edges,
                     doc, _graph(doc, sources))

    def test_supplemental_l6_edge_and_disposition_are_both_required(self):
        doc, sources, _ = _baseline()
        edge_id = "edge.local.F-LCI-10.UT-LCI-133"
        doc["coverage_edges"] = [edge for edge in doc["coverage_edges"] if edge["edge_id"] != edge_id]
        disposition = next(item for item in doc["coverage_dispositions"]
                           if item["source_id"] == "F-LCI-10")
        disposition["edge_ids"].remove(edge_id)
        _expect_diag(self, "Unknown", "missing_input", manifest.verify_coverage_edges,
                     doc, _graph(doc, sources))

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


    def test_ut_lci_115_missing_k4_g3_literal_is_not_recovered(self):
        doc, sources, _ = _baseline()
        ident = "L8-G3-04-RECORD-ONLY-NO-ACCEPTANCE-OUTPUT"
        path = manifest.CK_L8_PATH
        row = next(line for line in sources[path].splitlines() if f"| `{ident}` |".encode() in line)
        sources[path] = sources[path].replace(row, b"", 1)
        _expect_diag(self, "Unknown", "missing_input", _graph, doc, sources)

    def test_ut_lci_116_extra_k4_g3_fixture_is_conflict(self):
        doc, sources, _ = _baseline()
        path = manifest.CK_L8_PATH
        end_heading = (manifest.CK_L8_DEFINITION_CONFIG[manifest.CK_L8_K4_G3_RANGE][1] + "\n").encode()
        row = b"| `L8-K4-EXTRA` | `IV-K4-01` | `contract-k4-L8-K4-EXTRA` | Value(accepted) |\n"
        sources[path] = sources[path].replace(end_heading, row + end_heading, 1)
        _expect_diag(self, "Unknown", "conflict", _graph, doc, sources)

    def test_ut_lci_117_duplicate_k4_g3_fixture_is_conflict(self):
        doc, sources, _ = _baseline()
        path = manifest.CK_L8_PATH
        original = next(line for line in sources[path].splitlines() if b"L8-K4-01-COMPLETE" in line)
        end_heading = (manifest.CK_L8_DEFINITION_CONFIG[manifest.CK_L8_K4_G3_RANGE][1] + "\n").encode()
        sources[path] = sources[path].replace(end_heading, original + b"\n" + end_heading, 1)
        _expect_diag(self, "Unknown", "conflict", _graph, doc, sources)

    def test_ut_lci_118_k4_g3_bad_edge_owner_is_conflict(self):
        doc, sources, _ = _baseline()
        edge = next(row for row in doc["coverage_edges"] if row["verifier_id"] == "L8-K4-01-COMPLETE")
        edge["source_id"] = manifest.CK_L5_K5_LOCATOR
        _expect_diag(self, "Unknown", "conflict", manifest.verify_coverage_edges, doc, _graph(doc, sources))

    def test_ut_lci_89_common_kernel_component_inventories_are_independent(self):
        doc, sources, _ = _baseline()
        loaded = manifest.load_design_manifest(_raw(doc), sources)
        graph = _graph(loaded, sources)
        self.assertEqual(len(loaded["files"]), 12)
        self.assertEqual(len(manifest.REQUIRED_SOURCE_IDS), 193)
        self.assertEqual(len(manifest.EXPECTED_CK_K1_K2_VERIFIER_IDS), 164)
        self.assertEqual(len(manifest.EXPECTED_CK_K3_VERIFIER_IDS), 194)
        self.assertEqual(len(manifest.EXPECTED_CK_K5_VERIFIER_IDS), 91)
        self.assertEqual(len(manifest.EXPECTED_CK_K4_G3_VERIFIER_IDS), 73)
        self.assertEqual(len([item for item in graph["definitions"] if item["path"] == manifest.CK_L8_PATH]), 522)
        self.assertEqual(sum(ident.startswith("L8-K4-") for ident in manifest.EXPECTED_CK_K4_G3_VERIFIER_IDS), 51)
        self.assertEqual(sum(ident.startswith("L8-G3-") for ident in manifest.EXPECTED_CK_K4_G3_VERIFIER_IDS), 22)
        grouped = [row for row in graph["definition_rows"].values()
                   if row[0] == manifest.CK_L8_PATH and row[1] == manifest.CK_L8_K1_RANGE
                   and row[3][0] == "group-k1"]
        self.assertEqual(len(grouped), 3)
        self.assertEqual(len({row[2] for row in grouped}), 1)
        for range_id, expected in manifest.CK_L8_EXPECTED_IDS_BY_RANGE.items():
            actual = {item["id"] for item in graph["definitions"]
                      if item["path"] == manifest.CK_L8_PATH and item["range_id"] == range_id}
            self.assertEqual(actual, expected)

    def test_k4_g3_ranges_stop_before_trailing_k6_shaped_rows(self):
        doc, sources, _ = _baseline()
        sources[manifest.CK_L8_PATH] += (
            b"\n| `L8-K6-SYNTHETIC-01` | `IV-K6-SYNTHETIC-01` | `K6 synthetic contract` | Value(accepted) |\n"
        )
        loaded = manifest.load_design_manifest(_raw(doc), sources)
        graph = _graph(loaded, sources)
        actual = {item["id"] for item in graph["definitions"]
                  if item["path"] == manifest.CK_L8_PATH
                  and item["range_id"] == manifest.CK_L8_K4_G3_RANGE}
        self.assertEqual(actual, manifest.EXPECTED_CK_K4_G3_VERIFIER_IDS)
        self.assertEqual(len(actual), 73)
        self.assertNotIn("L8-K6-SYNTHETIC-01", actual)

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

    def test_ut_lci_96_k3_locator_range_id_collision_is_conflict(self):
        doc, sources, _ = _baseline()
        l5 = next(f for f in doc["files"] if f["path"] == manifest.CK_L5_PATH)
        k3_locator = next(
            r for r in l5["definition_ranges"]
            if r["start_heading"] == manifest.CK_L5_K3_LOCATOR
        )
        k3_locator["range_id"] = manifest.CK_L5_RANGE_CONFIG[manifest.CK_L5_K5_LOCATOR][0]
        _expect_diag(self, "Unknown", "conflict", manifest.load_design_manifest, _raw(doc), sources)

    def test_deleted_common_kernel_definition_range_remains_missing_input(self):
        doc, sources, _ = _baseline()
        l8 = next(f for f in doc["files"] if f["path"] == manifest.CK_L8_PATH)
        l8["definition_ranges"] = [r for r in l8["definition_ranges"]
                                  if r["range_id"] != manifest.CK_L8_K3_RANGE]
        _expect_diag(self, "Unknown", "missing_input", manifest.load_design_manifest, _raw(doc), sources)

    def test_ut_lci_120_ci_k4_g3_oracles_are_design_manifest_edges(self):
        doc, sources, _ = _baseline()
        pairs = {(edge["source_id"], edge["verifier_id"]) for edge in doc["coverage_edges"]}
        self.assertTrue(all(("D-LCI-03", ident) in pairs for ident in manifest.LCI_L8_DESIGN_IDS))
        self.assertTrue(all(("D-LCI-06", ident) in pairs for ident in manifest.LCI_L8_SUITE_IDS))
        self.assertFalse(any(("D-LCI-06", ident) in pairs for ident in manifest.LCI_L8_DESIGN_IDS))
        self.assertFalse(any(("D-LCI-03", ident) in pairs for ident in manifest.LCI_L8_SUITE_IDS))
        loaded = manifest.load_design_manifest(_raw(doc), sources)
        graph = _graph(loaded, sources)
        result = manifest.verify_coverage_edges(loaded, graph)
        self.assertTrue(result["structure_complete"])

    def test_ut_lci_119_deleted_k4_g3_l5_definition_range_is_missing_input(self):
        doc, sources, _ = _baseline()
        l5 = next(f for f in doc["files"] if f["path"] == manifest.CK_L5_PATH)
        l5["definition_ranges"] = [
            row for row in l5["definition_ranges"]
            if row["start_heading"] != manifest.CK_L5_K4_G3_LOCATOR
        ]
        _expect_diag(self, "Unknown", "missing_input", manifest.load_design_manifest, _raw(doc), sources)

    def test_ut_lci_97_joint_k5_raw_row_edge_disposition_removal_is_unknown(self):
        doc, sources, _ = _baseline()
        verifier_id = "L8-K5-17-CLOSED-PARTIAL-READ"
        # Keep the checker inventory fixed while removing the matching raw
        # table row, edge, and disposition reference.
        original = sources[manifest.CK_L8_PATH].decode()
        sources[manifest.CK_L8_PATH] = ("\n".join(
            line for line in original.splitlines() if not line.startswith(f"| `{verifier_id}` |")
        ) + "\n").encode()
        edge = next(item for item in doc["coverage_edges"] if item["verifier_id"] == verifier_id)
        doc["coverage_edges"].remove(edge)
        disposition = next(item for item in doc["coverage_dispositions"] if item["source_id"] == edge["source_id"])
        disposition["edge_ids"].remove(edge["edge_id"])
        _expect_diag(self, "Unknown", "missing_input", _graph, doc, sources)

    def test_ut_lci_99_joint_k3_id_expansion_edge_disposition_removal_is_unknown(self):
        doc, sources, _ = _baseline()
        verifier_id = "L8-K3-14-ROLE-ALIAS-COEXISTS"
        original = sources[manifest.CK_L8_PATH].decode()
        sources[manifest.CK_L8_PATH] = ("\n".join(
            line for line in original.splitlines() if not line.startswith(f"| `{verifier_id}` |")
        ) + "\n").encode()
        ck_file = next(f for f in doc["files"] if f["path"] == manifest.CK_L8_PATH)
        expansion = next(r for r in ck_file["definition_ranges"]
                         if r["range_id"] == manifest.CK_L8_K3_RANGE)["literal_expansions"]
        expansion[:] = [entry for entry in expansion if verifier_id not in entry["ids"]]
        edge = next(item for item in doc["coverage_edges"] if item["verifier_id"] == verifier_id)
        doc["coverage_edges"].remove(edge)
        disposition = next(item for item in doc["coverage_dispositions"] if item["source_id"] == edge["source_id"])
        disposition["edge_ids"].remove(edge["edge_id"])
        _expect_diag(self, "Unknown", "missing_input", _graph, doc, sources)

    def test_ut_lci_98_component_edge_source_and_outcome_column_are_fixed(self):
        doc, sources, _ = _baseline()
        edge = next(item for item in doc["coverage_edges"] if item["verifier_id"] in manifest.EXPECTED_CK_K3_VERIFIER_IDS)
        edge["source_id"] = manifest.CK_L5_K5_LOCATOR
        _expect_diag(self, "Unknown", "conflict", manifest.verify_coverage_edges, doc, _graph(doc, sources))
        doc, sources, _ = _baseline()
        edge = next(item for item in doc["coverage_edges"] if item["verifier_id"] in manifest.EXPECTED_CK_K3_VERIFIER_IDS)
        edge["outcome_ref"]["outcome_column"] = 5
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
        self.assertEqual(len(graph["by_id"]), len(manifest.REQUIRED_SOURCE_IDS) + 5
                         + len(manifest.EXPECTED_CK_VERIFIER_IDS)
                         + len(manifest.LCI_L7_SUITE_IDS) + len(manifest.LCI_L8_CASE_IDS)
                         + len(manifest.LCI_L9_SUITE_IDS) + len(manifest.LCI_L9_DESIGN_IDS) + 1 - 3)
        ck_refs = [ref for ref in graph["references"] if ref["path"] == manifest.CK_L8_PATH]
        # The first three K1 verifier IDs intentionally share one raw row;
        # table references are observed once per raw row, not copied per ID.
        raw_rows = 447 + len(manifest.EXPECTED_CK_K4_G3_VERIFIER_IDS)
        self.assertEqual(len(ck_refs), raw_rows * 3)
        self.assertEqual(sum(ref["column"] == 2 for ref in ck_refs), raw_rows)
        self.assertEqual(sum(ref["column"] == 3 for ref in ck_refs), raw_rows * 2)

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

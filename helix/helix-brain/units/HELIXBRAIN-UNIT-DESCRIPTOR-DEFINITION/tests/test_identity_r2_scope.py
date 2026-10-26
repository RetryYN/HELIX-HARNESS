"""L4 scope equality is same/different/unobserved across fn3 read branches."""

from __future__ import annotations

import copy
import json
import unittest

from descriptor_definitions import compare_identity_versions_and_trace, validate_supply_input
from identity_input_fixtures import (
    _write_source_content,
    bilateral_input,
    trace_input,
)


def _replace_scopes(value, replacement):
    if isinstance(value, dict):
        for key, child in list(value.items()):
            if key == "scope":
                value[key] = copy.deepcopy(replacement)
            else:
                _replace_scopes(child, replacement)
    elif isinstance(value, list):
        for child in value:
            _replace_scopes(child, replacement)


def _refresh_source_bytes(raw):
    sources = [source for source in raw.get("sources", [])
               if isinstance(source, dict) and isinstance(source.get("content"), dict)]

    def source_identity_key(source_ref):
        return json.dumps(
            [source_ref.get(key) for key in ("identity", "revision", "scope", "owner")],
            ensure_ascii=False, sort_keys=True, separators=(",", ":"),
        )

    def refs_by_identity():
        return {
            source_identity_key(source["ref"]): source["ref"]
            for source in sources if isinstance(source.get("ref"), dict)
        }

    def sync_refs(value, source_refs, own_refs):
        if isinstance(value, dict):
            if id(value) not in own_refs and all(key in value for key in ("identity", "revision", "scope", "owner")):
                source_ref = source_refs.get(source_identity_key(value))
                if source_ref is not None and isinstance(value.get("sha256"), str):
                    value["sha256"] = source_ref.get("sha256")
            for child in value.values():
                sync_refs(child, source_refs, own_refs)
        elif isinstance(value, list):
            for child in value:
                sync_refs(child, source_refs, own_refs)

    for _ in range(4):
        for source in sources:
            _write_source_content(raw, source, source["content"])
        source_refs = refs_by_identity()
        own_refs = {id(source["ref"]) for source in sources if isinstance(source.get("ref"), dict)}
        sync_refs(raw, source_refs, own_refs)
    for source in sources:
        _write_source_content(raw, source, source["content"])


def _set_scope_on_binding(binding, value):
    binding["template_ref"]["scope"] = copy.deepcopy(value)


class TestIdentityR2Scope(unittest.TestCase):
    def _call(self, raw):
        raw_before = copy.deepcopy(raw)
        validated = validate_supply_input(raw)
        self.assertEqual(validated["input"], raw_before)
        self.assertEqual(validated["input_issues"], [])
        validated_before = copy.deepcopy(validated)
        result = compare_identity_versions_and_trace({"validated": validated})
        self.assertEqual(raw, raw_before)
        self.assertEqual(validated, validated_before)
        return result

    def _axis(self, result, name):
        rows = [row for row in result["axes"] if row["axis"] == name]
        self.assertTrue(rows, f"expected a public {name} observation")
        return rows

    def test_same_scalar_scope_is_equal_in_actual_and_trace_reads(self):
        raw = bilateral_input("outside")
        _replace_scopes(raw, "synthetic-scope-token")
        _refresh_source_bytes(raw)
        result = self._call(raw)
        pack_identity = self._axis(result, "pack.identity")[0]
        self.assertEqual(pack_identity["state"], "resolved")
        self.assertIn("actual_owner_body_corresponding", pack_identity["reason"])

        raw = trace_input("positive")
        _replace_scopes(raw, "synthetic-scope-token")
        _refresh_source_bytes(raw)
        result = self._call(raw)
        traces = self._axis(result, "descriptor.trace")
        self.assertEqual(len(traces), 15)
        self.assertTrue(all(row["state"] == "resolved" for row in traces))

    def test_known_different_scope_is_conflict_for_actual_trace_and_bilateral_reads(self):
        raw = bilateral_input("outside")
        record = raw["compatibility_records"][0]
        right = next(source for source in raw["sources"] if source.get("ref") == record["source_ref"])
        old_ref = copy.deepcopy(right["ref"])
        changed_scope = "synthetic-known-different-scope"
        qualification = next(row for row in raw["qualifications"]
                             if row.get("ref", {}).get("identity") == right["qualification_ref"]["identity"])
        right["ref"]["scope"] = changed_scope
        right["qualification_ref"]["scope"] = changed_scope
        qualification["ref"]["scope"] = changed_scope
        qualification["subject_ref"] = copy.deepcopy(right["ref"])
        qualification["applicable_scope"] = changed_scope
        root_ref = qualification["root_ref"]
        root_ref["scope"] = changed_scope
        for root in raw["qualification_roots"]:
            if root.get("identity") == root_ref.get("identity"):
                root["scope"] = changed_scope
        left = next(source for source in raw["sources"]
                    if isinstance(source.get("content"), dict)
                    and source["content"].get("compatibility_record_ref") == record["ref"])
        left_body = copy.deepcopy(left["content"])
        left_body["counterpart_source_ref"] = copy.deepcopy(right["ref"])
        _write_source_content(raw, right, right["content"])
        record["source_ref"] = copy.deepcopy(right["ref"])
        left_body["counterpart_source_ref"] = copy.deepcopy(right["ref"])
        _write_source_content(raw, left, left_body)
        self.assertNotEqual(old_ref["scope"], right["ref"]["scope"])

        result = self._call(raw)
        pack_rows = self._axis(result, "pack.identity")
        self.assertTrue(any(row["state"] == "conflict" and "actual_scope_differs" in row["reason"]
                            for row in pack_rows))
        compatibility = self._axis(result, "compatibility")[0]
        self.assertEqual(compatibility["state"], "conflict")
        self.assertTrue(compatibility["reason"].startswith("scope\n"))

        raw = trace_input("positive")
        other_scope = "synthetic-known-different-scope"
        for slot in raw["descriptors"]:
            _set_scope_on_binding(slot["binding"], other_scope)
            for fact in slot.get("facts", []):
                if isinstance(fact.get("binding"), dict):
                    _set_scope_on_binding(fact["binding"], other_scope)
        for source in raw["sources"]:
            content = source.get("content")
            if not isinstance(content, dict):
                continue
            if isinstance(content.get("binding"), dict):
                _set_scope_on_binding(content["binding"], other_scope)
            for group in content.get("descriptor_facts", []):
                for fact in group.get("facts", []) if isinstance(group, dict) else []:
                    if isinstance(fact.get("binding"), dict):
                        _set_scope_on_binding(fact["binding"], other_scope)
        _refresh_source_bytes(raw)
        result = self._call(raw)
        traces = self._axis(result, "descriptor.trace")
        self.assertEqual(len(traces), 15)
        self.assertTrue(all(row["state"] == "conflict" and "scope_differs" in row["reason"]
                            for row in traces))

    def test_unobserved_scope_stays_unknown_in_trace_bilateral_and_actual_reads(self):
        raw = trace_input("positive")
        for slot in raw["descriptors"]:
            _set_scope_on_binding(slot["binding"], None)
            for fact in slot.get("facts", []):
                if isinstance(fact.get("binding"), dict):
                    _set_scope_on_binding(fact["binding"], None)
        for source in raw["sources"]:
            content = source.get("content")
            if not isinstance(content, dict):
                continue
            if isinstance(content.get("binding"), dict):
                _set_scope_on_binding(content["binding"], None)
            for group in content.get("descriptor_facts", []):
                for fact in group.get("facts", []) if isinstance(group, dict) else []:
                    if isinstance(fact.get("binding"), dict):
                        _set_scope_on_binding(fact["binding"], None)
        _refresh_source_bytes(raw)
        traces = self._axis(self._call(raw), "descriptor.trace")
        self.assertEqual(len(traces), 15)
        self.assertTrue(all(row["state"] == "unknown" for row in traces))

        raw = bilateral_input("positive")
        raw["binding"]["template_ref"]["scope"] = None
        compatibility = self._axis(self._call(raw), "compatibility")[0]
        self.assertEqual(compatibility["state"], "unknown")
        self.assertTrue(compatibility["reason"].startswith("scope_unresolved\n"))

        # A null target pack frame cannot join the existing full-Ref range declaration.
        # L4 therefore leaves the pack actual read unknown; this case does not claim an
        # actual_scope_unresolved row when the source/target full-Ref join itself is absent.
        raw = bilateral_input("outside")
        raw["binding"]["pack_ref"]["scope"] = None
        pack_identity = self._axis(self._call(raw), "pack.identity")[0]
        self.assertEqual(pack_identity["state"], "unknown")

    def test_actual_null_and_out_of_type_operands_never_become_known_difference(self):
        # The qualified RangeDeclaration remains formed; the original binding operand
        # is explicitly null, so L4 finite_branch_order requires unknown/input_member_null.
        raw = bilateral_input("outside")
        raw["binding"]["pack_artifact_version"] = None
        result = self._call(raw)
        artifact = self._axis(result, "pack.artifact_version")[0]
        self.assertEqual(artifact["state"], "unknown")
        self.assertIn('"cause":"input_member_null"', artifact["reason"])

        # actual_artifact_version itself must be a string for the closed L4
        # RangeDeclaration. Null therefore prevents candidate formation. Observe only
        # the public unknown and do not claim a typed actual_operand/cause was read.
        raw = bilateral_input("outside")
        record = raw["compatibility_records"][0]
        right = next(source for source in raw["sources"] if source.get("ref") == record["source_ref"])
        body = copy.deepcopy(right["content"])
        body["compatibility_range_declaration"]["actual_artifact_version"] = None
        old_ref = copy.deepcopy(right["ref"])
        _write_source_content(raw, right, body)
        record["source_ref"] = copy.deepcopy(right["ref"])
        left = next(source for source in raw["sources"]
                    if isinstance(source.get("content"), dict)
                    and source["content"].get("counterpart_source_ref") == old_ref)
        left_body = copy.deepcopy(left["content"])
        left_body["counterpart_source_ref"] = copy.deepcopy(right["ref"])
        _write_source_content(raw, left, left_body)
        artifact = self._axis(self._call(raw), "pack.artifact_version")[0]
        self.assertEqual(artifact["state"], "unknown")


if __name__ == "__main__":
    unittest.main()

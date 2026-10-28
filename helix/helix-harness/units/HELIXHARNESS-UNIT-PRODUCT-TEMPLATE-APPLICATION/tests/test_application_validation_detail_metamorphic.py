"""Metamorphic identity-renaming checks for native FN0 validation detail."""

from __future__ import annotations

import copy
from pathlib import Path
import sys
import unittest

UNIT_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(UNIT_ROOT / "src"))
sys.path.insert(0, str(UNIT_ROOT / "tests"))

import application_validation
from test_application_input import _fixture_normal_input


def _rename_raw_identities(value, mapping):
    if isinstance(value, dict):
        return {
            key: mapping.get(child, child)
            if key == "identity" and isinstance(child, str)
            else _rename_raw_identities(child, mapping)
            for key, child in value.items()
        }
    if isinstance(value, list):
        return [_rename_raw_identities(child, mapping) for child in value]
    return copy.deepcopy(value)


def _normalize_return_identities(value, mapping):
    if isinstance(value, dict):
        return {
            key: _normalize_return_identities(child, mapping)
            for key, child in value.items()
        }
    if isinstance(value, list):
        return [_normalize_return_identities(child, mapping) for child in value]
    if isinstance(value, str):
        return mapping.get(value, value)
    return copy.deepcopy(value)


class TestValidationDetailIdentityRenaming(unittest.TestCase):
    def test_consistent_opaque_root_identity_renaming_preserves_detail(self):
        raw = _fixture_normal_input()
        original = copy.deepcopy(raw)
        root_ids = {
            root["identity"]
            for root in raw["qualification_roots"]
            if isinstance(root, dict) and isinstance(root.get("identity"), str)
        }
        qualification_root_ids = {
            qualification["root_ref"]["identity"]
            for qualification in raw["qualifications"]
            if isinstance(qualification, dict)
            and isinstance(qualification.get("root_ref"), dict)
            and isinstance(qualification["root_ref"].get("identity"), str)
        }
        linked_ids = root_ids & qualification_root_ids
        self.assertTrue(linked_ids)

        mapping = {
            identity: f"metamorphic-root-identity-{index}"
            for index, identity in enumerate(sorted(linked_ids))
        }
        renamed_raw = _rename_raw_identities(raw, mapping)
        self.assertNotEqual(raw, renamed_raw)
        self.assertEqual(raw, original)

        detail = application_validation.validate_application_input_detail
        original_return = detail({"tag": "native", "raw": raw})
        renamed_return = detail({"tag": "native", "raw": renamed_raw})

        self.assertEqual(
            _normalize_return_identities(original_return, mapping),
            renamed_return,
        )
        self.assertEqual(raw, original)
        self.assertEqual(
            renamed_raw,
            _rename_raw_identities(raw, mapping),
        )


if __name__ == "__main__":
    unittest.main()

"""Fixed, source-bound Stage 1 local L7 unittest runner.

The embedded inventory is reviewed configuration. This process runs only inside
runner.py's sandbox; stdout is a bounded, untrusted result frame for the parent.
"""
from __future__ import annotations
import contextlib
import ast
import importlib.util
import io
import json
from pathlib import Path
import re
import sys
import unittest

try:
    from .common import Diagnostic, canonical_bytes, sha256
except ImportError:  # pragma: no cover - direct fixed argv entrypoint
    from common import Diagnostic, canonical_bytes, sha256

SUITE_ID = "stage1-l7-source"
CORE_SUITE_ID = "common-kernel-k1-k2-k3-k5-k6"
CURRENT_DESIGN_PATHS = (
    "docs/helix-harness/L6-function-design/common-kernel.md",
    "docs/helix-harness/L7-unit-test-design/common-kernel-unit-test-design.md",
)
SOURCE_SHA256 = {'helix/helix-harness/units/common-kernel/src/common_kernel.py': 'ce9c7a87cd318c2ff5d12f68c71129f6ad99f0b78616f89c501ccdd2c4643178', 'helix/helix-harness/units/common-kernel/src/journal.py': '78dba87db2b55cb349ed8fbc5d0483cdb933a8cce4d45e910c5f9cbcaefeb907', 'helix/helix-harness/units/common-kernel/src/permission.py': '6a2f3b0d82dd38b03a4b27b2f98ed58217286eb9912c6a984a6a5549ac6c9f8b', 'helix/helix-harness/units/common-kernel/src/verification.py': '173c885b4b2400cf7479d7cabeabd14b65bfc8b2a025b6256d6463c52f5f958c', 'helix/helix-harness/units/common-kernel/tests/test_k1.py': 'da847ab19a9c3fa0df17c360bc489c9da2470f53d3ee6487ea0e822905e561ff', 'helix/helix-harness/units/common-kernel/tests/test_k2.py': '3b1a6ede6642292ef31e458ca519bc293917da5e4654f85eda9ccf4a350d1582', 'helix/helix-harness/units/common-kernel/tests/test_k3.py': '1dd8ff995c40e428e6952f607731f3215c3a44785a8b4f0b0ff6c7c340a2c62a', 'helix/helix-harness/units/common-kernel/tests/test_k5.py': 'c7d3dcedec9e63a1beb364147036135ae966c4330241f236f9842686e9134574', 'helix/helix-harness/units/common-kernel/tests/test_k6.py': '3d6e6a873cdc80ac7ba7810a5b94d6b104e2d54b8523a8e01da0c80cf6fdda86'}
SUPPLEMENTAL_SOURCE_SHA256 = {
    "helix/helix-brain/units/stage1-brain/src/brain.py": "b2b856c3073d7a51e594362de3eaff9af7b76b6e9af6633fd214d2f3e8a05cce",
    "helix/helix-brain/units/stage1-brain/tests/test_brain.py": "18ebfeaedc496c37adc0f000f472e8eb00b83f774cc05504be5259feb177a42f",
    "helix/helix-labo/units/stage1-labo/src/projection.py": "5c61fe620c35eeb2786b740ccd37086e0e81bdf797a95cbf9588c585537ab60a",
    "helix/helix-labo/units/stage1-labo/tests/test_projection.py": "a60abe0042543a6bceedbff4f284356dc2d2c347343ba6469423e1dd26b9613c",
    "helix/helix-harness/units/harness-stage1/src/stage1_pack.py": "2a6db3be14fe2d094a3947c36b4e911708d0ec95c6bcd59bec4ffd338e088c5d",
    "helix/helix-harness/units/harness-stage1/tests/test_stage1_pack.py": "4ea1ee6a0056fba259298ce935f981dcfbef0dc00c296971b25cbc2806138d88",
    "helix/helix-infrastructure/units/infrastructure-stage1/src/infrastructure.py": "7bd177a70a01edd1adb439df290ef0c7d7d37940bff2072532eee28bd8ac7ffd",
    "helix/helix-infrastructure/units/infrastructure-stage1/tests/test_infrastructure.py": "e24e83f6dedf47202962687a9e00c70a85f9328e2587838a9ef349242e5add21",
}
SUPPLEMENTAL_DESIGN_PATHS = (
    "docs/helix-brain/L6-function-design/stage1-brain.md",
    "docs/helix-brain/L7-unit-test-design/stage1-brain-unit-test-design.md",
    "docs/helix-labo/L6-function-design/stage1-labo.md",
    "docs/helix-labo/L7-unit-test-design/stage1-labo-unit-test-design.md",
    "docs/helix-harness/L6-function-design/stage1-harness.md",
    "docs/helix-harness/L7-unit-test-design/stage1-harness-unit-test-design.md",
    "docs/helix-infrastructure/L6-function-design/stage1-infrastructure.md",
    "docs/helix-infrastructure/L7-unit-test-design/stage1-infrastructure-unit-test-design.md",
)

# Fixed aliases are independent from the source module's importable name.
SUPPLEMENTAL_MODULES = (
    ("l7_sup_brain_test_brain", "helix/helix-brain/units/stage1-brain/tests/test_brain.py"),
    ("l7_sup_labo_test_projection", "helix/helix-labo/units/stage1-labo/tests/test_projection.py"),
    ("l7_sup_harness_test_stage1_pack", "helix/helix-harness/units/harness-stage1/tests/test_stage1_pack.py"),
    ("l7_sup_infra_test_infrastructure", "helix/helix-infrastructure/units/infrastructure-stage1/tests/test_infrastructure.py"),
)
FIXED_TEST_MODULES = (
    ("test_k1", "helix/helix-harness/units/common-kernel/tests/test_k1.py"),
    ("test_k2", "helix/helix-harness/units/common-kernel/tests/test_k2.py"),
    ("test_k3", "helix/helix-harness/units/common-kernel/tests/test_k3.py"),
    ("test_k5", "helix/helix-harness/units/common-kernel/tests/test_k5.py"),
    ("test_k6", "helix/helix-harness/units/common-kernel/tests/test_k6.py"),
    *SUPPLEMENTAL_MODULES,
)
SUPPLEMENTAL_IDENTITIES = (
    ("SUP-BRAIN-001", "BRAIN", "l7_sup_brain_test_brain", "BrainProjectionTests.test_trace_source_projects_each_declared_field_and_keeps_owner_roles"),
    ("SUP-BRAIN-002", "BRAIN", "l7_sup_brain_test_brain", "BrainProjectionTests.test_trace_source_preserves_k1_variants_without_reclassifying_other_fields"),
    ("SUP-BRAIN-003", "BRAIN", "l7_sup_brain_test_brain", "BrainProjectionTests.test_trace_source_keeps_owner_observations_in_their_own_fields"),
    ("SUP-BRAIN-004", "BRAIN", "l7_sup_brain_test_brain", "BrainKnowledgeLookupTests.test_read_knowledge_returns_exact_k2_lookup_value"),
    ("SUP-BRAIN-005", "BRAIN", "l7_sup_brain_test_brain", "BrainKnowledgeLookupTests.test_read_knowledge_preserves_k2_no_match"),
    ("SUP-BRAIN-006", "BRAIN", "l7_sup_brain_test_brain", "BrainKnowledgeLookupTests.test_read_knowledge_preserves_saved_unknown_observation"),
    ("SUP-BRAIN-007", "BRAIN", "l7_sup_brain_test_brain", "BrainKnowledgeLookupTests.test_read_knowledge_keeps_nested_version_unknown_in_record_value"),
    ("SUP-BRAIN-008", "BRAIN", "l7_sup_brain_test_brain", "BrainKnowledgeLookupTests.test_read_knowledge_keeps_nested_state_unknown_in_record_value"),
    ("SUP-BRAIN-009", "BRAIN", "l7_sup_brain_test_brain", "BrainKnowledgeLookupTests.test_read_knowledge_keeps_each_declared_state_payload"),
    ("SUP-BRAIN-010", "BRAIN", "l7_sup_brain_test_brain", "BrainKnowledgeLookupTests.test_read_knowledge_preserves_prior_value_as_k2_stale"),
    ("SUP-BRAIN-011", "BRAIN", "l7_sup_brain_test_brain", "BrainKnowledgeLookupTests.test_read_knowledge_preserves_prior_nonvalue_as_k2_unobserved"),
    ("SUP-BRAIN-012", "BRAIN", "l7_sup_brain_test_brain", "BrainKnowledgeLookupTests.test_read_knowledge_preserves_same_key_content_conflict"),
    ("SUP-BRAIN-013", "BRAIN", "l7_sup_brain_test_brain", "BrainKnowledgeLookupTests.test_read_knowledge_does_not_mutate_restored_records"),
    ("SUP-LABO-001", "LABO", "l7_sup_labo_test_projection", "PrivateProjectionTests.test_all_twenty_fields_are_retained_without_value_interpretation"),
    ("SUP-LABO-002", "LABO", "l7_sup_labo_test_projection", "PrivateProjectionTests.test_each_single_missing_field_is_local_and_does_not_mutate_input"),
    ("SUP-LABO-003", "LABO", "l7_sup_labo_test_projection", "PrivateProjectionTests.test_all_seven_declared_status_values_are_preserved_separately"),
    ("SUP-LABO-004", "LABO", "l7_sup_labo_test_projection", "PrivateProjectionTests.test_episode_candidate_shape_retains_refs_and_relation_only"),
    ("SUP-HARNESS-001", "HARNESS", "l7_sup_harness_test_stage1_pack", "PrivatePackComparisonTests.test_exact_ref_baseline_is_match_and_retains_all_refs"),
    ("SUP-HARNESS-002", "HARNESS", "l7_sup_harness_test_stage1_pack", "PrivatePackComparisonTests.test_single_revision_mutation_is_domain_mismatch"),
    ("SUP-HARNESS-003", "HARNESS", "l7_sup_harness_test_stage1_pack", "PrivatePackComparisonTests.test_explicit_fields_keep_order_and_detect_one_mutation"),
    ("SUP-HARNESS-004", "HARNESS", "l7_sup_harness_test_stage1_pack", "PrivatePackComparisonTests.test_explicit_missing_and_multiple_states_are_not_inferred"),
    ("SUP-HARNESS-005", "HARNESS", "l7_sup_harness_test_stage1_pack", "PrivatePackComparisonTests.test_existing_owner_nonvalue_is_returned_by_identity"),
    ("SUP-INFRA-001", "INFRA", "l7_sup_infra_test_infrastructure", "TestImplementedProjections.test_resource_projection_subset_preserves_baseline_and_unreadable_mutation"),
    ("SUP-INFRA-002", "INFRA", "l7_sup_infra_test_infrastructure", "TestImplementedProjections.test_resource_projection_subset_preserves_unseen_declared_role"),
    ("SUP-INFRA-003", "INFRA", "l7_sup_infra_test_infrastructure", "TestImplementedProjections.test_axis_pair_retains_values_and_unknown_without_comparison_class"),
    ("SUP-INFRA-004", "INFRA", "l7_sup_infra_test_infrastructure", "TestImplementedProjections.test_path_storage_projection_treats_owner_keys_as_opaque"),
    ("SUP-INFRA-005", "INFRA", "l7_sup_infra_test_infrastructure", "TestImplementedProjections.test_nfr_helper_counts_supplied_states_and_keeps_missing_denominator"),
)
SUPPLEMENTAL_IDS = tuple(row[0] for row in SUPPLEMENTAL_IDENTITIES)
SUPPLEMENTAL_IDS_SHA256 = "e5d71feabe981041144583fb0ee0f4754dd76d881e08fb44b48e5bf25d0b8239"
COMPOSITE_DISCOVERY_COUNT = 613
COMPOSITE_DISCOVERY_IDS_SHA256 = "739e4f7078047a1bd19eb3c77a723d9a85809cd82193c383d04bb365b4bce5de"
SUPPLEMENTAL_SOURCE_REFS = {
    "BRAIN": ("docs/helix-brain/L7-unit-test-design/stage1-brain-unit-test-design.md", 104, "UT-BRAIN-", (2,)),
    "LABO": ("docs/helix-labo/L7-unit-test-design/stage1-labo-unit-test-design.md", 83, "LABO-UT-", (3,)),
    "HARNESS": ("docs/helix-harness/L7-unit-test-design/stage1-harness-unit-test-design.md", 269, "UT-HARNESS-", (3,)),
    "INFRA": ("docs/helix-infrastructure/L7-unit-test-design/stage1-infrastructure-unit-test-design.md", 40, "INFRA-L7-", (3, 4)),
}
_FORMAL_LOCATOR_SHA256 = {
    "BRAIN": "6a464b3b832bbaa0ca149b8d1d9ecd96344ca5249dd3b5c1425e0fe8d30eede9",
    "LABO": "9ba1c0e0af3fb12c3591f613106e6eeb836c6410a4dae428e578c5900766d72c",
    "HARNESS": "e6adafc7253fca9021d752d32d40d93ee50b3cd7159f29e6e3b01c74e957e8e6",
    "INFRA": "d5296e1c9a61c32ffee1702259a3605d048c234feb88b60906f065d1d6546c50",
}
_LABO_NFR_REUSE_IDS = frozenset(f"LABO-UT-{number:03d}" for number in range(75, 80))
_LABO_NFR_ORACLE_IDS = frozenset({
    "IV-LABO-NFR-001-01", "IV-LABO-NFR-001-02", "IV-LABO-NFR-001-03",
    "IV-LABO-NFR-011-01", "IV-LABO-NFR-011-02",
})
_FIXED_L7_TABLE_HEADERS = {
    "BRAIN": {2: ("UT ID", "L8定義ID", "固定L9 oracle ID", "assertion境界・局所状態")},
    "LABO": {
        3: ("L7 ID", "L8定義ID", "索引種別", "API / comparator / 索引先",
            "L8 §5 coverage境界", "baseline・mutation・expectedの正本"),
        4: ("L9 oracle ID", "L7 case IDs / reuse index", "L8定義ID"),
    },
    "HARNESS": {3: ("L7 test ID", "既存L9 verifier", "L6関数ID", "L8 fixture ID",
                    "基準入力", "単一変異 / positive control", "型付き主結果",
                    "構造 / owner境界assertion")},
    "INFRA": {
        3: ("L7 test ID", "L9 verifier / L10 case", "L6関数", "unit fixtureで照合するoracle境界"),
        4: ("L7 test ID", "L9 verifier / L3 obligation", "L6関数", "unit fixtureで照合する範囲"),
    },
}
_FIXED_STATUS_TABLES = {
    "HARNESS": {
        7: {"header": ("固定対象", "実status", "実行・assert範囲"),
            "status_column": 1, "key_columns": (0,), "expected_rows": 3,
            "expected_keys": ("UT-HARNESS-001`〜`UT-HARNESS-269`（対応するL8 formal fixture 269件）",
                              "UT-HARNESS-SUP-001`〜`UT-HARNESS-SUP-010`（補助fixture 10件）",
                              "test_stage1_pack.PrivatePackComparisonTests` 5件")},
    },
    "INFRA": {
        5: {"header": ("L7 oracle ID", "L9 verifier", "L8 fixture ID",
                        "L6 function candidate", "L8 baseline / mutation",
                        "L8 expected result / field / owner", "実装候補区分（未実行）"),
            "status_column": 6, "owner_column": 5, "key_columns": (0, 1, 2),
            "expected_rows": 278},
        9: {"header": ("L8 fixture ID", "coverage", "実検査範囲または未接続理由"),
            "status_column": 1, "key_columns": (0,), "expected_rows": 248},
    },
}
_FIXED_SOURCE_CONTEXT_SECTIONS = {
    "BRAIN": (3, 6, 7), "LABO": (5, 6), "HARNESS": (5, 7),
    "INFRA": (5, 7, 8, 9),
}
_FIXED_BOUNDARY_TABLES = {
    "LABO": {3: {"header": _FIXED_L7_TABLE_HEADERS["LABO"][3], "column": 4,
                 "kind": "coverage_boundary", "expected_rows": 88,
                 "id_digest": "669ecaa27c434743fd348b8cb88f5340556a0419d54d2a80701ffe37dae4a270"}},
    "HARNESS": {3: {"header": _FIXED_L7_TABLE_HEADERS["HARNESS"][3], "column": 7,
                    "kind": "owner_boundary_assertion", "expected_rows": 269,
                    "id_digest": _FORMAL_LOCATOR_SHA256["HARNESS"]}},
}
FORMAL_MAPPING = ({'callable_qualname': 'K1UnitTests.test_CK_K1_UT_001',
  'coverage_kind': 'primary_callable',
  'formal_l7_id': 'CK-K1-UT-001',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k1.py',
  'unittest_identity': 'test_k1.K1UnitTests.test_CK_K1_UT_001'},
 {'callable_qualname': 'K1UnitTests.test_CK_K1_UT_002_ADMIT_INCONSISTENT',
  'coverage_kind': 'primary_callable',
  'formal_l7_id': 'CK-K1-UT-002-ADMIT-INCONSISTENT',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k1.py',
  'unittest_identity': 'test_k1.K1UnitTests.test_CK_K1_UT_002_ADMIT_INCONSISTENT'},
 {'callable_qualname': 'K1UnitTests.test_CK_K1_UT_002a',
  'coverage_kind': 'primary_callable',
  'formal_l7_id': 'CK-K1-UT-002a',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k1.py',
  'unittest_identity': 'test_k1.K1UnitTests.test_CK_K1_UT_002a'},
 {'callable_qualname': 'K1UnitTests.test_CK_K1_UT_002b',
  'coverage_kind': 'primary_callable',
  'formal_l7_id': 'CK-K1-UT-002b',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k1.py',
  'unittest_identity': 'test_k1.K1UnitTests.test_CK_K1_UT_002b'},
 {'callable_qualname': 'K1UnitTests.test_CK_K1_UT_002c',
  'coverage_kind': 'primary_callable',
  'formal_l7_id': 'CK-K1-UT-002c',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k1.py',
  'unittest_identity': 'test_k1.K1UnitTests.test_CK_K1_UT_002c'},
 {'callable_qualname': 'K1UnitTests.test_CK_K1_UT_003',
  'coverage_kind': 'primary_callable',
  'formal_l7_id': 'CK-K1-UT-003',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k1.py',
  'unittest_identity': 'test_k1.K1UnitTests.test_CK_K1_UT_003'},
 {'callable_qualname': 'K1UnitTests.test_CK_K1_UT_004',
  'coverage_kind': 'primary_callable',
  'formal_l7_id': 'CK-K1-UT-004',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k1.py',
  'unittest_identity': 'test_k1.K1UnitTests.test_CK_K1_UT_004'},
 {'callable_qualname': 'K1UnitTests.test_CK_K1_UT_005a',
  'coverage_kind': 'primary_callable',
  'formal_l7_id': 'CK-K1-UT-005a',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k1.py',
  'unittest_identity': 'test_k1.K1UnitTests.test_CK_K1_UT_005a'},
 {'callable_qualname': 'K1UnitTests.test_CK_K1_UT_005b',
  'coverage_kind': 'primary_callable',
  'formal_l7_id': 'CK-K1-UT-005b',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k1.py',
  'unittest_identity': 'test_k1.K1UnitTests.test_CK_K1_UT_005b'},
 {'callable_qualname': 'K1UnitTests.test_CK_K1_UT_006',
  'coverage_kind': 'owner_or_fixture_stub',
  'formal_l7_id': 'CK-K1-UT-006',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k1.py',
  'unittest_identity': 'test_k1.K1UnitTests.test_CK_K1_UT_006'},
 {'callable_qualname': 'K1UnitTests.test_CK_K1_UT_007a',
  'coverage_kind': 'primary_callable',
  'formal_l7_id': 'CK-K1-UT-007a',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k1.py',
  'unittest_identity': 'test_k1.K1UnitTests.test_CK_K1_UT_007a'},
 {'callable_qualname': 'K1UnitTests.test_CK_K1_UT_007b',
  'coverage_kind': 'primary_callable',
  'formal_l7_id': 'CK-K1-UT-007b',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k1.py',
  'unittest_identity': 'test_k1.K1UnitTests.test_CK_K1_UT_007b'},
 {'callable_qualname': 'K1UnitTests.test_CK_K1_UT_007c',
  'coverage_kind': 'primary_callable',
  'formal_l7_id': 'CK-K1-UT-007c',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k1.py',
  'unittest_identity': 'test_k1.K1UnitTests.test_CK_K1_UT_007c'},
 {'callable_qualname': 'K1UnitTests.test_CK_K1_UT_008_invalid_not_applicable_is_nonvalue',
  'coverage_kind': 'primary_callable',
  'formal_l7_id': 'CK-K1-UT-008-INVALID-NA',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k1.py',
  'unittest_identity': 'test_k1.K1UnitTests.test_CK_K1_UT_008_invalid_not_applicable_is_nonvalue'},
 {'callable_qualname': 'K1UnitTests.test_CK_K1_UT_008a',
  'coverage_kind': 'primary_callable',
  'formal_l7_id': 'CK-K1-UT-008a',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k1.py',
  'unittest_identity': 'test_k1.K1UnitTests.test_CK_K1_UT_008a'},
 {'callable_qualname': 'K1UnitTests.test_CK_K1_UT_008b',
  'coverage_kind': 'primary_callable',
  'formal_l7_id': 'CK-K1-UT-008b',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k1.py',
  'unittest_identity': 'test_k1.K1UnitTests.test_CK_K1_UT_008b'},
 {'callable_qualname': 'K1UnitTests.test_CK_K1_UT_008c',
  'coverage_kind': 'primary_callable',
  'formal_l7_id': 'CK-K1-UT-008c',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k1.py',
  'unittest_identity': 'test_k1.K1UnitTests.test_CK_K1_UT_008c'},
 {'callable_qualname': 'K1UnitTests.test_CK_K1_UT_009_ACCEPT_COMBINE_NotApplicable',
  'coverage_kind': 'primary_callable',
  'formal_l7_id': 'CK-K1-UT-009-ACCEPT-COMBINE-NotApplicable',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k1.py',
  'unittest_identity': 'test_k1.K1UnitTests.test_CK_K1_UT_009_ACCEPT_COMBINE_NotApplicable'},
 {'callable_qualname': 'K1UnitTests.test_CK_K1_UT_009_ACCEPT_COMBINE_Stale',
  'coverage_kind': 'primary_callable',
  'formal_l7_id': 'CK-K1-UT-009-ACCEPT-COMBINE-Stale',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k1.py',
  'unittest_identity': 'test_k1.K1UnitTests.test_CK_K1_UT_009_ACCEPT_COMBINE_Stale'},
 {'callable_qualname': 'K1UnitTests.test_CK_K1_UT_009_ACCEPT_COMBINE_Unknown',
  'coverage_kind': 'primary_callable',
  'formal_l7_id': 'CK-K1-UT-009-ACCEPT-COMBINE-Unknown',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k1.py',
  'unittest_identity': 'test_k1.K1UnitTests.test_CK_K1_UT_009_ACCEPT_COMBINE_Unknown'},
 {'callable_qualname': 'K1UnitTests.test_CK_K1_UT_009_ACCEPT_COMBINE_Unobserved',
  'coverage_kind': 'primary_callable',
  'formal_l7_id': 'CK-K1-UT-009-ACCEPT-COMBINE-Unobserved',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k1.py',
  'unittest_identity': 'test_k1.K1UnitTests.test_CK_K1_UT_009_ACCEPT_COMBINE_Unobserved'},
 {'callable_qualname': 'K1UnitTests.test_CK_K1_UT_009_ACCEPT_COMBINE_Value',
  'coverage_kind': 'primary_callable',
  'formal_l7_id': 'CK-K1-UT-009-ACCEPT-COMBINE-Value',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k1.py',
  'unittest_identity': 'test_k1.K1UnitTests.test_CK_K1_UT_009_ACCEPT_COMBINE_Value'},
 {'callable_qualname': 'K1UnitTests.test_CK_K1_UT_009_ACCEPT_RECORD_NotApplicable',
  'coverage_kind': 'primary_callable',
  'formal_l7_id': 'CK-K1-UT-009-ACCEPT-RECORD-NotApplicable',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k1.py',
  'unittest_identity': 'test_k1.K1UnitTests.test_CK_K1_UT_009_ACCEPT_RECORD_NotApplicable'},
 {'callable_qualname': 'K1UnitTests.test_CK_K1_UT_009_ACCEPT_RECORD_Unknown',
  'coverage_kind': 'primary_callable',
  'formal_l7_id': 'CK-K1-UT-009-ACCEPT-RECORD-Unknown',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k1.py',
  'unittest_identity': 'test_k1.K1UnitTests.test_CK_K1_UT_009_ACCEPT_RECORD_Unknown'},
 {'callable_qualname': 'K1UnitTests.test_CK_K1_UT_009_ACCEPT_RECORD_Unobserved',
  'coverage_kind': 'primary_callable',
  'formal_l7_id': 'CK-K1-UT-009-ACCEPT-RECORD-Unobserved',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k1.py',
  'unittest_identity': 'test_k1.K1UnitTests.test_CK_K1_UT_009_ACCEPT_RECORD_Unobserved'},
 {'callable_qualname': 'K1UnitTests.test_CK_K1_UT_009_ACCEPT_RECORD_Value',
  'coverage_kind': 'primary_callable',
  'formal_l7_id': 'CK-K1-UT-009-ACCEPT-RECORD-Value',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k1.py',
  'unittest_identity': 'test_k1.K1UnitTests.test_CK_K1_UT_009_ACCEPT_RECORD_Value'},
 {'callable_qualname': 'K1UnitTests.test_CK_K1_UT_009_KEY_COMBINE_NotApplicable',
  'coverage_kind': 'primary_callable',
  'formal_l7_id': 'CK-K1-UT-009-KEY-COMBINE-NotApplicable',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k1.py',
  'unittest_identity': 'test_k1.K1UnitTests.test_CK_K1_UT_009_KEY_COMBINE_NotApplicable'},
 {'callable_qualname': 'K1UnitTests.test_CK_K1_UT_009_KEY_COMBINE_Stale',
  'coverage_kind': 'primary_callable',
  'formal_l7_id': 'CK-K1-UT-009-KEY-COMBINE-Stale',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k1.py',
  'unittest_identity': 'test_k1.K1UnitTests.test_CK_K1_UT_009_KEY_COMBINE_Stale'},
 {'callable_qualname': 'K1UnitTests.test_CK_K1_UT_009_KEY_COMBINE_Unknown',
  'coverage_kind': 'primary_callable',
  'formal_l7_id': 'CK-K1-UT-009-KEY-COMBINE-Unknown',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k1.py',
  'unittest_identity': 'test_k1.K1UnitTests.test_CK_K1_UT_009_KEY_COMBINE_Unknown'},
 {'callable_qualname': 'K1UnitTests.test_CK_K1_UT_009_KEY_COMBINE_Unobserved',
  'coverage_kind': 'primary_callable',
  'formal_l7_id': 'CK-K1-UT-009-KEY-COMBINE-Unobserved',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k1.py',
  'unittest_identity': 'test_k1.K1UnitTests.test_CK_K1_UT_009_KEY_COMBINE_Unobserved'},
 {'callable_qualname': 'K1UnitTests.test_CK_K1_UT_009_KEY_COMBINE_Value',
  'coverage_kind': 'primary_callable',
  'formal_l7_id': 'CK-K1-UT-009-KEY-COMBINE-Value',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k1.py',
  'unittest_identity': 'test_k1.K1UnitTests.test_CK_K1_UT_009_KEY_COMBINE_Value'},
 {'callable_qualname': 'K1UnitTests.test_CK_K1_UT_009_KEY_LOOKUP',
  'coverage_kind': 'primary_callable',
  'formal_l7_id': 'CK-K1-UT-009-KEY-LOOKUP',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k1.py',
  'unittest_identity': 'test_k1.K1UnitTests.test_CK_K1_UT_009_KEY_LOOKUP'},
 {'callable_qualname': 'K1UnitTests.test_CK_K1_UT_009_KEY_RECORD',
  'coverage_kind': 'primary_callable',
  'formal_l7_id': 'CK-K1-UT-009-KEY-RECORD',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k1.py',
  'unittest_identity': 'test_k1.K1UnitTests.test_CK_K1_UT_009_KEY_RECORD'},
 {'callable_qualname': 'K1UnitTests.test_CK_K1_UT_009_LOOKUP_NotApplicable',
  'coverage_kind': 'primary_callable',
  'formal_l7_id': 'CK-K1-UT-009-LOOKUP-NotApplicable',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k1.py',
  'unittest_identity': 'test_k1.K1UnitTests.test_CK_K1_UT_009_LOOKUP_NotApplicable'},
 {'callable_qualname': 'K1UnitTests.test_CK_K1_UT_009_LOOKUP_Unknown',
  'coverage_kind': 'primary_callable',
  'formal_l7_id': 'CK-K1-UT-009-LOOKUP-Unknown',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k1.py',
  'unittest_identity': 'test_k1.K1UnitTests.test_CK_K1_UT_009_LOOKUP_Unknown'},
 {'callable_qualname': 'K1UnitTests.test_CK_K1_UT_009_LOOKUP_Unobserved',
  'coverage_kind': 'primary_callable',
  'formal_l7_id': 'CK-K1-UT-009-LOOKUP-Unobserved',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k1.py',
  'unittest_identity': 'test_k1.K1UnitTests.test_CK_K1_UT_009_LOOKUP_Unobserved'},
 {'callable_qualname': 'K1UnitTests.test_CK_K1_UT_009_LOOKUP_Value',
  'coverage_kind': 'primary_callable',
  'formal_l7_id': 'CK-K1-UT-009-LOOKUP-Value',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k1.py',
  'unittest_identity': 'test_k1.K1UnitTests.test_CK_K1_UT_009_LOOKUP_Value'},
 {'callable_qualname': 'K1UnitTests.test_CK_K1_UT_009_STALE_LOOKUP',
  'coverage_kind': 'primary_callable',
  'formal_l7_id': 'CK-K1-UT-009-STALE-LOOKUP',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k1.py',
  'unittest_identity': 'test_k1.K1UnitTests.test_CK_K1_UT_009_STALE_LOOKUP'},
 {'callable_qualname': 'K1UnitTests.test_CK_K1_UT_009_STALE_RECORD',
  'coverage_kind': 'primary_callable',
  'formal_l7_id': 'CK-K1-UT-009-STALE-RECORD',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k1.py',
  'unittest_identity': 'test_k1.K1UnitTests.test_CK_K1_UT_009_STALE_RECORD'},
 {'callable_qualname': 'K1UnitTests.test_CK_K1_UT_010_COMPLETE',
  'coverage_kind': 'owner_or_fixture_stub',
  'formal_l7_id': 'CK-K1-UT-010-COMPLETE',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k1.py',
  'unittest_identity': 'test_k1.K1UnitTests.test_CK_K1_UT_010_COMPLETE'},
 {'callable_qualname': 'K1UnitTests.test_CK_K1_UT_010_PARTIAL',
  'coverage_kind': 'owner_or_fixture_stub',
  'formal_l7_id': 'CK-K1-UT-010-PARTIAL',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k1.py',
  'unittest_identity': 'test_k1.K1UnitTests.test_CK_K1_UT_010_PARTIAL'},
 {'callable_qualname': 'K1UnitTests.test_CK_K1_UT_010_READ_FAIL',
  'coverage_kind': 'owner_or_fixture_stub',
  'formal_l7_id': 'CK-K1-UT-010-READ-FAIL',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k1.py',
  'unittest_identity': 'test_k1.K1UnitTests.test_CK_K1_UT_010_READ_FAIL'},
 {'callable_qualname': 'K1UnitTests.test_CK_K1_UT_011_projection_cannot_be_combined',
  'coverage_kind': 'primary_callable',
  'formal_l7_id': 'CK-K1-UT-011',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k1.py',
  'unittest_identity': 'test_k1.K1UnitTests.test_CK_K1_UT_011_projection_cannot_be_combined'},
 {'callable_qualname': 'K1UnitTests.test_CK_K1_UT_012_MAP_absent',
  'coverage_kind': 'owner_or_fixture_stub',
  'formal_l7_id': 'CK-K1-UT-012-MAP-absent',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k1.py',
  'unittest_identity': 'test_k1.K1UnitTests.test_CK_K1_UT_012_MAP_absent'},
 {'callable_qualname': 'K1UnitTests.test_CK_K1_UT_012_MAP_ambiguous',
  'coverage_kind': 'owner_or_fixture_stub',
  'formal_l7_id': 'CK-K1-UT-012-MAP-ambiguous',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k1.py',
  'unittest_identity': 'test_k1.K1UnitTests.test_CK_K1_UT_012_MAP_ambiguous'},
 {'callable_qualname': 'K1UnitTests.test_CK_K1_UT_012_MAP_conflict',
  'coverage_kind': 'owner_or_fixture_stub',
  'formal_l7_id': 'CK-K1-UT-012-MAP-conflict',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k1.py',
  'unittest_identity': 'test_k1.K1UnitTests.test_CK_K1_UT_012_MAP_conflict'},
 {'callable_qualname': 'K1UnitTests.test_CK_K1_UT_012_MAP_evaluation_error',
  'coverage_kind': 'owner_or_fixture_stub',
  'formal_l7_id': 'CK-K1-UT-012-MAP-evaluation_error',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k1.py',
  'unittest_identity': 'test_k1.K1UnitTests.test_CK_K1_UT_012_MAP_evaluation_error'},
 {'callable_qualname': 'K1UnitTests.test_CK_K1_UT_012_MAP_incompatible',
  'coverage_kind': 'owner_or_fixture_stub',
  'formal_l7_id': 'CK-K1-UT-012-MAP-incompatible',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k1.py',
  'unittest_identity': 'test_k1.K1UnitTests.test_CK_K1_UT_012_MAP_incompatible'},
 {'callable_qualname': 'K1UnitTests.test_CK_K1_UT_012_MAP_indeterminate',
  'coverage_kind': 'owner_or_fixture_stub',
  'formal_l7_id': 'CK-K1-UT-012-MAP-indeterminate',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k1.py',
  'unittest_identity': 'test_k1.K1UnitTests.test_CK_K1_UT_012_MAP_indeterminate'},
 {'callable_qualname': 'K1UnitTests.test_CK_K1_UT_012_MAP_mismatch',
  'coverage_kind': 'owner_or_fixture_stub',
  'formal_l7_id': 'CK-K1-UT-012-MAP-mismatch',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k1.py',
  'unittest_identity': 'test_k1.K1UnitTests.test_CK_K1_UT_012_MAP_mismatch'},
 {'callable_qualname': 'K1UnitTests.test_CK_K1_UT_012_MAP_not_applicable',
  'coverage_kind': 'owner_or_fixture_stub',
  'formal_l7_id': 'CK-K1-UT-012-MAP-not_applicable',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k1.py',
  'unittest_identity': 'test_k1.K1UnitTests.test_CK_K1_UT_012_MAP_not_applicable'},
 {'callable_qualname': 'K1UnitTests.test_CK_K1_UT_012_MAP_not_observed',
  'coverage_kind': 'owner_or_fixture_stub',
  'formal_l7_id': 'CK-K1-UT-012-MAP-not_observed',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k1.py',
  'unittest_identity': 'test_k1.K1UnitTests.test_CK_K1_UT_012_MAP_not_observed'},
 {'callable_qualname': 'K1UnitTests.test_CK_K1_UT_012_MAP_stale',
  'coverage_kind': 'owner_or_fixture_stub',
  'formal_l7_id': 'CK-K1-UT-012-MAP-stale',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k1.py',
  'unittest_identity': 'test_k1.K1UnitTests.test_CK_K1_UT_012_MAP_stale'},
 {'callable_qualname': 'K1UnitTests.test_CK_K1_UT_012_MAP_unknown',
  'coverage_kind': 'owner_or_fixture_stub',
  'formal_l7_id': 'CK-K1-UT-012-MAP-unknown',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k1.py',
  'unittest_identity': 'test_k1.K1UnitTests.test_CK_K1_UT_012_MAP_unknown'},
 {'callable_qualname': 'K1UnitTests.test_CK_K1_UT_012_MAP_unsupported',
  'coverage_kind': 'owner_or_fixture_stub',
  'formal_l7_id': 'CK-K1-UT-012-MAP-unsupported',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k1.py',
  'unittest_identity': 'test_k1.K1UnitTests.test_CK_K1_UT_012_MAP_unsupported'},
 {'callable_qualname': 'K1UnitTests.test_CK_K1_UT_012_MAP_未評価',
  'coverage_kind': 'owner_or_fixture_stub',
  'formal_l7_id': 'CK-K1-UT-012-MAP-未評価',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k1.py',
  'unittest_identity': 'test_k1.K1UnitTests.test_CK_K1_UT_012_MAP_未評価'},
 {'callable_qualname': 'K1UnitTests.test_CK_K1_UT_012_unregistered',
  'coverage_kind': 'owner_or_fixture_stub',
  'formal_l7_id': 'CK-K1-UT-012-UNREGISTERED',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k1.py',
  'unittest_identity': 'test_k1.K1UnitTests.test_CK_K1_UT_012_unregistered'},
 {'callable_qualname': 'K1UnitTests.test_CK_K1_UT_012_wrong_mapping_incompatible',
  'coverage_kind': 'owner_or_fixture_stub',
  'formal_l7_id': 'CK-K1-UT-012-WRONG-INCOMPATIBLE',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k1.py',
  'unittest_identity': 'test_k1.K1UnitTests.test_CK_K1_UT_012_wrong_mapping_incompatible'},
 {'callable_qualname': 'K1UnitTests.test_CK_K1_UT_012_wrong_mapping_mismatch',
  'coverage_kind': 'owner_or_fixture_stub',
  'formal_l7_id': 'CK-K1-UT-012-WRONG-MISMATCH',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k1.py',
  'unittest_identity': 'test_k1.K1UnitTests.test_CK_K1_UT_012_wrong_mapping_mismatch'},
 {'callable_qualname': 'K1UnitTests.test_CK_K1_UT_012_wrong_mapping_not_observed',
  'coverage_kind': 'owner_or_fixture_stub',
  'formal_l7_id': 'CK-K1-UT-012-WRONG-NOT-OBSERVED',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k1.py',
  'unittest_identity': 'test_k1.K1UnitTests.test_CK_K1_UT_012_wrong_mapping_not_observed'},
 {'callable_qualname': 'K1UnitTests.test_CK_K1_UT_013_input_digest_combine',
  'coverage_kind': 'primary_callable',
  'formal_l7_id': 'CK-K1-UT-013-input.digest-combine-component',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k1.py',
  'unittest_identity': 'test_k1.K1UnitTests.test_CK_K1_UT_013_input_digest_combine'},
 {'callable_qualname': 'K1UnitTests.test_CK_K1_UT_013_input_digest_lookup',
  'coverage_kind': 'primary_callable',
  'formal_l7_id': 'CK-K1-UT-013-input.digest-lookup-query',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k1.py',
  'unittest_identity': 'test_k1.K1UnitTests.test_CK_K1_UT_013_input_digest_lookup'},
 {'callable_qualname': 'K1UnitTests.test_CK_K1_UT_013_input_digest_record',
  'coverage_kind': 'primary_callable',
  'formal_l7_id': 'CK-K1-UT-013-input.digest-record-key',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k1.py',
  'unittest_identity': 'test_k1.K1UnitTests.test_CK_K1_UT_013_input_digest_record'},
 {'callable_qualname': 'K1UnitTests.test_CK_K1_UT_013_input_identity_combine',
  'coverage_kind': 'primary_callable',
  'formal_l7_id': 'CK-K1-UT-013-input.identity-combine-component',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k1.py',
  'unittest_identity': 'test_k1.K1UnitTests.test_CK_K1_UT_013_input_identity_combine'},
 {'callable_qualname': 'K1UnitTests.test_CK_K1_UT_013_input_identity_lookup',
  'coverage_kind': 'primary_callable',
  'formal_l7_id': 'CK-K1-UT-013-input.identity-lookup-query',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k1.py',
  'unittest_identity': 'test_k1.K1UnitTests.test_CK_K1_UT_013_input_identity_lookup'},
 {'callable_qualname': 'K1UnitTests.test_CK_K1_UT_013_input_identity_record',
  'coverage_kind': 'primary_callable',
  'formal_l7_id': 'CK-K1-UT-013-input.identity-record-key',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k1.py',
  'unittest_identity': 'test_k1.K1UnitTests.test_CK_K1_UT_013_input_identity_record'},
 {'callable_qualname': 'K1UnitTests.test_CK_K1_UT_013_input_kind_combine',
  'coverage_kind': 'primary_callable',
  'formal_l7_id': 'CK-K1-UT-013-input.kind-combine-component',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k1.py',
  'unittest_identity': 'test_k1.K1UnitTests.test_CK_K1_UT_013_input_kind_combine'},
 {'callable_qualname': 'K1UnitTests.test_CK_K1_UT_013_input_kind_lookup',
  'coverage_kind': 'primary_callable',
  'formal_l7_id': 'CK-K1-UT-013-input.kind-lookup-query',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k1.py',
  'unittest_identity': 'test_k1.K1UnitTests.test_CK_K1_UT_013_input_kind_lookup'},
 {'callable_qualname': 'K1UnitTests.test_CK_K1_UT_013_input_kind_record',
  'coverage_kind': 'primary_callable',
  'formal_l7_id': 'CK-K1-UT-013-input.kind-record-key',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k1.py',
  'unittest_identity': 'test_k1.K1UnitTests.test_CK_K1_UT_013_input_kind_record'},
 {'callable_qualname': 'K1UnitTests.test_CK_K1_UT_013_input_revision_combine',
  'coverage_kind': 'primary_callable',
  'formal_l7_id': 'CK-K1-UT-013-input.revision-combine-component',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k1.py',
  'unittest_identity': 'test_k1.K1UnitTests.test_CK_K1_UT_013_input_revision_combine'},
 {'callable_qualname': 'K1UnitTests.test_CK_K1_UT_013_input_revision_lookup',
  'coverage_kind': 'primary_callable',
  'formal_l7_id': 'CK-K1-UT-013-input.revision-lookup-query',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k1.py',
  'unittest_identity': 'test_k1.K1UnitTests.test_CK_K1_UT_013_input_revision_lookup'},
 {'callable_qualname': 'K1UnitTests.test_CK_K1_UT_013_input_revision_record',
  'coverage_kind': 'primary_callable',
  'formal_l7_id': 'CK-K1-UT-013-input.revision-record-key',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k1.py',
  'unittest_identity': 'test_k1.K1UnitTests.test_CK_K1_UT_013_input_revision_record'},
 {'callable_qualname': 'K1UnitTests.test_CK_K1_UT_013_inputs_combine',
  'coverage_kind': 'primary_callable',
  'formal_l7_id': 'CK-K1-UT-013-inputs-combine-component',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k1.py',
  'unittest_identity': 'test_k1.K1UnitTests.test_CK_K1_UT_013_inputs_combine'},
 {'callable_qualname': 'K1UnitTests.test_CK_K1_UT_013_inputs_lookup',
  'coverage_kind': 'primary_callable',
  'formal_l7_id': 'CK-K1-UT-013-inputs-lookup-query',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k1.py',
  'unittest_identity': 'test_k1.K1UnitTests.test_CK_K1_UT_013_inputs_lookup'},
 {'callable_qualname': 'K1UnitTests.test_CK_K1_UT_013_inputs_record',
  'coverage_kind': 'primary_callable',
  'formal_l7_id': 'CK-K1-UT-013-inputs-record-key',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k1.py',
  'unittest_identity': 'test_k1.K1UnitTests.test_CK_K1_UT_013_inputs_record'},
 {'callable_qualname': 'K1UnitTests.test_CK_K1_UT_013_operation_combine',
  'coverage_kind': 'primary_callable',
  'formal_l7_id': 'CK-K1-UT-013-operation-combine-component',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k1.py',
  'unittest_identity': 'test_k1.K1UnitTests.test_CK_K1_UT_013_operation_combine'},
 {'callable_qualname': 'K1UnitTests.test_CK_K1_UT_013_operation_lookup',
  'coverage_kind': 'primary_callable',
  'formal_l7_id': 'CK-K1-UT-013-operation-lookup-query',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k1.py',
  'unittest_identity': 'test_k1.K1UnitTests.test_CK_K1_UT_013_operation_lookup'},
 {'callable_qualname': 'K1UnitTests.test_CK_K1_UT_013_operation_record',
  'coverage_kind': 'primary_callable',
  'formal_l7_id': 'CK-K1-UT-013-operation-record-key',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k1.py',
  'unittest_identity': 'test_k1.K1UnitTests.test_CK_K1_UT_013_operation_record'},
 {'callable_qualname': 'K1UnitTests.test_CK_K1_UT_013_operation_version_combine',
  'coverage_kind': 'primary_callable',
  'formal_l7_id': 'CK-K1-UT-013-operation_version-combine-component',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k1.py',
  'unittest_identity': 'test_k1.K1UnitTests.test_CK_K1_UT_013_operation_version_combine'},
 {'callable_qualname': 'K1UnitTests.test_CK_K1_UT_013_operation_version_lookup',
  'coverage_kind': 'primary_callable',
  'formal_l7_id': 'CK-K1-UT-013-operation_version-lookup-query',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k1.py',
  'unittest_identity': 'test_k1.K1UnitTests.test_CK_K1_UT_013_operation_version_lookup'},
 {'callable_qualname': 'K1UnitTests.test_CK_K1_UT_013_operation_version_record',
  'coverage_kind': 'primary_callable',
  'formal_l7_id': 'CK-K1-UT-013-operation_version-record-key',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k1.py',
  'unittest_identity': 'test_k1.K1UnitTests.test_CK_K1_UT_013_operation_version_record'},
 {'callable_qualname': 'K1UnitTests.test_CK_K1_UT_013_scope_combine',
  'coverage_kind': 'primary_callable',
  'formal_l7_id': 'CK-K1-UT-013-scope-combine-component',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k1.py',
  'unittest_identity': 'test_k1.K1UnitTests.test_CK_K1_UT_013_scope_combine'},
 {'callable_qualname': 'K1UnitTests.test_CK_K1_UT_013_scope_lookup',
  'coverage_kind': 'primary_callable',
  'formal_l7_id': 'CK-K1-UT-013-scope-lookup-query',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k1.py',
  'unittest_identity': 'test_k1.K1UnitTests.test_CK_K1_UT_013_scope_lookup'},
 {'callable_qualname': 'K1UnitTests.test_CK_K1_UT_013_scope_record',
  'coverage_kind': 'primary_callable',
  'formal_l7_id': 'CK-K1-UT-013-scope-record-key',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k1.py',
  'unittest_identity': 'test_k1.K1UnitTests.test_CK_K1_UT_013_scope_record'},
 {'callable_qualname': 'K1UnitTests.test_CK_K1_UT_013_subject_combine',
  'coverage_kind': 'primary_callable',
  'formal_l7_id': 'CK-K1-UT-013-subject-combine-component',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k1.py',
  'unittest_identity': 'test_k1.K1UnitTests.test_CK_K1_UT_013_subject_combine'},
 {'callable_qualname': 'K1UnitTests.test_CK_K1_UT_013_subject_lookup',
  'coverage_kind': 'primary_callable',
  'formal_l7_id': 'CK-K1-UT-013-subject-lookup-query',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k1.py',
  'unittest_identity': 'test_k1.K1UnitTests.test_CK_K1_UT_013_subject_lookup'},
 {'callable_qualname': 'K1UnitTests.test_CK_K1_UT_013_subject_record',
  'coverage_kind': 'primary_callable',
  'formal_l7_id': 'CK-K1-UT-013-subject-record-key',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k1.py',
  'unittest_identity': 'test_k1.K1UnitTests.test_CK_K1_UT_013_subject_record'},
 {'callable_qualname': 'K1UnitTests.test_CK_K1_UT_013_subject_digest_combine',
  'coverage_kind': 'primary_callable',
  'formal_l7_id': 'CK-K1-UT-013-subject.digest-combine-component',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k1.py',
  'unittest_identity': 'test_k1.K1UnitTests.test_CK_K1_UT_013_subject_digest_combine'},
 {'callable_qualname': 'K1UnitTests.test_CK_K1_UT_013_subject_digest_lookup',
  'coverage_kind': 'primary_callable',
  'formal_l7_id': 'CK-K1-UT-013-subject.digest-lookup-query',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k1.py',
  'unittest_identity': 'test_k1.K1UnitTests.test_CK_K1_UT_013_subject_digest_lookup'},
 {'callable_qualname': 'K1UnitTests.test_CK_K1_UT_013_subject_digest_record',
  'coverage_kind': 'primary_callable',
  'formal_l7_id': 'CK-K1-UT-013-subject.digest-record-key',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k1.py',
  'unittest_identity': 'test_k1.K1UnitTests.test_CK_K1_UT_013_subject_digest_record'},
 {'callable_qualname': 'K1UnitTests.test_CK_K1_UT_013_subject_identity_combine',
  'coverage_kind': 'primary_callable',
  'formal_l7_id': 'CK-K1-UT-013-subject.identity-combine-component',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k1.py',
  'unittest_identity': 'test_k1.K1UnitTests.test_CK_K1_UT_013_subject_identity_combine'},
 {'callable_qualname': 'K1UnitTests.test_CK_K1_UT_013_subject_identity_lookup',
  'coverage_kind': 'primary_callable',
  'formal_l7_id': 'CK-K1-UT-013-subject.identity-lookup-query',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k1.py',
  'unittest_identity': 'test_k1.K1UnitTests.test_CK_K1_UT_013_subject_identity_lookup'},
 {'callable_qualname': 'K1UnitTests.test_CK_K1_UT_013_subject_identity_record',
  'coverage_kind': 'primary_callable',
  'formal_l7_id': 'CK-K1-UT-013-subject.identity-record-key',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k1.py',
  'unittest_identity': 'test_k1.K1UnitTests.test_CK_K1_UT_013_subject_identity_record'},
 {'callable_qualname': 'K1UnitTests.test_CK_K1_UT_013_subject_kind_combine',
  'coverage_kind': 'primary_callable',
  'formal_l7_id': 'CK-K1-UT-013-subject.kind-combine-component',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k1.py',
  'unittest_identity': 'test_k1.K1UnitTests.test_CK_K1_UT_013_subject_kind_combine'},
 {'callable_qualname': 'K1UnitTests.test_CK_K1_UT_013_subject_kind_lookup',
  'coverage_kind': 'primary_callable',
  'formal_l7_id': 'CK-K1-UT-013-subject.kind-lookup-query',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k1.py',
  'unittest_identity': 'test_k1.K1UnitTests.test_CK_K1_UT_013_subject_kind_lookup'},
 {'callable_qualname': 'K1UnitTests.test_CK_K1_UT_013_subject_kind_record',
  'coverage_kind': 'primary_callable',
  'formal_l7_id': 'CK-K1-UT-013-subject.kind-record-key',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k1.py',
  'unittest_identity': 'test_k1.K1UnitTests.test_CK_K1_UT_013_subject_kind_record'},
 {'callable_qualname': 'K1UnitTests.test_CK_K1_UT_013_subject_revision_combine',
  'coverage_kind': 'primary_callable',
  'formal_l7_id': 'CK-K1-UT-013-subject.revision-combine-component',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k1.py',
  'unittest_identity': 'test_k1.K1UnitTests.test_CK_K1_UT_013_subject_revision_combine'},
 {'callable_qualname': 'K1UnitTests.test_CK_K1_UT_013_subject_revision_lookup',
  'coverage_kind': 'primary_callable',
  'formal_l7_id': 'CK-K1-UT-013-subject.revision-lookup-query',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k1.py',
  'unittest_identity': 'test_k1.K1UnitTests.test_CK_K1_UT_013_subject_revision_lookup'},
 {'callable_qualname': 'K1UnitTests.test_CK_K1_UT_013_subject_revision_record',
  'coverage_kind': 'primary_callable',
  'formal_l7_id': 'CK-K1-UT-013-subject.revision-record-key',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k1.py',
  'unittest_identity': 'test_k1.K1UnitTests.test_CK_K1_UT_013_subject_revision_record'},
 {'callable_qualname': 'K1UnitTests.test_CK_K1_UT_014_KEY_WHOLE',
  'coverage_kind': 'primary_callable',
  'formal_l7_id': 'CK-K1-UT-014-KEY-WHOLE',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k1.py',
  'unittest_identity': 'test_k1.K1UnitTests.test_CK_K1_UT_014_KEY_WHOLE'},
 {'callable_qualname': 'K1UnitTests.test_CK_K1_UT_014_KEY_input_digest',
  'coverage_kind': 'primary_callable',
  'formal_l7_id': 'CK-K1-UT-014-KEY-input.digest',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k1.py',
  'unittest_identity': 'test_k1.K1UnitTests.test_CK_K1_UT_014_KEY_input_digest'},
 {'callable_qualname': 'K1UnitTests.test_CK_K1_UT_014_KEY_input_identity',
  'coverage_kind': 'primary_callable',
  'formal_l7_id': 'CK-K1-UT-014-KEY-input.identity',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k1.py',
  'unittest_identity': 'test_k1.K1UnitTests.test_CK_K1_UT_014_KEY_input_identity'},
 {'callable_qualname': 'K1UnitTests.test_CK_K1_UT_014_KEY_input_kind',
  'coverage_kind': 'primary_callable',
  'formal_l7_id': 'CK-K1-UT-014-KEY-input.kind',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k1.py',
  'unittest_identity': 'test_k1.K1UnitTests.test_CK_K1_UT_014_KEY_input_kind'},
 {'callable_qualname': 'K1UnitTests.test_CK_K1_UT_014_KEY_input_revision',
  'coverage_kind': 'primary_callable',
  'formal_l7_id': 'CK-K1-UT-014-KEY-input.revision',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k1.py',
  'unittest_identity': 'test_k1.K1UnitTests.test_CK_K1_UT_014_KEY_input_revision'},
 {'callable_qualname': 'K1UnitTests.test_CK_K1_UT_014_KEY_inputs',
  'coverage_kind': 'primary_callable',
  'formal_l7_id': 'CK-K1-UT-014-KEY-inputs',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k1.py',
  'unittest_identity': 'test_k1.K1UnitTests.test_CK_K1_UT_014_KEY_inputs'},
 {'callable_qualname': 'K1UnitTests.test_CK_K1_UT_014_KEY_operation',
  'coverage_kind': 'primary_callable',
  'formal_l7_id': 'CK-K1-UT-014-KEY-operation',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k1.py',
  'unittest_identity': 'test_k1.K1UnitTests.test_CK_K1_UT_014_KEY_operation'},
 {'callable_qualname': 'K1UnitTests.test_CK_K1_UT_014_KEY_operation_version',
  'coverage_kind': 'primary_callable',
  'formal_l7_id': 'CK-K1-UT-014-KEY-operation_version',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k1.py',
  'unittest_identity': 'test_k1.K1UnitTests.test_CK_K1_UT_014_KEY_operation_version'},
 {'callable_qualname': 'K1UnitTests.test_CK_K1_UT_014_KEY_scope',
  'coverage_kind': 'primary_callable',
  'formal_l7_id': 'CK-K1-UT-014-KEY-scope',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k1.py',
  'unittest_identity': 'test_k1.K1UnitTests.test_CK_K1_UT_014_KEY_scope'},
 {'callable_qualname': 'K1UnitTests.test_CK_K1_UT_014_KEY_subject',
  'coverage_kind': 'primary_callable',
  'formal_l7_id': 'CK-K1-UT-014-KEY-subject',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k1.py',
  'unittest_identity': 'test_k1.K1UnitTests.test_CK_K1_UT_014_KEY_subject'},
 {'callable_qualname': 'K1UnitTests.test_CK_K1_UT_014_KEY_subject_digest',
  'coverage_kind': 'primary_callable',
  'formal_l7_id': 'CK-K1-UT-014-KEY-subject.digest',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k1.py',
  'unittest_identity': 'test_k1.K1UnitTests.test_CK_K1_UT_014_KEY_subject_digest'},
 {'callable_qualname': 'K1UnitTests.test_CK_K1_UT_014_KEY_subject_identity',
  'coverage_kind': 'primary_callable',
  'formal_l7_id': 'CK-K1-UT-014-KEY-subject.identity',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k1.py',
  'unittest_identity': 'test_k1.K1UnitTests.test_CK_K1_UT_014_KEY_subject_identity'},
 {'callable_qualname': 'K1UnitTests.test_CK_K1_UT_014_KEY_subject_kind',
  'coverage_kind': 'primary_callable',
  'formal_l7_id': 'CK-K1-UT-014-KEY-subject.kind',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k1.py',
  'unittest_identity': 'test_k1.K1UnitTests.test_CK_K1_UT_014_KEY_subject_kind'},
 {'callable_qualname': 'K1UnitTests.test_CK_K1_UT_014_KEY_subject_revision',
  'coverage_kind': 'primary_callable',
  'formal_l7_id': 'CK-K1-UT-014-KEY-subject.revision',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k1.py',
  'unittest_identity': 'test_k1.K1UnitTests.test_CK_K1_UT_014_KEY_subject_revision'},
 {'callable_qualname': 'K2UnitTests.test_CK_K2_UT_001_NOT_APPLICABLE',
  'coverage_kind': 'primary_callable',
  'formal_l7_id': 'CK-K2-UT-001-NOT-APPLICABLE',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k2.py',
  'unittest_identity': 'test_k2.K2UnitTests.test_CK_K2_UT_001_NOT_APPLICABLE'},
 {'callable_qualname': 'K2UnitTests.test_CK_K2_UT_001_UNKNOWN',
  'coverage_kind': 'primary_callable',
  'formal_l7_id': 'CK-K2-UT-001-UNKNOWN',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k2.py',
  'unittest_identity': 'test_k2.K2UnitTests.test_CK_K2_UT_001_UNKNOWN'},
 {'callable_qualname': 'K2UnitTests.test_CK_K2_UT_001_UNOBSERVED',
  'coverage_kind': 'primary_callable',
  'formal_l7_id': 'CK-K2-UT-001-UNOBSERVED',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k2.py',
  'unittest_identity': 'test_k2.K2UnitTests.test_CK_K2_UT_001_UNOBSERVED'},
 {'callable_qualname': 'K2UnitTests.test_CK_K2_UT_001_VALUE',
  'coverage_kind': 'primary_callable',
  'formal_l7_id': 'CK-K2-UT-001-VALUE',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k2.py',
  'unittest_identity': 'test_k2.K2UnitTests.test_CK_K2_UT_001_VALUE'},
 {'callable_qualname': 'K2UnitTests.test_CK_K2_UT_002a',
  'coverage_kind': 'primary_callable',
  'formal_l7_id': 'CK-K2-UT-002a',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k2.py',
  'unittest_identity': 'test_k2.K2UnitTests.test_CK_K2_UT_002a'},
 {'callable_qualname': 'K2UnitTests.test_CK_K2_UT_002b',
  'coverage_kind': 'primary_callable',
  'formal_l7_id': 'CK-K2-UT-002b',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k2.py',
  'unittest_identity': 'test_k2.K2UnitTests.test_CK_K2_UT_002b'},
 {'callable_qualname': 'K2UnitTests.test_CK_K2_UT_002c',
  'coverage_kind': 'primary_callable',
  'formal_l7_id': 'CK-K2-UT-002c',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k2.py',
  'unittest_identity': 'test_k2.K2UnitTests.test_CK_K2_UT_002c'},
 {'callable_qualname': 'K2UnitTests.test_CK_K2_UT_002d',
  'coverage_kind': 'primary_callable',
  'formal_l7_id': 'CK-K2-UT-002d',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k2.py',
  'unittest_identity': 'test_k2.K2UnitTests.test_CK_K2_UT_002d'},
 {'callable_qualname': 'K2UnitTests.test_CK_K2_UT_003a',
  'coverage_kind': 'primary_callable',
  'formal_l7_id': 'CK-K2-UT-003a',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k2.py',
  'unittest_identity': 'test_k2.K2UnitTests.test_CK_K2_UT_003a'},
 {'callable_qualname': 'K2UnitTests.test_CK_K2_UT_003b',
  'coverage_kind': 'primary_callable',
  'formal_l7_id': 'CK-K2-UT-003b',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k2.py',
  'unittest_identity': 'test_k2.K2UnitTests.test_CK_K2_UT_003b'},
 {'callable_qualname': 'K2UnitTests.test_CK_K2_UT_003c',
  'coverage_kind': 'primary_callable',
  'formal_l7_id': 'CK-K2-UT-003c',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k2.py',
  'unittest_identity': 'test_k2.K2UnitTests.test_CK_K2_UT_003c'},
 {'callable_qualname': 'K2UnitTests.test_CK_K2_UT_004a',
  'coverage_kind': 'primary_callable',
  'formal_l7_id': 'CK-K2-UT-004a',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k2.py',
  'unittest_identity': 'test_k2.K2UnitTests.test_CK_K2_UT_004a'},
 {'callable_qualname': 'K2UnitTests.test_CK_K2_UT_004b',
  'coverage_kind': 'primary_callable',
  'formal_l7_id': 'CK-K2-UT-004b',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k2.py',
  'unittest_identity': 'test_k2.K2UnitTests.test_CK_K2_UT_004b'},
 {'callable_qualname': 'K2UnitTests.test_CK_K2_UT_004c',
  'coverage_kind': 'primary_callable',
  'formal_l7_id': 'CK-K2-UT-004c',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k2.py',
  'unittest_identity': 'test_k2.K2UnitTests.test_CK_K2_UT_004c'},
 {'callable_qualname': 'K2UnitTests.test_CK_K2_UT_004d',
  'coverage_kind': 'primary_callable',
  'formal_l7_id': 'CK-K2-UT-004d',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k2.py',
  'unittest_identity': 'test_k2.K2UnitTests.test_CK_K2_UT_004d'},
 {'callable_qualname': 'K2UnitTests.test_CK_K2_UT_005_conflict_precedes_stale',
  'coverage_kind': 'primary_callable',
  'formal_l7_id': 'CK-K2-UT-005',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k2.py',
  'unittest_identity': 'test_k2.K2UnitTests.test_CK_K2_UT_005_conflict_precedes_stale'},
 {'callable_qualname': 'K2UnitTests.test_CK_K2_UT_006_revision_only_change_is_stale',
  'coverage_kind': 'primary_callable',
  'formal_l7_id': 'CK-K2-UT-006',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k2.py',
  'unittest_identity': 'test_k2.K2UnitTests.test_CK_K2_UT_006_revision_only_change_is_stale'},
 {'callable_qualname': 'K2UnitTests.test_CK_K2_UT_007_whitespace_revision_is_stale',
  'coverage_kind': 'primary_callable',
  'formal_l7_id': 'CK-K2-UT-007',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k2.py',
  'unittest_identity': 'test_k2.K2UnitTests.test_CK_K2_UT_007_whitespace_revision_is_stale'},
 {'callable_qualname': 'K2UnitTests.test_CK_K2_UT_008a',
  'coverage_kind': 'primary_callable',
  'formal_l7_id': 'CK-K2-UT-008a',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k2.py',
  'unittest_identity': 'test_k2.K2UnitTests.test_CK_K2_UT_008a'},
 {'callable_qualname': 'K2UnitTests.test_CK_K2_UT_008b',
  'coverage_kind': 'primary_callable',
  'formal_l7_id': 'CK-K2-UT-008b',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k2.py',
  'unittest_identity': 'test_k2.K2UnitTests.test_CK_K2_UT_008b'},
 {'callable_qualname': 'K2UnitTests.test_CK_K2_UT_008c',
  'coverage_kind': 'primary_callable',
  'formal_l7_id': 'CK-K2-UT-008c',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k2.py',
  'unittest_identity': 'test_k2.K2UnitTests.test_CK_K2_UT_008c'},
 {'callable_qualname': 'K2UnitTests.test_CK_K2_UT_009a',
  'coverage_kind': 'primary_callable',
  'formal_l7_id': 'CK-K2-UT-009a',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k2.py',
  'unittest_identity': 'test_k2.K2UnitTests.test_CK_K2_UT_009a'},
 {'callable_qualname': 'K2UnitTests.test_CK_K2_UT_009b',
  'coverage_kind': 'primary_callable',
  'formal_l7_id': 'CK-K2-UT-009b',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k2.py',
  'unittest_identity': 'test_k2.K2UnitTests.test_CK_K2_UT_009b'},
 {'callable_qualname': 'K2UnitTests.test_CK_K2_UT_010_lookup_does_not_mutate_records',
  'coverage_kind': 'primary_callable',
  'formal_l7_id': 'CK-K2-UT-010',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k2.py',
  'unittest_identity': 'test_k2.K2UnitTests.test_CK_K2_UT_010_lookup_does_not_mutate_records'},
 {'callable_qualname': 'K2UnitTests.test_CK_K2_UT_011a',
  'coverage_kind': 'primary_callable',
  'formal_l7_id': 'CK-K2-UT-011a',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k2.py',
  'unittest_identity': 'test_k2.K2UnitTests.test_CK_K2_UT_011a'},
 {'callable_qualname': 'K2UnitTests.test_CK_K2_UT_011b',
  'coverage_kind': 'primary_callable',
  'formal_l7_id': 'CK-K2-UT-011b',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k2.py',
  'unittest_identity': 'test_k2.K2UnitTests.test_CK_K2_UT_011b'},
 {'callable_qualname': 'K2UnitTests.test_CK_K2_UT_011c',
  'coverage_kind': 'primary_callable',
  'formal_l7_id': 'CK-K2-UT-011c',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k2.py',
  'unittest_identity': 'test_k2.K2UnitTests.test_CK_K2_UT_011c'},
 {'callable_qualname': 'K2UnitTests.test_CK_K2_UT_012_old_revision_is_never_current_value',
  'coverage_kind': 'primary_callable',
  'formal_l7_id': 'CK-K2-UT-012',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k2.py',
  'unittest_identity': 'test_k2.K2UnitTests.test_CK_K2_UT_012_old_revision_is_never_current_value'},
 {'callable_qualname': 'K2UnitTests.test_CK_K2_UT_013_GIT_REVISION',
  'coverage_kind': 'primary_callable',
  'formal_l7_id': 'CK-K2-UT-013-GIT-REVISION',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k2.py',
  'unittest_identity': 'test_k2.K2UnitTests.test_CK_K2_UT_013_GIT_REVISION'},
 {'callable_qualname': 'K2UnitTests.test_CK_K2_UT_013_NO_PREFIX',
  'coverage_kind': 'primary_callable',
  'formal_l7_id': 'CK-K2-UT-013-NO-PREFIX',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k2.py',
  'unittest_identity': 'test_k2.K2UnitTests.test_CK_K2_UT_013_NO_PREFIX'},
 {'callable_qualname': 'K2UnitTests.test_CK_K2_UT_013_PRECEDENCE_DIGEST',
  'coverage_kind': 'primary_callable',
  'formal_l7_id': 'CK-K2-UT-013-PRECEDENCE-DIGEST',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k2.py',
  'unittest_identity': 'test_k2.K2UnitTests.test_CK_K2_UT_013_PRECEDENCE_DIGEST'},
 {'callable_qualname': 'K2UnitTests.test_CK_K2_UT_013_PRECEDENCE_MISSING',
  'coverage_kind': 'primary_callable',
  'formal_l7_id': 'CK-K2-UT-013-PRECEDENCE-MISSING',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k2.py',
  'unittest_identity': 'test_k2.K2UnitTests.test_CK_K2_UT_013_PRECEDENCE_MISSING'},
 {'callable_qualname': 'K2UnitTests.test_CK_K2_UT_013_SHORT',
  'coverage_kind': 'primary_callable',
  'formal_l7_id': 'CK-K2-UT-013-SHORT',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k2.py',
  'unittest_identity': 'test_k2.K2UnitTests.test_CK_K2_UT_013_SHORT'},
 {'callable_qualname': 'K2UnitTests.test_CK_K2_UT_013_UPPERCASE',
  'coverage_kind': 'primary_callable',
  'formal_l7_id': 'CK-K2-UT-013-UPPERCASE',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k2.py',
  'unittest_identity': 'test_k2.K2UnitTests.test_CK_K2_UT_013_UPPERCASE'},
 {'callable_qualname': 'K2UnitTests.test_CK_K2_UT_014_layer_versions_stay_independent',
  'coverage_kind': 'primary_callable',
  'formal_l7_id': 'CK-K2-UT-014',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k2.py',
  'unittest_identity': 'test_k2.K2UnitTests.test_CK_K2_UT_014_layer_versions_stay_independent'},
 {'callable_qualname': 'K2UnitTests.test_CK_K2_UT_015_DUP',
  'coverage_kind': 'primary_callable',
  'formal_l7_id': 'CK-K2-UT-015-DUP',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k2.py',
  'unittest_identity': 'test_k2.K2UnitTests.test_CK_K2_UT_015_DUP'},
 {'callable_qualname': 'K2UnitTests.test_CK_K2_UT_015_ORDER',
  'coverage_kind': 'primary_callable',
  'formal_l7_id': 'CK-K2-UT-015-ORDER',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k2.py',
  'unittest_identity': 'test_k2.K2UnitTests.test_CK_K2_UT_015_ORDER'},
 {'callable_qualname': 'K2UnitTests.test_CK_K2_UT_016a',
  'coverage_kind': 'primary_callable',
  'formal_l7_id': 'CK-K2-UT-016a',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k2.py',
  'unittest_identity': 'test_k2.K2UnitTests.test_CK_K2_UT_016a'},
 {'callable_qualname': 'K2UnitTests.test_CK_K2_UT_016b',
  'coverage_kind': 'primary_callable',
  'formal_l7_id': 'CK-K2-UT-016b',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k2.py',
  'unittest_identity': 'test_k2.K2UnitTests.test_CK_K2_UT_016b'},
 {'callable_qualname': 'K2UnitTests.test_CK_K2_UT_017a',
  'coverage_kind': 'primary_callable',
  'formal_l7_id': 'CK-K2-UT-017a',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k2.py',
  'unittest_identity': 'test_k2.K2UnitTests.test_CK_K2_UT_017a'},
 {'callable_qualname': 'K2UnitTests.test_CK_K2_UT_017b',
  'coverage_kind': 'primary_callable',
  'formal_l7_id': 'CK-K2-UT-017b',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k2.py',
  'unittest_identity': 'test_k2.K2UnitTests.test_CK_K2_UT_017b'},
 {'callable_qualname': 'K2UnitTests.test_CK_K2_UT_018_OLD_UNKNOWN',
  'coverage_kind': 'primary_callable',
  'formal_l7_id': 'CK-K2-UT-018-OLD-UNKNOWN',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k2.py',
  'unittest_identity': 'test_k2.K2UnitTests.test_CK_K2_UT_018_OLD_UNKNOWN'},
 {'callable_qualname': 'K2UnitTests.test_CK_K2_UT_018_OLD_VALUE',
  'coverage_kind': 'primary_callable',
  'formal_l7_id': 'CK-K2-UT-018-OLD-VALUE',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k2.py',
  'unittest_identity': 'test_k2.K2UnitTests.test_CK_K2_UT_018_OLD_VALUE'},
 {'callable_qualname': 'K2UnitTests.test_CK_K2_UT_019_exact_plus_same_revision_conflict',
  'coverage_kind': 'primary_callable',
  'formal_l7_id': 'CK-K2-UT-019',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k2.py',
  'unittest_identity': 'test_k2.K2UnitTests.test_CK_K2_UT_019_exact_plus_same_revision_conflict'},
 {'callable_qualname': 'K2UnitTests.test_CK_K2_UT_020a',
  'coverage_kind': 'primary_callable',
  'formal_l7_id': 'CK-K2-UT-020a',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k2.py',
  'unittest_identity': 'test_k2.K2UnitTests.test_CK_K2_UT_020a'},
 {'callable_qualname': 'K2UnitTests.test_CK_K2_UT_020b',
  'coverage_kind': 'primary_callable',
  'formal_l7_id': 'CK-K2-UT-020b',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k2.py',
  'unittest_identity': 'test_k2.K2UnitTests.test_CK_K2_UT_020b'},
 {'callable_qualname': 'K2UnitTests.test_CK_K2_UT_020c',
  'coverage_kind': 'primary_callable',
  'formal_l7_id': 'CK-K2-UT-020c',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k2.py',
  'unittest_identity': 'test_k2.K2UnitTests.test_CK_K2_UT_020c'},
 {'callable_qualname': 'K2UnitTests.test_CK_K2_UT_021_alias_binding_dedup_conflict_and_handoff',
  'coverage_kind': 'owner_or_fixture_stub',
  'formal_l7_id': 'CK-K2-UT-021',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k2.py',
  'unittest_identity': 'test_k2.K2UnitTests.test_CK_K2_UT_021_alias_binding_dedup_conflict_and_handoff'},
 {'callable_qualname': 'K2UnitTests.test_CK_K2_UT_021a_missing_binding_input',
  'coverage_kind': 'owner_or_fixture_stub',
  'formal_l7_id': 'CK-K2-UT-021a',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k2.py',
  'unittest_identity': 'test_k2.K2UnitTests.test_CK_K2_UT_021a_missing_binding_input'},
 {'callable_qualname': 'K2UnitTests.test_CK_K2_UT_021b',
  'coverage_kind': 'owner_or_fixture_stub',
  'formal_l7_id': 'CK-K2-UT-021b',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k2.py',
  'unittest_identity': 'test_k2.K2UnitTests.test_CK_K2_UT_021b'},
 {'callable_qualname': 'K2UnitTests.test_CK_K2_UT_021c',
  'coverage_kind': 'owner_or_fixture_stub',
  'formal_l7_id': 'CK-K2-UT-021c',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k2.py',
  'unittest_identity': 'test_k2.K2UnitTests.test_CK_K2_UT_021c'},
 {'callable_qualname': 'K2UnitTests.test_CK_K2_UT_021d_alias_revision_change_stales_lookup',
  'coverage_kind': 'owner_or_fixture_stub',
  'formal_l7_id': 'CK-K2-UT-021d',
  'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k2.py',
  'unittest_identity': 'test_k2.K2UnitTests.test_CK_K2_UT_021d_alias_revision_change_stales_lookup'})
EXPECTED_DISCOVERY_IDS = ('test_k1.K1UnitTests.test_CK_K1_UT_001',
 'test_k1.K1UnitTests.test_CK_K1_UT_002_ADMIT_INCONSISTENT',
 'test_k1.K1UnitTests.test_CK_K1_UT_002a',
 'test_k1.K1UnitTests.test_CK_K1_UT_002b',
 'test_k1.K1UnitTests.test_CK_K1_UT_002c',
 'test_k1.K1UnitTests.test_CK_K1_UT_003',
 'test_k1.K1UnitTests.test_CK_K1_UT_004',
 'test_k1.K1UnitTests.test_CK_K1_UT_005a',
 'test_k1.K1UnitTests.test_CK_K1_UT_005b',
 'test_k1.K1UnitTests.test_CK_K1_UT_006',
 'test_k1.K1UnitTests.test_CK_K1_UT_007a',
 'test_k1.K1UnitTests.test_CK_K1_UT_007b',
 'test_k1.K1UnitTests.test_CK_K1_UT_007c',
 'test_k1.K1UnitTests.test_CK_K1_UT_008_disposition_three_required_fields',
 'test_k1.K1UnitTests.test_CK_K1_UT_008_invalid_not_applicable_is_nonvalue',
 'test_k1.K1UnitTests.test_CK_K1_UT_008a',
 'test_k1.K1UnitTests.test_CK_K1_UT_008b',
 'test_k1.K1UnitTests.test_CK_K1_UT_008c',
 'test_k1.K1UnitTests.test_CK_K1_UT_009_ACCEPT_COMBINE_NotApplicable',
 'test_k1.K1UnitTests.test_CK_K1_UT_009_ACCEPT_COMBINE_Stale',
 'test_k1.K1UnitTests.test_CK_K1_UT_009_ACCEPT_COMBINE_Unknown',
 'test_k1.K1UnitTests.test_CK_K1_UT_009_ACCEPT_COMBINE_Unobserved',
 'test_k1.K1UnitTests.test_CK_K1_UT_009_ACCEPT_COMBINE_Value',
 'test_k1.K1UnitTests.test_CK_K1_UT_009_ACCEPT_RECORD_NotApplicable',
 'test_k1.K1UnitTests.test_CK_K1_UT_009_ACCEPT_RECORD_Unknown',
 'test_k1.K1UnitTests.test_CK_K1_UT_009_ACCEPT_RECORD_Unobserved',
 'test_k1.K1UnitTests.test_CK_K1_UT_009_ACCEPT_RECORD_Value',
 'test_k1.K1UnitTests.test_CK_K1_UT_009_KEY_COMBINE_NotApplicable',
 'test_k1.K1UnitTests.test_CK_K1_UT_009_KEY_COMBINE_Stale',
 'test_k1.K1UnitTests.test_CK_K1_UT_009_KEY_COMBINE_Unknown',
 'test_k1.K1UnitTests.test_CK_K1_UT_009_KEY_COMBINE_Unobserved',
 'test_k1.K1UnitTests.test_CK_K1_UT_009_KEY_COMBINE_Value',
 'test_k1.K1UnitTests.test_CK_K1_UT_009_KEY_LOOKUP',
 'test_k1.K1UnitTests.test_CK_K1_UT_009_KEY_RECORD',
 'test_k1.K1UnitTests.test_CK_K1_UT_009_LOOKUP_NotApplicable',
 'test_k1.K1UnitTests.test_CK_K1_UT_009_LOOKUP_Unknown',
 'test_k1.K1UnitTests.test_CK_K1_UT_009_LOOKUP_Unobserved',
 'test_k1.K1UnitTests.test_CK_K1_UT_009_LOOKUP_Value',
 'test_k1.K1UnitTests.test_CK_K1_UT_009_STALE_LOOKUP',
 'test_k1.K1UnitTests.test_CK_K1_UT_009_STALE_RECORD',
 'test_k1.K1UnitTests.test_CK_K1_UT_009_accept_classes_and_record_classes',
 'test_k1.K1UnitTests.test_CK_K1_UT_010_COMPLETE',
 'test_k1.K1UnitTests.test_CK_K1_UT_010_PARTIAL',
 'test_k1.K1UnitTests.test_CK_K1_UT_010_READ_FAIL',
 'test_k1.K1UnitTests.test_CK_K1_UT_011_projection_cannot_be_combined',
 'test_k1.K1UnitTests.test_CK_K1_UT_012_MAP_absent',
 'test_k1.K1UnitTests.test_CK_K1_UT_012_MAP_ambiguous',
 'test_k1.K1UnitTests.test_CK_K1_UT_012_MAP_conflict',
 'test_k1.K1UnitTests.test_CK_K1_UT_012_MAP_evaluation_error',
 'test_k1.K1UnitTests.test_CK_K1_UT_012_MAP_incompatible',
 'test_k1.K1UnitTests.test_CK_K1_UT_012_MAP_indeterminate',
 'test_k1.K1UnitTests.test_CK_K1_UT_012_MAP_mismatch',
 'test_k1.K1UnitTests.test_CK_K1_UT_012_MAP_not_applicable',
 'test_k1.K1UnitTests.test_CK_K1_UT_012_MAP_not_observed',
 'test_k1.K1UnitTests.test_CK_K1_UT_012_MAP_stale',
 'test_k1.K1UnitTests.test_CK_K1_UT_012_MAP_unknown',
 'test_k1.K1UnitTests.test_CK_K1_UT_012_MAP_unsupported',
 'test_k1.K1UnitTests.test_CK_K1_UT_012_MAP_未評価',
 'test_k1.K1UnitTests.test_CK_K1_UT_012_mapping_word_table',
 'test_k1.K1UnitTests.test_CK_K1_UT_012_unregistered',
 'test_k1.K1UnitTests.test_CK_K1_UT_012_wrong_mapping_incompatible',
 'test_k1.K1UnitTests.test_CK_K1_UT_012_wrong_mapping_mismatch',
 'test_k1.K1UnitTests.test_CK_K1_UT_012_wrong_mapping_not_observed',
 'test_k1.K1UnitTests.test_CK_K1_UT_013_input_digest_combine',
 'test_k1.K1UnitTests.test_CK_K1_UT_013_input_digest_lookup',
 'test_k1.K1UnitTests.test_CK_K1_UT_013_input_digest_record',
 'test_k1.K1UnitTests.test_CK_K1_UT_013_input_identity_combine',
 'test_k1.K1UnitTests.test_CK_K1_UT_013_input_identity_lookup',
 'test_k1.K1UnitTests.test_CK_K1_UT_013_input_identity_record',
 'test_k1.K1UnitTests.test_CK_K1_UT_013_input_kind_combine',
 'test_k1.K1UnitTests.test_CK_K1_UT_013_input_kind_lookup',
 'test_k1.K1UnitTests.test_CK_K1_UT_013_input_kind_record',
 'test_k1.K1UnitTests.test_CK_K1_UT_013_input_revision_combine',
 'test_k1.K1UnitTests.test_CK_K1_UT_013_input_revision_lookup',
 'test_k1.K1UnitTests.test_CK_K1_UT_013_input_revision_record',
 'test_k1.K1UnitTests.test_CK_K1_UT_013_inputs_combine',
 'test_k1.K1UnitTests.test_CK_K1_UT_013_inputs_lookup',
 'test_k1.K1UnitTests.test_CK_K1_UT_013_inputs_record',
 'test_k1.K1UnitTests.test_CK_K1_UT_013_operation_combine',
 'test_k1.K1UnitTests.test_CK_K1_UT_013_operation_lookup',
 'test_k1.K1UnitTests.test_CK_K1_UT_013_operation_record',
 'test_k1.K1UnitTests.test_CK_K1_UT_013_operation_version_combine',
 'test_k1.K1UnitTests.test_CK_K1_UT_013_operation_version_lookup',
 'test_k1.K1UnitTests.test_CK_K1_UT_013_operation_version_record',
 'test_k1.K1UnitTests.test_CK_K1_UT_013_scope_combine',
 'test_k1.K1UnitTests.test_CK_K1_UT_013_scope_lookup',
 'test_k1.K1UnitTests.test_CK_K1_UT_013_scope_record',
 'test_k1.K1UnitTests.test_CK_K1_UT_013_subject_combine',
 'test_k1.K1UnitTests.test_CK_K1_UT_013_subject_digest_combine',
 'test_k1.K1UnitTests.test_CK_K1_UT_013_subject_digest_lookup',
 'test_k1.K1UnitTests.test_CK_K1_UT_013_subject_digest_record',
 'test_k1.K1UnitTests.test_CK_K1_UT_013_subject_identity_combine',
 'test_k1.K1UnitTests.test_CK_K1_UT_013_subject_identity_lookup',
 'test_k1.K1UnitTests.test_CK_K1_UT_013_subject_identity_record',
 'test_k1.K1UnitTests.test_CK_K1_UT_013_subject_kind_combine',
 'test_k1.K1UnitTests.test_CK_K1_UT_013_subject_kind_lookup',
 'test_k1.K1UnitTests.test_CK_K1_UT_013_subject_kind_record',
 'test_k1.K1UnitTests.test_CK_K1_UT_013_subject_lookup',
 'test_k1.K1UnitTests.test_CK_K1_UT_013_subject_record',
 'test_k1.K1UnitTests.test_CK_K1_UT_013_subject_revision_combine',
 'test_k1.K1UnitTests.test_CK_K1_UT_013_subject_revision_lookup',
 'test_k1.K1UnitTests.test_CK_K1_UT_013_subject_revision_record',
 'test_k1.K1UnitTests.test_CK_K1_UT_014_KEY_WHOLE',
 'test_k1.K1UnitTests.test_CK_K1_UT_014_KEY_input_digest',
 'test_k1.K1UnitTests.test_CK_K1_UT_014_KEY_input_identity',
 'test_k1.K1UnitTests.test_CK_K1_UT_014_KEY_input_kind',
 'test_k1.K1UnitTests.test_CK_K1_UT_014_KEY_input_revision',
 'test_k1.K1UnitTests.test_CK_K1_UT_014_KEY_inputs',
 'test_k1.K1UnitTests.test_CK_K1_UT_014_KEY_operation',
 'test_k1.K1UnitTests.test_CK_K1_UT_014_KEY_operation_version',
 'test_k1.K1UnitTests.test_CK_K1_UT_014_KEY_scope',
 'test_k1.K1UnitTests.test_CK_K1_UT_014_KEY_subject',
 'test_k1.K1UnitTests.test_CK_K1_UT_014_KEY_subject_digest',
 'test_k1.K1UnitTests.test_CK_K1_UT_014_KEY_subject_identity',
 'test_k1.K1UnitTests.test_CK_K1_UT_014_KEY_subject_kind',
 'test_k1.K1UnitTests.test_CK_K1_UT_014_KEY_subject_revision',
 'test_k1.K1UnitTests.test_contract_boundary_value_without_mapping_is_rejected',
 'test_k2.K2UnitTests.test_CK_K2_UT_001_NOT_APPLICABLE',
 'test_k2.K2UnitTests.test_CK_K2_UT_001_UNKNOWN',
 'test_k2.K2UnitTests.test_CK_K2_UT_001_UNOBSERVED',
 'test_k2.K2UnitTests.test_CK_K2_UT_001_VALUE',
 'test_k2.K2UnitTests.test_CK_K2_UT_002_old_value_revision_and_digest_updates',
 'test_k2.K2UnitTests.test_CK_K2_UT_002a',
 'test_k2.K2UnitTests.test_CK_K2_UT_002b',
 'test_k2.K2UnitTests.test_CK_K2_UT_002c',
 'test_k2.K2UnitTests.test_CK_K2_UT_002d',
 'test_k2.K2UnitTests.test_CK_K2_UT_003_old_nonvalues_supersede',
 'test_k2.K2UnitTests.test_CK_K2_UT_003a',
 'test_k2.K2UnitTests.test_CK_K2_UT_003b',
 'test_k2.K2UnitTests.test_CK_K2_UT_003c',
 'test_k2.K2UnitTests.test_CK_K2_UT_004_same_revision_digest_conflict_all_positions',
 'test_k2.K2UnitTests.test_CK_K2_UT_004a',
 'test_k2.K2UnitTests.test_CK_K2_UT_004b',
 'test_k2.K2UnitTests.test_CK_K2_UT_004c',
 'test_k2.K2UnitTests.test_CK_K2_UT_004d',
 'test_k2.K2UnitTests.test_CK_K2_UT_005_conflict_precedes_stale',
 'test_k2.K2UnitTests.test_CK_K2_UT_006_revision_only_change_is_stale',
 'test_k2.K2UnitTests.test_CK_K2_UT_007_whitespace_revision_is_stale',
 'test_k2.K2UnitTests.test_CK_K2_UT_008_operation_version_scope_are_separate_questions',
 'test_k2.K2UnitTests.test_CK_K2_UT_008a',
 'test_k2.K2UnitTests.test_CK_K2_UT_008b',
 'test_k2.K2UnitTests.test_CK_K2_UT_008c',
 'test_k2.K2UnitTests.test_CK_K2_UT_009_identity_set_add_remove',
 'test_k2.K2UnitTests.test_CK_K2_UT_009a',
 'test_k2.K2UnitTests.test_CK_K2_UT_009b',
 'test_k2.K2UnitTests.test_CK_K2_UT_010_lookup_does_not_mutate_records',
 'test_k2.K2UnitTests.test_CK_K2_UT_011_noop_conflict_and_stale_record_priority',
 'test_k2.K2UnitTests.test_CK_K2_UT_011a',
 'test_k2.K2UnitTests.test_CK_K2_UT_011b',
 'test_k2.K2UnitTests.test_CK_K2_UT_011c',
 'test_k2.K2UnitTests.test_CK_K2_UT_012_old_revision_is_never_current_value',
 'test_k2.K2UnitTests.test_CK_K2_UT_013_GIT_REVISION',
 'test_k2.K2UnitTests.test_CK_K2_UT_013_NO_PREFIX',
 'test_k2.K2UnitTests.test_CK_K2_UT_013_PRECEDENCE_DIGEST',
 'test_k2.K2UnitTests.test_CK_K2_UT_013_PRECEDENCE_MISSING',
 'test_k2.K2UnitTests.test_CK_K2_UT_013_SHORT',
 'test_k2.K2UnitTests.test_CK_K2_UT_013_UPPERCASE',
 'test_k2.K2UnitTests.test_CK_K2_UT_013_VALID',
 'test_k2.K2UnitTests.test_CK_K2_UT_013_digest_format_validation_order',
 'test_k2.K2UnitTests.test_CK_K2_UT_014_layer_versions_stay_independent',
 'test_k2.K2UnitTests.test_CK_K2_UT_015_DUP',
 'test_k2.K2UnitTests.test_CK_K2_UT_015_ORDER',
 'test_k2.K2UnitTests.test_CK_K2_UT_015_input_order_and_duplicate_identity',
 'test_k2.K2UnitTests.test_CK_K2_UT_016_kind_mismatch_subject_and_input',
 'test_k2.K2UnitTests.test_CK_K2_UT_016a',
 'test_k2.K2UnitTests.test_CK_K2_UT_016b',
 'test_k2.K2UnitTests.test_CK_K2_UT_017_identity_change_has_no_candidate',
 'test_k2.K2UnitTests.test_CK_K2_UT_017a',
 'test_k2.K2UnitTests.test_CK_K2_UT_017b',
 'test_k2.K2UnitTests.test_CK_K2_UT_018_OLD_UNKNOWN',
 'test_k2.K2UnitTests.test_CK_K2_UT_018_OLD_VALUE',
 'test_k2.K2UnitTests.test_CK_K2_UT_018_exact_match_beats_old_append_position',
 'test_k2.K2UnitTests.test_CK_K2_UT_019_exact_plus_same_revision_conflict',
 'test_k2.K2UnitTests.test_CK_K2_UT_020_last_prior_respects_sequence',
 'test_k2.K2UnitTests.test_CK_K2_UT_020a',
 'test_k2.K2UnitTests.test_CK_K2_UT_020b',
 'test_k2.K2UnitTests.test_CK_K2_UT_020c',
 'test_k2.K2UnitTests.test_CK_K2_UT_021_CROSS_ROLE',
 'test_k2.K2UnitTests.test_CK_K2_UT_021_DEDUP',
 'test_k2.K2UnitTests.test_CK_K2_UT_021_P',
 'test_k2.K2UnitTests.test_CK_K2_UT_021_alias_binding_dedup_conflict_and_handoff',
 'test_k2.K2UnitTests.test_CK_K2_UT_021a_missing_binding_input',
 'test_k2.K2UnitTests.test_CK_K2_UT_021b',
 'test_k2.K2UnitTests.test_CK_K2_UT_021c',
 'test_k2.K2UnitTests.test_CK_K2_UT_021d_alias_revision_change_stales_lookup',
 'test_k2.K2UnitTests.test_CK_K2_UT_030_canonical_json_object_sort',
 'test_k2.K2UnitTests.test_CK_K2_UT_031_array_order',
 'test_k2.K2UnitTests.test_CK_K2_UT_032_finite_float',
 'test_k2.K2UnitTests.test_CK_K2_UT_033_negative_zero',
 'test_k2.K2UnitTests.test_CK_K2_UT_034a_integer',
 'test_k2.K2UnitTests.test_CK_K2_UT_034b_exponent',
 'test_k2.K2UnitTests.test_CK_K2_UT_035a_composed_unicode',
 'test_k2.K2UnitTests.test_CK_K2_UT_035b_decomposed_unicode',
 'test_k2.K2UnitTests.test_CK_K2_UT_036_non_string_key_rejected_by_codec',
 'test_k2.K2UnitTests.test_CK_K2_UT_037_nonfinite_rejected_by_codec',
 'test_k2.K2UnitTests.test_CK_K2_UT_038_cycle_rejected_by_codec',
 'test_k2.K2UnitTests.test_CK_K2_UT_039_lone_surrogate_rejected_by_codec',
 'test_k2.K2UnitTests.test_CK_K2_UT_040_raw_source_digest',
 'test_k2.K2UnitTests.test_CK_K2_UT_041_canonical_bytes_do_not_include_storage_lf')
K1_K2_DISCOVERY_IDS = EXPECTED_DISCOVERY_IDS
K1_K2_DISCOVERY_IDS_SHA256 = "2203c7ba4c3064940792d0cd19b8e0e5e6b0123ed0f5ad302472213b1be3c874"
K3_DISCOVERY_IDS = (
    'test_k3.K3FormalFixtures.test_CK_K3_REG_ALLOW_WITH_CONSTRAINTS_UNSUPPORTED',
    'test_k3.K3FormalFixtures.test_CK_K3_REG_CONSTRAINT_DECLARATION_MISMATCH',
    'test_k3.K3FormalFixtures.test_CK_K3_REG_CURRENT_INPUT_REF',
    'test_k3.K3FormalFixtures.test_CK_K3_REG_CURRENT_REF_DIFFERS_FROM_PERMISSION',
    'test_k3.K3FormalFixtures.test_CK_K3_REG_DECLARED_ISSUER_MISMATCH',
    'test_k3.K3FormalFixtures.test_CK_K3_REG_EMPTY_CONSTRAINT_SET_IS_NONPOSITIVE',
    'test_k3.K3FormalFixtures.test_CK_K3_REG_ISSUER_DECL_MISSING',
    'test_k3.K3FormalFixtures.test_CK_K3_REG_OPERATION_INPUT_SAME_REVISION_DIGEST_CONFLICT',
    'test_k3.K3FormalFixtures.test_CK_K3_REG_OPERATION_INVALID',
    'test_k3.K3FormalFixtures.test_CK_K3_REG_OUTCOME_CASE_EXACT',
    'test_k3.K3FormalFixtures.test_CK_K3_REG_PARTIAL_CONTEXT_NO_SCOPE',
    'test_k3.K3FormalFixtures.test_CK_K3_REG_PARTIAL_CONTEXT_OWNER_SCOPE',
    'test_k3.K3FormalFixtures.test_CK_K3_REG_QUERY_CONTEXT_TARGET',
    'test_k3.K3FormalFixtures.test_CK_K3_REG_QUERY_REF_FIELDS',
    'test_k3.K3FormalFixtures.test_CK_K3_REG_QUERY_SCOPE_MISMATCH',
    'test_k3.K3FormalFixtures.test_CK_K3_REG_RECORD_MISSING_SELECTOR_POSITIVE',
    'test_k3.K3FormalFixtures.test_CK_K3_REG_RECORD_REF_STALE',
    'test_k3.K3FormalFixtures.test_CK_K3_REG_RECORD_SOURCE_DIGEST_CONFLICT',
    'test_k3.K3FormalFixtures.test_CK_K3_REG_RECORD_SOURCE_UNREGISTERED',
    'test_k3.K3FormalFixtures.test_CK_K3_REG_RESOLVE_CONTEXT_OUTCOMES',
    'test_k3.K3FormalFixtures.test_CK_K3_REG_RESOLVE_WITH_EMPTY_CALLER_INPUT_HEADS',
    'test_k3.K3FormalFixtures.test_CK_K3_REG_REVOCATION_ENTRY_DIGEST_ONLY_CONFLICT',
    'test_k3.K3FormalFixtures.test_CK_K3_REG_REVOCATION_HEAD_MISSING',
    'test_k3.K3FormalFixtures.test_CK_K3_REG_REVOCATION_HEAD_SET_CONFLICT',
    'test_k3.K3FormalFixtures.test_CK_K3_REG_REVOCATION_HEAD_SET_ORDER_AND_EXACT_DUPLICATES',
    'test_k3.K3FormalFixtures.test_CK_K3_REG_REVOCATION_OBSERVATION_KEY_PRESERVED',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_001',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_002',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_003',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_004',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_005',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_006',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_007',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_008',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_009',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_010',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_011',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_012',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_013',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_014',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_015',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_016',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_017',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_018',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_019',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_020',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_021',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_022',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_023',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_024',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_025',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_026',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_027',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_028',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_029',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_030',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_031',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_032',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_033',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_034',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_035',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_036',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_037',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_038',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_039',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_040',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_041',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_042',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_043',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_044',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_045',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_046',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_047',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_048',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_049',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_050',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_051',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_052',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_053',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_054',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_055',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_056',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_057',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_058',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_059',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_060',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_061',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_062',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_063',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_064',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_065',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_066',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_067',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_068',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_069',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_070',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_071',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_072',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_073',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_074',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_075',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_076',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_077',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_078',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_079',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_080',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_081',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_082',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_083',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_084',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_085',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_086',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_087',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_088',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_089',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_090',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_091',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_092',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_093',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_094',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_095',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_096',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_097',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_098',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_099',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_100',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_101',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_102',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_103',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_104',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_105',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_106',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_107',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_108',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_109',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_110',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_111',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_112',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_113',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_114',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_115',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_116',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_117',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_118',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_119',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_120',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_121',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_122',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_123',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_124',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_125',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_126',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_127',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_128',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_129',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_130',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_131',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_132',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_133',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_134',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_135',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_136',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_137',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_138',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_139',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_140',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_141',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_142',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_143',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_144',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_145',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_146',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_147',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_148',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_149',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_150',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_151',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_152',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_153',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_154',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_155',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_156',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_157',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_158',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_159',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_160',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_161',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_162',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_163',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_164',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_165',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_166',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_167',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_168',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_169',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_170',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_171',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_172',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_173',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_174',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_175',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_176',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_177',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_178',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_179',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_180',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_181',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_182',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_183',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_184',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_185',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_186',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_187',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_188',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_189',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_190',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_191',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_192',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_193',
    'test_k3.K3FormalFixtures.test_CK_K3_UT_194',
)
EXPECTED_DISCOVERY_IDS = tuple(sorted(EXPECTED_DISCOVERY_IDS + K3_DISCOVERY_IDS))
K5_DISCOVERY_IDS = tuple(
    sorted(
        [f"test_k5.K5Fixtures.test_ck_k5_ut_{number:03d}" for number in range(1, 92)]
        + [
            "test_k5.K5Fixtures.test_ck_k5_ut_092_ledger_rows",
            "test_k5.K5Fixtures.test_ck_k5_ut_093_ledger_fields",
            "test_k5.K5Fixtures.test_ck_k5_ut_094_head_refs",
            "test_k5.K5Fixtures.test_ck_k5_ut_095_current_head_rejects_seq_zero_tail",
            "test_k5.K5Fixtures.test_ck_k5_ut_096_current_head_rejects_duplicate_tail_seq",
            "test_k5.K5Fixtures.test_ck_k5_ut_097_read_rejects_foreign_genesis_head",
            "test_k5.K5Fixtures.test_ck_k5_ut_098_restore_rejects_malformed_result_body",
            "test_k5.K5Fixtures.test_ck_k5_ut_099_scope_log_mismatch_stops_unmapped_branch",
            "test_k5.K5Fixtures.test_ck_k5_ut_100_restore_rejects_invalid_result_key",
            "test_k5.K5Fixtures.test_ck_k5_ut_101_append_invalid_key_body_stops_unmapped_branch",
            "test_k5.K5Fixtures.test_ck_k5_ut_102_closed_event_union_rejects_missing_and_unknown_kind",
            "test_k5.K5Fixtures.test_ck_k5_ut_103_malformed_nested_event_stops_read_and_append",
            "test_k5.K5Fixtures.test_ck_k5_ut_104_genesis_head_key_and_projection_paths",
            "test_k5.K5Fixtures.test_ck_k5_ut_105_segment_opened_targets_manifest_segment",
            "test_k5.K5Fixtures.test_ck_k5_ut_106_append_constraints_reject_duplicate_and_wrong_shapes",
            "test_k5.K5Fixtures.test_ck_k5_ut_107_projection_heads_deduplicate_only_in_scope_duplicates",
            "test_k5.K5Fixtures.test_ck_k5_ut_108_stale_precedes_missing_key",
            "test_k5.K5Fixtures.test_ck_k5_ut_109_scope_out_head_stops_before_read",
            "test_k5.K5Fixtures.test_ck_k5_ut_110_event_validation_malformed_and_nonfinite_are_unmapped",
            "test_k5.K5Fixtures.test_ck_k5_ut_111_existing_append_reasons_are_event_scoped",
            "test_k5.K5Fixtures.test_ck_k5_ut_112_restore_closed_key_shape_and_project_is_domain_only",
            "test_k5.K5Fixtures.test_ck_k5_ut_113_fixed_read_and_correction_shape_branches",
            "test_k5.K5Fixtures.test_ck_k5_ut_114_append_scope_and_manifest_local_boundaries",
            "test_k5.K5Fixtures.test_ck_k5_ut_115_checkpoint_conflicts_share_existing_diagnostic",
        ]
    )
)
EXPECTED_DISCOVERY_IDS = tuple(sorted(EXPECTED_DISCOVERY_IDS + K5_DISCOVERY_IDS))

K5_DISCOVERY_IDS_SHA256 = "fd8edf4364fe9eac9e707ffe18852f249ea3f82e26ffe8780343c15672e25715"
EXPECTED_DISCOVERY_IDS_SHA256 = "aca81abd7dd60c29512431c2d8223fd509d4c7a3a3fd7f1fc70847658ba0042d"

# K3 formal IDs map one-to-one to the individually listed L7 UTs.
K3_FORMAL_MAPPING = (
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_001', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-001', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_001'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_002', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-002', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_002'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_003', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-003', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_003'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_004', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-004', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_004'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_005', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-005', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_005'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_006', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-006', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_006'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_007', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-007', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_007'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_008', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-008', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_008'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_009', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-009', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_009'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_010', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-010', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_010'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_011', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-011', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_011'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_012', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-012', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_012'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_013', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-013', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_013'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_014', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-014', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_014'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_015', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-015', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_015'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_016', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-016', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_016'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_017', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-017', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_017'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_018', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-018', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_018'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_019', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-019', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_019'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_020', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-020', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_020'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_021', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-021', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_021'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_022', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-022', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_022'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_023', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-023', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_023'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_024', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-024', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_024'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_025', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-025', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_025'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_026', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-026', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_026'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_027', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-027', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_027'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_028', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-028', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_028'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_029', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-029', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_029'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_030', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-030', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_030'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_031', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-031', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_031'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_032', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-032', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_032'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_033', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-033', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_033'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_034', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-034', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_034'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_035', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-035', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_035'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_036', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-036', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_036'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_037', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-037', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_037'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_038', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-038', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_038'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_039', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-039', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_039'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_040', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-040', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_040'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_041', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-041', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_041'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_042', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-042', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_042'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_043', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-043', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_043'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_044', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-044', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_044'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_045', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-045', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_045'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_046', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-046', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_046'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_047', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-047', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_047'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_048', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-048', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_048'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_049', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-049', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_049'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_050', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-050', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_050'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_051', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-051', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_051'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_052', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-052', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_052'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_053', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-053', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_053'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_054', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-054', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_054'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_055', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-055', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_055'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_056', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-056', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_056'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_057', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-057', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_057'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_058', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-058', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_058'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_059', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-059', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_059'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_060', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-060', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_060'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_061', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-061', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_061'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_062', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-062', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_062'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_063', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-063', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_063'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_064', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-064', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_064'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_065', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-065', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_065'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_066', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-066', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_066'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_067', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-067', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_067'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_068', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-068', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_068'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_069', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-069', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_069'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_070', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-070', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_070'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_071', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-071', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_071'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_072', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-072', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_072'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_073', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-073', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_073'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_074', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-074', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_074'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_075', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-075', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_075'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_076', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-076', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_076'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_077', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-077', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_077'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_078', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-078', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_078'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_079', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-079', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_079'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_080', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-080', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_080'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_081', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-081', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_081'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_082', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-082', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_082'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_083', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-083', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_083'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_084', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-084', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_084'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_085', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-085', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_085'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_086', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-086', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_086'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_087', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-087', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_087'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_088', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-088', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_088'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_089', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-089', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_089'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_090', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-090', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_090'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_091', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-091', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_091'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_092', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-092', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_092'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_093', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-093', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_093'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_094', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-094', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_094'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_095', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-095', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_095'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_096', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-096', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_096'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_097', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-097', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_097'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_098', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-098', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_098'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_099', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-099', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_099'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_100', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-100', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_100'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_101', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-101', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_101'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_102', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-102', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_102'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_103', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-103', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_103'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_104', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-104', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_104'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_105', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-105', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_105'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_106', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-106', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_106'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_107', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-107', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_107'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_108', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-108', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_108'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_109', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-109', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_109'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_110', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-110', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_110'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_111', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-111', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_111'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_112', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-112', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_112'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_113', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-113', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_113'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_114', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-114', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_114'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_115', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-115', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_115'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_116', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-116', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_116'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_117', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-117', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_117'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_118', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-118', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_118'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_119', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-119', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_119'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_120', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-120', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_120'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_121', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-121', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_121'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_122', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-122', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_122'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_123', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-123', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_123'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_124', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-124', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_124'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_125', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-125', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_125'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_126', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-126', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_126'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_127', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-127', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_127'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_128', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-128', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_128'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_129', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-129', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_129'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_130', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-130', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_130'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_131', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-131', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_131'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_132', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-132', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_132'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_133', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-133', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_133'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_134', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-134', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_134'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_135', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-135', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_135'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_136', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-136', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_136'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_137', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-137', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_137'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_138', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-138', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_138'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_139', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-139', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_139'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_140', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-140', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_140'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_141', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-141', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_141'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_142', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-142', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_142'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_143', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-143', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_143'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_144', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-144', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_144'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_145', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-145', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_145'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_146', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-146', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_146'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_147', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-147', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_147'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_148', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-148', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_148'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_149', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-149', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_149'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_150', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-150', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_150'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_151', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-151', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_151'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_152', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-152', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_152'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_153', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-153', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_153'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_154', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-154', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_154'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_155', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-155', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_155'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_156', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-156', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_156'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_157', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-157', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_157'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_158', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-158', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_158'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_159', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-159', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_159'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_160', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-160', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_160'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_161', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-161', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_161'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_162', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-162', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_162'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_163', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-163', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_163'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_164', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-164', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_164'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_165', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-165', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_165'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_166', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-166', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_166'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_167', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-167', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_167'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_168', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-168', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_168'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_169', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-169', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_169'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_170', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-170', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_170'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_171', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-171', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_171'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_172', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-172', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_172'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_173', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-173', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_173'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_174', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-174', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_174'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_175', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-175', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_175'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_176', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-176', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_176'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_177', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-177', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_177'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_178', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-178', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_178'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_179', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-179', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_179'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_180', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-180', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_180'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_181', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-181', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_181'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_182', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-182', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_182'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_183', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-183', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_183'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_184', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-184', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_184'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_185', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-185', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_185'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_186', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-186', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_186'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_187', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-187', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_187'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_188', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-188', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_188'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_189', 'coverage_kind': 'owner_or_fixture_stub', 'formal_l7_id': 'CK-K3-UT-189', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_189'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_190', 'coverage_kind': 'owner_or_fixture_stub', 'formal_l7_id': 'CK-K3-UT-190', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_190'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_191', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-191', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_191'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_192', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-192', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_192'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_193', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-193', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_193'},
    {'callable_qualname': 'K3FormalFixtures.test_CK_K3_UT_194', 'coverage_kind': 'primary_callable', 'formal_l7_id': 'CK-K3-UT-194', 'module_path': 'helix/helix-harness/units/common-kernel/tests/test_k3.py', 'unittest_identity': 'test_k3.K3FormalFixtures.test_CK_K3_UT_194'},
)
FORMAL_MAPPING = FORMAL_MAPPING + K3_FORMAL_MAPPING
K5_STUB_IDS = frozenset((18, 19, *range(21, 33), *range(77, 84), 46, 85, 86))
K5_FORMAL_MAPPING = tuple(
    {
        "callable_qualname": f"K5Fixtures.test_ck_k5_ut_{number:03d}",
        "coverage_kind": "owner_or_fixture_stub" if number in K5_STUB_IDS else "primary_callable",
        "formal_l7_id": f"CK-K5-UT-{number:03d}",
        "module_path": "helix/helix-harness/units/common-kernel/tests/test_k5.py",
        "unittest_identity": f"test_k5.K5Fixtures.test_ck_k5_ut_{number:03d}",
    }
    for number in range(1, 92)
)
FORMAL_MAPPING = FORMAL_MAPPING + K5_FORMAL_MAPPING
K5_FORMAL_MAPPING_SHA256 = "9e25d170dc5dc5bb48af57dd487fdc2939715f71f7c0679b84005e5aeb341acc"
K5_FORMAL_MAPPING_COUNT = 91
K5_PRIMARY_COUNT = 67
K5_STUB_COUNT = 24
BASE_FORMAL_MAPPING = FORMAL_MAPPING
BASE_FORMAL_MAPPING_COUNT = 450
BASE_FORMAL_MAPPING_SHA256 = "439370e5a305949919fa959b9ee1c2d49f507ef2ed68457e4ba24947867c97cb"
BASE_PRIMARY_COUNT = 398
BASE_STUB_COUNT = 52
BASE_EXPECTED_DISCOVERY_IDS = EXPECTED_DISCOVERY_IDS
BASE_EXPECTED_DISCOVERY_COUNT = 534
BASE_EXPECTED_DISCOVERY_IDS_SHA256 = "45fe38adc541d60538ae4a2393c6f33116e9cebadba5c2629ecf7f85ee962d8e"

# K6 has 55 formal design IDs, but only 45 executable formal methods. Two
# executable methods are partial assertions; ten IDs have no callable and
# remain explicit, non-executable dispositions. Do not represent those ten
# IDs as unittest identities or fixture stubs.
K6_EXECUTABLE_UT_NUMBERS = (*range(1, 10), *range(14, 18), *range(20, 50), 53, 55)
K6_PARTIAL_UT_NUMBERS = frozenset((35, 36))
K6_FORMAL_MAPPING = tuple(
    {
        "callable_qualname": f"K6ImplementedFixtures.test_ck_k6_ut_{number:03d}",
        "coverage_kind": "partial_callable" if number in K6_PARTIAL_UT_NUMBERS else "primary_callable",
        "formal_l7_id": f"CK-K6-UT-{number:03d}",
        "module_path": "helix/helix-harness/units/common-kernel/tests/test_k6.py",
        "unittest_identity": f"test_k6.K6ImplementedFixtures.test_ck_k6_ut_{number:03d}",
    }
    for number in K6_EXECUTABLE_UT_NUMBERS
)
K6_UNEXECUTED_DISPOSITIONS = (
    {"formal_l7_id": "CK-K6-UT-010", "disposition": "owner_unconnected"},
    {"formal_l7_id": "CK-K6-UT-011", "disposition": "owner_unconnected"},
    {"formal_l7_id": "CK-K6-UT-012", "disposition": "owner_unconnected"},
    {"formal_l7_id": "CK-K6-UT-013", "disposition": "owner_unconnected"},
    {"formal_l7_id": "CK-K6-UT-018", "disposition": "partial_design"},
    {"formal_l7_id": "CK-K6-UT-019", "disposition": "partial_design"},
    {"formal_l7_id": "CK-K6-UT-050", "disposition": "owner_unconnected"},
    {"formal_l7_id": "CK-K6-UT-051", "disposition": "owner_unconnected"},
    {"formal_l7_id": "CK-K6-UT-052", "disposition": "owner_unconnected"},
    {"formal_l7_id": "CK-K6-UT-054", "disposition": "owner_unconnected"},
)
K6_FORMAL_COUNT = 55
K6_EXECUTABLE_FORMAL_COUNT = 45
K6_PRIMARY_COUNT = 43
K6_PARTIAL_COUNT = 2
K6_UNEXECUTED_COUNT = 10
K6_REGRESSION_IDS = (
    "test_k6.K6ImplementedFixtures.test_missing_owner_polarity_keeps_component_key_and_nonpositive",
    "test_k6.K6ImplementedFixtures.test_restored_record_metadata_is_not_synthesized",
    "test_k6.K6ImplementedFixtures.test_result_record_digest_mutation_is_rejected_as_conflict",
    "test_k6.K6ImplementedFixtures.test_unconnected_public_owner_bound_apis_are_not_exposed",
    "test_k6.K6ImplementedFixtures.test_same_check_identity_across_verifiers_has_no_namespace_carrier",
    "test_k6.K6ImplementedFixtures.test_receipt_verifier_must_match_derived_member_not_any_base_input",
    "test_k6.K6ImplementedFixtures.test_optimized_missing_fixed_output_observation_is_nonpositive",
)
K6_FORMAL_DISCOVERY_IDS = tuple(row["unittest_identity"] for row in K6_FORMAL_MAPPING)
K6_DISCOVERY_IDS = tuple(sorted((*K6_FORMAL_DISCOVERY_IDS, *K6_REGRESSION_IDS)))
FORMAL_MAPPING = FORMAL_MAPPING + K6_FORMAL_MAPPING
FORMAL_MAPPING_SHA256 = "7473135901595324b2b6a42ac59b4af877398e5e1471950da54969b60059ea9c"
EXPECTED_DISCOVERY_IDS = tuple(sorted((*EXPECTED_DISCOVERY_IDS, *K6_DISCOVERY_IDS)))
CORE_EXPECTED_DISCOVERY_IDS = EXPECTED_DISCOVERY_IDS
SUPPLEMENTAL_EXPECTED_DISCOVERY_IDS = tuple(sorted(
    alias + "." + qualname for _sid, _mechanism, alias, qualname in SUPPLEMENTAL_IDENTITIES))
EXPECTED_DISCOVERY_IDS = tuple(sorted((*CORE_EXPECTED_DISCOVERY_IDS,
                                        *SUPPLEMENTAL_EXPECTED_DISCOVERY_IDS)))
K3_FORMAL_MAPPING_SHA256 = "8c58deecd7739ba48a01e4281de6c93cf6ece107ad66fa3eaeac6d10f80323b0"
K3_DISCOVERY_IDS_SHA256 = "a3de5d8fbe0daf3500441a1e7a96fc9c6b71409e38fea446d6185dd05c86b70c"
K1_K2_FORMAL_MAPPING_SHA256 = "ca5c7a91e666a13062e6cd22a2bf157f54dad0ce7aa79f3815b70e19c7d11f19"
K1_K2_FORMAL_MAPPING_COUNT = 165
K1_K2_PRIMARY_COUNT = 139
K1_K2_STUB_COUNT = 26
K3_FORMAL_MAPPING_COUNT = 194
K3_PRIMARY_COUNT = 192
K3_STUB_COUNT = 2
K6_FORMAL_MAPPING_SHA256 = "12e75e7a54064d6f1bc9d5a7fbd2225b9bec4b04c6fa18a643e81ca035c194fd"
K6_DISPOSITION_SHA256 = "886884b4168945fd2d510f6ed787e46160821ebbb0292a6f82941434a8ef4e7d"
K6_FORMAL_CLOSURE_SHA256 = "476f65aecf6647fd11bd0e2850e972bec18b0f825e3761aa43fbbc934d657cb7"
FORMAL_MAPPING_COUNT = K1_K2_FORMAL_MAPPING_COUNT + K3_FORMAL_MAPPING_COUNT + K5_FORMAL_MAPPING_COUNT + K6_EXECUTABLE_FORMAL_COUNT
FORMAL_INVENTORY_COUNT = FORMAL_MAPPING_COUNT + K6_UNEXECUTED_COUNT
PRIMARY_MAPPING_COUNT = K1_K2_PRIMARY_COUNT + K3_PRIMARY_COUNT + K5_PRIMARY_COUNT + K6_PRIMARY_COUNT
STUB_MAPPING_COUNT = K1_K2_STUB_COUNT + K3_STUB_COUNT + K5_STUB_COUNT
PARTIAL_MAPPING_COUNT = K6_PARTIAL_COUNT
UNEXECUTED_FORMAL_COUNT = K6_UNEXECUTED_COUNT
FORMAL_ID_CLOSURE = tuple(sorted(
    [row["formal_l7_id"] for row in FORMAL_MAPPING]
    + [row["formal_l7_id"] for row in K6_UNEXECUTED_DISPOSITIONS]
))
K6_FORMAL_ID_CLOSURE = tuple(sorted(
    [row["formal_l7_id"] for row in K6_FORMAL_MAPPING]
    + [row["formal_l7_id"] for row in K6_UNEXECUTED_DISPOSITIONS]
))
K6_DISCOVERY_COUNT = 52
CORE_EXPECTED_DISCOVERY_COUNT = 586
EXPECTED_DISCOVERY_COUNT = COMPOSITE_DISCOVERY_COUNT
CORE_EXPECTED_DISCOVERY_IDS_SHA256 = "aca81abd7dd60c29512431c2d8223fd509d4c7a3a3fd7f1fc70847658ba0042d"
EXPECTED_DISCOVERY_IDS_SHA256 = COMPOSITE_DISCOVERY_IDS_SHA256
K6_DISCOVERY_IDS_SHA256 = "52e558bc65de379093d9a3fa46ce7d59909f23a33a15e6a135d1fcf09cd4c857"
RESULT_MAX_BYTES = 99820
MODULES = ("test_k1", "test_k2", "test_k3", "test_k5", "test_k6")

# Literal values permitted by the current L7 expansion rules.  Keeping the
# template-to-domain mapping explicit prevents arbitrary regex captures from
# standing in for a designed fixture ID.
_L7_TEMPLATE_VALUES = {
    "CK-K1-UT-009-ACCEPT-COMBINE-{CLASS}": {
        "CLASS": frozenset(("Value", "Unknown", "Unobserved", "NotApplicable", "Stale")),
    },
    "CK-K1-UT-009-ACCEPT-RECORD-{CLASS}": {
        "CLASS": frozenset(("Value", "Unknown", "Unobserved", "NotApplicable")),
    },
    "CK-K1-UT-009-LOOKUP-{CLASS}": {
        "CLASS": frozenset(("Value", "Unknown", "Unobserved", "NotApplicable")),
    },
    "CK-K1-UT-009-KEY-COMBINE-{CLASS}": {
        "CLASS": frozenset(("Value", "Unknown", "Unobserved", "NotApplicable", "Stale")),
    },
    "CK-K1-UT-012-MAP-{WORD}": {
        "WORD": frozenset(("ambiguous", "unsupported", "mismatch", "conflict", "absent",
                            "evaluation_error", "indeterminate", "unknown", "stale",
                            "not_observed", "未評価", "incompatible", "not_applicable")),
    },
    "CK-K1-UT-013-{FIELD}-{BOUNDARY}": {
        "FIELD": frozenset(("operation", "operation_version", "subject", "inputs", "scope",
                            "subject.kind", "subject.identity", "subject.revision", "subject.digest",
                            "input.kind", "input.identity", "input.revision", "input.digest")),
        "BOUNDARY": frozenset(("combine-component", "record-key", "lookup-query")),
    },
    "CK-K1-UT-014-KEY-{FIELD}": {
        "FIELD": frozenset(("operation", "operation_version", "subject", "inputs", "scope",
                            "subject.kind", "subject.identity", "subject.revision", "subject.digest",
                            "input.kind", "input.identity", "input.revision", "input.digest")),
    },
}


def inventory_value() -> dict:
    return {
        "suite_id": SUITE_ID,
        "core_suite_id": CORE_SUITE_ID,
        "source_sha256": dict(sorted(SOURCE_SHA256.items())),
        "current_design_paths": list(CURRENT_DESIGN_PATHS),
        "supplemental_source_sha256": dict(sorted(SUPPLEMENTAL_SOURCE_SHA256.items())),
        "supplemental_design_paths": list(SUPPLEMENTAL_DESIGN_PATHS),
        "supplemental_modules": [list(row) for row in SUPPLEMENTAL_MODULES],
        "fixed_test_modules": [list(row) for row in FIXED_TEST_MODULES],
        "supplemental_identities": [list(row) for row in SUPPLEMENTAL_IDENTITIES],
        "supplemental_ids_sha256": SUPPLEMENTAL_IDS_SHA256,
        "composite_discovery_count": COMPOSITE_DISCOVERY_COUNT,
        "composite_discovery_ids_sha256": COMPOSITE_DISCOVERY_IDS_SHA256,
        "mechanism_l7_sources": {key: list(value) for key, value in SUPPLEMENTAL_SOURCE_REFS.items()},
        "formal_mapping": list(FORMAL_MAPPING),
        "formal_mapping_sha256": FORMAL_MAPPING_SHA256,
        "formal_id_closure": list(FORMAL_ID_CLOSURE),
        "formal_inventory_count": FORMAL_INVENTORY_COUNT,
        "k6_unexecuted_dispositions": list(K6_UNEXECUTED_DISPOSITIONS),
        "k6_unexecuted_disposition_sha256": K6_DISPOSITION_SHA256,
        "expected_discovery_ids": list(EXPECTED_DISCOVERY_IDS),
        "expected_discovery_count": EXPECTED_DISCOVERY_COUNT,
        "expected_discovery_ids_sha256": EXPECTED_DISCOVERY_IDS_SHA256,
        "runner_profile": {"implementation": "CPython", "minimum_version": "3.11", "stdlib_module": "unittest"},
    }


def inventory_digest() -> str:
    return sha256(canonical_bytes(inventory_value()))


def l7_formal_ids_present(raw: bytes) -> bool:
    """Resolve each fixed formal ID against a literal or explicit L7 row expansion."""
    try:
        text = raw.decode("utf-8", "strict")
    except UnicodeError:
        return False
    tokens = re.findall(r"`([^`]+)`", text)
    templates = [token for token in tokens if token in _L7_TEMPLATE_VALUES]
    for ident in FORMAL_ID_CLOSURE:
        if ident in tokens:
            continue
        matched = False
        for template in templates:
            variables = re.findall(r"\{([A-Z]+)\}", template)
            pattern = re.escape(template)
            for variable in variables:
                pattern = pattern.replace(re.escape("{" + variable + "}"),
                                          rf"(?P<{variable}>[^`]+?)")
            expansion = re.fullmatch(pattern, ident)
            if expansion and all(expansion.group(variable) in _L7_TEMPLATE_VALUES[template][variable]
                                 for variable in variables):
                matched = True
                break
        if matched:
            continue
        for token in tokens:
            slash = re.fullmatch(r"(.+?)([a-z])/([a-z](?:/[a-z])*)", token)
            if slash:
                expanded = {slash.group(1) + suffix for suffix in (slash.group(2), *slash.group(3).split("/"))}
                if ident in expanded:
                    matched = True
                    break
            ranged = re.fullmatch(r"(.+?)([a-z])–([a-z])", token)
            if ranged:
                expanded = {ranged.group(1) + chr(code)
                            for code in range(ord(ranged.group(2)), ord(ranged.group(3)) + 1)}
                if ident in expanded:
                    matched = True
                    break
        if matched:
            continue
        class_row = "CK-K2-UT-001"
        classes = ("VALUE", "UNKNOWN", "UNOBSERVED", "NOT-APPLICABLE")
        if any(token == class_row for token in tokens) and any(
                ident == class_row + "-" + suffix for suffix in classes):
            matched = True
        if not matched:
            return False
    return True


class _AstName:
    """A name token used only while reading static AST constants."""

    def __init__(self, value: str):
        self.value = value


_AST_UNKNOWN = object()


def _ast_static_value(node, environment):
    """Evaluate the small literal subset used by fixed unittest generators."""
    if isinstance(node, ast.Constant):
        return node.value
    if isinstance(node, ast.Name):
        return environment.get(node.id, _AstName(node.id))
    if isinstance(node, (ast.Tuple, ast.List, ast.Set)):
        values = []
        for element in node.elts:
            value = _ast_static_value(element.value if isinstance(element, ast.Starred) else element,
                                      environment)
            if value is _AST_UNKNOWN:
                return _AST_UNKNOWN
            if isinstance(element, ast.Starred):
                if not isinstance(value, (tuple, list)):
                    return _AST_UNKNOWN
                values.extend(value)
            else:
                values.append(value)
        return tuple(values) if isinstance(node, ast.Tuple) else values
    if isinstance(node, ast.Call):
        if isinstance(node.func, ast.Name) and node.func.id == "range":
            args = [_ast_static_value(item, environment) for item in node.args]
            if all(type(item) is int for item in args) and not node.keywords:
                return tuple(range(*args))
            return _AST_UNKNOWN
        if isinstance(node.func, ast.Name) and node.func.id == "zip":
            args = [_ast_static_value(item, environment) for item in node.args]
            if all(isinstance(item, (tuple, list)) for item in args) and not node.keywords:
                return tuple(zip(*args))
            return _AST_UNKNOWN
        if isinstance(node.func, ast.Attribute) and node.func.attr == "replace":
            target = _ast_static_value(node.func.value, environment)
            args = [_ast_static_value(item, environment) for item in node.args]
            if (isinstance(target, str) and len(args) == 2
                    and all(isinstance(item, str) for item in args) and not node.keywords):
                return target.replace(*args)
            return _AST_UNKNOWN
        return _AST_UNKNOWN
    if isinstance(node, ast.BinOp) and isinstance(node.op, ast.Add):
        left = _ast_static_value(node.left, environment)
        right = _ast_static_value(node.right, environment)
        if type(left) is type(right) and isinstance(left, (str, int, tuple, list)):
            return left + right
        return _AST_UNKNOWN
    if isinstance(node, ast.JoinedStr):
        output = []
        for part in node.values:
            if isinstance(part, ast.Constant):
                output.append(str(part.value))
                continue
            if not isinstance(part, ast.FormattedValue):
                return _AST_UNKNOWN
            value = _ast_static_value(part.value, environment)
            if value is _AST_UNKNOWN or isinstance(value, _AstName):
                return _AST_UNKNOWN
            if part.conversion == ord("r"):
                value = repr(value)
            elif part.conversion == ord("s"):
                value = str(value)
            elif part.conversion == ord("a"):
                value = ascii(value)
            if part.format_spec is not None:
                spec_parts = []
                for spec_part in part.format_spec.values:
                    if not isinstance(spec_part, ast.Constant):
                        return _AST_UNKNOWN
                    spec_parts.append(str(spec_part.value))
                try:
                    value = format(value, "".join(spec_parts))
                except (TypeError, ValueError):
                    return _AST_UNKNOWN
            output.append(str(value))
        return "".join(output)
    return _AST_UNKNOWN


def _ast_assign_target(target, value, environment):
    if isinstance(target, ast.Name):
        environment[target.id] = value
        return
    if not isinstance(target, (ast.Tuple, ast.List)) or not isinstance(value, (tuple, list)):
        return
    star_index = next((index for index, item in enumerate(target.elts)
                       if isinstance(item, ast.Starred)), None)
    if star_index is None:
        if len(target.elts) == len(value):
            for child, item in zip(target.elts, value):
                _ast_assign_target(child, item, environment)
        return
    before, after = target.elts[:star_index], target.elts[star_index + 1:]
    if len(value) < len(before) + len(after):
        return
    for child, item in zip(before, value[:len(before)]):
        _ast_assign_target(child, item, environment)
    stop = len(value) - len(after) if after else len(value)
    _ast_assign_target(target.elts[star_index].value,
                       tuple(value[len(before):stop]), environment)
    for child, item in zip(after, value[len(value) - len(after):]):
        _ast_assign_target(child, item, environment)


def _ast_helper_registration(function, *, nested_name=None):
    """Read a fixed registration helper's class and generated-name template."""
    class_names, name_templates = set(), []
    if function is None:
        return None, None
    for node in ast.walk(function):
        if isinstance(node, ast.Call) and isinstance(node.func, ast.Name) and node.func.id == "setattr":
            if node.args and isinstance(node.args[0], ast.Name):
                class_names.add(node.args[0].id)
        if (nested_name is not None and isinstance(node, (ast.Assign, ast.AnnAssign))):
            targets = node.targets if isinstance(node, ast.Assign) else [node.target]
            value = node.value
            if any(isinstance(target, ast.Attribute) and target.attr == "__name__"
                   and isinstance(target.value, ast.Name) and target.value.id == nested_name
                   for target in targets):
                name_templates.append(value)
    if len(class_names) != 1 or len(name_templates) > 1:
        return None, None
    return next(iter(class_names)), (name_templates[0] if name_templates else None)


def _ast_test_identities_for_module(alias, raw: bytes, expected_classes):
    try:
        text = raw.decode("utf-8", "strict")
        tree = ast.parse(text, filename=alias)
    except (UnicodeError, SyntaxError, ValueError) as exc:
        raise Diagnostic("Unknown", "unreadable", "fixed test module cannot be parsed as UTF-8 AST") from exc

    class_nodes = [node for node in tree.body if isinstance(node, ast.ClassDef)]
    function_nodes = [node for node in tree.body
                      if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef))]
    class_names = [node.name for node in class_nodes]
    function_names = [node.name for node in function_nodes]
    if len(class_names) != len(set(class_names)) or len(function_names) != len(set(function_names)):
        raise Diagnostic("Unknown", "conflict", "fixed AST module has duplicate class or function names")
    for class_node in class_nodes:
        method_names = [node.name for node in class_node.body
                        if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef))
                        and node.name.startswith("test")]
        if len(method_names) != len(set(method_names)):
            raise Diagnostic("Unknown", "conflict", "fixed AST class has duplicate test method names")
    classes = {node.name: node for node in class_nodes}
    functions = {node.name: node for node in function_nodes}
    absent = set(expected_classes) - set(classes)
    if absent:
        raise Diagnostic("Unknown", "missing_input", "fixed AST test class is absent")
    if set(classes) - set(expected_classes):
        raise Diagnostic("Unknown", "conflict", "fixed AST module has an unlisted test class")

    actual = []
    for class_name, class_node in classes.items():
        for member in class_node.body:
            if isinstance(member, (ast.FunctionDef, ast.AsyncFunctionDef)) and member.name.startswith("test"):
                actual.append(f"{alias}.{class_name}.{member.name}")

    add_class, _ = _ast_helper_registration(functions.get("_add_l7_expansion"))
    if add_class is None and "_add_l7_expansion" in functions:
        raise Diagnostic("Unknown", "conflict", "fixed AST expansion helper has ambiguous owner class")
    install_class, install_template = _ast_helper_registration(
        functions.get("_install_case"), nested_name="test_case")
    if install_class is None and "_install_case" in functions:
        raise Diagnostic("Unknown", "conflict", "fixed AST installer has ambiguous owner class")

    def visit(statements, environment):
        for statement in statements:
            if isinstance(statement, (ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef)):
                continue
            if isinstance(statement, (ast.Assign, ast.AnnAssign)):
                value = _ast_static_value(statement.value, environment)
                targets = statement.targets if isinstance(statement, ast.Assign) else [statement.target]
                if value is not _AST_UNKNOWN:
                    for target in targets:
                        _ast_assign_target(target, value, environment)
                continue
            if isinstance(statement, ast.For):
                values = _ast_static_value(statement.iter, environment)
                if not isinstance(values, (tuple, list)):
                    continue
                for value in values:
                    nested = dict(environment)
                    _ast_assign_target(statement.target, value, nested)
                    visit(statement.body, nested)
                    visit(statement.orelse, nested)
                continue
            if isinstance(statement, ast.If):
                visit(statement.body, dict(environment))
                visit(statement.orelse, dict(environment))
                continue
            if not (isinstance(statement, ast.Expr) and isinstance(statement.value, ast.Call)):
                continue
            call = statement.value
            if isinstance(call.func, ast.Name) and call.func.id == "setattr" and len(call.args) >= 2:
                class_value = _ast_static_value(call.args[0], environment)
                class_name = class_value.value if isinstance(class_value, _AstName) else class_value
                method_name = _ast_static_value(call.args[1], environment)
                if (method_name is _AST_UNKNOWN and isinstance(call.args[1], ast.Attribute)
                        and call.args[1].attr == "__name__" and class_name == install_class
                        and install_template is not None):
                    method_name = _ast_static_value(install_template, environment)
                if class_name in classes and method_name is _AST_UNKNOWN:
                    raise Diagnostic("Unknown", "conflict", "fixed AST test method name is not statically resolvable")
                if class_name in classes and isinstance(method_name, str) and method_name.startswith("test"):
                    actual.append(f"{alias}.{class_name}.{method_name}")
                continue
            if isinstance(call.func, ast.Name) and call.func.id == "_add_l7_expansion":
                method_name = _ast_static_value(call.args[0], environment) if call.args else _AST_UNKNOWN
                if not isinstance(method_name, str) or add_class not in classes:
                    raise Diagnostic("Unknown", "conflict", "fixed AST expansion identity is not statically resolvable")
                actual.append(f"{alias}.{add_class}.{method_name}")
                continue
            if isinstance(call.func, ast.Name) and call.func.id == "_install_case":
                number = _ast_static_value(call.args[1], environment) if len(call.args) > 1 else _AST_UNKNOWN
                method_name = (_ast_static_value(install_template, {"ut_number": number})
                               if type(number) is int and install_template is not None else _AST_UNKNOWN)
                if not isinstance(method_name, str) or install_class not in classes:
                    raise Diagnostic("Unknown", "conflict", "fixed AST installer identity is not statically resolvable")
                actual.append(f"{alias}.{install_class}.{method_name}")

    visit(tree.body, {})
    return actual


def validate_fixed_test_ast_inventory(source_bytes: dict[str, bytes]) -> None:
    """Match nine fixed aliases' class/method identities using AST only; import occurs in sandbox."""
    aliases = [alias for alias, _path in FIXED_TEST_MODULES]
    paths = [path for _alias, path in FIXED_TEST_MODULES]
    if (len(aliases) != 9 or len(set(aliases)) != 9 or len(set(paths)) != 9
            or set(source_bytes) != set(paths)):
        missing = set(paths) - set(source_bytes)
        reason = "missing_input" if missing else "conflict"
        raise Diagnostic("Unknown", reason, "fixed AST test module aliases or source paths differ")

    expected = list(EXPECTED_DISCOVERY_IDS)
    if (len(expected) != 613 or len(set(expected)) != 613
            or any(len(identity.split(".")) != 3 for identity in expected)):
        raise Diagnostic("Unknown", "conflict", "fixed AST expected identity inventory is malformed")
    expected_by_alias = {alias: set() for alias in aliases}
    for identity in expected:
        alias, class_name, method_name = identity.split(".")
        if alias not in expected_by_alias or not class_name or not method_name.startswith("test"):
            raise Diagnostic("Unknown", "conflict", "fixed AST identity is outside the closed aliases")
        expected_by_alias[alias].add(identity)

    actual = []
    for alias, path in FIXED_TEST_MODULES:
        classes = {identity.split(".")[1] for identity in expected_by_alias[alias]}
        actual.extend(_ast_test_identities_for_module(alias, source_bytes[path], classes))
    if len(actual) != len(set(actual)) or set(actual) != set(expected):
        raise Diagnostic("Unknown", "conflict", "AST test identities differ from the closed 613 identities")


def _markdown_cells(line: str) -> list[str] | None:
    """Split one markdown table row without treating escaped pipes as separators."""
    stripped = line.strip()
    if not stripped.startswith("|") or not stripped.endswith("|"):
        return None
    result, current = [], []
    escaped = False
    for char in stripped[1:-1]:
        if char == "|" and not escaped:
            result.append("".join(current).strip())
            current = []
        else:
            current.append(char)
        if char == "\\" and not escaped:
            escaped = True
        else:
            escaped = False
    result.append("".join(current).strip())
    return result


def collect_mechanism_l7_trace(source_bytes: dict[str, bytes]) -> dict[str, list[dict]]:
    """Extract raw formal locators and separate indexes from fixed L7 tables."""
    formal_traces, nfr_reuse_indexes, oracle_indexes = [], [], []
    for mechanism, (path, formal_count, prefix, included_sections) in SUPPLEMENTAL_SOURCE_REFS.items():
        raw = source_bytes.get(path)
        if not isinstance(raw, bytes):
            raise Diagnostic("Unknown", "missing_input", "fixed mechanism L7 source is unavailable")
        try:
            text = raw.decode("utf-8", "strict")
        except UnicodeError as exc:
            raise Diagnostic("Unknown", "unreadable", "mechanism L7 source is not UTF-8") from exc
        rows, reuse_indexes, section_oracle_indexes = [], [], []
        headers = None
        heading = ""
        section = None
        for line_number, line in enumerate(text.splitlines(), 1):
            if line.startswith("#"):
                heading = line.strip()
                match = re.match(r"^## (\d+)(?:\.|\s)", line)
                if match:
                    section = int(match.group(1))
            cells = _markdown_cells(line)
            if cells is None:
                headers = None
                continue
            if all(re.fullmatch(r":?-{3,}:?", cell.replace(" ", "")) for cell in cells):
                continue
            first_tokens = re.findall(r"`([^`]+)`", cells[0]) if cells else []
            if not first_tokens:
                headers = cells
                continue
            identifier = first_tokens[0]
            if (mechanism == "LABO" and section == 4
                    and identifier.startswith("IV-LABO-NFR-")):
                if tuple(headers or ()) != _FIXED_L7_TABLE_HEADERS["LABO"][4] or len(cells) != 3:
                    raise Diagnostic("Unknown", "conflict", "LABO NFR oracle index schema is not fixed")
                section_oracle_indexes.append(_source_trace_row(
                    path, mechanism, identifier, line_number, heading, line, cells, headers,
                    category="nfr_oracle_index"))
                continue
            if mechanism == "LABO" and section == 4 and identifier.startswith("IV-LABO-"):
                # Preserve the fixed section-4 header while skipping non-NFR oracle rows.
                continue
            if not identifier.startswith(prefix):
                headers = cells
                continue
            if mechanism == "INFRA" and not re.fullmatch(r"INFRA-L7-(?:NFR-)?\d{3}-\d{2}", identifier):
                continue
            if mechanism != "INFRA" and not re.fullmatch(re.escape(prefix) + r"\d{3}", identifier):
                continue
            if section not in included_sections:
                headers = cells
                continue
            expected_header = _FIXED_L7_TABLE_HEADERS.get(mechanism, {}).get(section)
            if expected_header is None or tuple(headers or ()) != expected_header:
                raise Diagnostic("Unknown", "conflict", "mechanism L7 table header differs from the fixed schema")
            if len(cells) != len(expected_header):
                raise Diagnostic("Unknown", "conflict", "mechanism L7 formal row width differs from the fixed schema")
            if mechanism == "LABO":
                index_kind = cells[2].strip("`")
                if index_kind == "nfr_reuse_index":
                    reuse_indexes.append(_source_trace_row(
                        path, mechanism, identifier, line_number, heading, line, cells, headers,
                        category="nfr_reuse_index"))
                    continue
                if index_kind not in {"input_api_case", "output_oracle_self_test",
                                      "input_api_case / partial_mapping"}:
                    raise Diagnostic("Unknown", "conflict", "LABO L7 index kind is not recognized")
            rows.append(_source_trace_row(path, mechanism, identifier, line_number,
                                          heading, line, cells, headers,
                                          category="formal_locator"))
        if len(rows) != formal_count:
            raise Diagnostic("Unknown", "missing_input", "mechanism L7 locator rows are incomplete")
        ids = [row["source_id"] for row in rows]
        if len(ids) != len(set(ids)):
            raise Diagnostic("Unknown", "conflict", "mechanism L7 locator IDs are duplicated")
        if sha256(("\n".join(sorted(ids)) + "\n").encode("utf-8")) != _FORMAL_LOCATOR_SHA256[mechanism]:
            raise Diagnostic("Unknown", "conflict", "mechanism L7 formal locator set differs from its fixed set")
        formal_traces.extend(rows)
        nfr_reuse_indexes.extend(reuse_indexes)
        oracle_indexes.extend(section_oracle_indexes)
    infra_nfr_formal_count = sum(
        row["mechanism"] == "INFRA" and row["source_id"].startswith("INFRA-L7-NFR-")
        for row in formal_traces)
    reuse_ids = [row["source_id"] for row in nfr_reuse_indexes]
    oracle_ids = [row["source_id"] for row in oracle_indexes]
    if (len(reuse_ids) != len(_LABO_NFR_REUSE_IDS)
            or len(oracle_ids) != len(_LABO_NFR_ORACLE_IDS)
            or infra_nfr_formal_count != 6):
        raise Diagnostic("Unknown", "missing_input", "fixed mechanism L7 index rows are incomplete")
    if (len(set(reuse_ids)) != len(reuse_ids) or set(reuse_ids) != _LABO_NFR_REUSE_IDS
            or len(set(oracle_ids)) != len(oracle_ids) or set(oracle_ids) != _LABO_NFR_ORACLE_IDS):
        raise Diagnostic("Unknown", "conflict", "fixed mechanism L7 index IDs differ from their closed sets")
    status_cells, owner_cells, owner_boundaries, status_absent, owner_absent = (
        _collect_status_owner_trace(source_bytes))
    return {"formal_locators": formal_traces,
            "nfr_reuse_indexes": nfr_reuse_indexes,
            "oracle_index_rows": oracle_indexes,
            "source_status_cells": status_cells,
            "owner_return_cells": owner_cells,
            "owner_boundary_cells": owner_boundaries,
            "status_not_declared": status_absent,
            "owner_return_not_declared": owner_absent,
            "source_context_sections": _collect_source_context_sections(source_bytes)}


def _collect_status_owner_trace(source_bytes: dict[str, bytes]) -> tuple[list[dict], list[dict], list[dict], list[dict], list[dict]]:
    """Collect only cells from the exact fixed status/owner table schemas."""
    status_cells, owner_cells, owner_boundaries = [], [], []
    status_absent, owner_absent = [], []
    for mechanism, (path, _formal_count, _prefix, _sections) in SUPPLEMENTAL_SOURCE_REFS.items():
        raw = source_bytes.get(path)
        if not isinstance(raw, bytes):
            raise Diagnostic("Unknown", "missing_input", "fixed mechanism L7 source is unavailable")
        try:
            lines = raw.decode("utf-8", "strict").splitlines()
        except UnicodeError as exc:
            raise Diagnostic("Unknown", "unreadable", "mechanism L7 source is not UTF-8") from exc
        current_section = 0
        header = None
        found_sections = set()
        for line_number, line in enumerate(lines, 1):
            if line.startswith("## "):
                match = re.match(r"^## (\d+)(?:\.|\s)", line)
                current_section = int(match.group(1)) if match else 0
                header = None
            cells = _markdown_cells(line)
            if cells is None:
                header = None
                continue
            if all(re.fullmatch(r":?-{3,}:?", cell.replace(" ", "")) for cell in cells):
                continue
            specs = _FIXED_STATUS_TABLES.get(mechanism, {})
            spec = specs.get(current_section)
            if spec is None:
                if not any(re.fullmatch(r"`[^`]+`", cell) for cell in cells):
                    header = cells
                continue
            if not any(re.fullmatch(r"`[^`]+`", cell) for cell in cells):
                header = cells
                continue
            if tuple(header or ()) != spec["header"] or len(cells) != len(spec["header"]):
                first_value = cells[0].strip("`") if cells else ""
                is_fixed_row = ((mechanism == "INFRA" and current_section == 5
                                and first_value.startswith("INFRA-L7-"))
                                or (mechanism == "INFRA" and current_section == 9
                                    and first_value.startswith("L8-INFRA-"))
                                or (mechanism == "HARNESS" and current_section == 7
                                    and first_value.startswith(("UT-HARNESS-", "test_stage1_pack."))))
                if is_fixed_row:
                    raise Diagnostic("Unknown", "conflict", "fixed status table header differs from its schema")
                continue
            row = _raw_status_row(path, mechanism, current_section, line_number,
                                  cells, spec, line)
            status_cells.append(row)
            if "owner_column" in spec:
                owner_cells.append({"mechanism": mechanism, "source_row_locator": row["source_row_locator"],
                                    "row_key": row["row_key"], "cell_ref": row["owner_cell_ref"],
                                    "header": spec["header"][spec["owner_column"]],
                                    "raw_literal": cells[spec["owner_column"]]})
            found_sections.add(current_section)
        for section, spec in _FIXED_STATUS_TABLES.get(mechanism, {}).items():
            section_rows = [row for row in status_cells
                             if row["mechanism"] == mechanism and row["section"] == section]
            keys = [tuple(row["row_key"]) for row in section_rows]
            if len(keys) != len(set(keys)):
                raise Diagnostic("Unknown", "conflict", "fixed status table row keys are duplicated")
            if (len(section_rows) != spec["expected_rows"]
                    or ("expected_keys" in spec
                        and set(row["row_key"][0] for row in section_rows) != set(spec["expected_keys"]))):
                raise Diagnostic("Unknown", "missing_input", "fixed mechanism status rows are incomplete")
        if mechanism in ("BRAIN", "LABO"):
            status_absent.append({"mechanism": mechanism, "source_ref": path,
                                 "kind": "NotDeclaredBySource",
                                 "scope": "fixed formal L7 locator table has no status column"})
        if mechanism != "INFRA":
            owner_absent.append({"mechanism": mechanism, "source_ref": path,
                                 "kind": "NotDeclaredBySource",
                                 "scope": "fixed L7 source table has no owner-return column"})
        if mechanism == "LABO":
            owner_boundaries.extend(_collect_fixed_table_cells(source_bytes[path], path, mechanism, 3))
        elif mechanism == "HARNESS":
            owner_boundaries.extend(_collect_fixed_table_cells(source_bytes[path], path, mechanism, 3))
    return status_cells, owner_cells, owner_boundaries, status_absent, owner_absent


def _collect_fixed_table_cells(raw: bytes, path: str, mechanism: str, section: int) -> list[dict]:
    try:
        lines = raw.decode("utf-8", "strict").splitlines()
    except UnicodeError as exc:
        raise Diagnostic("Unknown", "unreadable", "mechanism L7 source is not UTF-8") from exc
    current_section = 0
    header = None
    result = []
    spec = _FIXED_BOUNDARY_TABLES[mechanism][section]
    for line_number, line in enumerate(lines, 1):
        if line.startswith("## "):
            match = re.match(r"^## (\d+)(?:\.|\s)", line)
            current_section = int(match.group(1)) if match else 0
            header = None
        cells = _markdown_cells(line)
        if cells is None:
            header = None
            continue
        if all(re.fullmatch(r":?-{3,}:?", cell.replace(" ", "")) for cell in cells):
            continue
        if current_section != section:
            continue
        if not any(re.fullmatch(r"`[^`]+`", cell) for cell in cells):
            header = cells
            continue
        first = cells[0].strip("`") if cells else ""
        looks_fixed = first.startswith("LABO-UT-") if mechanism == "LABO" else first.startswith("UT-HARNESS-")
        if tuple(header or ()) != spec["header"] or len(cells) != len(spec["header"]):
            if looks_fixed:
                raise Diagnostic("Unknown", "conflict", "fixed owner boundary table header differs from its schema")
            continue
        column = spec["column"]
        if column >= len(cells):
            raise Diagnostic("Unknown", "conflict", "fixed owner boundary cell is absent")
        result.append({"mechanism": mechanism, "collection_kind": spec["kind"],
                       "source_row_locator": f"{path}#L{line_number}",
                       "row_key": first, "cell_ref": f"{path}#L{line_number}:C{column + 1}",
                       "header": spec["header"][column], "raw_literal": cells[column],
                       "raw_row": line})
    row_keys = [row["row_key"] for row in result]
    if len(result) != spec["expected_rows"] or len(row_keys) != len(set(row_keys)):
        raise Diagnostic("Unknown", "conflict" if len(row_keys) != len(set(row_keys)) else "missing_input",
                         "fixed owner boundary rows differ from their closed set")
    if sha256(("\n".join(sorted(row_keys)) + "\n").encode("utf-8")) != spec["id_digest"]:
        raise Diagnostic("Unknown", "conflict", "fixed owner boundary row keys differ from their closed set")
    return result


def _collect_source_context_sections(source_bytes: dict[str, bytes]) -> list[dict]:
    """Keep exact section spans as source refs without interpreting their prose."""
    sections = []
    for mechanism, (path, _formal_count, _prefix, _included) in SUPPLEMENTAL_SOURCE_REFS.items():
        raw = source_bytes.get(path)
        if not isinstance(raw, bytes):
            raise Diagnostic("Unknown", "missing_input", "fixed mechanism L7 source is unavailable")
        try:
            lines = raw.decode("utf-8", "strict").splitlines(keepends=True)
        except UnicodeError as exc:
            raise Diagnostic("Unknown", "unreadable", "mechanism L7 source is not UTF-8") from exc
        found = {}
        current = None
        for line_number, line in enumerate(lines, 1):
            if line.startswith("## "):
                match = re.match(r"^## (\d+)(?:\.|\s)", line)
                section_number = int(match.group(1)) if match else None
                if current in found:
                    found[current]["end_line"] = line_number - 1
                if section_number in found:
                    raise Diagnostic("Unknown", "conflict", "fixed source context section heading is duplicated")
                current = section_number
                if current in _FIXED_SOURCE_CONTEXT_SECTIONS[mechanism]:
                    found[current] = {"mechanism": mechanism, "source_ref": path,
                                      "section": current, "heading": line.strip(),
                                      "start_line": line_number, "end_line": None,
                                      "raw_bytes": bytearray()}
            if current in found:
                found[current]["raw_bytes"].extend(line.encode("utf-8"))
        if current is not None and current in found:
            found[current]["end_line"] = len(lines)
        expected_sections = _FIXED_SOURCE_CONTEXT_SECTIONS[mechanism]
        if set(found) != set(expected_sections):
            raise Diagnostic("Unknown", "missing_input", "fixed source context sections are incomplete")
        for section_number in expected_sections:
            entry = found[section_number]
            raw_section = bytes(entry.pop("raw_bytes"))
            entry["byte_count"] = len(raw_section)
            entry["section_sha256"] = sha256(raw_section)
            sections.append(entry)
    return sections


def _raw_status_row(path, mechanism, section, line_number, cells, spec, line):
    key_columns = spec["key_columns"]
    row_key = [cells[index].strip("`") for index in key_columns]
    if any(not value for value in row_key):
        raise Diagnostic("Unknown", "conflict", "fixed status row has an empty key")
    status_column = spec["status_column"]
    return {"mechanism": mechanism, "section": section,
            "source_row_locator": f"{path}#L{line_number}", "row_key": row_key,
            "raw_row": line, "status_cell_ref": f"{path}#L{line_number}:C{status_column + 1}",
            "status_header": spec["header"][status_column],
            "status_raw_literal": cells[status_column],
            **({"owner_cell_ref": f"{path}#L{line_number}:C{spec['owner_column'] + 1}"}
               if "owner_column" in spec else {})}


def _source_trace_row(path, mechanism, identifier, line_number, heading, line, cells,
                      headers, *, category):
    return {"mechanism": mechanism, "source_id": identifier, "source_kind": category,
            "source_row_locator": f"{path}#L{line_number}",
            "source_heading": heading, "header_cells": list(headers or ()),
            "raw_cells": list(cells), "raw_row": line,
            "l8_refs": sorted(set(re.findall(r"(?:CASE-)?L8-[A-Z0-9-]+", line))),
            "l9_refs": sorted(set(re.findall(r"IV-[A-Z0-9-]+", line)))}


def _ids(suite):
    for item in suite:
        if isinstance(item, unittest.TestSuite):
            yield from _ids(item)
        else:
            yield item.id()


def _load_fixed_suite(root: Path):
    modules = []
    for module_name, relative_source in FIXED_TEST_MODULES:
        source = root / relative_source
        spec = importlib.util.spec_from_file_location(module_name, source)
        if spec is None or spec.loader is None:
            raise Diagnostic("Unknown", "unreadable", "fixed suite module cannot be loaded")
        module = importlib.util.module_from_spec(spec)
        sys.modules[module_name] = module
        spec.loader.exec_module(module)
        modules.append(module)
    loader = unittest.TestLoader()
    suites = [loader.loadTestsFromModule(module) for module in modules]
    combined = unittest.TestSuite(suites)
    return combined


class _IdentityResult(unittest.TextTestResult):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.executed_ids = []
    def startTest(self, test):
        self.executed_ids.append(test.id())
        super().startTest(test)


def _result_payload(discovered, result, exit_code):
    failed_ids = sorted({test.id() for test, _ in result.failures})
    error_ids = sorted({test.id() for test, _ in result.errors})
    skipped_ids = sorted({test.id() for test, _ in result.skipped})
    expected_failure_ids = sorted({test.id() for test, _ in result.expectedFailures})
    unexpected_success_ids = sorted({test.id() for test in result.unexpectedSuccesses})
    executed_ids = list(result.executed_ids)
    complete = (result.testsRun == EXPECTED_DISCOVERY_COUNT
                and len(executed_ids) == EXPECTED_DISCOVERY_COUNT
                and len(set(executed_ids)) == EXPECTED_DISCOVERY_COUNT
                and set(executed_ids) == set(discovered))
    outcomes = (failed_ids, error_ids, skipped_ids, expected_failure_ids, unexpected_success_ids)
    state = "success" if complete and exit_code == 0 and not any(outcomes) else "fail"
    return {
        "schema_version": 1, "suite_id": SUITE_ID, "complete": complete,
        "discovered_test_ids": list(discovered), "executed_test_ids": executed_ids,
        "test_count": result.testsRun, "failure_count": len(failed_ids), "failed_ids": failed_ids,
        "error_count": len(error_ids), "error_ids": error_ids,
        "skip_count": len(skipped_ids), "skipped_ids": skipped_ids,
        "expected_failure_count": len(expected_failure_ids),
        "expected_failure_ids": expected_failure_ids,
        "unexpected_success_count": len(unexpected_success_ids),
        "unexpected_success_ids": unexpected_success_ids,
        "exit_code": exit_code, "state": state,
    }


def _run_discovered_suite(suite):
    discovered = sorted(_ids(suite))
    if len(discovered) != len(set(discovered)) or tuple(discovered) != EXPECTED_DISCOVERY_IDS:
        return ({"schema_version": 1, "suite_id": SUITE_ID, "complete": False,
                 "discovered_test_ids": discovered, "executed_test_ids": [],
                 "diagnostic": {"classification": "Unknown", "reason": "conflict"}}, 2)
    stream = io.StringIO()
    runner = unittest.TextTestRunner(stream=stream, resultclass=_IdentityResult, verbosity=0)
    result = runner.run(suite)
    complete = (result.testsRun == EXPECTED_DISCOVERY_COUNT
                and len(result.executed_ids) == EXPECTED_DISCOVERY_COUNT
                and len(set(result.executed_ids)) == EXPECTED_DISCOVERY_COUNT
                and set(result.executed_ids) == set(discovered))
    exit_code = 0 if (complete and result.wasSuccessful() and not result.skipped
                      and not result.expectedFailures and not result.unexpectedSuccesses) else 1
    return _result_payload(discovered, result, exit_code), exit_code


def run_suite(root: Path) -> tuple[dict, int]:
    if (len(BASE_FORMAL_MAPPING) != BASE_FORMAL_MAPPING_COUNT
            or sha256(canonical_bytes(list(BASE_FORMAL_MAPPING))) != BASE_FORMAL_MAPPING_SHA256
            or len(BASE_EXPECTED_DISCOVERY_IDS) != BASE_EXPECTED_DISCOVERY_COUNT
            or sha256(("\n".join(BASE_EXPECTED_DISCOVERY_IDS) + "\n").encode()) != BASE_EXPECTED_DISCOVERY_IDS_SHA256):
        raise Diagnostic("Unknown", "conflict", "protected K1/K2/K3/K5 inventory changed")
    if len(FORMAL_MAPPING) != FORMAL_MAPPING_COUNT or len({row["formal_l7_id"] for row in FORMAL_MAPPING}) != FORMAL_MAPPING_COUNT:
        raise Diagnostic("Unknown", "conflict", "fixed formal mapping inventory is inconsistent")
    if (sum(row["coverage_kind"] == "primary_callable" for row in FORMAL_MAPPING) != PRIMARY_MAPPING_COUNT
            or sum(row["coverage_kind"] == "owner_or_fixture_stub" for row in FORMAL_MAPPING) != STUB_MAPPING_COUNT
            or sum(row["coverage_kind"] == "partial_callable" for row in FORMAL_MAPPING) != PARTIAL_MAPPING_COUNT):
        raise Diagnostic("Unknown", "conflict", "fixed primary/stub/partial mapping counts are inconsistent")
    if sha256(canonical_bytes(list(FORMAL_MAPPING[:K1_K2_FORMAL_MAPPING_COUNT]))) != K1_K2_FORMAL_MAPPING_SHA256:
        raise Diagnostic("Unknown", "conflict", "protected K1/K2 formal mapping bytes changed")
    if (len(K3_FORMAL_MAPPING) != K3_FORMAL_MAPPING_COUNT
            or sum(row["coverage_kind"] == "primary_callable" for row in K3_FORMAL_MAPPING) != K3_PRIMARY_COUNT
            or sum(row["coverage_kind"] == "owner_or_fixture_stub" for row in K3_FORMAL_MAPPING) != K3_STUB_COUNT
            or sha256(canonical_bytes(list(K3_FORMAL_MAPPING))) != K3_FORMAL_MAPPING_SHA256):
        raise Diagnostic("Unknown", "conflict", "fixed K3 mapping inventory is inconsistent")
    if (len(K5_FORMAL_MAPPING) != K5_FORMAL_MAPPING_COUNT
            or sum(row["coverage_kind"] == "primary_callable" for row in K5_FORMAL_MAPPING) != K5_PRIMARY_COUNT
            or sum(row["coverage_kind"] == "owner_or_fixture_stub" for row in K5_FORMAL_MAPPING) != K5_STUB_COUNT
            or sha256(canonical_bytes(list(K5_FORMAL_MAPPING))) != K5_FORMAL_MAPPING_SHA256):
        raise Diagnostic("Unknown", "conflict", "fixed K5 mapping inventory is inconsistent")
    if (len(K6_FORMAL_MAPPING) != K6_EXECUTABLE_FORMAL_COUNT
            or sum(row["coverage_kind"] == "primary_callable" for row in K6_FORMAL_MAPPING) != K6_PRIMARY_COUNT
            or sum(row["coverage_kind"] == "partial_callable" for row in K6_FORMAL_MAPPING) != K6_PARTIAL_COUNT
            or sha256(canonical_bytes(list(K6_FORMAL_MAPPING))) != K6_FORMAL_MAPPING_SHA256):
        raise Diagnostic("Unknown", "conflict", "fixed K6 callable mapping inventory is inconsistent")
    disposition_ids = [row.get("formal_l7_id") for row in K6_UNEXECUTED_DISPOSITIONS]
    if (len(K6_UNEXECUTED_DISPOSITIONS) != K6_UNEXECUTED_COUNT
            or len(set(disposition_ids)) != K6_UNEXECUTED_COUNT
            or set(disposition_ids) & {row["formal_l7_id"] for row in K6_FORMAL_MAPPING}
            or any(set(row) != {"formal_l7_id", "disposition"}
                   or row["disposition"] not in {"partial_design", "owner_unconnected"}
                   for row in K6_UNEXECUTED_DISPOSITIONS)
            or sha256(canonical_bytes(list(K6_UNEXECUTED_DISPOSITIONS))) != K6_DISPOSITION_SHA256):
        raise Diagnostic("Unknown", "conflict", "fixed K6 unexecuted disposition inventory is inconsistent")
    if (len(K6_FORMAL_ID_CLOSURE) != K6_FORMAL_COUNT
            or len(set(K6_FORMAL_ID_CLOSURE)) != K6_FORMAL_COUNT
            or K6_FORMAL_ID_CLOSURE != tuple(f"CK-K6-UT-{number:03d}" for number in range(1, 56))
            or sha256(canonical_bytes(list(K6_FORMAL_ID_CLOSURE))) != K6_FORMAL_CLOSURE_SHA256):
        raise Diagnostic("Unknown", "conflict", "fixed K6 formal ID closure is incomplete")
    if (len(K6_DISCOVERY_IDS) != K6_DISCOVERY_COUNT
            or len(set(K6_DISCOVERY_IDS)) != K6_DISCOVERY_COUNT
            or sha256(("\n".join(K6_DISCOVERY_IDS) + "\n").encode()) != K6_DISCOVERY_IDS_SHA256):
        raise Diagnostic("Unknown", "conflict", "fixed K6 discovery inventory is inconsistent")
    if (len(FORMAL_ID_CLOSURE) != FORMAL_INVENTORY_COUNT
            or len(set(FORMAL_ID_CLOSURE)) != FORMAL_INVENTORY_COUNT
            or FORMAL_ID_CLOSURE != tuple(sorted(FORMAL_ID_CLOSURE))):
        raise Diagnostic("Unknown", "conflict", "fixed formal ID closure is incomplete or duplicated")
    if sha256(canonical_bytes(list(FORMAL_MAPPING))) != FORMAL_MAPPING_SHA256:
        raise Diagnostic("Unknown", "conflict", "fixed formal mapping bytes differ from its digest")
    if (len(K1_K2_DISCOVERY_IDS) != 199
            or sha256(("\n".join(K1_K2_DISCOVERY_IDS) + "\n").encode()) != K1_K2_DISCOVERY_IDS_SHA256
            or not set(K1_K2_DISCOVERY_IDS) <= set(EXPECTED_DISCOVERY_IDS)):
        raise Diagnostic("Unknown", "conflict", "protected K1/K2 discovery inventory changed")
    mapping_ids = [row["unittest_identity"] for row in FORMAL_MAPPING]
    if len(set(mapping_ids)) != len(mapping_ids) or not set(mapping_ids) <= set(EXPECTED_DISCOVERY_IDS):
        raise Diagnostic("Unknown", "conflict", "formal mapping identities are not unique members of the fixed discovery set")
    if (len(K3_DISCOVERY_IDS) != 220 or len(set(K3_DISCOVERY_IDS)) != 220
            or sha256(("\n".join(K3_DISCOVERY_IDS) + "\n").encode()) != K3_DISCOVERY_IDS_SHA256
            or not set(K3_DISCOVERY_IDS) <= set(EXPECTED_DISCOVERY_IDS)):
        raise Diagnostic("Unknown", "conflict", "fixed K3 discovery inventory is inconsistent")
    if (len(K5_DISCOVERY_IDS) != 115 or len(set(K5_DISCOVERY_IDS)) != 115
            or sha256(("\n".join(K5_DISCOVERY_IDS) + "\n").encode()) != K5_DISCOVERY_IDS_SHA256
            or not set(K5_DISCOVERY_IDS) <= set(EXPECTED_DISCOVERY_IDS)):
        raise Diagnostic("Unknown", "conflict", "fixed K5 discovery inventory is inconsistent")
    if (not set(K6_FORMAL_DISCOVERY_IDS) <= set(K6_DISCOVERY_IDS)
            or not set(K6_REGRESSION_IDS) <= set(K6_DISCOVERY_IDS)
            or not set(K6_DISCOVERY_IDS) <= set(EXPECTED_DISCOVERY_IDS)):
        raise Diagnostic("Unknown", "conflict", "K6 callable identities are not bound to the fixed suite")
    if (len(EXPECTED_DISCOVERY_IDS) != EXPECTED_DISCOVERY_COUNT
            or len(set(EXPECTED_DISCOVERY_IDS)) != EXPECTED_DISCOVERY_COUNT
            or EXPECTED_DISCOVERY_IDS != tuple(sorted(EXPECTED_DISCOVERY_IDS))
            or sha256(("\n".join(EXPECTED_DISCOVERY_IDS) + "\n").encode()) != EXPECTED_DISCOVERY_IDS_SHA256):
        raise Diagnostic("Unknown", "conflict", "fixed expected discovery identity inventory is inconsistent")
    all_source_sha256 = {**SOURCE_SHA256, **SUPPLEMENTAL_SOURCE_SHA256}
    for relative, expected in all_source_sha256.items():
        source = root / relative
        try:
            actual = sha256(source.read_bytes())
        except OSError as exc:
            raise Diagnostic("Unknown", "missing_input", "fixed suite source is unavailable") from exc
        if actual != expected:
            raise Diagnostic("Unknown", "conflict", "fixed suite source bytes differ from inventory")
    ast_test_sources = {}
    for _alias, relative in FIXED_TEST_MODULES:
        try:
            ast_test_sources[relative] = (root / relative).read_bytes()
        except OSError as exc:
            raise Diagnostic("Unknown", "missing_input", "fixed AST test source is unavailable") from exc
    validate_fixed_test_ast_inventory(ast_test_sources)
    source_bytes = {}
    for _mechanism, (relative, _minimum, _prefix, _sections) in SUPPLEMENTAL_SOURCE_REFS.items():
        try:
            source_bytes[relative] = (root / relative).read_bytes()
        except OSError as exc:
            raise Diagnostic("Unknown", "missing_input", "fixed mechanism L7 source is unavailable") from exc
    trace = collect_mechanism_l7_trace(source_bytes)
    if not trace:
        raise Diagnostic("Unknown", "missing_input", "fixed mechanism L7 locator sources are empty")
    for relative in (*CURRENT_DESIGN_PATHS, *SUPPLEMENTAL_DESIGN_PATHS):
        try:
            (root / relative).read_bytes()
        except OSError as exc:
            raise Diagnostic("Unknown", "missing_input", "fixed current L6/L7 target source is unavailable") from exc
    with contextlib.redirect_stdout(io.StringIO()), contextlib.redirect_stderr(io.StringIO()):
        suite = _load_fixed_suite(root)
        return _run_discovered_suite(suite)


def main(argv=None):
    import argparse
    parser = argparse.ArgumentParser(add_help=False)
    parser.add_argument("--suite", choices=(SUITE_ID,), required=True)
    args = parser.parse_args(argv)
    try:
        payload, code = run_suite(Path.cwd())
    except Diagnostic as exc:
        payload, code = {"schema_version": 1, "suite_id": SUITE_ID, "complete": False,
                         "diagnostic": exc.as_dict()}, 2
    encoded = canonical_bytes(payload)
    if len(encoded) > RESULT_MAX_BYTES:
        payload, code = {"schema_version": 1, "suite_id": SUITE_ID, "complete": False,
                         "diagnostic": {"classification": "Unknown", "reason": "conflict"}}, 2
        encoded = canonical_bytes(payload)
    sys.stdout.buffer.write(encoded + b"\n")
    return code


if __name__ == "__main__":
    raise SystemExit(main())
